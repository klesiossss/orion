import { createRequire } from 'node:module';
const SERVICE = 'PersonalHarness';
const require = createRequire(import.meta.url);
let loadedEntry;
function entry(reference) {
    loadedEntry ??= require('@napi-rs/keyring').Entry;
    return new loadedEntry(SERVICE, reference);
}
export function readCredential(reference) {
    try {
        const value = entry(reference).getPassword();
        if (value !== null)
            return value;
    }
    catch {
        // The actionable error below deliberately excludes native error text,
        // which can contain credential metadata on some platforms.
    }
    throw new Error(`credential "${reference}" was not found in the OS credential store`);
}
export function hasCredential(reference) {
    try {
        return entry(reference).getPassword() !== null;
    }
    catch {
        return false;
    }
}
export function writeCredential(reference, value) {
    entry(reference).setPassword(value);
}
export function removeCredential(reference) {
    try {
        entry(reference).deletePassword();
    }
    catch {
        // Removing an already absent credential is idempotent.
    }
}
//# sourceMappingURL=credentials.js.map