export declare const PALETTE_ROLES: readonly ["canvas", "surface", "surfaceAlt", "text", "textMuted", "divider", "controlBorder", "accent", "accentHover", "onAccent", "accentText", "focusRing"];
export type PaletteRole = (typeof PALETTE_ROLES)[number];
export type PaletteThemeName = 'light' | 'dark';
export type PaletteRoles = Record<PaletteRole, string>;
export interface PaletteThemeDirection {
    accentSeed: string;
    neutralSeed?: string;
    surfaceContrast: 'quiet' | 'defined';
}
export interface PaletteRequest {
    themes: Partial<Record<PaletteThemeName, PaletteThemeDirection>>;
    locked?: Partial<Record<PaletteThemeName, Partial<Record<PaletteRole, string>>>>;
}
export interface PaletteContrastCheck {
    foreground: PaletteRole;
    background: PaletteRole;
    ratio: number;
    minimum: 3 | 4.5;
    criterion: 'WCAG 2.2 1.4.3' | 'WCAG 2.2 1.4.11';
    pass: boolean;
}
export interface PaletteRepair {
    role: PaletteRole;
    from: string;
    to: string;
    reason: 'contrast';
    affectedPairs: string[];
}
export interface PaletteTheme {
    direction: PaletteThemeDirection;
    roles: PaletteRoles;
    lockedRoles: PaletteRole[];
    repairs: PaletteRepair[];
    checks: PaletteContrastCheck[];
}
export interface ColorSystem {
    version: 1;
    usageBalance: {
        dominant: Array<'canvas' | 'surface'>;
        supporting: Array<'surfaceAlt'>;
        accent: Array<'accent' | 'accentText'>;
        guidance: string;
    };
    themes: Partial<Record<PaletteThemeName, PaletteTheme>>;
    evidenceScope: 'opaque-srgb-token-pairs';
}
export interface PaletteIssue {
    code: 'invalid-request' | 'invalid-color' | 'unknown-role' | 'missing-theme-direction' | 'locked-contrast-conflict' | 'unrepairable-contrast';
    message: string;
    theme?: PaletteThemeName;
    roles?: PaletteRole[];
}
export type PaletteBuildResult = {
    status: 'ready';
    value: ColorSystem;
} | {
    status: 'blocked';
    issues: PaletteIssue[];
    partial?: ColorSystem;
};
interface PaletteAudit {
    pass: boolean;
    checks: PaletteContrastCheck[];
}
export declare function generatePalette(input: unknown): PaletteBuildResult;
export declare function auditPalette(roles: PaletteRoles): PaletteAudit;
export declare function paletteCssVariables(roles: PaletteRoles): Record<string, string>;
export declare function paletteColorRecords(system: ColorSystem): Array<{
    name: string;
    value: string;
    usage: string;
}>;
export {};
//# sourceMappingURL=palette.d.ts.map