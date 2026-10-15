import type { PullRequestAction, PullRequestActionResult, PullRequestDetail, PullRequestFilesResult, PullRequestListResult, PullRequestMetadataOptions } from '@harness/contracts';
import { PullRequestImageService } from './pull-request-images.js';
export type GitHubSetupAction = 'install' | 'login';
/** Fixed server-owned commands keep PR setup interactive without exposing a shell RPC. */
export declare function githubSetupCommand(action: GitHubSetupAction, platform?: NodeJS.Platform): string;
type GhRunOptions = {
    stdin?: string;
    timeoutMs?: number;
    maxBytes?: number;
    encoding?: 'utf8' | 'base64';
};
export type GhRunner = (args: string[], options?: GhRunOptions) => Promise<string>;
/**
 * GitHub-backed pull-request operations. The authenticated `gh` process owns
 * the token; neither its token nor GitHub response headers cross into the UI.
 */
export declare class PullRequestService {
    #private;
    readonly images: PullRequestImageService;
    constructor(options?: {
        run?: GhRunner;
        installed?: () => Promise<boolean>;
        now?: () => number;
        resolveProjects?: (paths: readonly string[]) => Promise<Map<string, string>>;
    });
    list(projectPaths: readonly string[], refresh?: boolean): Promise<PullRequestListResult>;
    detail(repository: string, number: number, projectPaths: readonly string[], refresh?: boolean): Promise<PullRequestDetail>;
    files(repository: string, number: number, comparison: Pick<PullRequestFilesResult, 'headRefOid' | 'baseRefOid'>, page?: number, refresh?: boolean): Promise<PullRequestFilesResult>;
    metadataOptions(repository: string, refresh?: boolean): Promise<PullRequestMetadataOptions>;
    action(repository: string, number: number, action: PullRequestAction): Promise<PullRequestActionResult>;
}
export declare function comparePullRequestText(left: string, right: string): number;
/** The only process boundary used by the feature; bodies always travel over stdin. */
export declare function runGh(args: string[], options?: GhRunOptions): Promise<string>;
export declare function resolveProjectRepositories(paths: readonly string[]): Promise<Map<string, string>>;
export declare function githubRepositoryFromRemote(remote: string): string | undefined;
export {};
//# sourceMappingURL=pull-requests.d.ts.map