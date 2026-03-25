import type { ExtensionCatalogDocument, ExtensionCatalogEntry, ExtensionIntegrity, ExtensionManifest, SignedExtensionManifest, TrustedExtensionSigner } from "@mdwrk/extension-manifest";
import type { ExtensionArtifactTransport, ExtensionRuntimeTrustPolicy, RegisteredExternalCatalogEntry } from "./types.js";
export declare const EXTENSION_CATALOG_SIGNED_MANIFEST_SCHEMA_VERSION: 1;
export declare const createExtensionCatalogEntryId: (extensionId: string, version: string) => string;
export declare function resolveCatalogUrl(baseUrl: string | undefined, value: string): string;
export declare function canonicalizeJson(value: unknown): string;
export declare function bytesToBase64Url(bytes: Uint8Array): string;
export declare function digestText(value: string, algorithm?: ExtensionIntegrity["algorithm"]): Promise<string>;
export declare function verifyTextIntegrity(value: string, integrity: ExtensionIntegrity): Promise<boolean>;
export interface VerifiedSignedManifest {
    readonly manifest: ExtensionManifest;
    readonly signer: TrustedExtensionSigner | null;
    readonly signatureVerified: boolean;
}
export declare function verifySignedManifest(signedManifest: SignedExtensionManifest, signers: readonly TrustedExtensionSigner[]): Promise<VerifiedSignedManifest>;
export declare function createFetchExtensionArtifactTransport(fetchImpl?: typeof fetch): ExtensionArtifactTransport;
export declare function createInMemoryExtensionArtifactTransport(seed: Readonly<Record<string, string | unknown>>): ExtensionArtifactTransport;
export declare function evaluateCatalogEntryPolicy(entry: ExtensionCatalogEntry, trustPolicy: ExtensionRuntimeTrustPolicy | undefined): readonly string[];
export declare function validateCatalogDocument(document: ExtensionCatalogDocument): readonly string[];
export interface InstallableCatalogPayload {
    readonly catalogEntry: RegisteredExternalCatalogEntry;
    readonly manifest: ExtensionManifest;
    readonly signedManifest: SignedExtensionManifest | null;
    readonly moduleCode: string;
    readonly signatureVerified: boolean;
    readonly signer: TrustedExtensionSigner | null;
}
export declare function fetchInstallableCatalogPayload(catalogEntry: RegisteredExternalCatalogEntry, transport: ExtensionArtifactTransport, trustPolicy: ExtensionRuntimeTrustPolicy): Promise<InstallableCatalogPayload>;
//# sourceMappingURL=catalog.d.ts.map