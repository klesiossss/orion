import type { ProviderId, ProviderUpdate } from '@harness/contracts';
import { commandVersion, isInstalled } from '@harness/proc/cli';
import { providerUpdateSources } from './providers.js';
type Sources = ReturnType<typeof providerUpdateSources>;
export declare class ProviderUpdateService {
    #private;
    private sources;
    private system;
    constructor(sources?: Sources, system?: {
        isInstalled: typeof isInstalled;
        version: typeof commandVersion;
    });
    list(refresh?: boolean): Promise<ProviderUpdate[]>;
    commandFor(provider: ProviderId): Promise<string>;
}
export {};
//# sourceMappingURL=provider-updates.d.ts.map