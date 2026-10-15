/** Grants come only from the native picker, never from renderer-supplied paths. */
export declare class PickedImagePaths {
    #private;
    authorize(filePath: string): Promise<void>;
    resolve(reference: string): Promise<string | undefined>;
}
/** Resolve old and current transcript references inside TasteCode's own paste folder. */
export declare function viewedImagePath(referenceValue: unknown, pastedRoots: string | readonly string[], pickedPaths?: PickedImagePaths): Promise<string | undefined>;
//# sourceMappingURL=viewed-image-path.d.ts.map