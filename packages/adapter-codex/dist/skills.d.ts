import type { Skill, SkillCapabilities, SkillDiscoveryError } from '@harness/contracts';
import type { ParsedSkillsListResponse } from './schemas.js';
export declare const CODEX_SKILL_CAPABILITIES: SkillCapabilities;
export type SkillInventory = {
    skills: Skill[];
    errors: SkillDiscoveryError[];
};
export declare function mapSkillList(response: ParsedSkillsListResponse, cwd: string, configuredMcpIds?: ReadonlySet<string>): SkillInventory;
//# sourceMappingURL=skills.d.ts.map