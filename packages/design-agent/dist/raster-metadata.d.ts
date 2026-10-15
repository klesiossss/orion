interface RasterMetadata {
    format: 'png' | 'jpeg' | 'webp' | 'gif';
    width: number;
    height: number;
}
export declare function readRasterMetadata(filePath: string): RasterMetadata;
export {};
//# sourceMappingURL=raster-metadata.d.ts.map