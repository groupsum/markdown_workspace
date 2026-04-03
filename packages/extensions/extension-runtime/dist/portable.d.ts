import type { ExtensionCatalogDocument } from "@mdwrk/extension-manifest";
export interface PortableExtensionPackageFile {
    readonly path: string;
    readonly content: string;
    readonly mimeType?: string;
}
export interface PortableExtensionPackageArtifact {
    readonly kind: "mdwrk-extension-package";
    readonly version: 1;
    readonly entryId?: string;
    readonly catalogId?: string;
    readonly files: readonly PortableExtensionPackageFile[];
}
export interface PortableExtensionCatalogRegistration {
    readonly entryId: string;
    readonly catalogId: string;
    readonly catalog: ExtensionCatalogDocument;
    readonly baseUrl: string;
    revoke(): void;
}
export declare function normalizePortableExtensionPackageArtifact(value: unknown): PortableExtensionPackageArtifact | null;
export declare function createPortableExtensionCatalogRegistration(artifact: PortableExtensionPackageArtifact): Promise<PortableExtensionCatalogRegistration>;
//# sourceMappingURL=portable.d.ts.map