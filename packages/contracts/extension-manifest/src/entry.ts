import type { ExtensionIntegrity } from "./integrity.js";

export interface ExtensionEntrypoint {
  readonly module: string;
  readonly export: string;
}

export interface ExtensionDistribution {
  readonly channel: "bundled" | "catalog";
  readonly format: "esm";
  readonly moduleUrl?: string;
  readonly manifestUrl?: string;
  readonly signedManifestUrl?: string;
  readonly integrity?: ExtensionIntegrity;
}
