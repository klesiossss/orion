import { type BoundaryRecord } from './parse.js';
export { DESIGN_BRIEF_ATTACHMENT, isDesignBriefAttachment } from './attachment.js';
export interface BriefingQuestion {
    id: string;
    header: string;
    question: string;
    allowOther: boolean;
    options: Array<{
        label: string;
        description: string;
    }>;
}
export type BriefingOutput = {
    status: 'questions';
    message: string;
    questions: BriefingQuestion[];
    brief: null;
} | {
    status: 'complete';
    message: string;
    questions: [];
    brief: BoundaryRecord;
} | {
    status: 'not_design';
    message: string;
    questions: [];
    brief: null;
};
export declare function designBriefingPrompt(request: string): string;
export declare function designBriefingContinuation(questions: BriefingQuestion[], answers: Record<string, string[]>): string;
export declare function designPhaseCorrectionPrompt(error: string): string;
export declare function designTaskContinuation(request: string, answers: Array<{
    question: string;
    answer: string;
}>): string;
export declare function parseBriefingOutput(text: string): BriefingOutput;
//# sourceMappingURL=workflow.d.ts.map