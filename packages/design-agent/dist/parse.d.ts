export type BoundaryRecord = Record<string, unknown>;
export type BoundaryList = unknown[];
export declare function record(value: unknown, field: string): BoundaryRecord;
export declare function optionalRecord(value: unknown): BoundaryRecord | undefined;
export declare function string(value: unknown, field: string): string;
export declare function optionalString(value: unknown, field: string): string | undefined;
export declare function strings(value: unknown, field: string): string[];
export declare function stringsAllowEmpty(value: unknown, field: string): string[];
export declare function list(value: unknown, field: string): BoundaryList;
export declare function array(value: unknown, field: string): BoundaryList;
export declare function integer(value: unknown, field: string, minimum: number, maximum: number): number;
export declare function boundedInteger(value: unknown, minimum: number, maximum: number): number | undefined;
export declare function fontWeights(value: unknown, field: string): number[];
export declare function member<const Values extends readonly string[]>(value: unknown, values: Values, field: string): Values[number];
//# sourceMappingURL=parse.d.ts.map