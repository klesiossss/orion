export interface BrandSystem {
    version: 1;
    foundation: {
        strategy: 'preserve' | 'extend' | 'create';
        existingAssets: string[];
        assetActions: Array<{
            asset: string;
            action: 'protect' | 'preserve' | 'evolve' | 'retire' | 'create';
            reason: string;
        }>;
        lockedDecisions: string[];
        assumptions: string[];
    };
    creativeDirection: {
        summary: string;
        traits: Array<{
            quality: string;
            boundary: string;
        }>;
        productiveTension: string;
        signatureDevice: {
            description: string;
            status: 'existing' | 'candidate' | 'validated';
            invariants: string[];
        };
        restraint: string;
        avoid: string[];
    };
    colorPalette: Array<{
        name: string;
        value: string;
        usage: string;
    }>;
    typefaces: Array<{
        family: string;
        source: string;
        roles: string[];
        weights: number[];
    }>;
    interfaceDirection: string;
    imageDirection: {
        summary: string;
        subjects: string[];
        treatment: string;
        avoid: string[];
    };
    motionDirection: {
        summary: string;
        principles: string[];
        avoid: string[];
    };
    voice: {
        summary: string;
        avoid: string[];
    };
}
export declare function parseBrandSystem(value: unknown): BrandSystem;
export declare function readBrandSystem(workspacePath: string): BrandSystem;
export declare function writeBrandSystem(workspacePath: string, value: unknown): BrandSystem;
//# sourceMappingURL=brand.d.ts.map