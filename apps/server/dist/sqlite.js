import { createRequire } from 'node:module';
function loadSqlite() {
    const emitWarning = process.emitWarning;
    // SQLite is an intentional dependency. Filter only its import-time notice,
    // and restore the warning handler before any application code can run.
    process.emitWarning = (warning, ...args) => {
        if (warning === 'SQLite is an experimental feature and might change at any time' &&
            args[0] === 'ExperimentalWarning') {
            return;
        }
        Reflect.apply(emitWarning, process, [warning, ...args]);
    };
    try {
        return createRequire(import.meta.url)('node:sqlite');
    }
    finally {
        process.emitWarning = emitWarning;
    }
}
export const { DatabaseSync } = loadSqlite();
//# sourceMappingURL=sqlite.js.map