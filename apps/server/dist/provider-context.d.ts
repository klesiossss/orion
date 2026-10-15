import type { ContextControl, ProviderContextSettings, ProviderId } from '@harness/contracts';
export declare function providerContextControl(provider: ProviderId): ContextControl | undefined;
/** Refuses a setting the provider never declared, before it is stored. */
export declare function validateContextSettings(control: ContextControl | undefined, settings: ProviderContextSettings): void;
/**
 * What a launching session receives. A setting stored while an older engine
 * declared it is dropped quietly when the engine no longer can, so an update
 * never turns into sessions that refuse to start.
 */
export declare function contextForLaunch(control: ContextControl | undefined, settings: ProviderContextSettings | undefined): ProviderContextSettings | undefined;
//# sourceMappingURL=provider-context.d.ts.map