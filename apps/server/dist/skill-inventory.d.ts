import type { Skill, SkillDiscoveryError } from '@harness/contracts';
export declare const LOCAL_SKILL_CAPABILITIES: {
    readonly inventory: true;
    readonly configure: false;
    readonly install: false;
};
export declare function userSkillsDir(home?: string): string;
export declare function projectSkillsDir(projectPath: string): string;
export declare function listLocalSkills(projectPath: string, options?: {
    userSkillsDir?: string;
}): Promise<{
    skills: Skill[];
    errors: SkillDiscoveryError[];
}>;
export declare function mergeSkills(primary: Skill[], extra: Skill[]): Skill[];
//# sourceMappingURL=skill-inventory.d.ts.map