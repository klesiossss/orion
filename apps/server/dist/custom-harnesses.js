import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CustomHarnessSchema } from '@harness/contracts';
import { z } from 'zod';
import { configFile } from './product-paths.js';
const EMPTY_CONFIG = { version: 1, harnesses: [], unsupported: [] };
const ConfigFileSchema = z.object({
    version: z.literal(1),
    harnesses: z.array(z.unknown()),
});
function defaultLocation() {
    return configFile('custom-harnesses.json');
}
function parseConfig(raw) {
    const value = ConfigFileSchema.safeParse(JSON.parse(raw));
    if (!value.success) {
        throw new Error('invalid custom harness config: expected a version 1 harness list');
    }
    const harnesses = [];
    const unsupported = [];
    for (const entry of value.data.harnesses) {
        const harness = CustomHarnessSchema.safeParse(entry);
        if (harness.success)
            harnesses.push(harness.data);
        else
            unsupported.push(entry);
    }
    return { version: 1, harnesses, unsupported };
}
function entryId(entry) {
    return typeof entry === 'object' && entry !== null && 'id' in entry ? entry.id : undefined;
}
/** Human-readable launch configuration. It deliberately has no credential fields. */
export class CustomHarnessStore {
    location;
    constructor(location = defaultLocation()) {
        this.location = location;
    }
    list() {
        return this.#read().harnesses;
    }
    get(id) {
        const harness = this.#read().harnesses.find((entry) => entry.id === id);
        if (!harness)
            throw new Error(`custom harness "${id}" does not exist`);
        return harness;
    }
    find(id) {
        return this.#read().harnesses.find((entry) => entry.id === id);
    }
    upsert(input) {
        const harness = CustomHarnessSchema.parse(input);
        const file = this.#read();
        file.unsupported = file.unsupported.filter((entry) => entryId(entry) !== harness.id);
        const index = file.harnesses.findIndex((entry) => entry.id === harness.id);
        if (index < 0)
            file.harnesses.push(harness);
        else
            file.harnesses[index] = harness;
        this.#write(file);
        return harness;
    }
    remove(id) {
        const file = this.#read();
        const index = file.harnesses.findIndex((entry) => entry.id === id);
        if (index < 0)
            throw new Error(`custom harness "${id}" does not exist`);
        file.harnesses.splice(index, 1);
        this.#write(file);
    }
    #read() {
        return existsSync(this.location)
            ? parseConfig(readFileSync(this.location, 'utf8'))
            : structuredClone(EMPTY_CONFIG);
    }
    #write(file) {
        mkdirSync(path.dirname(this.location), { recursive: true });
        const temporary = `${this.location}.${randomUUID()}.tmp`;
        const stored = { version: file.version, harnesses: [...file.harnesses, ...file.unsupported] };
        writeFileSync(temporary, `${JSON.stringify(stored, null, 2)}\n`, {
            encoding: 'utf8',
            mode: 0o600,
        });
        renameSync(temporary, this.location);
    }
}
//# sourceMappingURL=custom-harnesses.js.map