export declare const MAX_PASTED_FILE_BYTES: number;
export type PastedFile = {
    bytes: Buffer;
    name: string;
};
export declare function savePastedFile(userData: string, payload: unknown): Promise<string>;
export declare function pastedFile(payload: unknown): PastedFile;
//# sourceMappingURL=pasted-file.d.ts.map