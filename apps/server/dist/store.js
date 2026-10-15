import { createCipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, rmSync, statSync, writeSync, } from 'node:fs';
import path from 'node:path';
import { ApprovalModeSchema, BackgroundModelPreferenceSchema, DiffDecisionSchema, DomainEventSchema, ProviderContextSettingsMapSchema, ProviderIdSchema, SidebarSettingsSchema, } from '@harness/contracts';
import { z } from 'zod';
import { canonicalDataPath } from './data-lease.js';
import { DatabaseSync } from './sqlite.js';
import { affectsInboxProjection, applyInboxProjectionEvent, emptyInboxProjection, isEmptyInboxProjection, } from './inbox-projection.js';
const BACKGROUND_MODEL_SETTING = 'background-model';
const PROVIDER_CONTEXT_SETTING = 'provider-context';
const AUTOMATIC_BACKGROUND_MODEL_PREFERENCE = Object.freeze({
    mode: 'automatic',
});
function freezeBackgroundModelPreference(preference) {
    if (preference.mode === 'automatic')
        return AUTOMATIC_BACKGROUND_MODEL_PREFERENCE;
    return Object.freeze({ ...preference, target: Object.freeze({ ...preference.target }) });
}
const RESTART_INTERRUPTION_MESSAGE = 'Turn interrupted: TasteCode restarted. Send a new message to continue.';
// v2 bounds indexed tool output; the rebuild shrinks rows written before the bound.
const SEARCH_INDEX_VERSION = 'session_search_v2';
// A long command or tool result is found by its command, its opening output or
// its final lines. Indexing a whole log duplicates it into the full-text index.
const SEARCH_OUTPUT_HEAD_CHARACTERS = 12 * 1024;
const SEARCH_OUTPUT_TAIL_CHARACTERS = 4 * 1024;
const USAGE_INDEX_VERSION = 'usage_events_v1';
const INBOX_INDEX_VERSION = 'inbox_events_v2';
const USER_SUBMISSION_INDEX_VERSION = 'user_submission_items_v1';
const TURN_DIFF_INDEX_VERSION = 'turn_diff_events_v1';
// v2 reopens requests asked again after their answer; the rebuild settles them.
const RECOVERY_STATE_VERSION = 'recovery_lifecycles_v2';
const BOUNDED_REPLAY_SNAPSHOTS_VERSION = 'bounded_replay_snapshots_v1';
const CHRONOLOGICAL_REPLAY_SNAPSHOTS_VERSION = 'chronological_replay_snapshots_v1';
const SEARCH_RESULT_KEY_SETTING = 'search_result_key_v1';
const SEARCH_SNAPSHOT_TTL_MS = 5 * 60 * 1_000;
// The renderer owns one active search. Keep a few recently used cursors for
// backtracking, but do not let abandoned broad queries retain dozens of packed
// result arrays for the full five-minute cursor lifetime.
const MAX_SEARCH_SNAPSHOTS = 8;
const MAX_SEARCH_PAGE_SIZE = 100;
const SEARCH_TOKEN = /[\p{L}\p{N}][\p{L}\p{N}\p{M}_]*/gu;
const ASCII_SEARCH_TOKEN = /^\p{ASCII}+$/u;
const ASCII_SEARCH_TEXT = /^\p{ASCII}*$/u;
const ASCII_COMPARABLE_SEARCH_TERM = /^[a-z0-9][a-z0-9_]*$/;
const ASCII_FTS_SEARCH_TERM = /^[a-z0-9]+$/;
const ASCII_FTS_TEXT_TOKEN = /[a-z0-9]+/g;
const SEARCH_COMBINING_MARK = /\p{M}/gu;
const ASCII_SNIPPET_SCAN_THRESHOLD = 4_096;
const SEARCH_SNAPSHOT_REUSE_SCAN_LIMIT = 16_384;
function parseSearchRowIds(serialized) {
    const unpacked = JSON.parse(serialized);
    if (unpacked.length <= MAX_SEARCH_PAGE_SIZE)
        return unpacked;
    const packed = new Uint32Array(unpacked.length);
    for (let index = 0; index < unpacked.length; index += 1) {
        const rowId = unpacked[index];
        if (!Number.isInteger(rowId) || rowId < 0 || rowId > 0xffff_ffff)
            return unpacked;
        packed[index] = rowId;
    }
    return packed;
}
function searchRowIdPage(rowIds, start, end) {
    if (Array.isArray(rowIds))
        return rowIds.slice(start, end);
    return Array.from(rowIds.subarray(start, end));
}
const LIFECYCLE_INDEXES = `
CREATE INDEX IF NOT EXISTS threads_due_snooze
  ON threads (wake_at)
  WHERE closed_at IS NULL AND lifecycle_state = 'snoozed' AND ephemeral = 0;
CREATE INDEX IF NOT EXISTS threads_inactive
  ON threads (last_active_at)
  WHERE closed_at IS NULL AND lifecycle_state = 'active' AND ephemeral = 0 AND keep_active = 0;
`;
const SESSION_SEARCH_TABLE = `
CREATE VIRTUAL TABLE IF NOT EXISTS session_search USING fts5 (
  thread_id UNINDEXED,
  event_seq UNINDEXED,
  turn_id UNINDEXED,
  created_at UNINDEXED,
  text,
  tokenize = 'unicode61'
);`;
const SCHEMA = `
CREATE TABLE IF NOT EXISTS projects (
  path       TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  pinned     INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS threads (
  id           TEXT PRIMARY KEY,
  project_path TEXT NOT NULL,
  provider     TEXT NOT NULL,
  agent        TEXT,
  provider_session_id TEXT,
  title        TEXT NOT NULL,
  pinned       INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL,
  closed_at    INTEGER,
  worktree_path   TEXT,
  worktree_branch TEXT,
  lifecycle_state  TEXT NOT NULL DEFAULT 'active'
    CHECK (lifecycle_state IN ('active', 'settled', 'snoozed')),
  lifecycle_at     INTEGER,
  lifecycle_reason TEXT,
  wake_at          INTEGER,
  keep_active      INTEGER NOT NULL DEFAULT 0,
  woke_at          INTEGER,
  unread           INTEGER NOT NULL DEFAULT 0,
  last_active_at   INTEGER NOT NULL,
  ephemeral        INTEGER NOT NULL DEFAULT 0,
  parent_thread_id TEXT,
  restore_context_pending INTEGER NOT NULL DEFAULT 0,
  history_rewrite_after   INTEGER,
  history_rewrite_through INTEGER
);

CREATE TABLE IF NOT EXISTS sidebar_settings (
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  mode             TEXT NOT NULL CHECK (mode IN ('classic', 'inbox')),
  auto_settle_days INTEGER CHECK (auto_settle_days BETWEEN 1 AND 90)
);

CREATE TABLE IF NOT EXISTS provider_history (
  provider TEXT NOT NULL,
  session_id TEXT NOT NULL,
  thread_id TEXT NOT NULL UNIQUE,
  metadata TEXT NOT NULL,
  loaded_revision TEXT,
  PRIMARY KEY (provider, session_id)
);

CREATE TABLE IF NOT EXISTS provider_history_events (
  thread_id TEXT NOT NULL,
  event_key TEXT NOT NULL,
  event_seq INTEGER NOT NULL REFERENCES events(seq) ON DELETE CASCADE,
  active INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (thread_id, event_seq)
);
CREATE INDEX IF NOT EXISTS provider_history_event_seq ON provider_history_events (event_seq);

INSERT OR IGNORE INTO sidebar_settings (id, mode, auto_settle_days) VALUES (1, 'classic', 3);

CREATE TABLE IF NOT EXISTS events (
  seq       INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id TEXT NOT NULL,
  at        INTEGER NOT NULL,
  payload   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS usage_events (
  event_seq INTEGER PRIMARY KEY REFERENCES events(seq) ON DELETE CASCADE,
  thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  at        INTEGER NOT NULL,
  payload   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS usage_events_thread_seq ON usage_events (thread_id, event_seq);
CREATE INDEX IF NOT EXISTS usage_events_at ON usage_events (at);

CREATE TABLE IF NOT EXISTS inbox_events (
  event_seq INTEGER PRIMARY KEY REFERENCES events(seq) ON DELETE CASCADE,
  thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  payload   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS inbox_events_thread_seq ON inbox_events (thread_id, event_seq);

CREATE TABLE IF NOT EXISTS user_submission_items (
  thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  item_id   TEXT NOT NULL,
  event_seq INTEGER NOT NULL REFERENCES events(seq) ON DELETE CASCADE,
  PRIMARY KEY (thread_id, item_id)
);

CREATE TABLE IF NOT EXISTS turn_diff_events (
  event_seq INTEGER PRIMARY KEY REFERENCES events(seq) ON DELETE CASCADE,
  thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  turn_id   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS turn_diff_events_thread_turn_seq
  ON turn_diff_events (thread_id, turn_id, event_seq DESC);

CREATE TABLE IF NOT EXISTS recovery_lifecycles (
  thread_id     TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  lifecycle_key TEXT NOT NULL,
  event_type    TEXT,
  started_seq   INTEGER REFERENCES events(seq) ON DELETE SET NULL,
  terminal_seq  INTEGER REFERENCES events(seq) ON DELETE SET NULL,
  payload       TEXT,
  PRIMARY KEY (thread_id, lifecycle_key)
);

CREATE INDEX IF NOT EXISTS recovery_lifecycles_open
  ON recovery_lifecycles (started_seq)
  WHERE started_seq IS NOT NULL AND terminal_seq IS NULL;

CREATE TABLE IF NOT EXISTS recovery_errors (
  thread_id TEXT PRIMARY KEY REFERENCES threads(id) ON DELETE CASCADE,
  event_seq INTEGER NOT NULL REFERENCES events(seq) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS queued_turn_events (
  seq       INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  queue_id  TEXT,
  at        INTEGER NOT NULL,
  mutation  TEXT NOT NULL,
  payload   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS queued_turns (
  thread_id            TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  queue_id             TEXT NOT NULL,
  client_submission_id TEXT,
  position             INTEGER NOT NULL,
  state                TEXT NOT NULL CHECK (state IN ('queued', 'dispatching')),
  intent               TEXT NOT NULL CHECK (intent IN ('normal', 'steer')),
  payload              TEXT NOT NULL,
  created_at           INTEGER NOT NULL,
  PRIMARY KEY (thread_id, queue_id)
);

CREATE TABLE IF NOT EXISTS checkpoints (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id  TEXT NOT NULL,
  seq        INTEGER NOT NULL,
  commit_sha TEXT NOT NULL,
  label      TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS checkpoint_repositories (
  path TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS restore_undos (
  token            TEXT PRIMARY KEY,
  thread_id        TEXT NOT NULL UNIQUE,
  checkpoint_seq   INTEGER NOT NULL,
  snapshot_commit  TEXT NOT NULL,
  events_json      TEXT NOT NULL,
  checkpoints_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS thread_replay_snapshots (
  thread_id TEXT PRIMARY KEY REFERENCES threads(id) ON DELETE CASCADE,
  seq       INTEGER NOT NULL,
  payload   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  name TEXT PRIMARY KEY
);

${SESSION_SEARCH_TABLE}

CREATE TABLE IF NOT EXISTS diff_decisions (
  thread_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  decision  TEXT NOT NULL CHECK (decision IN ('accept', 'reject')),
  PRIMARY KEY (thread_id, target_id)
);

CREATE TABLE IF NOT EXISTS design_runs (
  thread_id TEXT PRIMARY KEY,
  payload   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS thread_approvals (
  thread_id TEXT PRIMARY KEY REFERENCES threads(id) ON DELETE CASCADE,
  mode TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS checkpoints_by_thread ON checkpoints (thread_id, seq);
CREATE INDEX IF NOT EXISTS events_by_thread ON events (thread_id, seq);
CREATE INDEX IF NOT EXISTS queued_turn_events_by_thread
  ON queued_turn_events (thread_id, seq);
CREATE INDEX IF NOT EXISTS queued_turns_by_thread
  ON queued_turns (thread_id, state, position);
CREATE UNIQUE INDEX IF NOT EXISTS queued_turn_submission_id
  ON queued_turns (thread_id, client_submission_id)
  WHERE client_submission_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS threads_by_project ON threads (project_path);
`;
/**
 * Columns added after a version shipped.
 *
 * `CREATE TABLE IF NOT EXISTS` does nothing to a table that already exists, so
 * a database written by an older build keeps its old shape and every query
 * naming a new column fails. Anyone who had used the app before the change
 * would meet that, and only them — which is the kind of break that never shows
 * up in development.
 *
 * Add here as well as to the schema above: the schema is for a fresh database,
 * this is for every existing one.
 */
