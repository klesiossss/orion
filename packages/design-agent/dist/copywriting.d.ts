import type { PageBlueprint } from './page.js';
export type CopyLintSeverity = 'error' | 'warning' | 'review';
export interface CopyLintFinding {
    rule: string;
    severity: CopyLintSeverity;
    path: string;
    excerpt: string;
    message: string;
}
export declare function lintPageCopy(page: PageBlueprint): CopyLintFinding[];
export declare function assertPageCopy(page: PageBlueprint): PageBlueprint;
//# sourceMappingURL=copywriting.d.ts.map