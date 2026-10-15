import type { WebSocket } from 'ws';
import type { ChannelName, DataOf } from '@harness/contracts';
export type PushSocket = Pick<WebSocket, 'OPEN' | 'readyState' | 'send' | 'terminate'> & Partial<Pick<WebSocket, 'bufferedAmount'>>;
export declare const MAX_PUSH_BUFFER_BYTES: number;
export declare const MAX_REPLY_FRAME_BYTES: number;
type RecordedEventChannel = 'thread.event' | 'sideChat.event';
/**
 * All outbound pushes go through one ordered path.
 *
 * `sequence` is monotonic per connection, so a client that sees a gap knows it
 * missed something and can resync instead of silently diverging — the failure
 * mode that is impossible to debug after the fact.
 */
export declare class PushBus<Socket extends PushSocket = WebSocket> {
    #private;
    add(socket: Socket): void;
    remove(socket: Socket): void;
    /**
     * Push to one connection. A dead socket must never take the caller down —
     * one client resetting its TCP connection cannot be allowed to starve every
     * other connection of the rest of a broadcast.
     */
    send<C extends ChannelName>(socket: Socket, channel: C, data: DataOf<C>): void;
    /** RPC results share the output budget without consuming push sequence numbers. */
    reply(socket: Socket, frame: string): void;
    /** Push to every connection. Each keeps its own sequence. */
    broadcast<C extends ChannelName>(channel: C, data: DataOf<C>): void;
    /** Reuse the exact event JSON already written to SQLite. */
    broadcastRecordedEvent(channel: RecordedEventChannel, threadId: string, serializedEvent: string, seq: number): void;
}
export {};
//# sourceMappingURL=push-bus.d.ts.map