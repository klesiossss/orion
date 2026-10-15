import type { WebContents } from 'electron';
export declare function configurePreviewNavigation(contents: Pick<WebContents, 'on'>, previewUrl: string): void;
export declare function allowsPreviewNavigation(previewUrl: string, navigationUrl: string): boolean;
//# sourceMappingURL=preview-navigation.d.ts.map