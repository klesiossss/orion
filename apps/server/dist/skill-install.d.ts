/**
 * Whether two spellings name the same folder. A provider may report a path
 * with different drive or directory casing; string comparison would call a
 * successful install missing. Filesystem identity avoids folding case on a
 * case-sensitive volume.
 */
export declare function sameSkillFolder(reported: string, destination: string): boolean;
/** Whether a reported file lies below the installed folder, under any spelling. */
export declare function insideSkillFolder(reported: string, destination: string): boolean;
export declare function installLocalSkill(projectPath: string, folderPath: string): Promise<string>;
//# sourceMappingURL=skill-install.d.ts.map