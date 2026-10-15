import { type PullRequestImage } from '@harness/contracts';
import type { GhRunner } from './pull-requests.js';
export declare class PullRequestImageService {
    #private;
    private readonly run;
    private readonly now;
    constructor(run: GhRunner, now?: () => number);
    image(source: string): Promise<PullRequestImage>;
}
//# sourceMappingURL=pull-request-images.d.ts.map