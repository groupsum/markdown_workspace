export declare const EXTENSION_INTEGRITY_ALGORITHMS: readonly ["sha256", "sha384", "sha512"];
export type ExtensionIntegrityAlgorithm = typeof EXTENSION_INTEGRITY_ALGORITHMS[number];
export interface ExtensionIntegrity {
    readonly algorithm: ExtensionIntegrityAlgorithm;
    readonly digest: string;
}
//# sourceMappingURL=integrity.d.ts.map