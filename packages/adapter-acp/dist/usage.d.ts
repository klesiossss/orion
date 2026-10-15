import type { Usage } from '@harness/contracts';
import { z } from 'zod';
export declare const AcpTurnTokenUsageSchema: z.ZodObject<{
    totalTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    inputTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    outputTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    thoughtTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cachedReadTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cachedWriteTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export declare const AcpSessionUsageUpdateSchema: z.ZodObject<{
    used: z.ZodOptional<z.ZodNumber>;
    size: z.ZodOptional<z.ZodNumber>;
    cost: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        amount: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type AcpTurnTokenUsage = z.infer<typeof AcpTurnTokenUsageSchema>;
export type AcpSessionUsageUpdate = z.infer<typeof AcpSessionUsageUpdateSchema>;
/** Maps the optional ACP end-turn usage extension onto TasteCode accounting. */
export declare function acpTurnUsage(value: AcpTurnTokenUsage | null | undefined, model?: string): Usage | undefined;
/** Maps ACP's completed session context/cost update without treating context as spend. */
export declare function acpSessionUsage(value: AcpSessionUsageUpdate, model?: string): Usage | undefined;
//# sourceMappingURL=usage.d.ts.map