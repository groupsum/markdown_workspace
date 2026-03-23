import type { ExtensionManifest } from "./manifest.js";
export declare const EXTENSION_SIGNATURE_ALGORITHMS: readonly ["ecdsa-p256-sha256"];
export type ExtensionSignatureAlgorithm = typeof EXTENSION_SIGNATURE_ALGORITHMS[number];
export interface ExtensionManifestSignature {
    readonly keyId: string;
    readonly algorithm: ExtensionSignatureAlgorithm;
    readonly signature: string;
    readonly signedAt: string;
}
export interface SignedExtensionManifest {
    readonly schemaVersion: 1;
    readonly manifest: ExtensionManifest;
    readonly signature: ExtensionManifestSignature;
}
export interface TrustedExtensionSigner {
    readonly keyId: string;
    readonly algorithm: ExtensionSignatureAlgorithm;
    readonly publicKeyJwk: JsonWebKey;
    readonly publisher?: string;
    readonly label?: string;
}
//# sourceMappingURL=signature.d.ts.map