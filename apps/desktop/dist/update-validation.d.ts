export declare class InvalidUpdateError extends Error {
}
/** Tool failures alone say nothing about the already verified source bytes. */
export declare function isInvalidUpdate(error: unknown): boolean;
export declare function invalidDmgToolOutput(tool: 'hdiutil' | 'codesign', error: unknown): boolean;
//# sourceMappingURL=update-validation.d.ts.map