const ADDED_COLUMNS = [
    { table: 'projects', column: 'pinned', definition: 'INTEGER NOT NULL DEFAULT 0' },
    { table: 'threads', column: 'pinned', definition: 'INTEGER NOT NULL DEFAULT 0' },
    { table: 'threads', column: 'worktree_path', definition: 'TEXT' },
    { table: 'threads', column: 'worktree_branch', definition: 'TEXT' },
    {
        table: 'threads',
        column: 'lifecycle_state',
        definition: `TEXT NOT NULL DEFAULT 'active' CHECK (lifecycle_state IN ('active', 'settled', 'snoozed'))`,
    },
    { table: 'threads', column: 'lifecycle_at', definition: 'INTEGER' },
    { table: 'threads', column: 'lifecycle_reason', definition: 'TEXT' },
    { table: 'threads', column: 'wake_at', definition: 'INTEGER' },
    { table: 'threads', column: 'keep_active', definition: 'INTEGER NOT NULL DEFAULT 0' },
    { table: 'threads', column: 'woke_at', definition: 'INTEGER' },
    { table: 'threads', column: 'unread', definition: 'INTEGER NOT NULL DEFAULT 0' },
    { table: 'threads', column: 'last_active_at', definition: 'INTEGER NOT NULL DEFAULT 0' },
    { table: 'threads', column: 'ephemeral', definition: 'INTEGER NOT NULL DEFAULT 0' },
    { table: 'threads', column: 'parent_thread_id', definition: 'TEXT' },
    { table: 'threads', column: 'restore_context_pending', definition: 'INTEGER NOT NULL DEFAULT 0' },
    { table: 'threads', column: 'provider_session_id', definition: 'TEXT' },
    { table: 'threads', column: 'history_rewrite_after', definition: 'INTEGER' },
    { table: 'threads', column: 'history_rewrite_through', definition: 'INTEGER' },
];
const StoredTurnOptionsSchema = z.object({
    model: z.string().optional(),
    serviceTier: z.string().optional(),
    effort: z.string().optional(),
});
const StoredQueuedTurnPayloadSchema = z.object({
    text: z.string(),
    attachments: z.array(z.string()),
    options: StoredTurnOptionsSchema,
    channel: z.enum(['main', 'side']).optional(),
});
/** Keep hot thread metadata without retaining every thread in a large workspace. */
const THREAD_CACHE_LIMIT = 128;
// Count and bytes are separate: many short threads should not evict one another,
// while the character budget still bounds the parsed replay payloads.
const REPLAY_SNAPSHOT_CACHE_LIMIT = 64;
// Disk snapshots duplicate a thread's compacted replay. Recently written threads
// keep one; an older or closed thread rebuilds its replay from the log when reopened.
const REPLAY_SNAPSHOT_DISK_LIMIT = REPLAY_SNAPSHOT_CACHE_LIMIT;
const REPLAY_SNAPSHOT_CACHE_CHARACTER_LIMIT = 16 * 1024 * 1024;
const StoredEventRowsSchema = z.array(z.object({
    seq: z.number().safe().int(),
    thread_id: z.string(),
    at: z.number().safe().int(),
    payload: z.string(),
    event_key: z.string().nullish(),
    active: z.union([z.literal(0), z.literal(1)]).nullish(),
}));
const StoredCheckpointRowsSchema = z.array(z.object({
    id: z.number().safe().int(),
    thread_id: z.string(),
    seq: z.number().safe().int(),
    commit_sha: z.string(),
    label: z.string(),
    created_at: z.number().safe().int(),
}));
const ReplaySnapshotSchema = z.array(z.object({ seq: z.number().safe().int(), event: DomainEventSchema }));
const SearchCursorSchema = z.object({
    snapshotId: z.string().min(1),
    position: z.number().safe().int().min(1),
});
export class Store {
    checkpointNamespace;
    location;
    #db;
    #insertEvent;
    #insertSearchEntry;
    #insertUsageEvent;
    #insertInboxEvent;
    #deleteInboxStatus;
    #deleteInboxRequest;
    #deleteThreadInboxEvents;
    #insertUserSubmission;
    #hasUserSubmission;
    #insertTurnDiffEvent;
    #readTurnDiff;
    #upsertRecoveryStart;
    #settleRecoveryLifecycle;
    #upsertRecoveryError;
    #readInterruptedThreads;
    #readInterruptedThread;
    #insertQueuedTurnEvent;
    #listQueuedTurns;
    #hasQueuedSubmission;
    #openThread;
    #nextQueuedPosition;
    #insertQueuedTurn;
    #deleteQueuedTurn;
    #queuedTurnPosition;
    #previousQueuedTurn;
    #nextQueuedTurn;
    #swapQueuedTurnPositions;
    #findQueuedTurn;
    #dispatchQueuedTurn;
    #restoreQueuedTurn;
    #claimedQueuedTurn;
    #deleteClaimedQueuedTurn;
    #queuedTurnInState;
    #hasQueuedTurn;
    #clearQueuedTurnsStatement;
    #insertProject;
    #findProject;
    #insertThread;
    #listProjects;
    #listProjectThreads;
    #listThreads;
    #listSidebarThreads;
    #findThread;
    #threadHistory;
    #threadInboxEvents;
    #queuedThreadIds;
    #settleThreadStatement;
    #settleInactiveThreadStatement;
    #activateThreadStatement;
    #wakeSnoozedThreadStatement;
    #touchActiveThreadStatement;
    #touchThreadStatement;
    #dueSnoozedThreadIds;
    #nextSnoozedThread;
    #oldestActiveThread;
    #inactiveThreadCandidates;
    #readReplaySnapshotBase;
    #readTailReplaySnapshot;
    #writeReplaySnapshot;
    #pruneReplaySnapshots;
    #deleteReplaySnapshot;
    #lastSequence;
    #selectSearchSnapshot = new Map();
    #readSearchResults;
    #readSidebarSettings;
    #writeSidebarSettings;
    #readAppSetting;
    #writeAppSetting;
    #searchResultKey;
    #projectsCache;
    #projectCache = new Map();
    #queuedThreadIdsCache;
    /** `null` is a retained miss; `undefined` means the key was never cached. */
    #threadCache = new Map();
    #sidebarThreadsCache;
    #sidebarThreadIndexes;
    #sidebarThreadUpdateBatchDepth = 0;
    #pendingSidebarThreads;
    #sidebarSettingsCache;
    #backgroundModelPreferenceCache;
    #providerContextSettingsCache;
    /**
     * Compact replays by thread. `tail` is false once an event lands after the
     * snapshot: the entry still serves as a base and for older history pages.
     */
    #replaySnapshotCache = new Map();
    #replaySnapshotCacheCharacters = 0;
    /** Search cursors are process-local; retaining packed row IDs avoids a temp-table write per hit. */
    #searchSnapshots = new Map();
    /** Fresh searches may share ranked IDs only while the searchable event index is unchanged. */
    #searchRevision = 0;
    /** Keeps the streamed-event path from querying SQLite just to skip search indexing. */
    #ephemeralThreads = new Set();
    /** `:memory:` in tests; a file under the user's data directory in the app. */
    constructor(location) {
        if (location !== ':memory:')
            location = canonicalDataPath(location);
        this.location = location;
        this.checkpointNamespace = createHash('sha256')
            .update(location === ':memory:' ? randomUUID() : path.resolve(location))
            .digest('hex')
            .slice(0, 32);
        if (location !== ':memory:')
            mkdirSync(path.dirname(location), { recursive: true });
        this.#db = new DatabaseSync(location);
        // Without WAL a reader blocks a writer, and we do both on every turn.
        this.#db.exec('PRAGMA journal_mode = WAL');
        // Search and history are read-heavy once the event log grows. Mapping the
        // stable database pages avoids copying them through SQLite's small default
        // page cache; the OS still brings pages into physical memory on demand.
        this.#db.exec('PRAGMA mmap_size = 268435456');
        // FULL fsyncs the WAL on every commit — and append() commits per streamed
        // delta chunk. NORMAL only syncs at checkpoint; with WAL a crash can lose
        // the tail of the log but cannot corrupt the database, which is the right
        // trade for a local event log rebuilt from the agent on resume.
        this.#db.exec('PRAGMA synchronous = NORMAL');
        this.#db.exec('PRAGMA foreign_keys = ON');
        this.#db.exec(SCHEMA);
        this.#readSidebarSettings = this.#db.prepare(`SELECT mode, auto_settle_days FROM sidebar_settings WHERE id = 1`);
        this.#writeSidebarSettings = this.#db.prepare(`UPDATE sidebar_settings SET mode = ?, auto_settle_days = ? WHERE id = 1`);
        this.#readAppSetting = this.#db.prepare(`SELECT value FROM app_settings WHERE key = ?`);
        this.#writeAppSetting = this.#db.prepare(`INSERT INTO app_settings (key, value) VALUES (?, ?)
       ON CONFLICT (key) DO UPDATE SET value = excluded.value`);
        this.#searchResultKey = this.#loadSearchResultKey();
        // These statements run for every persisted event. Preparing them once
        // keeps SQLite compilation off the streamed-delta path.
        this.#insertEvent = this.#db.prepare(`INSERT INTO events (thread_id, at, payload) VALUES (?, ?, ?)`);
        this.#insertSearchEntry = this.#db.prepare(`INSERT INTO session_search (rowid, thread_id, event_seq, turn_id, created_at, text)
       VALUES (?, ?, ?, ?, ?, ?)`);
        this.#insertUsageEvent = this.#db.prepare(`INSERT OR REPLACE INTO usage_events (event_seq, thread_id, at, payload)
       VALUES (?, ?, ?, ?)`);
        this.#insertInboxEvent = this.#db.prepare(`INSERT OR REPLACE INTO inbox_events (event_seq, thread_id, payload) VALUES (?, ?, ?)`);
        this.#deleteInboxStatus = this.#db.prepare(`DELETE FROM inbox_events
       WHERE thread_id = ?
         AND json_extract(CASE WHEN json_valid(payload) THEN payload END, '$.type')
           IN ('thread.error', 'turn.completed')`);
        this.#deleteInboxRequest = this.#db.prepare(`DELETE FROM inbox_events
       WHERE thread_id = ?
         AND json_extract(CASE WHEN json_valid(payload) THEN payload END, '$.type') = ?
         AND json_extract(CASE WHEN json_valid(payload) THEN payload END, '$.request.id') = ?`);
        this.#deleteThreadInboxEvents = this.#db.prepare(`DELETE FROM inbox_events WHERE thread_id = ?`);
        this.#insertUserSubmission = this.#db.prepare(`INSERT OR IGNORE INTO user_submission_items (thread_id, item_id, event_seq)
       VALUES (?, ?, ?)`);
        this.#hasUserSubmission = this.#db.prepare(`SELECT 1 FROM user_submission_items WHERE thread_id = ? AND item_id = ?`);
        this.#insertTurnDiffEvent = this.#db.prepare(`INSERT OR REPLACE INTO turn_diff_events (event_seq, thread_id, turn_id)
       VALUES (?, ?, ?)`);
        this.#readTurnDiff = this.#db.prepare(`SELECT events.payload
       FROM turn_diff_events
       INNER JOIN events ON events.seq = turn_diff_events.event_seq
       WHERE turn_diff_events.thread_id = ? AND turn_diff_events.turn_id = ?
       ORDER BY turn_diff_events.event_seq DESC LIMIT 1`);
        this.#upsertRecoveryStart = this.#db.prepare(`INSERT INTO recovery_lifecycles
         (thread_id, lifecycle_key, event_type, started_seq, terminal_seq, payload)
       VALUES (?, ?, ?, ?, NULL, ?)
       ON CONFLICT (thread_id, lifecycle_key) DO UPDATE SET
         event_type = excluded.event_type,
         started_seq = excluded.started_seq,
         terminal_seq = NULL,
         payload = excluded.payload
       WHERE recovery_lifecycles.terminal_seq IS NULL
          OR (? AND recovery_lifecycles.terminal_seq < excluded.started_seq)`);
        this.#settleRecoveryLifecycle = this.#db.prepare(`INSERT INTO recovery_lifecycles
         (thread_id, lifecycle_key, event_type, started_seq, terminal_seq, payload)
       VALUES (?, ?, NULL, NULL, ?, NULL)
       ON CONFLICT (thread_id, lifecycle_key) DO UPDATE SET
         event_type = NULL,
         started_seq = NULL,
         terminal_seq = excluded.terminal_seq,
         payload = NULL`);
        this.#upsertRecoveryError = this.#db.prepare(`INSERT INTO recovery_errors (thread_id, event_seq) VALUES (?, ?)
       ON CONFLICT (thread_id) DO UPDATE SET event_seq = excluded.event_seq`);
        const openRecoveryLifecycles = `SELECT recovery.thread_id, recovery.payload,
              CASE WHEN recovery.event_type = 'user_input.requested'
                AND EXISTS (
                  SELECT 1 FROM design_runs
                  WHERE design_runs.thread_id = recovery.thread_id
                    AND json_extract(
                      CASE WHEN json_valid(design_runs.payload) THEN design_runs.payload END,
                      '$.phase'
                    ) = 'brief'
                ) THEN 1 ELSE 0 END AS resumable
       FROM recovery_lifecycles AS recovery
       INNER JOIN threads ON threads.id = recovery.thread_id
       LEFT JOIN recovery_errors AS errors ON errors.thread_id = recovery.thread_id
       WHERE threads.closed_at IS NULL
         AND recovery.started_seq IS NOT NULL
         AND recovery.terminal_seq IS NULL
         AND recovery.payload IS NOT NULL
         AND (recovery.event_type <> 'turn.started' OR errors.event_seq IS NULL
              OR errors.event_seq < recovery.started_seq)`;
        this.#readInterruptedThreads = this.#db.prepare(`${openRecoveryLifecycles} ORDER BY recovery.started_seq`);
        this.#readInterruptedThread = this.#db.prepare(`${openRecoveryLifecycles} AND recovery.thread_id = ? ORDER BY recovery.started_seq`);
        this.#insertQueuedTurnEvent = this.#db.prepare(`INSERT INTO queued_turn_events (thread_id, queue_id, at, mutation, payload)
       VALUES (?, ?, ?, ?, ?)`);
        this.#listQueuedTurns = this.#db.prepare(`SELECT queued_turns.* FROM queued_turns
       INNER JOIN threads ON threads.id = queued_turns.thread_id
       WHERE queued_turns.thread_id = ? AND queued_turns.state = 'queued'
         AND threads.closed_at IS NULL
       ORDER BY queued_turns.position`);
        this.#hasQueuedSubmission = this.#db.prepare(`SELECT 1 FROM queued_turns
       WHERE thread_id = ? AND client_submission_id = ? LIMIT 1`);
        this.#openThread = this.#db.prepare(`SELECT 1 FROM threads WHERE id = ? AND closed_at IS NULL`);
        this.#nextQueuedPosition = this.#db.prepare(`SELECT COALESCE(MAX(position), -1) + 1 AS position
       FROM queued_turns WHERE thread_id = ?`);
        this.#insertQueuedTurn = this.#db.prepare(`INSERT INTO queued_turns
         (thread_id, queue_id, client_submission_id, position, state, intent, payload, created_at)
       VALUES (?, ?, ?, ?, 'queued', 'normal', ?, ?)`);
        this.#deleteQueuedTurn = this.#db.prepare(`DELETE FROM queued_turns WHERE thread_id = ? AND queue_id = ?`);
        this.#queuedTurnPosition = this.#db.prepare(`SELECT position FROM queued_turns
       WHERE thread_id = ? AND queue_id = ? AND state = 'queued'`);
        this.#previousQueuedTurn = this.#db.prepare(`SELECT queue_id, position FROM queued_turns
       WHERE thread_id = ? AND state = 'queued' AND position < ?
       ORDER BY position DESC LIMIT 1`);
        this.#nextQueuedTurn = this.#db.prepare(`SELECT queue_id, position FROM queued_turns
       WHERE thread_id = ? AND state = 'queued' AND position > ?
       ORDER BY position ASC LIMIT 1`);
        this.#swapQueuedTurnPositions = this.#db.prepare(`UPDATE queued_turns SET position = CASE queue_id WHEN ? THEN ? WHEN ? THEN ? END
       WHERE thread_id = ? AND queue_id IN (?, ?)`);
        this.#findQueuedTurn = this.#db.prepare(`SELECT * FROM queued_turns
       WHERE thread_id = ? AND queue_id = ? AND state = 'queued'`);
        this.#dispatchQueuedTurn = this.#db.prepare(`UPDATE queued_turns SET state = 'dispatching', intent = ?
       WHERE thread_id = ? AND queue_id = ?`);
        this.#restoreQueuedTurn = this.#db.prepare(`UPDATE queued_turns SET state = 'queued', intent = 'normal'
       WHERE thread_id = ? AND queue_id = ?`);
        this.#claimedQueuedTurn = this.#db.prepare(`SELECT 1 FROM queued_turns
       WHERE thread_id = ? AND queue_id = ? AND state = 'dispatching'`);
        this.#deleteClaimedQueuedTurn = this.#db.prepare(`DELETE FROM queued_turns
       WHERE thread_id = ? AND queue_id = ? AND state = 'dispatching'`);
        this.#queuedTurnInState = this.#db.prepare(`SELECT 1 FROM queued_turns WHERE thread_id = ? AND queue_id = ? AND state = ?`);
        this.#hasQueuedTurn = this.#db.prepare(`SELECT 1 FROM queued_turns WHERE thread_id = ? LIMIT 1`);
        this.#clearQueuedTurnsStatement = this.#db.prepare(`DELETE FROM queued_turns WHERE thread_id = ?`);
        this.#migrate();
        this.#db.exec(LIFECYCLE_INDEXES);
        this.#insertProject = this.#db.prepare(`INSERT INTO projects (path, name, pinned, created_at) VALUES (?, ?, 0, ?)
       ON CONFLICT (path) DO NOTHING`);
        this.#findProject = this.#db.prepare(`SELECT * FROM projects WHERE path = ?`);
        this.#insertThread = this.#db.prepare(`INSERT INTO threads
        (id, project_path, provider, agent, provider_session_id, title, created_at,
          worktree_path, worktree_branch,
          lifecycle_state, keep_active, unread, last_active_at, ephemeral, parent_thread_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, 0, ?, ?, ?)`);
        this.#listProjects = this.#db.prepare(`SELECT * FROM projects ORDER BY created_at`);
        this.#listProjectThreads = this.#db.prepare(`SELECT * FROM threads WHERE project_path = ? AND ephemeral = 0 ORDER BY created_at DESC`);
        this.#listThreads = this.#db.prepare(`SELECT * FROM threads WHERE ephemeral = 0 ORDER BY created_at DESC`);
        this.#listSidebarThreads = this.#db.prepare(`SELECT id, project_path, provider, agent, title, pinned, created_at, closed_at,
              worktree_branch, lifecycle_state, lifecycle_at, lifecycle_reason, wake_at,
              keep_active, woke_at, unread
       FROM threads WHERE ephemeral = 0 ORDER BY created_at DESC`);
        for (let mask = 0; mask < 4; mask += 1) {
            const clauses = ['session_search MATCH ?'];
            const threadFilters = [];
            // Build the small eligible-thread set once instead of probing the thread
            // primary key for every FTS match. The visible page still joins metadata.
            if ((mask & 1) !== 0)
                threadFilters.push('threads.project_path = ?');
            if ((mask & 2) !== 0)
                threadFilters.push('threads.provider = ?');
            if (threadFilters.length > 0) {
                clauses.push(`session_search.thread_id IN (
             SELECT threads.id FROM threads WHERE ${threadFilters.join(' AND ')}
           )`);
            }
            this.#selectSearchSnapshot.set(mask, this.#db.prepare(`SELECT json_group_array(search_rowid) AS search_rowids
           FROM (
             SELECT session_search.rowid AS search_rowid
             FROM session_search
             WHERE ${clauses.join(' AND ')}
             ORDER BY rank, session_search.created_at DESC,
                      session_search.rowid DESC
           )`));
        }
        this.#readSearchResults = this.#db.prepare(`SELECT projects.path AS project_path, projects.name AS project_name,
              threads.id AS thread_id, threads.title AS thread_title,
              threads.provider, session_search.event_seq, session_search.turn_id,
              session_search.created_at,
              CAST(page.key AS INTEGER) + ? + 1 AS position,
              session_search.text
       FROM json_each(?) AS page
       JOIN session_search ON session_search.rowid = CAST(page.value AS INTEGER)
       JOIN threads ON threads.id = session_search.thread_id
       JOIN projects ON projects.path = threads.project_path
       ORDER BY CAST(page.key AS INTEGER)
       `);
        this.#findThread = this.#db.prepare(`SELECT * FROM threads WHERE id = ?`);
        this.#threadHistory = this.#db.prepare(`SELECT e.seq, e.payload FROM events e
       LEFT JOIN provider_history_events p ON p.event_seq = e.seq
       WHERE e.thread_id = ? AND e.seq > ? AND (p.active IS NULL OR p.active = 1) ORDER BY e.seq`);
        this.#threadInboxEvents = this.#db.prepare(`SELECT thread_id, payload FROM inbox_events ORDER BY event_seq`);
        this.#queuedThreadIds = this.#db.prepare(`SELECT DISTINCT queued_turns.thread_id
       FROM queued_turns
       INNER JOIN threads ON threads.id = queued_turns.thread_id
       WHERE queued_turns.state = 'queued' AND threads.closed_at IS NULL`);
        this.#settleThreadStatement = this.#db.prepare(`UPDATE threads SET lifecycle_state = 'settled', lifecycle_at = ?, lifecycle_reason = ?,
       wake_at = NULL, keep_active = 0, woke_at = NULL WHERE id = ? AND closed_at IS NULL`);
        this.#settleInactiveThreadStatement = this.#db.prepare(`UPDATE threads SET lifecycle_state = 'settled', lifecycle_at = ?,
       lifecycle_reason = 'inactivity', wake_at = NULL, keep_active = 0, woke_at = NULL
       WHERE id = ? AND closed_at IS NULL AND lifecycle_state = 'active'
       AND ephemeral = 0 AND keep_active = 0 AND last_active_at <= ?`);
        this.#activateThreadStatement = this.#db.prepare(`UPDATE threads SET lifecycle_state = 'active', lifecycle_at = NULL,
       lifecycle_reason = NULL, wake_at = NULL,
       woke_at = CASE WHEN lifecycle_state = 'active' THEN woke_at ELSE ? END
       WHERE id = ? RETURNING woke_at, keep_active`);
        this.#wakeSnoozedThreadStatement = this.#db.prepare(`UPDATE threads SET lifecycle_state = 'active', lifecycle_at = NULL,
       lifecycle_reason = NULL, wake_at = NULL, woke_at = ?, last_active_at = ?
       WHERE id = ? AND closed_at IS NULL AND lifecycle_state = 'snoozed'
         AND ephemeral = 0 AND wake_at <= ? RETURNING woke_at, keep_active`);
        this.#touchActiveThreadStatement = this.#db.prepare(`UPDATE threads SET last_active_at = ?, unread = MAX(unread, ?)
       WHERE id = ? AND closed_at IS NULL`);
        this.#touchThreadStatement = this.#db.prepare(`UPDATE threads SET lifecycle_state = 'active', lifecycle_at = NULL,
       lifecycle_reason = NULL, wake_at = NULL,
       woke_at = CASE WHEN lifecycle_state = 'active' THEN woke_at ELSE ? END,
       last_active_at = ?, unread = MAX(unread, ?)
       WHERE id = ? AND closed_at IS NULL RETURNING woke_at, keep_active`);
        this.#dueSnoozedThreadIds = this.#db.prepare(`SELECT id FROM threads WHERE closed_at IS NULL AND lifecycle_state = 'snoozed'
       AND ephemeral = 0 AND wake_at <= ? ORDER BY wake_at`);
        this.#nextSnoozedThread = this.#db.prepare(`SELECT MIN(wake_at) AS at FROM threads
       WHERE closed_at IS NULL AND lifecycle_state = 'snoozed' AND ephemeral = 0`);
        this.#oldestActiveThread = this.#db.prepare(`SELECT MIN(last_active_at) AS at FROM threads
       WHERE closed_at IS NULL AND lifecycle_state = 'active'
         AND ephemeral = 0 AND keep_active = 0`);
        this.#inactiveThreadCandidates = this.#db.prepare(`SELECT id, unread FROM threads
       WHERE closed_at IS NULL AND lifecycle_state = 'active'
         AND ephemeral = 0 AND keep_active = 0 AND last_active_at <= ?
       ORDER BY last_active_at`);
        this.#readReplaySnapshotBase = this.#db.prepare(`SELECT seq, payload FROM thread_replay_snapshots WHERE thread_id = ?`);
        this.#readTailReplaySnapshot = this.#db.prepare(`SELECT snapshot.seq, snapshot.payload
       FROM thread_replay_snapshots AS snapshot
       WHERE snapshot.thread_id = ?
         AND snapshot.seq = COALESCE(
           (SELECT MAX(events.seq) FROM events WHERE events.thread_id = snapshot.thread_id),
           0
         )`);
        // REPLACE assigns a new rowid, so rowid order is write recency.
        this.#writeReplaySnapshot = this.#db.prepare(`INSERT OR REPLACE INTO thread_replay_snapshots (thread_id, seq, payload) VALUES (?, ?, ?)`);
        this.#pruneReplaySnapshots = this.#db.prepare(`DELETE FROM thread_replay_snapshots
       WHERE rowid <= (
         SELECT rowid FROM thread_replay_snapshots ORDER BY rowid DESC LIMIT 1 OFFSET ?
       )`);
        this.#deleteReplaySnapshot = this.#db.prepare(`DELETE FROM thread_replay_snapshots WHERE thread_id = ?`);
        this.#lastSequence = this.#db.prepare(`SELECT MAX(seq) AS seq FROM events WHERE thread_id = ?`);
        this.#purgeEphemeralThreads();
        this.#recoverQueuedTurnClaims();
        const completedMigrations = new Set(sqliteRows(this.#db.prepare(`SELECT name FROM schema_migrations`)).map(({ name }) => name));
        const rebuild = {
            search: !completedMigrations.has(SEARCH_INDEX_VERSION),
            usage: !completedMigrations.has(USAGE_INDEX_VERSION),
            inbox: !completedMigrations.has(INBOX_INDEX_VERSION),
            userSubmission: !completedMigrations.has(USER_SUBMISSION_INDEX_VERSION),
            turnDiff: !completedMigrations.has(TURN_DIFF_INDEX_VERSION),
            recovery: !completedMigrations.has(RECOVERY_STATE_VERSION),
        };
        if (Object.values(rebuild).some(Boolean))
            this.#rebuildDerivedIndexes(rebuild);
        if (!completedMigrations.has(CHRONOLOGICAL_REPLAY_SNAPSHOTS_VERSION)) {
            this.#transaction(() => {
                this.#db.exec('DELETE FROM thread_replay_snapshots');
                this.#db
                    .prepare('INSERT INTO schema_migrations (name) VALUES (?)')
                    .run(CHRONOLOGICAL_REPLAY_SNAPSHOTS_VERSION);
            });
        }
        if (!completedMigrations.has(BOUNDED_REPLAY_SNAPSHOTS_VERSION)) {
            this.#transaction(() => {
                this.#db.exec(`DELETE FROM thread_replay_snapshots
           WHERE thread_id IN (SELECT id FROM threads WHERE closed_at IS NOT NULL)`);
                this.#pruneReplaySnapshots.run(REPLAY_SNAPSHOT_DISK_LIMIT);
                this.#db
                    .prepare(`INSERT OR REPLACE INTO schema_migrations (name) VALUES (?)`)
                    .run(BOUNDED_REPLAY_SNAPSHOTS_VERSION);
            });
        }
    }
    /** Bring a database written by an older build up to the current shape. */
    #migrate() {
        const columnsByTable = new Map();
        for (const { table, column, definition } of ADDED_COLUMNS) {
            let columns = columnsByTable.get(table);
            if (!columns) {
                columns = new Set(sqliteRows(this.#db.prepare(`PRAGMA table_info(${table})`)).map((row) => row.name));
                columnsByTable.set(table, columns);
            }
            if (columns.has(column))
                continue;
            this.#db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
            columns.add(column);
        }
        this.#db.exec(`UPDATE threads SET last_active_at = created_at WHERE last_active_at = 0`);
    }
    /** Side chats intentionally do not survive an app restart or a crashed renderer. */
    #purgeEphemeralThreads() {
        const exists = this.#db.prepare(`SELECT 1 FROM threads WHERE ephemeral = 1 LIMIT 1`).get();
        if (!exists)
            return;
        this.#transaction(() => {
            this.#db.exec(`
        DELETE FROM session_search
        WHERE thread_id IN (SELECT id FROM threads WHERE ephemeral = 1);
        DELETE FROM events
        WHERE thread_id IN (SELECT id FROM threads WHERE ephemeral = 1);
        DELETE FROM checkpoints
        WHERE thread_id IN (SELECT id FROM threads WHERE ephemeral = 1);
        DELETE FROM restore_undos
        WHERE thread_id IN (SELECT id FROM threads WHERE ephemeral = 1);
        DELETE FROM diff_decisions
        WHERE thread_id IN (SELECT id FROM threads WHERE ephemeral = 1);
        DELETE FROM design_runs
        WHERE thread_id IN (SELECT id FROM threads WHERE ephemeral = 1);
        DELETE FROM threads WHERE ephemeral = 1;
      `);
        });
    }
    close() {
        this.#searchSnapshots.clear();
        this.#db.close();
    }
    #loadSearchResultKey() {
        this.#db
            .prepare(`INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)`)
            .run(SEARCH_RESULT_KEY_SETTING, randomBytes(32).toString('base64url'));
        const row = requiredSqliteRow(this.#readAppSetting, SEARCH_RESULT_KEY_SETTING);
        const key = Buffer.from(row.value, 'base64url');
        if (key.length !== 32)
            throw new Error('Search result identity key is invalid.');
        return key;
    }
    // ---- projects ----------------------------------------------------------
    addProject(projectPath, name) {
        const retained = this.#projectCache.get(projectPath);
        if (retained)
            return retained;
        const project = {
            path: projectPath,
            name: name ?? path.basename(projectPath),
            pinned: false,
            createdAt: Date.now(),
        };
        // Adding a project twice is a normal thing for a user to do; it must not
        // wipe the name they gave it.
        const inserted = this.#insertProject.run(project.path, project.name, project.createdAt);
        if (Number(inserted.changes) > 0) {
            this.#projectsCache = undefined;
            this.#projectCache.set(projectPath, project);
            return project;
        }
        return this.project(projectPath) ?? project;
    }
    setPinned(projectPath, pinned) {
        this.#db
            .prepare(`UPDATE projects SET pinned = ? WHERE path = ?`)
            .run(pinned ? 1 : 0, projectPath);
        this.#projectsCache = undefined;
        const retained = this.#projectCache.get(projectPath);
        if (retained)
            this.#projectCache.set(projectPath, { ...retained, pinned });
    }
    project(projectPath) {
        const retained = this.#projectCache.get(projectPath);
        if (retained)
            return retained;
        const row = sqliteRow(this.#findProject, projectPath);
        const project = row ? toProject(row) : undefined;
        if (project)
            this.#projectCache.set(projectPath, project);
        return project;
    }
    projects() {
        if (!this.#projectsCache) {
            this.#projectsCache = sqliteRows(this.#listProjects).map(toProject);
            for (const project of this.#projectsCache)
                this.#projectCache.set(project.path, project);
        }
        return this.#projectsCache;
    }
    renameProject(projectPath, name) {
        this.#db.prepare(`UPDATE projects SET name = ? WHERE path = ?`).run(name, projectPath);
        this.#projectsCache = undefined;
        const retained = this.#projectCache.get(projectPath);
        if (retained)
            this.#projectCache.set(projectPath, { ...retained, name });
    }
    /** Hides the project from the sidebar. Re-adding it restores its chat history. */
    removeProject(projectPath) {
        this.#db.prepare(`DELETE FROM projects WHERE path = ?`).run(projectPath);
        this.#projectsCache = undefined;
        this.#projectCache.delete(projectPath);
    }
    // ---- threads -----------------------------------------------------------
    addThread(thread) {
        const stored = { ...thread, createdAt: thread.createdAt ?? Date.now() };
        const ephemeral = thread.ephemeral ?? false;
        const lifecycle = { state: 'active', keepActive: false };
        this.#insertThread.run(stored.id, stored.projectPath, stored.provider, stored.agent ?? null, stored.providerSessionId ?? null, stored.title, stored.createdAt, stored.worktreePath ?? null, stored.worktreeBranch ?? null, stored.createdAt, ephemeral ? 1 : 0, stored.parentThreadId ?? null);
        if (ephemeral)
            this.#ephemeralThreads.add(stored.id);
        this.#invalidateSidebarThreads();
        const result = {
            ...stored,
            pinned: false,
            lifecycle,
            unread: false,
            lastActiveAt: stored.createdAt,
            ephemeral,
        };
        this.#cacheThread(stored.id, result);
        return result;
    }
    /**
     * Every worktree we ever created and have not forgotten.
     *
     * Read at startup: a crash leaves directories behind that nobody remembers,
     * and the record here is the only thing that knows they exist.
     */
    worktrees() {
        return sqliteRows(this.#db.prepare(`SELECT id, project_path, worktree_path, worktree_branch FROM threads
                WHERE worktree_path IS NOT NULL AND ephemeral = 0`)).map((row) => {
            return {
                threadId: row.id,
                path: row.worktree_path,
                branch: row.worktree_branch,
                repoPath: row.project_path,
            };
        });
    }
    addProviderThread(id, provider, session, projectPath = session.workspacePath) {
        const thread = this.addThread({
            id,
            provider,
            providerSessionId: session.id,
            projectPath,
            title: session.title || 'Untitled chat',
            createdAt: session.createdAt,
        });
        const closedAt = session.archived ? session.updatedAt : undefined;
        this.#db
            .prepare('UPDATE threads SET closed_at = ?, last_active_at = ? WHERE id = ?')
            .run(closedAt ?? null, session.updatedAt, id);
        this.#cacheThread(id, { ...thread, closedAt, lastActiveAt: session.updatedAt });
    }
    forgetWorktree(threadId) {
        this.#db
            .prepare(`UPDATE threads SET worktree_path = NULL, worktree_branch = NULL WHERE id = ?`)
            .run(threadId);
        this.#updateCachedThread(threadId, (thread) => {
            if (thread.worktreePath === undefined && thread.worktreeBranch === undefined)
                return thread;
            const { worktreePath: _worktreePath, worktreeBranch: _worktreeBranch, ...updated } = thread;
            return updated;
        });
        this.#updateSidebarThread(threadId, (thread) => {
            if (thread.worktreeBranch === undefined)
                return thread;
            const { worktreeBranch: _worktreeBranch, ...updated } = thread;
            return updated;
        });
    }
    thread(id) {
        const cached = this.#threadCache.get(id);
        if (cached !== undefined)
            return cached ?? undefined;
        const row = sqliteRow(this.#findThread, id);
        const thread = row ? toThread(row) : undefined;
        this.#cacheThread(id, thread);
        return thread;
    }
    /** Newest first — the rail shows recent work at the top. */
    threads(projectPath) {
        const rows = projectPath
            ? sqliteRows(this.#listProjectThreads, projectPath)
            : sqliteRows(this.#listThreads);
        const threads = [];
        for (const row of rows) {
            const thread = toThread(row);
            if (thread !== undefined)
                threads.push(thread);
        }
        return threads;
    }
    /** Compact metadata for the sidebar's all-thread refresh. */
    sidebarThreads() {
        if (!this.#sidebarThreadsCache) {
            const threads = [];
            for (const row of sqliteRows(this.#listSidebarThreads)) {
                const thread = toSidebarThread(row);
                if (thread !== undefined)
                    threads.push(thread);
            }
            this.#sidebarThreadsCache = threads;
            this.#sidebarThreadIndexes = new Map(threads.map((thread, index) => [thread.id, index]));
        }
        this.#flushPendingSidebarThreads();
        return this.#sidebarThreadsCache;
    }
    batchSidebarThreadUpdates(operation) {
        this.#sidebarThreadUpdateBatchDepth += 1;
        try {
            return operation();
        }
        finally {
            this.#sidebarThreadUpdateBatchDepth -= 1;
            if (this.#sidebarThreadUpdateBatchDepth === 0)
                this.#flushPendingSidebarThreads();
        }
    }
    batchLifecycleUpdates(operation) {
        return this.batchSidebarThreadUpdates(() => {
            try {
                return this.#transaction(operation);
            }
            catch (error) {
                this.#threadCache.clear();
                this.#projectCache.clear();
                this.#projectsCache = undefined;
                this.#invalidateSidebarThreads();
                throw error;
            }
        });
    }
    renameThread(id, title) {
        this.#db.prepare(`UPDATE threads SET title = ? WHERE id = ?`).run(title, id);
        this.#updateCachedThread(id, (thread) => thread.title === title ? thread : { ...thread, title });
        this.#updateSidebarThread(id, (thread) => thread.title === title ? thread : { ...thread, title });
    }
    setThreadPinned(id, pinned) {
        this.#db.prepare(`UPDATE threads SET pinned = ? WHERE id = ?`).run(pinned ? 1 : 0, id);
        this.#updateCachedThread(id, (thread) => thread.pinned === pinned ? thread : { ...thread, pinned });
        this.#updateSidebarThread(id, (thread) => thread.pinned === pinned ? thread : { ...thread, pinned });
    }
    /** Persist the provider's opaque resume identity as thread recovery metadata. */
    setProviderSessionId(id, providerSessionId) {
        if (!providerSessionId)
            throw new Error('provider session id cannot be empty');
        this.#updateThread(id, `UPDATE threads SET provider_session_id = ? WHERE id = ?`, (thread) => thread.providerSessionId === providerSessionId ? thread : { ...thread, providerSessionId }, providerSessionId);
    }
    providerHistories() {
        return sqliteRows(this.#db.prepare('SELECT * FROM provider_history')).flatMap((row) => {
            const provider = toProviderId(row.provider);
            if (!provider)
                return [];
            return [
                {
                    provider,
                    threadId: row.thread_id,
                    session: JSON.parse(row.metadata),
                    loadedRevision: row.loaded_revision,
                },
            ];
        });
    }
    /** Include temporary tasks so provider discovery cannot publish their internal prompts. */
    nativeProviderThreads(provider) {
        return sqliteRows(this.#db.prepare("SELECT * FROM threads WHERE provider = ? AND id NOT LIKE 'external:%'"), provider).flatMap((row) => {
            const thread = toThread(row);
            return thread ? [thread] : [];
        });
    }
    /** Whether a client whose cursor is `seq` may still show events a restore removed. */
    historyRewrittenAfter(threadId, seq) {
        return (this.#db
            .prepare(`SELECT 1 FROM threads
           WHERE id = ? AND history_rewrite_after < ? AND history_rewrite_through >= ?`)
            .get(threadId, seq, seq) !== undefined);
    }
    providerHistoryChangedAfter(threadId, seq) {
        return (this.#db
            .prepare('SELECT 1 FROM provider_history_events WHERE thread_id = ? AND event_seq > ? LIMIT 1')
            .get(threadId, seq) !== undefined);
    }
    saveProviderHistory(provider, threadId, session) {
        this.#db
            .prepare(`INSERT INTO provider_history (provider, session_id, thread_id, metadata)
      VALUES (?, ?, ?, ?) ON CONFLICT(provider, session_id) DO UPDATE SET
        metadata = excluded.metadata,
        loaded_revision = CASE WHEN provider_history.thread_id = excluded.thread_id
          THEN provider_history.loaded_revision ELSE NULL END,
        thread_id = excluded.thread_id`)
            .run(provider, session.id, threadId, JSON.stringify(session));
        const thread = this.thread(threadId);
        if (thread && Number.isFinite(session.updatedAt) && session.updatedAt > thread.lastActiveAt) {
            this.#db
                .prepare('UPDATE threads SET last_active_at = ? WHERE id = ?')
                .run(session.updatedAt, threadId);
            this.#updateCachedThread(threadId, (current) => ({
                ...current,
                lastActiveAt: session.updatedAt,
            }));
            this.#updateSidebarThread(threadId, (current) => ({
                ...current,
                lastActiveAt: session.updatedAt,
            }));
        }
    }
    /**
     * Saves a provider session as the thread's only history row. A Side chat's
     * tombstone is keyed by its TasteCode id until the provider reports its own
     * session id, and `thread_id` is unique, so the new key replaces the old row.
     */
    replaceProviderHistory(provider, threadId, session) {
        this.#transaction(() => {
            this.#db
                .prepare(`DELETE FROM provider_history
           WHERE thread_id = ? AND NOT (provider = ? AND session_id = ?)`)
                .run(threadId, provider, session.id);
            this.saveProviderHistory(provider, threadId, session);
        });
    }
    /** Only locally recorded events, used to identify provider echoes of our own turns. */
    localHistory(threadId) {
        return sqliteRows(this.#db.prepare(`SELECT e.seq, e.payload FROM events e
      LEFT JOIN provider_history_events p ON p.event_seq = e.seq
      WHERE e.thread_id = ? AND p.event_seq IS NULL ORDER BY e.seq`), threadId).flatMap((row) => {
            const event = parseDomainEvent(row.payload, `local history for thread ${threadId}`);
            return event === undefined ? [] : [{ seq: Number(row.seq), event }];
        });
    }
    /** Keep stable log positions so imported updates cannot invalidate local checkpoints. */
    mergeProviderHistory(threadId, revision, entries) {
        const previous = new Map(sqliteRows(this.#db
            .prepare(`SELECT p.event_key, p.event_seq, p.active, e.payload FROM provider_history_events p
        JOIN events e ON e.seq = p.event_seq WHERE p.thread_id = ? ORDER BY p.event_seq`), threadId).map((row) => [row.event_key, row]));
        const link = this.#db.prepare('INSERT INTO provider_history_events (thread_id, event_key, event_seq) VALUES (?, ?, ?)');
        let changed = false;
        this.#transaction(() => {
            const keys = JSON.stringify(entries.map(({ key }) => key));
            const retired = this.#db
                .prepare(`UPDATE provider_history_events SET active = 0
        WHERE thread_id = ? AND active = 1 AND event_key NOT IN (SELECT value FROM json_each(?))`)
                .run(threadId, keys).changes;
            if (retired)
                changed = true;
            let turnAt = this.thread(threadId)?.createdAt ?? 0;
            for (const { key, event } of entries) {
                const payload = JSON.stringify(event);
                const existing = previous.get(key);
                if (event.type === 'turn.started')
                    turnAt = event.turn.createdAt;
                if (existing?.active &&
                    existing.payload === payload &&
                    !(retired && event.type === 'thread.started'))
                    continue;
                if (existing)
                    this.#db
                        .prepare('UPDATE provider_history_events SET active = 0 WHERE thread_id = ? AND event_key = ?')
                        .run(threadId, key);
                const at = event.type === 'item.completed' || event.type === 'item.started'
                    ? event.item.createdAt
                    : event.type === 'turn.started'
                        ? event.turn.createdAt
                        : turnAt;
                const seq = this.#appendEventPayload(threadId, event, at, payload);
                link.run(threadId, key, seq);
                previous.set(key, { event_key: key, event_seq: seq, payload, active: 1 });
                changed = true;
            }
            this.#db
                .prepare('UPDATE provider_history SET loaded_revision = ? WHERE thread_id = ?')
                .run(revision, threadId);
            if (changed) {
                this.#db
                    .prepare(`DELETE FROM session_search WHERE rowid IN
          (SELECT event_seq FROM provider_history_events WHERE thread_id = ? AND active = 0)`)
                    .run(threadId);
                this.#db
                    .prepare(`DELETE FROM usage_events WHERE event_seq IN
          (SELECT event_seq FROM provider_history_events WHERE thread_id = ? AND active = 0)`)
                    .run(threadId);
                this.#searchRevision += 1;
                this.#deleteReplaySnapshot.run(threadId);
                this.#deleteCachedReplaySnapshot(threadId);
                this.#rebuildThreadInboxState(threadId);
                this.#rebuildThreadRecoveryState(threadId);
            }
        });
        return changed;
    }
    settleThread(id, reason, at = Date.now()) {
        const lifecycle = { state: 'settled', settledAt: at, reason };
        const result = this.#settleThreadStatement.run(at, reason, id);
        if (result.changes === 0)
            throw new Error('thread not found');
        this.#updateCachedThread(id, (thread) => ({ ...thread, lifecycle }));
        this.#updateSidebarThread(id, (thread) => ({ ...thread, lifecycle }));
        return lifecycle;
    }
    settleInactiveThread(id, cutoff, at = Date.now()) {
        const lifecycle = { state: 'settled', settledAt: at, reason: 'inactivity' };
        const result = this.#settleInactiveThreadStatement.run(at, id, cutoff);
        if (result.changes === 0)
            return undefined;
        this.#updateCachedThread(id, (thread) => ({ ...thread, lifecycle }));
        this.#updateSidebarThread(id, (thread) => ({ ...thread, lifecycle }));
        return lifecycle;
    }
    snoozeThread(id, wakeAt, at = Date.now()) {
        const lifecycle = { state: 'snoozed', snoozedAt: at, wakeAt };
        this.#updateThread(id, `UPDATE threads SET lifecycle_state = 'snoozed', lifecycle_at = ?,
       lifecycle_reason = NULL, wake_at = ?, keep_active = 0, woke_at = NULL
       WHERE id = ? AND closed_at IS NULL`, (thread) => ({ ...thread, lifecycle }), at, wakeAt);
        this.#updateSidebarThread(id, (thread) => ({ ...thread, lifecycle }));
        return lifecycle;
    }
    activateThread(id, at = Date.now()) {
        const row = sqliteRow(this.#activateThreadStatement, at, id);
        if (!row)
            throw new Error('thread not found');
        const lifecycle = toActiveLifecycle(row);
        this.#updateCachedThread(id, (thread) => ({ ...thread, lifecycle }));
        this.#updateSidebarThread(id, (thread) => thread.lifecycle === lifecycle ? thread : { ...thread, lifecycle });
        return lifecycle;
    }
    wakeSnoozedThread(id, dueAt, at = Date.now()) {
        const row = sqliteRow(this.#wakeSnoozedThreadStatement, at, at, id, dueAt);
        if (!row)
            return undefined;
        const lifecycle = toActiveLifecycle(row);
        this.#updateCachedThread(id, (thread) => ({ ...thread, lifecycle, lastActiveAt: at }));
        this.#updateSidebarThread(id, (thread) => ({ ...thread, lifecycle }));
        return lifecycle;
    }
    setThreadKeepActive(id, keepActive, at = Date.now()) {
        const lifecycle = this.activateThread(id, at);
        this.#db.prepare(`UPDATE threads SET keep_active = ? WHERE id = ?`).run(keepActive ? 1 : 0, id);
        const wokeAt = lifecycle.state === 'active' ? lifecycle.wokeAt : undefined;
        const updated = activeLifecycle(keepActive, wokeAt);
        this.#updateCachedThread(id, (thread) => ({ ...thread, lifecycle: updated }));
        this.#updateSidebarThread(id, (thread) => thread.lifecycle === updated ? thread : { ...thread, lifecycle: updated });
        return updated;
    }
    touchThread(id, unread = false, at = Date.now()) {
        const retained = this.thread(id);
        if (retained === undefined)
            throw new Error('thread not found');
        // A closed thread is frozen history. An event still landing after close
        // must not resurrect it, and must not fail the dispatch that already
        // appended the event either.
        if (retained.closedAt !== undefined)
            return retained.lifecycle;
        let lifecycle;
        if (retained.lifecycle.state === 'active') {
            const result = this.#touchActiveThreadStatement.run(at, unread ? 1 : 0, id);
            if (Number(result.changes) === 0)
                throw new Error('thread not found');
            lifecycle = retained.lifecycle;
        }
        else {
            const row = sqliteRow(this.#touchThreadStatement, at, at, unread ? 1 : 0, id);
            if (!row)
                throw new Error('thread not found');
            lifecycle = toActiveLifecycle(row);
        }
        this.#updateCachedThread(id, (thread) => ({
            ...thread,
            lifecycle,
            unread: thread.unread || unread,
            lastActiveAt: at,
        }));
        this.#updateSidebarThread(id, (thread) => {
            const nextUnread = thread.unread || unread;
            return thread.lifecycle === lifecycle && thread.unread === nextUnread
                ? thread
                : { ...thread, lifecycle, unread: nextUnread };
        });
        return lifecycle;
    }
    markThreadRead(id) {
        const result = this.#db
            .prepare(`UPDATE threads SET unread = 0, woke_at = NULL WHERE id = ? AND closed_at IS NULL`)
            .run(id);
        if (result.changes === 0) {
            // Closed history is read-only; a missing id is still a caller error.
            if (this.thread(id) === undefined)
                throw new Error('thread not found');
            return;
        }
        this.#updateCachedThread(id, (thread) => ({
            ...thread,
            lifecycle: thread.lifecycle.state === 'active'
                ? activeLifecycle(thread.lifecycle.keepActive, undefined)
                : thread.lifecycle,
            unread: false,
        }));
        this.#updateSidebarThread(id, (thread) => {
            const lifecycle = thread.lifecycle.state === 'active'
                ? activeLifecycle(thread.lifecycle.keepActive, undefined)
                : thread.lifecycle;
            return thread.lifecycle === lifecycle && !thread.unread
                ? thread
                : { ...thread, lifecycle, unread: false };
        });
    }
    dueSnoozedThreadIds(now = Date.now()) {
        return sqliteRows(this.#dueSnoozedThreadIds, now).map((row) => row.id);
    }
    inactiveThreadCandidates(cutoff) {
        return sqliteRows(this.#inactiveThreadCandidates, cutoff).map((row) => ({ id: row.id, unread: row.unread === 1 }));
    }
    /** The next time a lifecycle refresh can change persisted state. */
    nextLifecycleRefreshAt() {
        const snoozed = sqliteRow(this.#nextSnoozedThread)?.at;
        const autoSettleDays = this.sidebarSettings().autoSettleDays;
        const oldestActive = autoSettleDays === null ? null : sqliteRow(this.#oldestActiveThread)?.at;
        const settleAt = autoSettleDays === null || oldestActive === null || oldestActive === undefined
            ? undefined
            : Number(oldestActive) + autoSettleDays * 24 * 60 * 60 * 1_000;
        if (snoozed === null || snoozed === undefined)
            return settleAt;
        return settleAt === undefined ? Number(snoozed) : Math.min(Number(snoozed), settleAt);
    }
    sidebarSettings() {
        if (this.#sidebarSettingsCache)
            return this.#sidebarSettingsCache;
        const row = requiredSqliteRow(this.#readSidebarSettings);
        const parsed = SidebarSettingsSchema.safeParse({
            mode: row.mode,
            autoSettleDays: row.auto_settle_days === null ? null : Number(row.auto_settle_days),
        });
        // The lifecycle scheduler reads this at startup; a row a newer build
        // shaped differently must degrade, not keep the store from opening.
        this.#sidebarSettingsCache = Object.freeze(parsed.success ? parsed.data : { mode: 'classic', autoSettleDays: 3 });
        if (!parsed.success) {
            console.warn('[store] unreadable sidebar settings, using defaults');
        }
        return this.#sidebarSettingsCache;
    }
    updateSidebarSettings(settings) {
        const current = this.sidebarSettings();
        const next = Object.freeze({ ...current, ...settings });
        this.#writeSidebarSettings.run(next.mode, next.autoSettleDays);
        this.#sidebarSettingsCache = next;
        return this.#sidebarSettingsCache;
    }
    threadApproval(threadId) {
        const row = this.#db
            .prepare('SELECT mode FROM thread_approvals WHERE thread_id = ?')
            .get(threadId);
        return ApprovalModeSchema.safeParse(row?.['mode']).data;
    }
    setThreadApproval(threadId, mode) {
        this.#db
            .prepare(`INSERT INTO thread_approvals (thread_id, mode) VALUES (?, ?)
      ON CONFLICT(thread_id) DO UPDATE SET mode = excluded.mode`)
            .run(threadId, mode);
    }
    backgroundModelPreference() {
        if (this.#backgroundModelPreferenceCache)
            return this.#backgroundModelPreferenceCache;
        const row = sqliteRow(this.#readAppSetting, BACKGROUND_MODEL_SETTING);
        if (!row) {
            this.#backgroundModelPreferenceCache = AUTOMATIC_BACKGROUND_MODEL_PREFERENCE;
            return this.#backgroundModelPreferenceCache;
        }
        try {
            this.#backgroundModelPreferenceCache = freezeBackgroundModelPreference(BackgroundModelPreferenceSchema.parse(JSON.parse(row.value)));
        }
        catch {
            // Same shared-table story as the event log: a value a newer build
            // shaped differently degrades to the default, it does not brick reads.
            console.warn('[store] unreadable background model preference, using the default');
            this.#backgroundModelPreferenceCache = AUTOMATIC_BACKGROUND_MODEL_PREFERENCE;
        }
        return this.#backgroundModelPreferenceCache;
    }
    updateBackgroundModelPreference(preference) {
        this.#writeAppSetting.run(BACKGROUND_MODEL_SETTING, JSON.stringify(preference));
        this.#backgroundModelPreferenceCache = freezeBackgroundModelPreference(preference);
        return this.#backgroundModelPreferenceCache;
    }
    providerContextSettings() {
        if (this.#providerContextSettingsCache)
            return this.#providerContextSettingsCache;
        const row = sqliteRow(this.#readAppSetting, PROVIDER_CONTEXT_SETTING);
        let settings = {};
        if (row) {
            try {
                settings = ProviderContextSettingsMapSchema.parse(JSON.parse(row.value));
            }
            catch {
                // A shape a newer build wrote leaves every engine on its own defaults.
                console.warn('[store] unreadable provider context settings, using engine defaults');
            }
        }
        this.#providerContextSettingsCache = Object.freeze(settings);
        return this.#providerContextSettingsCache;
    }
    updateProviderContextSettings(provider, settings) {
        const next = { ...this.providerContextSettings() };
        if (settings.window === undefined && settings.compactAt === undefined)
            delete next[provider];
        else
            next[provider] = Object.freeze({ ...settings });
        this.#writeAppSetting.run(PROVIDER_CONTEXT_SETTING, JSON.stringify(next));
        this.#providerContextSettingsCache = Object.freeze(next);
        return this.#providerContextSettingsCache;
    }
    #updateThread(id, sql, update, ...params) {
        const result = this.#db.prepare(sql).run(...params, id);
        if (result.changes === 0)
            throw new Error('thread not found');
        this.#updateCachedThread(id, update);
    }
    #cacheThread(id, thread) {
        if (!this.#threadCache.has(id) && this.#threadCache.size >= THREAD_CACHE_LIMIT) {
            const oldestId = this.#threadCache.keys().next().value;
            if (oldestId !== undefined)
                this.#threadCache.delete(oldestId);
        }
        this.#threadCache.set(id, thread ?? null);
    }
    #updateCachedThread(id, update) {
        const current = this.#threadCache.get(id);
        if (current === undefined)
            return;
        if (current === null) {
            // A successful mutation proves that a previously missing row now exists.
            this.#threadCache.delete(id);
            return;
        }
        const next = update(current);
        if (next !== current)
            this.#threadCache.set(id, next);
    }
    #invalidateSidebarThreads() {
        this.#pendingSidebarThreads = undefined;
        this.#sidebarThreadsCache = undefined;
        this.#sidebarThreadIndexes = undefined;
    }
    #flushPendingSidebarThreads() {
        if (!this.#pendingSidebarThreads)
            return;
        this.#sidebarThreadsCache = this.#pendingSidebarThreads;
        this.#pendingSidebarThreads = undefined;
    }
    #updateSidebarThread(id, update) {
        const threads = this.#sidebarThreadsCache;
        const index = this.#sidebarThreadIndexes?.get(id);
        if (!threads || index === undefined)
            return;
        const current = (this.#pendingSidebarThreads ?? threads)[index];
        if (!current) {
            this.#invalidateSidebarThreads();
            return;
        }
        const next = update(current);
        if (next === current)
            return;
        const updated = this.#pendingSidebarThreads ?? [...threads];
        updated[index] = next;
        this.#pendingSidebarThreads = updated;
    }
    /**
     * Marks a session finished without discarding it. Closing a session ends the
     * process; it does not mean the user wanted the transcript gone.
     */
    closeThread(id) {
        const closedAt = Date.now();
        this.#transaction(() => {
            this.#clearQueuedTurns(id);
            this.#db.prepare(`UPDATE threads SET closed_at = ? WHERE id = ?`).run(closedAt, id);
            this.#deleteReplaySnapshot.run(id);
        });
        this.#deleteCachedReplaySnapshot(id);
        this.#updateCachedThread(id, (thread) => ({ ...thread, closedAt }));
        this.#updateSidebarThread(id, (thread) => ({ ...thread, closedAt }));
    }
    /** Clears the closed mark of an imported chat its provider can resume again. */
    reopenThread(id) {
        this.#db.prepare(`UPDATE threads SET closed_at = NULL WHERE id = ?`).run(id);
        this.#updateCachedThread(id, ({ closedAt: _closedAt, ...thread }) => thread);
        this.#updateSidebarThread(id, ({ closedAt: _closedAt, ...thread }) => thread);
    }
    deleteThread(id) {
        if (this.thread(id)?.worktreePath) {
            throw new Error('discard the isolated session checkout before deleting it');
        }
        // One transaction: a failure partway must not leave orphaned rows with
        // no owner and no path to ever clean them up.
        this.#db.exec('BEGIN IMMEDIATE');
        try {
            this.#db.prepare(`DELETE FROM session_search WHERE thread_id = ?`).run(id);
            this.#db.prepare(`DELETE FROM events WHERE thread_id = ?`).run(id);
            this.#db.prepare(`DELETE FROM checkpoints WHERE thread_id = ?`).run(id);
            this.#db.prepare(`DELETE FROM restore_undos WHERE thread_id = ?`).run(id);
            this.#db.prepare(`DELETE FROM diff_decisions WHERE thread_id = ?`).run(id);
            this.#db.prepare(`DELETE FROM design_runs WHERE thread_id = ?`).run(id);
            this.#db.prepare(`DELETE FROM threads WHERE id = ?`).run(id);
            this.#db.exec('COMMIT');
            this.#searchRevision += 1;
            this.#ephemeralThreads.delete(id);
            this.#deleteCachedReplaySnapshot(id);
            this.#cacheThread(id, undefined);
            this.#invalidateSidebarThreads();
        }
        catch (error) {
            this.#db.exec('ROLLBACK');
            throw error;
        }
    }
    historyStorage() {
        const count = (sql) => Number(this.#db.prepare(sql).get().count);
        const size = (file) => file !== ':memory:' && existsSync(file) ? statSync(file).size : 0;
        return {
            databaseBytes: size(this.location),
            walBytes: size(`${this.location}-wal`),
            reclaimableBytes: count('SELECT freelist_count AS count FROM pragma_freelist_count') *
                count('SELECT page_size AS count FROM pragma_page_size'),
            threads: count('SELECT count(*) AS count FROM threads'),
            closedThreads: count('SELECT count(*) AS count FROM threads WHERE closed_at IS NOT NULL'),
            events: count('SELECT count(*) AS count FROM events'),
        };
    }
    exportHistory(destination) {
        this.#transaction(() => this.#writeHistoryArchive(destination));
    }
    /** No automatic retention: preview the exact eligible closed tasks before applying. */
    historyCleanupCandidates(before) {
        if (!Number.isFinite(before) || before <= 0)
            throw new Error('cleanup requires a valid date');
        return sqliteRows(this.#db.prepare('SELECT id FROM threads WHERE closed_at < ? AND worktree_path IS NULL ORDER BY closed_at, id'), before).map((row) => row.id);
    }
    pruneHistory(before, archive) {
        let ids = [];
        this.#transaction(() => {
            ids = this.historyCleanupCandidates(before);
            // The archive is flushed to disk while the transaction still holds the
            // selected state. A failed write cannot erase even one conversation.
            this.#writeHistoryArchive(archive, ids);
            for (const id of ids) {
                this.#db.prepare('DELETE FROM session_search WHERE thread_id = ?').run(id);
                for (const table of [
                    'events',
                    'checkpoints',
                    'restore_undos',
                    'diff_decisions',
                    'design_runs',
                ]) {
                    this.#db.prepare(`DELETE FROM ${table} WHERE thread_id = ?`).run(id);
                }
                this.#db.prepare('DELETE FROM threads WHERE id = ?').run(id);
            }
        });
        for (const id of ids) {
            this.#ephemeralThreads.delete(id);
            this.#deleteCachedReplaySnapshot(id);
            this.#cacheThread(id, undefined);
        }
        this.#searchRevision += 1;
        this.#searchSnapshots.clear();
        this.#queuedThreadIdsCache = undefined;
        this.#invalidateSidebarThreads();
        return ids.length;
    }
    /**
     * Explicit maintenance: remove streamed text fragments that a later
     * completed event of the same item already contains in full. Replay reads
     * the completed text, so the transcript is unchanged. Delta-first recovery
     * sequences and imported provider records stay exact.
     */
    foldCompletedItemDeltas() {
        let removed = 0;
        // No derived table references a stream fragment, but every deleted event
        // would still scan the child tables whose event columns have no index.
        // The setting cannot change inside a transaction, so it wraps this one.
        this.#db.exec('PRAGMA foreign_keys = OFF');
        try {
            this.#transaction(() => {
                this.#db.exec(`
          CREATE TEMP TABLE fold_item_events AS
          SELECT seq, thread_id,
                 json_extract(payload, '$.type') AS type,
                 COALESCE(json_extract(payload, '$.item.id'), json_extract(payload, '$.itemId'))
                   AS item_id,
                 COALESCE(json_extract(payload, '$.item.text'), '') <> '' AS has_text
          FROM (
            SELECT seq, thread_id, CASE WHEN json_valid(payload) THEN payload END AS payload
            FROM events
          )
          WHERE json_extract(payload, '$.type') IN ('item.started', 'item.completed', 'item.delta');
          CREATE TEMP TABLE fold_item_bounds AS
          SELECT thread_id, item_id,
                 MIN(CASE WHEN type = 'item.started' THEN seq END) AS started_seq,
                 MIN(CASE WHEN type = 'item.delta' THEN seq END) AS first_delta_seq,
                 MAX(CASE WHEN type = 'item.completed' AND has_text THEN seq END) AS completed_seq
          FROM fold_item_events
          GROUP BY thread_id, item_id;
          CREATE INDEX temp.fold_item_bounds_item ON fold_item_bounds (thread_id, item_id);
        `);
                const result = this.#db
                    .prepare(`DELETE FROM events WHERE seq IN (
               SELECT fragment.seq
               FROM fold_item_events AS fragment
               JOIN fold_item_bounds AS bounds
                 ON bounds.thread_id = fragment.thread_id AND bounds.item_id = fragment.item_id
               WHERE fragment.type = 'item.delta'
                 AND bounds.started_seq < bounds.first_delta_seq
                 AND fragment.seq < bounds.completed_seq
                 AND NOT EXISTS (
                   SELECT 1 FROM provider_history_events AS provider
                   WHERE provider.event_seq = fragment.seq
                 )
             )`)
                    .run();
                removed = Number(result.changes);
                this.#db.exec('DROP TABLE temp.fold_item_events; DROP TABLE temp.fold_item_bounds');
            });
        }
        finally {
            this.#db.exec('PRAGMA foreign_keys = ON');
        }
        return removed;
    }
    reclaimHistorySpace() {
        // Explicit maintenance only; VACUUM is never on the streaming path.
        this.#db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
        this.#db.exec('VACUUM');
        this.#db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    }
    #writeHistoryArchive(destination, ids) {
        const descriptor = openSync(destination, 'wx', 0o600);
        let complete = false;
        try {
            const write = (value) => {
                const bytes = Buffer.from(`${JSON.stringify(value)}\n`);
                let offset = 0;
                while (offset < bytes.length)
                    offset += writeSync(descriptor, bytes, offset, bytes.length - offset);
            };
            write({
                format: 'tastecode-history',
                version: 2,
                exportedAt: Date.now(),
                checkpointNamespace: this.checkpointNamespace,
            });
            const tables = [
                'threads',
                'events',
                'provider_history',
                'provider_history_events',
                'checkpoints',
                'restore_undos',
                'diff_decisions',
                'design_runs',
            ];
            for (const table of tables) {
                const key = table === 'threads' ? 'id' : 'thread_id';
                if (ids) {
                    const query = this.#db.prepare(`SELECT * FROM ${table} WHERE ${key} = ?`);
                    for (const id of ids)
                        for (const row of query.iterate(id))
                            write({ table, row });
                }
                else {
                    for (const row of this.#db.prepare(`SELECT * FROM ${table}`).iterate())
                        write({ table, row });
                }
            }
            fsyncSync(descriptor);
            complete = true;
        }
        finally {
            closeSync(descriptor);
            if (!complete)
                rmSync(destination, { force: true });
        }
    }
    setDesignRun(threadId, payload) {
        this.#db
            .prepare(`INSERT INTO design_runs (thread_id, payload) VALUES (?, ?)
         ON CONFLICT (thread_id) DO UPDATE SET payload = excluded.payload`)
            .run(threadId, serializeJson(payload));
    }
    designRun(threadId) {
        const row = sqliteRow(this.#db.prepare(`SELECT payload FROM design_runs WHERE thread_id = ?`), threadId);
        if (!row)
            return undefined;
        return parseJsonValue(row.payload);
    }
    deleteDesignRun(threadId) {
        this.#db.prepare(`DELETE FROM design_runs WHERE thread_id = ?`).run(threadId);
    }
    // ---- queued turns -----------------------------------------------------
    queuedTurns(threadId) {
        const turns = [];
        for (const row of sqliteRows(this.#listQueuedTurns, threadId)) {
            const turn = toQueuedTurn(row);
            if (turn !== undefined)
                turns.push(turn);
        }
        return turns;
    }
    queuedThreadIds() {
        this.#queuedThreadIdsCache ??= new Set(sqliteRows(this.#queuedThreadIds).map((row) => row.thread_id));
        return this.#queuedThreadIdsCache;
    }
    hasQueuedSubmission(threadId, clientSubmissionId) {
        return this.#hasQueuedSubmission.get(threadId, clientSubmissionId) !== undefined;
    }
    enqueueQueuedTurn(turn) {
        const payload = JSON.stringify({
            text: turn.text,
            attachments: turn.attachments,
            options: turn.options,
            ...(turn.channel ? { channel: turn.channel } : {}),
        });
        this.#transaction(() => {
            const open = this.#openThread.get(turn.threadId);
            if (!open)
                throw new Error('thread not found');
            const position = Number(requiredSqliteRow(this.#nextQueuedPosition, turn.threadId).position);
            this.#appendQueuedTurnEvent(turn.threadId, turn.id, 'enqueue', {
                ...turn,
                intent: 'normal',
                position,
            });
            this.#insertQueuedTurn.run(turn.threadId, turn.id, turn.clientSubmissionId ?? null, position, payload, turn.createdAt);
        });
        this.#queuedThreadIdsCache = undefined;
    }
    deleteQueuedTurn(threadId, queueId) {
        return this.#mutateQueuedTurn(threadId, queueId, 'queued', 'delete', () => {
            this.#deleteQueuedTurn.run(threadId, queueId);
        });
    }
    moveQueuedTurn(threadId, queueId, direction) {
        return this.#transaction(() => {
            const current = sqliteRow(this.#queuedTurnPosition, threadId, queueId);
            if (!current)
                return false;
            const adjacent = sqliteRow(direction === 'up' ? this.#previousQueuedTurn : this.#nextQueuedTurn, threadId, current.position);
            if (!adjacent)
                return false;
            this.#appendQueuedTurnEvent(threadId, queueId, 'move', { direction });
            this.#swapQueuedTurnPositions.run(queueId, adjacent.position, adjacent.queue_id, current.position, threadId, queueId, adjacent.queue_id);
            return true;
        });
    }
    claimQueuedTurn(threadId, queueId, intent) {
        const claimed = this.#transaction(() => {
            const row = sqliteRow(this.#findQueuedTurn, threadId, queueId);
            if (!row)
                return undefined;
            const stored = toQueuedTurn(row);
            // Cannot honestly dispatch a prompt this build cannot read; the row
            // stays queued for a build that can.
            if (stored === undefined)
                return undefined;
            this.#appendQueuedTurnEvent(threadId, queueId, 'claim', { intent });
            this.#dispatchQueuedTurn.run(intent, threadId, queueId);
            return { ...stored, intent };
        });
        if (claimed)
            this.#queuedThreadIdsCache = undefined;
        return claimed;
    }
    restoreQueuedTurn(threadId, queueId) {
        return this.#mutateQueuedTurn(threadId, queueId, 'dispatching', 'restore', () => {
            this.#restoreQueuedTurn.run(threadId, queueId);
        });
    }
    completeQueuedTurn(threadId, queueId) {
        return this.#mutateQueuedTurn(threadId, queueId, 'dispatching', 'complete', () => {
            this.#deleteQueuedTurn.run(threadId, queueId);
        });
    }
    appendAndCompleteQueuedTurn(threadId, queueId, event) {
        const serializedEvent = JSON.stringify(event);
        const seq = this.#transaction(() => {
            const claimed = this.#claimedQueuedTurn.get(threadId, queueId);
            if (!claimed)
                throw new Error('queued prompt is no longer claimed');
            const eventSeq = this.#appendEventPayload(threadId, event, Date.now(), serializedEvent);
            this.#appendQueuedTurnEvent(threadId, queueId, 'complete', {});
            this.#deleteClaimedQueuedTurn.run(threadId, queueId);
            return eventSeq;
        });
        return { seq, serializedEvent };
    }
    clearQueuedTurns(threadId) {
        this.#transaction(() => this.#clearQueuedTurns(threadId));
    }
    clearAllQueuedTurns() {
        const threadIds = this.#transaction(() => {
            const threadIds = sqliteRows(this.#db.prepare(`SELECT DISTINCT thread_id FROM queued_turns ORDER BY thread_id`)).map((row) => row.thread_id);
            for (const threadId of threadIds)
                this.#clearQueuedTurns(threadId);
            return threadIds;
        });
        if (threadIds.length > 0)
            this.#queuedThreadIdsCache = undefined;
        return threadIds;
    }
    #mutateQueuedTurn(threadId, queueId, state, mutation, project) {
        const changed = this.#transaction(() => {
            const exists = this.#queuedTurnInState.get(threadId, queueId, state);
            if (!exists)
                return false;
            this.#appendQueuedTurnEvent(threadId, queueId, mutation, {});
            project();
            return true;
        });
        if (changed)
            this.#queuedThreadIdsCache = undefined;
        return changed;
    }
    #clearQueuedTurns(threadId) {
        const exists = this.#hasQueuedTurn.get(threadId);
        if (!exists)
            return;
        this.#appendQueuedTurnEvent(threadId, null, 'clear', {});
        this.#clearQueuedTurnsStatement.run(threadId);
        this.#queuedThreadIdsCache = undefined;
    }
    #appendQueuedTurnEvent(threadId, queueId, mutation, payload) {
        this.#insertQueuedTurnEvent.run(threadId, queueId, Date.now(), mutation, serializeJson(payload));
    }
    #recoverQueuedTurnClaims() {
        const claims = sqliteRows(this.#db.prepare(`SELECT thread_id, queue_id, intent FROM queued_turns WHERE state = 'dispatching'`)).map((claim) => ({ ...claim, intent: queuedTurnIntent(claim.intent) }));
        if (claims.length === 0)
            return;
        this.#transaction(() => {
            for (const claim of claims) {
                this.#appendQueuedTurnEvent(claim.thread_id, claim.queue_id, 'recover', {
                    intent: claim.intent,
                });
            }
            this.#db
                .prepare(`UPDATE queued_turns SET state = 'queued', intent = 'normal' WHERE state = 'dispatching'`)
                .run();
        });
    }
    #transaction(action) {
        this.#db.exec('BEGIN IMMEDIATE');
        try {
            const result = action();
            this.#db.exec('COMMIT');
            return result;
        }
        catch (error) {
            this.#db.exec('ROLLBACK');
            throw error;
        }
    }
    setDiffDecision(threadId, targetId, decision) {
        this.#db
            .prepare(`INSERT INTO diff_decisions (thread_id, target_id, decision) VALUES (?, ?, ?)
         ON CONFLICT (thread_id, target_id) DO UPDATE SET decision = excluded.decision`)
            .run(threadId, targetId, decision);
    }
    diffDecision(threadId, targetId) {
        const row = sqliteRow(this.#db.prepare(`SELECT decision FROM diff_decisions WHERE thread_id = ? AND target_id = ?`), threadId, targetId);
        if (!row)
            return undefined;
        const parsed = DiffDecisionSchema.safeParse(row.decision);
        if (parsed.success)
            return parsed.data;
        console.warn(`[store] unknown diff decision '${row.decision}', treating as undecided`);
        return undefined;
    }
    // ---- events ------------------------------------------------------------
    #interruptedThreadStates(rows) {
        const states = new Map();
        for (const row of rows) {
            // Leave newer-provider histories intact; they must not abort recovery of other threads.
            if (!this.thread(row.thread_id))
                continue;
            const event = parseDomainEvent(row.payload, `recovery for interrupted thread ${row.thread_id}`);
            if (event === undefined)
                continue;
            const state = states.get(row.thread_id) ?? {
                openTurns: new Set(),
                activeItems: new Map(),
                approvals: new Set(),
                userInputs: new Set(),
                reviews: new Map(),
                hasResumableInput: false,
            };
            states.set(row.thread_id, state);
            if (event.type === 'turn.started')
                state.openTurns.add(event.turn.id);
            if (event.type === 'item.started')
                state.activeItems.set(event.item.id, event.item);
            if (event.type === 'approval.requested')
                state.approvals.add(event.request.id);
            if (event.type === 'user_input.requested') {
                if (row.resumable)
                    state.hasResumableInput = true;
                else
                    state.userInputs.add(event.request.id);
            }
            if (event.type === 'approval.review.started') {
                state.reviews.set(event.review.id, event.review);
            }
        }
        return states;
    }
    /**
     * Close event lifecycles that cannot still be live in this server process.
     *
     * Agent sessions and their approval callbacks are process-owned. Replaying a
     * request after restart can draw the old approval card, but accepting it can
     * never reach the callback that died with the previous process. Settle that
     * durable state before clients connect so history stays honest and the user
     * gets a clear next action instead of a button that does nothing.
     */
    recoverInterruptedThreads() {
        this.#db.exec('BEGIN IMMEDIATE');
        try {
            // The write path keeps only current process-owned lifecycles here. A
            // long transcript therefore costs the same to recover as a short one.
            const rows = sqliteRows(this.#readInterruptedThreads);
            const recovered = [];
            const at = Date.now();
            for (const [threadId, state] of this.#interruptedThreadStates(rows)) {
                for (const event of interruptedLifecycleEvents(state, at)) {
                    this.#appendEvent(threadId, event, at);
                }
                if (state.openTurns.size === 0)
                    continue;
                if (!state.hasResumableInput) {
                    this.#appendEvent(threadId, { type: 'thread.error', threadId, message: RESTART_INTERRUPTION_MESSAGE }, at);
                }
                this.touchThread(threadId, true, at);
                recovered.push(threadId);
            }
            this.#db.exec('COMMIT');
            return recovered;
        }
        catch (error) {
            this.#db.exec('ROLLBACK');
            // The append/touch calls above also wrote to in-memory caches and the
            // search revision; a database rollback does not undo those.
            this.#threadCache.clear();
            this.#invalidateSidebarThreads();
            this.#searchRevision += 1;
            throw error;
        }
    }
    /**
     * The terminal events for every lifecycle one thread's runtime left open.
     *
     * Restart recovery settles these for a dead process; a runtime force-stopped
     * while the server keeps running needs the same, or its turn and requests
     * stay open in the log until the next restart. The caller records them.
     */
    interruptedLifecycleEvents(threadId) {
        const rows = sqliteRows(this.#readInterruptedThread, threadId);
        const state = this.#interruptedThreadStates(rows).get(threadId);
        return state ? interruptedLifecycleEvents(state, Date.now()) : [];
    }
    /** Returns the sequence number, which is what a client resumes from. */
    append(threadId, event) {
        const at = Date.now();
        const serializedEvent = JSON.stringify(event);
        return this.#appendSerializedEvent(threadId, event, at, serializedEvent);
    }
    /** Return the exact stored JSON so the push path can reuse its encoding. */
    appendWithSerializedEvent(threadId, event) {
        const at = Date.now();
        const serializedEvent = JSON.stringify(event);
        return {
            seq: this.#appendSerializedEvent(threadId, event, at, serializedEvent),
            serializedEvent,
        };
    }
    #appendSerializedEvent(threadId, event, at, serializedEvent) {
        // Token deltas intentionally have no secondary index. Keep the dominant
        // write path to one serialization and one prepared SQLite insert.
        if (event.type === 'item.delta') {
            return this.#insertEventRow(threadId, at, serializedEvent);
        }
        const searchEntry = this.#ephemeralThreads.has(threadId) ? undefined : searchableEntry(event);
        const usageEvent = event.type === 'usage.updated';
        const inboxEvent = affectsInboxProjection(event);
        const userSubmissionId = userSubmissionItemId(event);
        const turnDiffId = event.type === 'diff.updated' ? event.turnId : undefined;
        const recovery = recoveryMutation(event);
        // A lone SQLite insert is already atomic. Only open an explicit
        // transaction when the event and a derived index row must commit together.
        if (!searchEntry &&
            !usageEvent &&
            !inboxEvent &&
            userSubmissionId === undefined &&
            turnDiffId === undefined &&
            recovery === undefined) {
            return this.#insertEventRow(threadId, at, serializedEvent);
        }
        this.#db.exec('BEGIN IMMEDIATE');
        try {
            const seq = this.#insertEventRow(threadId, at, serializedEvent);
            if (searchEntry)
                this.#indexSearchEntry(seq, threadId, at, searchEntry);
            if (usageEvent)
                this.#indexUsageEvent(seq, threadId, at, serializedEvent);
            if (inboxEvent)
                this.#indexInboxEvent(seq, threadId, event, serializedEvent);
            if (userSubmissionId)
                this.#indexUserSubmission(seq, threadId, userSubmissionId);
            if (turnDiffId !== undefined)
                this.#indexTurnDiff(seq, threadId, turnDiffId);
            if (recovery)
                this.#indexRecoveryMutation(seq, threadId, recovery, serializedEvent);
            this.#db.exec('COMMIT');
            return seq;
        }
        catch (error) {
            this.#db.exec('ROLLBACK');
            throw error;
        }
    }
    /** Persist one window and retain each exact event encoding for its push. */
    appendBatchWithSerializedEvents(records) {
        if (records.length === 0)
            return [];
        const at = Date.now();
        return this.#transaction(() => records.map(({ threadId, event }) => {
            const serializedEvent = JSON.stringify(event);
            return {
                seq: this.#appendEventPayload(threadId, event, at, serializedEvent),
                serializedEvent,
            };
        }));
    }
    hasUserSubmission(threadId, itemId) {
        return this.#hasUserSubmission.get(threadId, itemId) !== undefined;
    }
    #insertEventRow(threadId, at, payload) {
        const cached = this.#replaySnapshotCache.get(threadId);
        if (cached)
            cached.tail = false;
        return Number(this.#insertEvent.run(threadId, at, payload).lastInsertRowid);
    }
    #appendEvent(threadId, event, at) {
        return this.#appendEventPayload(threadId, event, at, JSON.stringify(event));
    }
    #appendEventPayload(threadId, event, at, payload) {
        const seq = this.#insertEventRow(threadId, at, payload);
        if (event.type === 'item.delta')
            return seq;
        if (!this.#ephemeralThreads.has(threadId))
            this.#indexEvent(seq, threadId, at, event);
        if (event.type === 'usage.updated')
            this.#indexUsageEvent(seq, threadId, at, payload);
        if (affectsInboxProjection(event))
            this.#indexInboxEvent(seq, threadId, event, payload);
        const userSubmissionId = userSubmissionItemId(event);
        if (userSubmissionId)
            this.#indexUserSubmission(seq, threadId, userSubmissionId);
        if (event.type === 'diff.updated')
            this.#indexTurnDiff(seq, threadId, event.turnId);
        const recovery = recoveryMutation(event);
        if (recovery)
            this.#indexRecoveryMutation(seq, threadId, recovery, payload);
        return seq;
    }
    /**
     * The thread's history, optionally only what happened after `afterSeq`.
     *
     * A client that was connected and fell behind asks for the tail; one opening
     * the thread fresh asks for all of it. Same call either way.
     */
    history(threadId, afterSeq = 0) {
        const entries = [];
        for (const row of sqliteRows(this.#threadHistory, threadId, afterSeq)) {
            const event = parseDomainEvent(row.payload, `history for thread ${threadId}`);
            if (event === undefined)
                continue;
            entries.push({ seq: Number(row.seq), event });
        }
        return entries;
    }
    /** Read the latest saved replay as an immutable base, even when a small tail is newer. */
    replaySnapshotBase(threadId) {
        const cached = this.#replaySnapshotCache.get(threadId);
        if (cached) {
            this.#promoteCachedReplaySnapshot(threadId, cached);
            return { seq: cached.seq, entries: cached.entries };
        }
        const row = sqliteRow(this.#readReplaySnapshotBase, threadId);
        if (!row)
            return undefined;
        const seq = Number(row.seq);
        const entries = this.#cacheReplaySnapshot(threadId, seq, row.payload, seq === this.lastSeq(threadId));
        return entries ? { seq, entries } : undefined;
    }
    /**
     * The saved replay exactly as it stood at `seq`, even when newer events have
     * landed since. Every rewrite of older history deletes the snapshot, so a
     * replay still saved at that sequence describes the same older turns.
     */
    replaySnapshotAt(threadId, seq) {
        const cached = this.#replaySnapshotCache.get(threadId);
        if (cached) {
            if (cached.seq !== seq)
                return undefined;
            this.#promoteCachedReplaySnapshot(threadId, cached);
            return cached.entries;
        }
        const row = sqliteRow(this.#readReplaySnapshotBase, threadId);
        if (!row || Number(row.seq) !== seq)
            return undefined;
        return this.#cacheReplaySnapshot(threadId, seq, row.payload, seq === this.lastSeq(threadId));
    }
    /** Preserve SQLite's JSON for the first response after a process restart. */
    tailReplaySnapshotForResponse(threadId) {
        const cached = this.#replaySnapshotCache.get(threadId);
        // The saved row holds the same replay, so it is no tail either.
        if (cached && !cached.tail)
            return undefined;
        if (cached) {
            this.#promoteCachedReplaySnapshot(threadId, cached);
            return { entries: cached.entries };
        }
        const row = sqliteRow(this.#readTailReplaySnapshot, threadId);
        if (!row)
            return undefined;
        const entries = this.#cacheReplaySnapshot(threadId, Number(row.seq), row.payload, true);
        return entries ? { entries, serializedEntries: row.payload } : undefined;
    }
    #cacheReplaySnapshot(threadId, seq, payload, tail) {
        try {
            const entries = ReplaySnapshotSchema.parse(JSON.parse(payload));
            this.#rememberReplaySnapshot(threadId, seq, entries, payload.length, tail);
            return entries;
        }
        catch {
            this.#deleteReplaySnapshot.run(threadId);
            this.#deleteCachedReplaySnapshot(threadId);
            return undefined;
        }
    }
    #promoteCachedReplaySnapshot(threadId, cached) {
        this.#replaySnapshotCache.delete(threadId);
        this.#replaySnapshotCache.set(threadId, cached);
    }
    #rememberReplaySnapshot(threadId, seq, entries, characters, tail) {
        this.#deleteCachedReplaySnapshot(threadId);
        if (characters > REPLAY_SNAPSHOT_CACHE_CHARACTER_LIMIT)
            return;
        while (this.#replaySnapshotCache.size >= REPLAY_SNAPSHOT_CACHE_LIMIT ||
            this.#replaySnapshotCacheCharacters + characters > REPLAY_SNAPSHOT_CACHE_CHARACTER_LIMIT) {
            const oldestThreadId = this.#replaySnapshotCache.keys().next().value;
            if (oldestThreadId === undefined)
                break;
            this.#deleteCachedReplaySnapshot(oldestThreadId);
        }
        this.#replaySnapshotCache.set(threadId, { seq, entries, characters, tail });
        this.#replaySnapshotCacheCharacters += characters;
    }
    #deleteCachedReplaySnapshot(threadId) {
        const cached = this.#replaySnapshotCache.get(threadId);
        if (!cached)
            return;
        this.#replaySnapshotCache.delete(threadId);
        this.#replaySnapshotCacheCharacters -= cached.characters;
    }
    /**
     * Cache only renderer-ready derived data; the event log remains authoritative.
     * `readToEnd` marks a replay built from every stored row: it stays the latest
     * even when `seq` names an older event because the newest rows are unreadable
     * or retired.
     */
    saveReplaySnapshot(threadId, seq, entries, options = {}) {
        const payload = JSON.stringify(entries);
        this.#writeReplaySnapshot.run(threadId, seq, payload);
        this.#pruneReplaySnapshots.run(REPLAY_SNAPSHOT_DISK_LIMIT);
        this.#rememberReplaySnapshot(threadId, seq, entries, payload.length, options.readToEnd === true || seq === this.lastSeq(threadId));
        return payload;
    }
    /** Build only non-default sidebar status rows in one database read. */
    inboxProjections() {
        const projections = new Map();
        for (const row of sqliteRows(this.#threadInboxEvents)) {
            const event = parseDomainEvent(row.payload, `inbox projections for thread ${row.thread_id}`);
            if (event === undefined)
                continue;
            const projection = projections.get(row.thread_id) ?? emptyInboxProjection();
            applyInboxProjectionEvent(projection, event);
            if (isEmptyInboxProjection(projection))
                projections.delete(row.thread_id);
            else
                projections.set(row.thread_id, projection);
        }
        return projections;
    }
    /** The final provider-owned patch shown for one turn. */
    turnDiff(threadId, turnId) {
        const row = sqliteRow(this.#readTurnDiff, threadId, turnId);
        if (!row)
            return undefined;
        const event = parseDomainEvent(row.payload, `turn diff for thread ${threadId}`);
        return event?.type === 'diff.updated' ? event.diff : undefined;
    }
    searchSessions(options) {
        const requestedLimit = options.limit ?? 25;
        const limit = Number.isSafeInteger(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), MAX_SEARCH_PAGE_SIZE)
            : 25;
        const terms = searchTerms(options.query);
        if (terms.length === 0)
            return { results: [], nextCursor: null };
        const ftsQuery = toFtsQuery(terms);
        const cursor = decodeCursor(options.cursor);
        const parameters = [ftsQuery];
        let filterMask = 0;
        if (options.projectPath) {
            filterMask |= 1;
            parameters.push(options.projectPath);
        }
        if (options.provider) {
            filterMask |= 2;
            parameters.push(options.provider);
        }
        const now = Date.now();
        this.#pruneSearchSnapshots(now, false);
        let snapshotId;
        let snapshot;
        if (cursor) {
            snapshotId = cursor.snapshotId;
            const retained = this.#searchSnapshots.get(snapshotId);
            if (!retained || retained.expiresAt <= now) {
                this.#searchSnapshots.delete(snapshotId);
                throw new Error('Search results expired. Search again.');
            }
            if (retained.ftsQuery !== ftsQuery ||
                retained.projectPath !== (options.projectPath ?? null) ||
                retained.provider !== (options.provider ?? null)) {
                throw new Error('Search cursor does not match this query.');
            }
            retained.expiresAt = now + SEARCH_SNAPSHOT_TTL_MS;
            this.#searchSnapshots.delete(snapshotId);
            this.#searchSnapshots.set(snapshotId, retained);
            snapshot = retained;
        }
        else {
            const projectPath = options.projectPath ?? null;
            const provider = options.provider ?? null;
            let cached;
            for (const entry of this.#searchSnapshots) {
                const retained = entry[1];
                if (retained.revision === this.#searchRevision &&
                    retained.ftsQuery === ftsQuery &&
                    retained.projectPath === projectPath &&
                    retained.provider === provider) {
                    cached = entry;
                    break;
                }
            }
            if (cached) {
                snapshotId = cached[0];
                snapshot = cached[1];
                snapshot.expiresAt = now + SEARCH_SNAPSHOT_TTL_MS;
                this.#searchSnapshots.delete(snapshotId);
                this.#searchSnapshots.set(snapshotId, snapshot);
            }
            else {
                this.#pruneSearchSnapshots(now, true);
                const selectSnapshot = this.#selectSearchSnapshot.get(filterMask);
                if (!selectSnapshot)
                    throw new Error('search filter statement is unavailable');
                const row = sqliteRow(selectSnapshot, ...parameters);
                snapshotId = randomUUID();
                snapshot = {
                    ftsQuery,
                    terms,
                    projectPath,
                    provider,
                    revision: this.#searchRevision,
                    expiresAt: now + SEARCH_SNAPSHOT_TTL_MS,
                    rowIds: parseSearchRowIds(row?.search_rowids ?? '[]'),
                };
                this.#searchSnapshots.set(snapshotId, snapshot);
            }
        }
        let position = cursor?.position ?? 0;
        const rows = [];
        // A retained ranking may outlive a project, thread, or indexed event.
        // Advance through its positions until there is a full visible page plus lookahead.
        while (rows.length <= limit && position < snapshot.rowIds.length) {
            const pageRowIds = searchRowIdPage(snapshot.rowIds, position, position + limit + 1);
            rows.push(...sqliteRows(this.#readSearchResults, position, JSON.stringify(pageRowIds)).filter((row) => toProviderId(row.provider) !== undefined));
            position += pageRowIds.length;
        }
        const page = rows.slice(0, limit);
        const comparableTerms = terms.map(comparableSearchToken);
        const resultIds = encodeSearchResultIds(this.#searchResultKey, page.map((row) => Number(row.event_seq)));
        const last = page.at(-1);
        const hasMore = rows.length > limit && last !== undefined;
        const results = [];
        for (const [index, row] of page.entries()) {
            const provider = toProviderId(row.provider);
            if (provider === undefined)
                continue;
            results.push({
                resultId: resultIds[index],
                projectPath: row.project_path,
                projectName: row.project_name,
                threadId: row.thread_id,
                threadTitle: row.thread_title,
                turnId: row.turn_id,
                provider,
                createdAt: Number(row.created_at),
                snippet: createSearchSnippetWithComparableTerms(row.text, comparableTerms),
            });
        }
        return {
            results,
            nextCursor: hasMore
                ? encodeCursor({
                    snapshotId,
                    position: Number(last.position),
                })
                : null,
        };
    }
    #pruneSearchSnapshots(now, reserveSlot) {
        for (const [snapshotId, snapshot] of this.#searchSnapshots) {
            if (snapshot.expiresAt <= now)
                this.#searchSnapshots.delete(snapshotId);
        }
        const retainedCount = MAX_SEARCH_SNAPSHOTS - (reserveSlot ? 1 : 0);
        while (this.#searchSnapshots.size > retainedCount) {
            const oldestSnapshotId = this.#searchSnapshots.keys().next().value;
            if (oldestSnapshotId === undefined)
                break;
            this.#searchSnapshots.delete(oldestSnapshotId);
        }
    }
    #indexEvent(seq, threadId, at, event) {
        const entry = searchableEntry(event);
        if (!entry)
            return;
        this.#indexSearchEntry(seq, threadId, at, entry);
    }
    #indexSearchEntry(seq, threadId, at, entry) {
        const previousRevision = this.#searchRevision;
        this.#insertSearchEntry.run(seq, threadId, seq, entry.turnId, entry.createdAt ?? at, entry.text);
        this.#searchRevision = previousRevision + 1;
        if (this.#searchSnapshots.size === 0)
            return;
        const thread = this.#threadCache.get(threadId);
        let tokens;
        let tokensComputed = false;
        for (const snapshot of this.#searchSnapshots.values()) {
            if (snapshot.revision !== previousRevision)
                continue;
            if (thread &&
                ((snapshot.projectPath !== null && snapshot.projectPath !== thread.projectPath) ||
                    (snapshot.provider !== null && snapshot.provider !== thread.provider))) {
                snapshot.revision = this.#searchRevision;
                continue;
            }
            if (!tokensComputed) {
                tokens = asciiFtsTextTokens(entry.text);
                tokensComputed = true;
            }
            if (!tokens)
                continue;
            if (asciiFtsTokensDefinitelyMiss(snapshot.terms, tokens)) {
                snapshot.revision = this.#searchRevision;
            }
        }
    }
    #indexUsageEvent(seq, threadId, at, payload) {
        this.#insertUsageEvent.run(seq, threadId, at, payload);
    }
    #indexInboxEvent(seq, threadId, event, payload) {
        if (event.type === 'approval.requested' || event.type === 'user_input.requested') {
            this.#deleteInboxRequest.run(threadId, event.type, event.request.id);
            this.#insertInboxEvent.run(seq, threadId, payload);
            return;
        }
        if (event.type === 'approval.resolved') {
            this.#deleteInboxRequest.run(threadId, 'approval.requested', event.id);
            return;
        }
        if (event.type === 'user_input.resolved') {
            this.#deleteInboxRequest.run(threadId, 'user_input.requested', event.id);
            return;
        }
        if (event.type === 'thread.error') {
            this.#deleteInboxStatus.run(threadId);
            this.#insertInboxEvent.run(seq, threadId, payload);
            return;
        }
        if (event.type === 'turn.completed') {
            this.#deleteInboxStatus.run(threadId);
            if (event.status === 'failed')
                this.#insertInboxEvent.run(seq, threadId, payload);
        }
    }
    #indexUserSubmission(seq, threadId, itemId) {
        this.#insertUserSubmission.run(threadId, itemId, seq);
    }
    #indexTurnDiff(seq, threadId, turnId) {
        this.#insertTurnDiffEvent.run(seq, threadId, turnId);
    }
    #indexRecoveryMutation(seq, threadId, mutation, payload) {
        if (mutation.kind === 'start') {
            this.#upsertRecoveryStart.run(threadId, mutation.lifecycleKey, mutation.eventType, seq, payload, mutation.reopens ? 1 : 0);
            return;
        }
        if (mutation.kind === 'terminal') {
            this.#settleRecoveryLifecycle.run(threadId, mutation.lifecycleKey, seq);
            return;
        }
        this.#upsertRecoveryError.run(threadId, seq);
    }
    #rebuildDerivedIndexes(rebuild) {
        const eventTypes = new Set();
        const include = (...types) => {
            for (const type of types)
                eventTypes.add(type);
        };
        if (rebuild.search)
            include('item.completed');
        if (rebuild.usage)
            include('usage.updated');
        if (rebuild.inbox) {
            include('approval.requested', 'approval.resolved', 'user_input.requested', 'user_input.resolved', 'thread.error', 'turn.completed');
        }
        if (rebuild.userSubmission)
            include('item.started', 'item.completed');
        if (rebuild.turnDiff)
            include('diff.updated');
        if (rebuild.recovery) {
            include('turn.started', 'turn.completed', 'thread.error', 'item.started', 'item.completed', 'approval.requested', 'approval.resolved', 'user_input.requested', 'user_input.resolved', 'approval.review.started', 'approval.review.completed');
        }
        const types = [...eventTypes];
        const placeholders = types.map(() => '?').join(', ');
        const batch = this.#db.prepare(`SELECT seq, thread_id, at, payload FROM events
       WHERE seq > ?
         AND json_extract(CASE WHEN json_valid(payload) THEN payload END, '$.type') IN (${placeholders})
         AND seq NOT IN (SELECT event_seq FROM provider_history_events WHERE active = 0)
       ORDER BY seq LIMIT 5000`);
        const saveMigration = this.#db.prepare(`INSERT OR REPLACE INTO schema_migrations (name) VALUES (?)`);
        this.#db.exec('BEGIN IMMEDIATE');
        try {
            // Deleting every full-text row first tokenizes all of them again to
            // record deletions. A new table starts with an empty index.
            if (rebuild.search)
                this.#db.exec(`DROP TABLE session_search; ${SESSION_SEARCH_TABLE}`);
            if (rebuild.usage)
                this.#db.exec(`DELETE FROM usage_events`);
            if (rebuild.inbox)
                this.#db.exec(`DELETE FROM inbox_events`);
            if (rebuild.userSubmission)
                this.#db.exec(`DELETE FROM user_submission_items`);
            if (rebuild.turnDiff)
                this.#db.exec(`DELETE FROM turn_diff_events`);
            if (rebuild.recovery) {
                this.#db.exec(`DELETE FROM recovery_lifecycles; DELETE FROM recovery_errors`);
            }
            let cursor = 0;
            for (;;) {
                const rows = sqliteRows(batch, cursor, ...types);
                if (rows.length === 0)
                    break;
                for (const row of rows) {
                    const event = parseDomainEvent(row.payload, `derived index rebuild at event seq ${Number(row.seq)}`);
                    if (event === undefined)
                        continue;
                    const seq = Number(row.seq);
                    const at = Number(row.at);
                    if (rebuild.search)
                        this.#indexEvent(seq, row.thread_id, at, event);
                    if (rebuild.usage && event.type === 'usage.updated') {
                        this.#indexUsageEvent(seq, row.thread_id, at, row.payload);
                    }
                    if (rebuild.inbox && affectsInboxProjection(event)) {
                        this.#indexInboxEvent(seq, row.thread_id, event, row.payload);
                    }
                    if (rebuild.userSubmission) {
                        const itemId = userSubmissionItemId(event);
                        if (itemId)
                            this.#indexUserSubmission(seq, row.thread_id, itemId);
                    }
                    if (rebuild.turnDiff && event.type === 'diff.updated') {
                        this.#indexTurnDiff(seq, row.thread_id, event.turnId);
                    }
                    if (rebuild.recovery) {
                        const mutation = recoveryMutation(event);
                        if (mutation) {
                            this.#indexRecoveryMutation(seq, row.thread_id, mutation, row.payload);
                        }
                    }
                }
                cursor = Number(rows.at(-1)?.seq ?? cursor);
            }
            if (rebuild.search) {
                this.#db.exec(`INSERT INTO session_search (session_search) VALUES ('optimize')`);
                saveMigration.run(SEARCH_INDEX_VERSION);
            }
            if (rebuild.usage)
                saveMigration.run(USAGE_INDEX_VERSION);
            if (rebuild.inbox)
                saveMigration.run(INBOX_INDEX_VERSION);
            if (rebuild.userSubmission)
                saveMigration.run(USER_SUBMISSION_INDEX_VERSION);
            if (rebuild.turnDiff)
                saveMigration.run(TURN_DIFF_INDEX_VERSION);
            if (rebuild.recovery)
                saveMigration.run(RECOVERY_STATE_VERSION);
            this.#db.exec('COMMIT');
        }
        catch (error) {
            this.#db.exec('ROLLBACK');
            throw error;
        }
    }
    #rebuildThreadRecoveryState(threadId) {
        this.#db.prepare(`DELETE FROM recovery_lifecycles WHERE thread_id = ?`).run(threadId);
        this.#db.prepare(`DELETE FROM recovery_errors WHERE thread_id = ?`).run(threadId);
        const rows = sqliteRows(this.#db.prepare(`SELECT seq, thread_id, at, payload
         FROM events
         WHERE thread_id = ?
           AND seq NOT IN (SELECT event_seq FROM provider_history_events WHERE active = 0)
           AND json_extract(CASE WHEN json_valid(payload) THEN payload END, '$.type') IN (
             'turn.started', 'turn.completed', 'thread.error',
             'item.started', 'item.completed',
             'approval.requested', 'approval.resolved',
             'user_input.requested', 'user_input.resolved',
             'approval.review.started', 'approval.review.completed'
           )
         ORDER BY seq`), threadId);
        for (const row of rows) {
            const event = parseDomainEvent(row.payload, `recovery index rebuild for thread ${threadId}`);
            if (event === undefined)
                continue;
            const mutation = recoveryMutation(event);
            if (mutation) {
                this.#indexRecoveryMutation(Number(row.seq), row.thread_id, mutation, row.payload);
            }
        }
    }
    #rebuildThreadInboxState(threadId) {
        this.#deleteThreadInboxEvents.run(threadId);
        const rows = sqliteRows(this.#db.prepare(`SELECT seq, thread_id, at, payload
         FROM events
         WHERE thread_id = ?
           AND seq NOT IN (SELECT event_seq FROM provider_history_events WHERE active = 0)
           AND json_extract(CASE WHEN json_valid(payload) THEN payload END, '$.type') IN (
             'approval.requested', 'approval.resolved',
             'user_input.requested', 'user_input.resolved',
             'thread.error', 'turn.completed'
           )
         ORDER BY seq`), threadId);
        for (const row of rows) {
            const event = parseDomainEvent(row.payload, `inbox index rebuild for thread ${threadId}`);
            if (event === undefined)
                continue;
            this.#indexInboxEvent(Number(row.seq), row.thread_id, event, row.payload);
        }
    }
    usageSummary(threadId, since) {
        const thread = this.thread(threadId);
        if (!thread)
            return { session: emptyUsage(), today: emptyUsage() };
        // The LIKE prefilter keeps SQLite from handing us every delta chunk ever
        // streamed just to find the rare usage rows; the type check below still
        // decides for real. Substring match, so key order in the payload is
        // irrelevant and a false positive costs one JSON.parse, not correctness.
        //
        // Two bounded scans instead of one unbounded one: the session total only
        // needs this thread's rows, and "today" only needs rows since midnight —
        // across every provider, because the user's day is not provider-scoped.
        const parseUsage = (payload, owner) => {
            const event = parseDomainEvent(payload, `usage summary for thread ${owner}`);
            return event?.type === 'usage.updated'
                ? { total: withoutContext(event.usage), cumulative: event.usage.cumulative === true }
                : undefined;
        };
        let session = emptyUsage();
        {
            const rows = sqliteRows(this.#db.prepare(`SELECT payload FROM usage_events
           WHERE thread_id = ? ORDER BY at, event_seq`), threadId);
            let previous;
            for (const row of rows) {
                const sample = parseUsage(row.payload, threadId);
                if (!sample)
                    continue;
                const current = sample.total;
                const increment = sample.cumulative ? usageIncrement(current, previous) : current;
                if (sample.cumulative)
                    previous = current;
                session = addUsage(session, increment);
            }
        }
        let today = emptyUsage();
        {
            // Seed each thread with its last usage row before the window, so a
            // running-total provider's first in-window increment is a diff, not the
            // whole session so far.
            const previous = new Map();
            const seeds = sqliteRows(this.#db.prepare(`SELECT thread_id, payload FROM (
             SELECT thread_id, payload,
               ROW_NUMBER() OVER (PARTITION BY thread_id ORDER BY at DESC, event_seq DESC) AS position
             FROM usage_events WHERE at < ?
           ) WHERE position = 1`), since);
            for (const seed of seeds) {
                const usage = parseUsage(seed.payload, seed.thread_id);
                if (usage?.cumulative)
                    previous.set(seed.thread_id, usage.total);
            }
            const rows = sqliteRows(this.#db.prepare(`SELECT u.thread_id, u.payload, t.provider
           FROM usage_events u JOIN threads t ON t.id = u.thread_id
           WHERE u.at >= ?
           ORDER BY u.thread_id, u.at, u.event_seq`), since);
            for (const row of rows) {
                const sample = parseUsage(row.payload, row.thread_id);
                if (!sample)
                    continue;
                const current = sample.total;
                const increment = sample.cumulative
                    ? usageIncrement(current, previous.get(row.thread_id))
                    : current;
                if (sample.cumulative)
                    previous.set(row.thread_id, current);
                today = addUsage(today, increment);
            }
        }
        return { session, today };
    }
    // ---- checkpoints -------------------------------------------------------
    recordCheckpointRepository(repoPath) {
        this.#db.prepare('INSERT OR IGNORE INTO checkpoint_repositories(path) VALUES (?)').run(repoPath);
    }
    checkpointRepositories() {
        return sqliteRows(this.#db.prepare('SELECT path FROM checkpoint_repositories')).map((row) => row.path);
    }
    /** Include the hidden conversation tail needed to undo a restore. */
    checkpointReferences() {
        const result = new Map();
        const add = (threadId, commit) => {
            let entry = result.get(threadId);
            if (!entry) {
                const thread = sqliteRow(this.#db.prepare('SELECT project_path, worktree_path FROM threads WHERE id = ?'), threadId);
                if (!thread)
                    return;
                entry = {
                    threadId,
                    projectPath: thread.project_path,
                    ...(thread.worktree_path ? { worktreePath: thread.worktree_path } : {}),
                    commits: new Set(),
                };
                result.set(threadId, entry);
            }
            entry.commits.add(commit);
        };
        for (const row of sqliteRows(this.#db.prepare('SELECT * FROM checkpoints')))
            add(row.thread_id, row.commit_sha);
        for (const row of sqliteRows(this.#db.prepare('SELECT * FROM restore_undos'))) {
            add(row.thread_id, row.snapshot_commit);
            for (const checkpoint of StoredCheckpointRowsSchema.parse(JSON.parse(row.checkpoints_json)))
                add(row.thread_id, checkpoint.commit_sha);
        }
        return [...result.values()];
    }
    addCheckpoint(entry) {
        const createdAt = Date.now();
        const result = this.#db
            .prepare(`INSERT INTO checkpoints (thread_id, seq, commit_sha, label, created_at)
         VALUES (?, ?, ?, ?, ?)`)
            .run(entry.threadId, entry.seq, entry.commit, entry.label, createdAt);
        return { id: Number(result.lastInsertRowid), createdAt, ...entry };
    }
    checkpoints(threadId) {
        return sqliteRows(this.#db.prepare(`SELECT * FROM checkpoints WHERE thread_id = ? ORDER BY seq`), threadId).map((row) => {
            return {
                id: Number(row.id),
                threadId: row.thread_id,
                seq: Number(row.seq),
                commit: row.commit_sha,
                label: row.label,
                createdAt: Number(row.created_at),
            };
        });
    }
    checkpoint(id) {
        const row = sqliteRow(this.#db.prepare(`SELECT * FROM checkpoints WHERE id = ?`), id);
        if (!row)
            return undefined;
        return {
            id: Number(row.id),
            threadId: row.thread_id,
            seq: Number(row.seq),
            commit: row.commit_sha,
            label: row.label,
            createdAt: Number(row.created_at),
        };
    }
    /**
     * Drop everything after a point in the conversation.
     *
     * Rolling the files back without this would leave the thread describing work
     * that no longer exists on disk — the transcript and the repository telling
     * two different stories.
     */
    #truncateAfter(threadId, seq) {
        this.#deleteReplaySnapshot.run(threadId);
        this.#deleteCachedReplaySnapshot(threadId);
        // Sequence numbers are never reused, so a client that saw a removed event
        // holds a cursor in (seq, through]. Widen the range across restores.
        this.#db
            .prepare(`UPDATE threads SET
           history_rewrite_after = MIN(COALESCE(history_rewrite_after, ?), ?),
           history_rewrite_through = MAX(COALESCE(history_rewrite_through, 0), removed.through)
         FROM (SELECT MAX(seq) AS through FROM events WHERE thread_id = ? AND seq > ?) AS removed
         WHERE id = ? AND removed.through IS NOT NULL`)
            .run(seq, seq, threadId, seq, threadId);
        this.#db
            .prepare(`DELETE FROM session_search
         WHERE rowid IN (SELECT seq FROM events WHERE thread_id = ? AND seq > ?)`)
            .run(threadId, seq);
        this.#searchRevision += 1;
        this.#db.prepare(`DELETE FROM events WHERE thread_id = ? AND seq > ?`).run(threadId, seq);
        this.#db.prepare(`DELETE FROM checkpoints WHERE thread_id = ? AND seq > ?`).run(threadId, seq);
        // The inbox index keeps only current state. Rebuild this one thread so a
        // removed resolution or terminal event exposes the retained state again.
        this.#rebuildThreadInboxState(threadId);
        // Terminal rows are compact tombstones. Rebuild this one thread so a
        // removed terminal event exposes the retained start again.
        this.#rebuildThreadRecoveryState(threadId);
    }
    threadNeedsRestoreContext(threadId) {
        return (this.#db
            .prepare('SELECT 1 FROM threads WHERE id = ? AND restore_context_pending = 1')
            .get(threadId) !== undefined);
    }
    clearThreadRestoreContext(threadId) {
        this.#db.prepare('UPDATE threads SET restore_context_pending = 0 WHERE id = ?').run(threadId);
    }
    /** Save and remove the conversation tail so a restore remains reversible. */
    saveRestoreUndo(threadId, seq, commit) {
        const token = randomUUID();
        const events = sqliteRows(this.#db.prepare(`SELECT e.*, p.event_key, p.active FROM events e
         LEFT JOIN provider_history_events p ON p.event_seq = e.seq
         WHERE e.thread_id = ? AND e.seq > ? ORDER BY e.seq`), threadId, seq);
        const checkpoints = sqliteRows(this.#db.prepare(`SELECT * FROM checkpoints WHERE thread_id = ? AND seq > ? ORDER BY seq`), threadId, seq);
        this.#db.exec('BEGIN IMMEDIATE');
        try {
            this.#db.prepare(`DELETE FROM restore_undos WHERE thread_id = ?`).run(threadId);
            this.#db
                .prepare(`INSERT INTO restore_undos
             (token, thread_id, checkpoint_seq, snapshot_commit, events_json, checkpoints_json)
           VALUES (?, ?, ?, ?, ?, ?)`)
                .run(token, threadId, seq, commit, JSON.stringify(events), JSON.stringify(checkpoints));
            this.#truncateAfter(threadId, seq);
            this.#db.prepare('UPDATE threads SET restore_context_pending = 1 WHERE id = ?').run(threadId);
            this.#db.exec('COMMIT');
            return token;
        }
        catch (error) {
            this.#db.exec('ROLLBACK');
            throw error;
        }
    }
    restoreUndo(threadId, token) {
        const row = sqliteRow(this.#db.prepare(`SELECT snapshot_commit FROM restore_undos WHERE thread_id = ? AND token = ?`), threadId, token);
        if (!row)
            return undefined;
        return { commit: row.snapshot_commit };
    }
    /** Put back the exact event/checkpoint rows removed by the latest restore. */
    applyRestoreUndo(threadId, token) {
        const row = sqliteRow(this.#db.prepare(`SELECT * FROM restore_undos WHERE thread_id = ? AND token = ?`), threadId, token);
        if (!row)
            throw new Error('restore can no longer be undone');
        if (this.lastSeq(threadId) > Number(row.checkpoint_seq)) {
            throw new Error('restore can only be undone before the session continues');
        }
        const events = StoredEventRowsSchema.parse(JSON.parse(row.events_json));
        const checkpoints = StoredCheckpointRowsSchema.parse(JSON.parse(row.checkpoints_json));
        this.#db.exec('BEGIN IMMEDIATE');
        try {
            this.#deleteReplaySnapshot.run(threadId);
            this.#deleteCachedReplaySnapshot(threadId);
            const insertEvent = this.#db.prepare(`INSERT INTO events (seq, thread_id, at, payload) VALUES (?, ?, ?, ?)`);
            const insertProviderEvent = this.#db.prepare(`INSERT INTO provider_history_events (thread_id, event_key, event_seq, active)
         VALUES (?, ?, ?, ?)`);
            for (const event of events) {
                insertEvent.run(event.seq, event.thread_id, event.at, event.payload);
                if (event.event_key != null) {
                    insertProviderEvent.run(event.thread_id, event.event_key, event.seq, event.active ?? 1);
                    if (event.active === 0)
                        continue;
                }
                // The row is restored verbatim even when this build cannot read it —
                // the transcript is the user's; only derived indexing is skipped.
                const parsed = parseDomainEvent(event.payload, `restored transcript for thread ${event.thread_id}`);
                if (parsed === undefined)
                    continue;
                this.#indexEvent(event.seq, event.thread_id, event.at, parsed);
                if (parsed.type === 'usage.updated') {
                    this.#indexUsageEvent(event.seq, event.thread_id, event.at, event.payload);
                }
                if (affectsInboxProjection(parsed)) {
                    this.#indexInboxEvent(event.seq, event.thread_id, parsed, event.payload);
                }
                const userSubmissionId = userSubmissionItemId(parsed);
                if (userSubmissionId) {
                    this.#indexUserSubmission(event.seq, event.thread_id, userSubmissionId);
                }
                if (parsed.type === 'diff.updated') {
                    this.#indexTurnDiff(event.seq, event.thread_id, parsed.turnId);
                }
                const recovery = recoveryMutation(parsed);
                if (recovery) {
                    this.#indexRecoveryMutation(event.seq, event.thread_id, recovery, event.payload);
                }
            }
            const insertCheckpoint = this.#db.prepare(`INSERT INTO checkpoints (id, thread_id, seq, commit_sha, label, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`);
            for (const checkpoint of checkpoints) {
                insertCheckpoint.run(checkpoint.id, checkpoint.thread_id, checkpoint.seq, checkpoint.commit_sha, checkpoint.label, checkpoint.created_at);
            }
            this.#db.prepare(`DELETE FROM restore_undos WHERE token = ?`).run(token);
            this.#db.prepare('UPDATE threads SET restore_context_pending = 1 WHERE id = ?').run(threadId);
            this.#db.exec('COMMIT');
        }
        catch (error) {
            this.#db.exec('ROLLBACK');
            throw error;
        }
    }
    lastSeq(threadId) {
        const row = sqliteRow(this.#lastSequence, threadId);
        const seq = row?.seq ?? null;
        return seq ? Number(seq) : 0;
    }
}
function searchableEntry(event) {
    if (event.type !== 'item.completed')
        return undefined;
    const { item } = event;
    const text = item.type === 'message'
        ? item.text
        : item.type === 'command'
            ? [item.command, item.text].filter(Boolean).join('\n')
            : item.type === 'tool_call' || item.type === 'error'
                ? item.text
                : undefined;
    if (!text?.trim())
        return undefined;
    return {
        turnId: item.turnId,
        createdAt: item.createdAt,
        text: item.type === 'message' ? text : boundedSearchText(text),
    };
}
function boundedSearchText(text) {
    if (text.length <= SEARCH_OUTPUT_HEAD_CHARACTERS + SEARCH_OUTPUT_TAIL_CHARACTERS)
        return text;
    let headEnd = SEARCH_OUTPUT_HEAD_CHARACTERS;
    if (isHighSurrogate(text.charCodeAt(headEnd - 1)))
        headEnd -= 1;
    let tailStart = text.length - SEARCH_OUTPUT_TAIL_CHARACTERS;
    if (isHighSurrogate(text.charCodeAt(tailStart - 1)))
        tailStart += 1;
    return `${text.slice(0, headEnd)}\n…\n${text.slice(tailStart)}`;
}
function isHighSurrogate(code) {
    return code >= 0xd800 && code <= 0xdbff;
}
function userSubmissionItemId(event) {
    if (event.type !== 'item.started' && event.type !== 'item.completed')
        return undefined;
    return event.item.type === 'message' && event.item.role === 'user' ? event.item.id : undefined;
}
function recoveryMutation(event) {
    switch (event.type) {
        case 'turn.started':
            return {
                kind: 'start',
                eventType: event.type,
                lifecycleKey: `turn:${event.turn.id}`,
            };
        case 'turn.completed':
            return { kind: 'terminal', lifecycleKey: `turn:${event.turnId}` };
        case 'item.started':
            return {
                kind: 'start',
                eventType: event.type,
                lifecycleKey: `item:${event.item.id}`,
            };
        case 'item.completed':
            return { kind: 'terminal', lifecycleKey: `item:${event.item.id}` };
        // A request id asked again after its answer is a new question (a retried
        // command reuses its id), not a late echo like an item started after it
        // completed, so it reopens the lifecycle.
        case 'approval.requested':
            return {
                kind: 'start',
                eventType: event.type,
                lifecycleKey: `approval:${event.request.id}`,
                reopens: true,
            };
        case 'approval.resolved':
            return { kind: 'terminal', lifecycleKey: `approval:${event.id}` };
        case 'user_input.requested':
            return {
                kind: 'start',
                eventType: event.type,
                lifecycleKey: `input:${event.request.id}`,
                reopens: true,
            };
        case 'user_input.resolved':
            return { kind: 'terminal', lifecycleKey: `input:${event.id}` };
        case 'approval.review.started':
            return {
                kind: 'start',
                eventType: event.type,
                lifecycleKey: `review:${event.review.id}`,
            };
        case 'approval.review.completed':
            return { kind: 'terminal', lifecycleKey: `review:${event.review.id}` };
        case 'thread.error':
            return { kind: 'error' };
        default:
            return undefined;
    }
}
/** The terminal events that settle every lifecycle a dead runtime left open. */
function interruptedLifecycleEvents(state, at) {
    const events = [];
    for (const item of state.activeItems.values()) {
        // Omitting text preserves every persisted delta when the renderer
        // folds this terminal item over the streamed version.
        const { text: _streamedText, ...started } = item;
        events.push({ type: 'item.completed', item: { ...started, status: 'failed' } });
    }
    for (const id of state.approvals)
        events.push({ type: 'approval.resolved', id });
    for (const id of state.userInputs)
        events.push({ type: 'user_input.resolved', id });
    for (const review of state.reviews.values()) {
        if (review.status !== 'in_progress')
            continue;
        events.push({
            type: 'approval.review.completed',
            review: { ...review, status: 'aborted', completedAt: at },
        });
    }
    for (const turnId of state.openTurns) {
        events.push({ type: 'turn.completed', turnId, status: 'interrupted' });
    }
    return events;
}
function encodeSearchResultIds(key, eventSeqs) {
    const source = Buffer.alloc(eventSeqs.length * 16);
    for (const [index, eventSeq] of eventSeqs.entries()) {
        source[index * 16] = 1;
        source.writeBigUInt64BE(BigInt(eventSeq), index * 16 + 8);
    }
    const cipher = createCipheriv('aes-256-ecb', key, null);
    cipher.setAutoPadding(false);
    const encoded = Buffer.concat([cipher.update(source), cipher.final()]);
    return eventSeqs.map((_, index) => `sr1_${encoded.subarray(index * 16, (index + 1) * 16).toString('base64url')}`);
}
function searchTerms(query) {
    const terms = query.normalize('NFKC').toLowerCase().match(SEARCH_TOKEN) ?? [];
    return [...new Set(terms)];
}
function asciiFtsTextTokens(value) {
    if (value.length > SEARCH_SNAPSHOT_REUSE_SCAN_LIMIT || !ASCII_SEARCH_TEXT.test(value)) {
        return undefined;
    }
    return value.toLowerCase().match(ASCII_FTS_TEXT_TOKEN) ?? [];
}
function asciiFtsTokensDefinitelyMiss(search, text) {
    for (const term of search) {
        if (!ASCII_FTS_SEARCH_TERM.test(term))
            continue;
        if (!text.some((token) => token.startsWith(term)))
            return true;
    }
    return false;
}
function toFtsQuery(terms) {
    return terms.map((term) => `("${term}" OR "${term}"*)`).join(' AND ');
}
function encodeCursor(cursor) {
    return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}
function decodeCursor(cursor) {
    if (!cursor)
        return undefined;
    try {
        return SearchCursorSchema.parse(JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')));
    }
    catch {
        return undefined;
    }
}
export function createSearchSnippet(value, terms) {
    return createSearchSnippetWithComparableTerms(value, terms.map(comparableSearchToken));
}
function createSearchSnippetWithComparableTerms(value, comparableTerms) {
    const asciiMatcher = asciiSnippetMatcher(value, comparableTerms);
    if (asciiMatcher)
        return createAsciiSearchSnippet(value, comparableTerms, asciiMatcher);
    const tokenLimit = 24;
    const recentLimit = tokenLimit - 1;
    const recent = [];
    const firstTokens = [];
    const iterator = value.matchAll(SEARCH_TOKEN)[Symbol.iterator]();
    let recentStart = 0;
    let tokenCount = 0;
    let firstMatch = -1;
    let selectedPriorCount = 0;
    let preceding = [];
    let tokens;
    let endsAtValueEnd = true;
    while (true) {
        const next = iterator.next();
        if (next.done)
            break;
        const match = next.value;
        const start = match.index;
        const text = match[0];
        const token = {
            start,
            end: start + text.length,
            highlighted: comparableTerms.some((term) => comparableSearchToken(text).startsWith(term)),
        };
        const tokenIndex = tokenCount;
        tokenCount += 1;
        if (tokens) {
            tokens.push(token);
            if (tokens.length < tokenLimit)
                continue;
            endsAtValueEnd = iterator.next().done === true;
            break;
        }
        if (firstTokens.length < tokenLimit)
            firstTokens.push(token);
        if (token.highlighted) {
            firstMatch = tokenIndex;
            preceding =
                recentStart === 0
                    ? recent.slice()
                    : [...recent.slice(recentStart), ...recent.slice(0, recentStart)];
            selectedPriorCount = Math.min(6, preceding.length);
            tokens = [...preceding.slice(-selectedPriorCount), token];
            continue;
        }
        if (recent.length < recentLimit)
            recent.push(token);
        else {
            recent[recentStart] = token;
            recentStart = (recentStart + 1) % recentLimit;
        }
    }
    if (tokenCount === 0)
        return [{ text: value, highlighted: false }];
    let firstToken = 0;
    if (!tokens) {
        tokens = firstTokens;
        endsAtValueEnd = tokenCount <= tokenLimit;
    }
    else {
        if (endsAtValueEnd && tokens.length < tokenLimit) {
            const unselectedPriorCount = preceding.length - selectedPriorCount;
            const additionalPriorCount = Math.min(tokenLimit - tokens.length, unselectedPriorCount);
            if (additionalPriorCount > 0) {
                const end = preceding.length - selectedPriorCount;
                tokens = [...preceding.slice(end - additionalPriorCount, end), ...tokens];
                selectedPriorCount += additionalPriorCount;
            }
        }
        firstToken = firstMatch - selectedPriorCount;
    }
    return formatSearchSnippet(value, tokens, firstToken === 0, endsAtValueEnd);
}
function asciiSnippetMatcher(value, comparableTerms) {
    if (comparableTerms.length === 0 ||
        !comparableTerms.every((term) => ASCII_COMPARABLE_SEARCH_TERM.test(term))) {
        return undefined;
    }
    const matcher = new RegExp(comparableTerms.join('|'), 'gi');
    const firstRawMatch = matcher.exec(value);
    if (firstRawMatch && firstRawMatch.index < ASCII_SNIPPET_SCAN_THRESHOLD)
        return undefined;
    if (!ASCII_SEARCH_TEXT.test(value))
        return undefined;
    matcher.lastIndex = 0;
    return matcher;
}
function createAsciiSearchSnippet(value, comparableTerms, matcher) {
    const firstMatch = firstAsciiSearchMatch(value, matcher);
    if (firstMatch === undefined) {
        const tokens = nextAsciiSearchTokens(value, 0, 25);
        return formatSearchSnippet(value, highlightAsciiSearchTokens(value, tokens.slice(0, 24), comparableTerms), true, tokens.length <= 24);
    }
    const matched = nextAsciiSearchToken(value, firstMatch);
    if (!matched)
        return [{ text: value, highlighted: false }];
    const previous = [];
    let cursor = matched.start;
    while (previous.length < 24) {
        const token = previousAsciiSearchToken(value, cursor);
        if (!token)
            break;
        previous.push(token);
        cursor = token.start;
    }
    const following = nextAsciiSearchTokens(value, matched.end, 24);
    const selectedFollowingCount = Math.min(17, following.length);
    const selectedPriorCount = Math.min(23 - selectedFollowingCount, previous.length);
    const selected = [
        ...previous.slice(0, selectedPriorCount).reverse(),
        matched,
        ...following.slice(0, 23 - selectedPriorCount),
    ];
    const selectedFollowing = selected.length - selectedPriorCount - 1;
    return formatSearchSnippet(value, highlightAsciiSearchTokens(value, selected, comparableTerms), previous.length <= selectedPriorCount, following.length <= selectedFollowing);
}
function firstAsciiSearchMatch(value, matcher) {
    let match = matcher.exec(value);
    while (match) {
        if (isAsciiSearchTokenStart(value, match.index))
            return match.index;
        match = matcher.exec(value);
    }
    return undefined;
}
function isAsciiSearchTokenStart(value, index) {
    let cursor = index - 1;
    while (cursor >= 0 && value.charCodeAt(cursor) === 95)
        cursor -= 1;
    return cursor < 0 || !isAsciiSearchTokenInitial(value.charCodeAt(cursor));
}
function nextAsciiSearchTokens(value, from, limit) {
    const tokens = [];
    let cursor = from;
    while (tokens.length < limit) {
        const token = nextAsciiSearchToken(value, cursor);
        if (!token)
            break;
        tokens.push(token);
        cursor = token.end;
    }
    return tokens;
}
function nextAsciiSearchToken(value, from) {
    let start = from;
    while (start < value.length && !isAsciiSearchTokenInitial(value.charCodeAt(start)))
        start += 1;
    if (start >= value.length)
        return undefined;
    let end = start + 1;
    while (end < value.length && isAsciiSearchTokenContinuation(value.charCodeAt(end)))
        end += 1;
    return { start, end, highlighted: false };
}
function previousAsciiSearchToken(value, before) {
    let end = before;
    while (end > 0) {
        let cursor = end - 1;
        while (cursor >= 0 && !isAsciiSearchTokenContinuation(value.charCodeAt(cursor)))
            cursor -= 1;
        if (cursor < 0)
            return undefined;
        const tokenEnd = cursor + 1;
        while (cursor >= 0 && isAsciiSearchTokenContinuation(value.charCodeAt(cursor)))
            cursor -= 1;
        const runStart = cursor + 1;
        let start = runStart;
        while (start < tokenEnd && !isAsciiSearchTokenInitial(value.charCodeAt(start)))
            start += 1;
        if (start < tokenEnd)
            return { start, end: tokenEnd, highlighted: false };
        end = runStart;
    }
    return undefined;
}
function isAsciiSearchTokenInitial(code) {
    return (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}
function isAsciiSearchTokenContinuation(code) {
    return code === 95 || isAsciiSearchTokenInitial(code);
}
function highlightAsciiSearchTokens(value, tokens, comparableTerms) {
    return tokens.map((token) => ({
        ...token,
        highlighted: comparableTerms.some((term) => value.slice(token.start, token.end).toLowerCase().startsWith(term)),
    }));
}
function formatSearchSnippet(value, tokens, startsAtValueStart, endsAtValueEnd) {
    if (tokens.length === 0)
        return [{ text: value, highlighted: false }];
    const start = startsAtValueStart ? 0 : tokens[0].start;
    const end = endsAtValueEnd ? value.length : tokens.at(-1).end;
    const parts = [];
    const append = (text, highlighted) => {
        if (!text)
            return;
        const previous = parts.at(-1);
        if (previous?.highlighted === highlighted)
            previous.text += text;
        else
            parts.push({ text, highlighted });
    };
    if (start > 0)
        append('… ', false);
    let cursor = start;
    for (const token of tokens) {
        append(value.slice(cursor, token.start), false);
        append(value.slice(token.start, token.end), token.highlighted);
        cursor = token.end;
    }
    append(value.slice(cursor, end), false);
    if (end < value.length)
        append(' …', false);
    return parts.length > 0 ? parts : [{ text: value, highlighted: false }];
}
function comparableSearchToken(value) {
    if (ASCII_SEARCH_TOKEN.test(value))
        return value.toLowerCase();
    return value.normalize('NFKD').toLowerCase().replace(SEARCH_COMBINING_MARK, '');
}
function emptyUsage() {
    return {
        inputTokens: 0,
        cachedInputTokens: 0,
        outputTokens: 0,
        reasoningTokens: 0,
        totalTokens: 0,
    };
}
function withoutContext(usage) {
    const { contextWindow: _contextWindow, model: _model, cumulative: _cumulative, inputIncludesCached: _inputIncludesCached, ...total } = usage;
    // ACP can report context occupancy and cumulative cost without end-turn
    // token accounting. Keep the cost, but don't turn "tokens currently in
    // context" into tokens processed by the session summary.
    return usage.contextWindow &&
        total.inputTokens === 0 &&
        total.cachedInputTokens === 0 &&
        total.outputTokens === 0 &&
        total.reasoningTokens === 0
        ? { ...total, totalTokens: 0 }
        : total;
}
function addUsage(left, right) {
    const hasCost = left.costUsd !== undefined || right.costUsd !== undefined;
    return {
        inputTokens: left.inputTokens + right.inputTokens,
        cachedInputTokens: left.cachedInputTokens + right.cachedInputTokens,
        outputTokens: left.outputTokens + right.outputTokens,
        reasoningTokens: left.reasoningTokens + right.reasoningTokens,
        totalTokens: left.totalTokens + right.totalTokens,
        ...(hasCost ? { costUsd: (left.costUsd ?? 0) + (right.costUsd ?? 0) } : {}),
    };
}
function usageIncrement(current, previous = emptyUsage()) {
    const delta = (now, before) => (now >= before ? now - before : now);
    const costUsd = current.costUsd === undefined ? undefined : delta(current.costUsd, previous.costUsd ?? 0);
    return {
        inputTokens: delta(current.inputTokens, previous.inputTokens),
        cachedInputTokens: delta(current.cachedInputTokens, previous.cachedInputTokens),
        outputTokens: delta(current.outputTokens, previous.outputTokens),
        reasoningTokens: delta(current.reasoningTokens, previous.reasoningTokens),
        totalTokens: delta(current.totalTokens, previous.totalTokens),
        ...(!(costUsd === undefined) ? { costUsd } : {}),
    };
}
function toProject(row) {
    return {
        path: row.path,
        name: row.name,
        pinned: row.pinned === 1,
        createdAt: Number(row.created_at),
    };
}
function toQueuedTurn(row) {
    let payload;
    try {
        const parsed = StoredQueuedTurnPayloadSchema.safeParse(JSON.parse(row.payload));
        if (parsed.success)
            payload = parsed.data;
    }
    catch {
        // Malformed JSON falls through to the same tombstone below.
    }
    if (payload === undefined) {
        // A queued prompt only a newer build can read. There is no honest
        // fallback for missing text, so the row becomes a tombstone: still
        // stored, skipped by list reads, never dispatched half-read.
        console.warn(`[store] skipped a queued turn this build cannot read (thread ${row.thread_id}, queue ${row.queue_id})`);
        return undefined;
    }
    return {
        id: row.queue_id,
        threadId: row.thread_id,
        ...(row.client_submission_id === null ? {} : { clientSubmissionId: row.client_submission_id }),
        text: payload.text,
        attachments: payload.attachments,
        options: payload.options,
        createdAt: Number(row.created_at),
        intent: queuedTurnIntent(row.intent),
        ...(payload.channel ? { channel: payload.channel } : {}),
    };
}
/**
 * Read one stored event without letting a row this build cannot interpret
 * deny the rest of the log. The table is shared across builds: a payload a
 * newer version wrote fails this schema, and the row becomes a tombstone —
 * still stored, skipped by every reader.
 */
function parseDomainEvent(serialized, context) {
    let value;
    try {
        value = JSON.parse(serialized);
    }
    catch {
        console.warn(`[store] ${context}: skipped a stored event with malformed JSON`);
        return undefined;
    }
    // item.delta stays hand-checked: hundreds a second and zod never sees them.
    if (value !== null && typeof value === 'object') {
        const event = value;
        if (event.type === 'item.delta' &&
            typeof event.turnId === 'string' &&
            typeof event.itemId === 'string' &&
            typeof event.textDelta === 'string') {
            return {
                type: 'item.delta',
                turnId: event.turnId,
                itemId: event.itemId,
                textDelta: event.textDelta,
            };
        }
    }
    const parsed = DomainEventSchema.safeParse(value);
    if (parsed.success)
        return parsed.data;
    const type = value !== null && typeof value === 'object' ? value.type : undefined;
    console.warn(`[store] ${context}: skipped a stored event this build cannot read` +
        (typeof type === 'string' ? ` (type '${type}')` : ''));
    return undefined;
}
function toProviderId(provider) {
    switch (provider) {
        case 'codex':
        case 'claude-code':
        case 'grok':
            return provider;
        default: {
            const parsed = ProviderIdSchema.safeParse(provider);
            if (parsed.success)
                return parsed.data;
            // A provider this build does not ship: a newer build, or one that lives
            // only on the nightly branch. The row stays stored; readers skip it
            // rather than die on it.
            console.warn(`[store] skipped a thread row with unknown provider '${provider}'`);
            return undefined;
        }
    }
}
function isLifecycleReason(reason) {
    return reason === 'manual' || reason === 'inactivity' || reason === 'change_request';
}
function isNonnegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
}
const ACTIVE_LIFECYCLE = Object.freeze({ state: 'active', keepActive: false });
const KEPT_ACTIVE_LIFECYCLE = Object.freeze({ state: 'active', keepActive: true });
function activeLifecycle(keepActive, wokeAt) {
    if (wokeAt === undefined)
        return keepActive ? KEPT_ACTIVE_LIFECYCLE : ACTIVE_LIFECYCLE;
    return { state: 'active', keepActive, wokeAt };
}
/** Corrupt stored timestamps normalize to 0 rather than fail the whole row. */
function storedTimestamp(value) {
    const parsed = Number(value);
    return isNonnegativeInteger(parsed) ? parsed : 0;
}
function toActiveLifecycle(row) {
    const wokeAt = row.woke_at === null ? undefined : Number(row.woke_at);
    return activeLifecycle(row.keep_active === 1, wokeAt !== undefined && isNonnegativeInteger(wokeAt) ? wokeAt : undefined);
}
function toThreadLifecycle(row) {
    if (row.lifecycle_state === 'settled') {
        const reason = row.lifecycle_reason ?? 'manual';
        return {
            state: 'settled',
            settledAt: storedTimestamp(row.lifecycle_at ?? row.created_at),
            reason: isLifecycleReason(reason) ? reason : 'manual',
        };
    }
    if (row.lifecycle_state === 'snoozed') {
        return {
            state: 'snoozed',
            snoozedAt: storedTimestamp(row.lifecycle_at ?? row.created_at),
            wakeAt: storedTimestamp(row.wake_at ?? row.created_at),
        };
    }
    if (row.lifecycle_state === 'active') {
        return toActiveLifecycle(row);
    }
    // A lifecycle state only a newer build understands: report the thread as
    // plainly active rather than hide it or fail every list it appears in.
    console.warn(`[store] unknown lifecycle state '${row.lifecycle_state}', treating as active`);
    return activeLifecycle(row.keep_active === 1, undefined);
}
function toSidebarThread(row) {
    const provider = toProviderId(row.provider);
    // A thread this build cannot attribute stays in the table; it just has no
    // honest place in a sidebar rendered from the provider contract.
    if (provider === undefined)
        return undefined;
    return {
        id: row.id,
        projectPath: row.project_path,
        provider,
        ...(row.agent === null ? {} : { agent: row.agent }),
        title: row.title,
        pinned: row.pinned === 1,
        createdAt: Number(row.created_at),
        ...(row.closed_at === null ? {} : { closedAt: Number(row.closed_at) }),
        ...(row.worktree_branch === null ? {} : { worktreeBranch: row.worktree_branch }),
        lifecycle: toThreadLifecycle(row),
        unread: row.unread === 1,
    };
}
function toThread(row) {
    // Null timestamps (rows migrated before these columns existed) must not
    // become NaN — a snoozed thread with NaN wakeAt can never be woken.
    const lifecycle = toThreadLifecycle(row);
    const provider = toProviderId(row.provider);
    if (provider === undefined)
        return undefined;
    return {
        id: row.id,
        projectPath: row.project_path,
        provider,
        ...(row.agent === null ? {} : { agent: row.agent }),
        ...(row.provider_session_id === null ? {} : { providerSessionId: row.provider_session_id }),
        title: row.title,
        pinned: row.pinned === 1,
        createdAt: Number(row.created_at),
        ...(row.closed_at === null ? {} : { closedAt: Number(row.closed_at) }),
        ...(row.worktree_path === null ? {} : { worktreePath: row.worktree_path }),
        ...(row.worktree_branch === null ? {} : { worktreeBranch: row.worktree_branch }),
        lifecycle,
        unread: row.unread === 1,
        lastActiveAt: Number(row.last_active_at),
        ephemeral: row.ephemeral === 1,
        ...(row.parent_thread_id === null ? {} : { parentThreadId: row.parent_thread_id }),
    };
}
function sqliteRows(statement, ...params) {
    return statement.all(...params);
}
function sqliteRow(statement, ...params) {
    return statement.get(...params);
}
function requiredSqliteRow(statement, ...params) {
    const row = sqliteRow(statement, ...params);
    if (!row)
        throw new Error('SQLite query returned no row');
    return row;
}
function queuedTurnIntent(value) {
    if (value === 'normal' || value === 'steer')
        return value;
    // Runs in the constructor's claim recovery: one intent only a newer build
    // wrote must not keep the store from opening. A normal turn is the honest
    // degradation — the prompt still runs, just without steer semantics.
    console.warn(`[store] unknown queued turn intent '${value}', treating as normal`);
    return 'normal';
}
function serializeJson(value) {
    const serialized = JSON.stringify(value);
    if (serialized === undefined)
        throw new Error('value cannot be stored as JSON');
    return serialized;
}
function parseJsonValue(serialized) {
    // SAFETY: JSON.parse can return only JSON primitives, arrays, and objects.
    return JSON.parse(serialized);
}
//# sourceMappingURL=store.js.map