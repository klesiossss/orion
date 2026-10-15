import type { ParamsOf, Request } from '@harness/contracts';
/** Validates the small RPC envelope before the method-specific schema runs. */
export declare function parseRequestEnvelope(value: unknown): Request | undefined;
type FrequentMethod = 'terminal.input' | 'terminal.resize';
/** Fast success path for terminal traffic; invalid data falls back to the full schema. */
export declare function parseFrequentMethodParams<M extends FrequentMethod>(method: M, value: unknown): ParamsOf<M> | undefined;
export {};
//# sourceMappingURL=request-envelope.d.ts.map