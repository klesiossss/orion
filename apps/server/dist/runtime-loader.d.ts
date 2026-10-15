import type { CustomHarness, CustomHarnessVerification, ProviderId } from '@harness/contracts';
import type { AgentSession, ProviderRuntime, StartOptions, TurnOptions } from './adapters.js';
export declare function providerRuntime(provider: ProviderId, onLog: (line: string) => void, resolveHarness?: (id: string) => CustomHarness | undefined): ProviderRuntime;
export declare function verifyCustomHarness(harness: CustomHarness, workspacePath?: string, onLog?: (line: string) => void): Promise<CustomHarnessVerification>;
export type { AgentSession, ProviderRuntime, StartOptions, TurnOptions };
//# sourceMappingURL=runtime-loader.d.ts.map