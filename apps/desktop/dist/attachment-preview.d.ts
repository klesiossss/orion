export declare const ATTACHMENT_PREVIEW_SCHEME = "tastecode-attachment";
type AttachmentMediaType = 'image' | 'video';
export type PickedAttachment = {
    path: string;
    name: string;
    mediaType?: AttachmentMediaType;
    previewUrl?: string;
    thumbnailUrl?: string;
};
type PreviewMediaDescriptor = {
    path: string;
    mediaType: AttachmentMediaType;
    mimeType: string;
};
type PreviewMedia = PreviewMediaDescriptor & {
    variant: 'media' | 'thumbnail';
};
export declare function pickedAttachment(filePath: string, secret: Buffer): PickedAttachment;
export declare function attachmentPreviewFromUrl(value: string, secret: Buffer): PreviewMedia | undefined;
export type AttachmentByteRange = {
    start: number;
    end: number;
} | 'invalid' | undefined;
export declare function attachmentByteRange(value: string | null, size: number): AttachmentByteRange;
export {};
//# sourceMappingURL=attachment-preview.d.ts.map