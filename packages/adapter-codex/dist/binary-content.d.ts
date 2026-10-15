/**
 * A placeholder for a tool result part that carries an image, audio clip or
 * file inline as base64. Written into an item's text, a single screenshot
 * added megabytes to every history load and rendered as unreadable noise.
 */
export declare function binaryPlaceholder(value: unknown): string | undefined;
/** JSON for a reader, with inline binary parts replaced by their placeholders. */
export declare function jsonWithoutBinary(value: unknown, indent?: number): string;
//# sourceMappingURL=binary-content.d.ts.map