export const EXTENSION_INTEGRITY_ALGORITHMS = ["sha256", "sha384", "sha512"] as const;

export type ExtensionIntegrityAlgorithm = typeof EXTENSION_INTEGRITY_ALGORITHMS[number];

export interface ExtensionIntegrity {
  readonly algorithm: ExtensionIntegrityAlgorithm;
  readonly digest: string;
}
