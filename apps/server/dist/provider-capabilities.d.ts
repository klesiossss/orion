/** Settings and lifecycle capabilities; importing this table never loads a vendor SDK. */
export type ProviderControlCapabilities = Readonly<{
    resume: boolean;
    managedMcp: boolean;
    inheritedMcp: boolean;
    nativeSkills: boolean;
    nativeModels: boolean;
    notifications: boolean;
    skillsInstall: boolean;
    account: boolean;
    login: boolean;
    apiKey: boolean;
    signOut: boolean;
    usageLimits: boolean;
    rateLimitReset: boolean;
}>;
export declare const PROVIDER_CAPABILITIES: {
    readonly 'claude-code': {
        readonly resume: true;
        readonly managedMcp: true;
        readonly nativeModels: true;
        readonly account: true;
        readonly login: true;
        readonly signOut: true;
        readonly usageLimits: true;
        readonly inheritedMcp: boolean;
        readonly nativeSkills: boolean;
        readonly notifications: boolean;
        readonly skillsInstall: boolean;
        readonly apiKey: boolean;
        readonly rateLimitReset: boolean;
    };
    readonly codex: {
        readonly resume: true;
        readonly managedMcp: true;
        readonly inheritedMcp: true;
        readonly nativeSkills: true;
        readonly nativeModels: true;
        readonly notifications: true;
        readonly skillsInstall: true;
        readonly account: true;
        readonly login: true;
        readonly apiKey: true;
        readonly signOut: true;
        readonly usageLimits: true;
        readonly rateLimitReset: true;
    };
    readonly grok: {
        readonly resume: true;
        readonly managedMcp: true;
        readonly nativeModels: true;
        readonly account: true;
        readonly signOut: true;
        readonly usageLimits: true;
        readonly inheritedMcp: boolean;
        readonly nativeSkills: boolean;
        readonly notifications: boolean;
        readonly skillsInstall: boolean;
        readonly login: boolean;
        readonly apiKey: boolean;
        readonly rateLimitReset: boolean;
    };
};
//# sourceMappingURL=provider-capabilities.d.ts.map