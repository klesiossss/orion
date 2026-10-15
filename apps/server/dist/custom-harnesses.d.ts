import { type CustomHarness } from '@harness/contracts';
/** Human-readable launch configuration. It deliberately has no credential fields. */
export declare class CustomHarnessStore {
    #private;
    private readonly location;
    constructor(location?: string);
    list(): CustomHarness[];
    get(id: string): CustomHarness;
    find(id: string): CustomHarness | undefined;
    upsert(input: CustomHarness): CustomHarness;
    remove(id: string): void;
}
//# sourceMappingURL=custom-harnesses.d.ts.map