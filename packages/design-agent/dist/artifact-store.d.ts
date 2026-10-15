type ArtifactName = 'brief.json' | 'brand.json' | 'page.json' | 'assets.json' | 'review.json';
export declare function readDesignArtifact(workspacePath: string, name: ArtifactName): unknown;
export declare function writeDesignArtifact(workspacePath: string, name: ArtifactName, value: unknown): void;
export {};
//# sourceMappingURL=artifact-store.d.ts.map