import type {
  ExtensionCatalogDocument,
  ExtensionCatalogEntry,
  ExtensionIntegrity,
  ExtensionManifest,
  SignedExtensionManifest,
  TrustedExtensionSigner,
} from "@markdown-workspace/extension-manifest";
import type {
  ExtensionArtifactTransport,
  ExtensionRuntimeTrustPolicy,
  RegisteredExternalCatalogEntry,
} from "./types.js";

const textEncoder = new TextEncoder();

export const EXTENSION_CATALOG_SIGNED_MANIFEST_SCHEMA_VERSION = 1 as const;

export const createExtensionCatalogEntryId = (extensionId: string, version: string): string => `${extensionId}@${version}`;

export function resolveCatalogUrl(baseUrl: string | undefined, value: string): string {
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)) {
    return value;
  }
  if (!baseUrl) {
    return value;
  }
  return new URL(value, baseUrl).toString();
}

export function canonicalizeJson(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => sortJson(entry));
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  return Object.keys(value as Record<string, unknown>)
    .sort((left, right) => left.localeCompare(right))
    .reduce<Record<string, unknown>>((output, key) => {
      output[key] = sortJson((value as Record<string, unknown>)[key]);
      return output;
    }, {});
}

function hexToBytes(value: string): Uint8Array {
  const clean = value.trim().toLowerCase();
  if (clean.length % 2 !== 0) {
    throw new Error(`Expected an even-length hexadecimal digest, received '${value}'.`);
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let index = 0; index < clean.length; index += 2) {
    bytes[index / 2] = Number.parseInt(clean.slice(index, index + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  if (typeof atob === "function") {
    const text = atob(padded);
    return Uint8Array.from(text, (character) => character.charCodeAt(0));
  }
  const nodeBuffer = (globalThis as typeof globalThis & { Buffer?: { from(input: string, encoding?: string): Uint8Array } }).Buffer;
  if (nodeBuffer) {
    return Uint8Array.from(nodeBuffer.from(padded, "base64"));
  }
  throw new Error("Base64url decoding is unavailable in this runtime.");
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  const nodeBuffer = (globalThis as typeof globalThis & { Buffer?: { from(input: Uint8Array): { toString(encoding: string): string } } }).Buffer;
  if (nodeBuffer) {
    return nodeBuffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  if (typeof btoa === "function") {
    const text = Array.from(bytes).map((byte) => String.fromCharCode(byte)).join("");
    return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  throw new Error("Base64url encoding is unavailable in this runtime.");
}

export async function digestText(value: string, algorithm: ExtensionIntegrity["algorithm"] = "sha256"): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto SubtleCrypto is required for extension integrity verification.");
  }
  const algo = algorithm.toUpperCase().replace("SHA", "SHA-");
  const digest = await globalThis.crypto.subtle.digest(algo, textEncoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

export async function verifyTextIntegrity(value: string, integrity: ExtensionIntegrity): Promise<boolean> {
  const digest = await digestText(value, integrity.algorithm);
  return digest.toLowerCase() === integrity.digest.toLowerCase();
}

export interface VerifiedSignedManifest {
  readonly manifest: ExtensionManifest;
  readonly signer: TrustedExtensionSigner | null;
  readonly signatureVerified: boolean;
}

export async function verifySignedManifest(
  signedManifest: SignedExtensionManifest,
  signers: readonly TrustedExtensionSigner[],
): Promise<VerifiedSignedManifest> {
  const signer = signers.find((candidate) => candidate.keyId === signedManifest.signature.keyId && candidate.algorithm === signedManifest.signature.algorithm) ?? null;
  if (!signer) {
    throw new Error(`No trusted signer with key id '${signedManifest.signature.keyId}' is configured.`);
  }
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto SubtleCrypto is required for extension manifest signature verification.");
  }
  const key = await globalThis.crypto.subtle.importKey(
    "jwk",
    signer.publicKeyJwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"],
  );
  const verified = await globalThis.crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    base64UrlToBytes(signedManifest.signature.signature),
    textEncoder.encode(canonicalizeJson(signedManifest.manifest)),
  );
  if (!verified) {
    throw new Error(`Signature verification failed for '${signedManifest.manifest.id}'.`);
  }
  return {
    manifest: signedManifest.manifest,
    signer,
    signatureVerified: true,
  };
}

export function createFetchExtensionArtifactTransport(fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis)): ExtensionArtifactTransport {
  return {
    async fetchText(url: string): Promise<string> {
      const response = await fetchImpl(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch '${url}': ${response.status} ${response.statusText}`);
      }
      return await response.text();
    },
    async fetchJson<T = unknown>(url: string): Promise<T> {
      return JSON.parse(await this.fetchText(url)) as T;
    },
  };
}

export function createInMemoryExtensionArtifactTransport(seed: Readonly<Record<string, string | unknown>>): ExtensionArtifactTransport {
  const table = new Map<string, string>(Object.entries(seed).map(([key, value]) => [key, typeof value === "string" ? value : JSON.stringify(value)]));
  return {
    async fetchText(url: string): Promise<string> {
      if (!table.has(url)) {
        throw new Error(`Missing in-memory extension artifact '${url}'.`);
      }
      return table.get(url) ?? "";
    },
    async fetchJson<T = unknown>(url: string): Promise<T> {
      return JSON.parse(await this.fetchText(url)) as T;
    },
  };
}

export function evaluateCatalogEntryPolicy(entry: ExtensionCatalogEntry, trustPolicy: ExtensionRuntimeTrustPolicy | undefined): readonly string[] {
  const issues: string[] = [];
  if (!trustPolicy) {
    issues.push("External extension installation is disabled because no trust policy is configured.");
    return issues;
  }
  if (trustPolicy.allowedExtensionIds && trustPolicy.allowedExtensionIds.length > 0 && !trustPolicy.allowedExtensionIds.includes(entry.extensionId)) {
    issues.push(`Extension id '${entry.extensionId}' is not allowlisted.`);
  }
  if (trustPolicy.allowedPackageNames && trustPolicy.allowedPackageNames.length > 0 && !trustPolicy.allowedPackageNames.includes(entry.packageName)) {
    issues.push(`Package '${entry.packageName}' is not allowlisted.`);
  }
  if (trustPolicy.allowedPublishers && trustPolicy.allowedPublishers.length > 0) {
    if (!entry.publisher || !trustPolicy.allowedPublishers.includes(entry.publisher)) {
      issues.push(`Publisher '${entry.publisher ?? "unknown"}' is not allowlisted.`);
    }
  }
  return issues;
}

export function validateCatalogDocument(document: ExtensionCatalogDocument): readonly string[] {
  const issues: string[] = [];
  if (document.schemaVersion !== 1) {
    issues.push(`Unsupported extension catalog schemaVersion '${String(document.schemaVersion)}'.`);
  }
  if (!Array.isArray(document.extensions)) {
    issues.push("Extension catalog 'extensions' must be an array.");
    return issues;
  }
  const entryIds = new Set<string>();
  for (const entry of document.extensions) {
    if (!entry.entryId) {
      issues.push("Extension catalog entryId is required.");
      continue;
    }
    if (entryIds.has(entry.entryId)) {
      issues.push(`Duplicate catalog entry id '${entry.entryId}'.`);
    }
    entryIds.add(entry.entryId);
    if (!entry.extensionId) {
      issues.push(`Catalog entry '${entry.entryId}' is missing extensionId.`);
    }
    if (!entry.packageName) {
      issues.push(`Catalog entry '${entry.entryId}' is missing packageName.`);
    }
    if (!entry.version) {
      issues.push(`Catalog entry '${entry.entryId}' is missing version.`);
    }
    if (!entry.urls?.manifest || !entry.urls?.signedManifest || !entry.urls?.module) {
      issues.push(`Catalog entry '${entry.entryId}' must include urls.manifest, urls.signedManifest, and urls.module.`);
    }
    if (!entry.integrity?.module?.digest) {
      issues.push(`Catalog entry '${entry.entryId}' must include module integrity metadata.`);
    }
  }
  return issues;
}

export interface InstallableCatalogPayload {
  readonly catalogEntry: RegisteredExternalCatalogEntry;
  readonly manifest: ExtensionManifest;
  readonly signedManifest: SignedExtensionManifest | null;
  readonly moduleCode: string;
  readonly signatureVerified: boolean;
  readonly signer: TrustedExtensionSigner | null;
}

export async function fetchInstallableCatalogPayload(
  catalogEntry: RegisteredExternalCatalogEntry,
  transport: ExtensionArtifactTransport,
  trustPolicy: ExtensionRuntimeTrustPolicy,
): Promise<InstallableCatalogPayload> {
  const entryPolicyIssues = evaluateCatalogEntryPolicy(catalogEntry.entry, trustPolicy);
  if (entryPolicyIssues.length > 0) {
    throw new Error(entryPolicyIssues.join(" "));
  }

  const manifestUrl = resolveCatalogUrl(catalogEntry.baseUrl, catalogEntry.entry.urls.manifest);
  const signedManifestUrl = resolveCatalogUrl(catalogEntry.baseUrl, catalogEntry.entry.urls.signedManifest);
  const moduleUrl = resolveCatalogUrl(catalogEntry.baseUrl, catalogEntry.entry.urls.module);

  const signedManifest = await transport.fetchJson<SignedExtensionManifest>(signedManifestUrl);
  const manifestText = canonicalizeJson(signedManifest.manifest);
  if (catalogEntry.entry.integrity.manifest) {
    const manifestIntegrityOk = await verifyTextIntegrity(manifestText, catalogEntry.entry.integrity.manifest);
    if (!manifestIntegrityOk) {
      throw new Error(`Manifest integrity verification failed for '${catalogEntry.entry.extensionId}'.`);
    }
  }

  let signer: TrustedExtensionSigner | null = null;
  let signatureVerified = false;
  if (signedManifest) {
    if (!trustPolicy.allowUnsigned) {
      const result = await verifySignedManifest(signedManifest, trustPolicy.trustedSigners ?? []);
      signer = result.signer;
      signatureVerified = result.signatureVerified;
    } else if ((trustPolicy.trustedSigners?.length ?? 0) > 0) {
      const result = await verifySignedManifest(signedManifest, trustPolicy.trustedSigners ?? []);
      signer = result.signer;
      signatureVerified = result.signatureVerified;
    }
  }

  const manifest = signedManifest.manifest;
  if (manifest.id !== catalogEntry.entry.extensionId) {
    throw new Error(`Catalog entry '${catalogEntry.entry.entryId}' expected extension id '${catalogEntry.entry.extensionId}' but manifest declared '${manifest.id}'.`);
  }
  if (manifest.version !== catalogEntry.entry.version) {
    throw new Error(`Catalog entry '${catalogEntry.entry.entryId}' expected version '${catalogEntry.entry.version}' but manifest declared '${manifest.version}'.`);
  }

  const manifestDocument = await transport.fetchJson<ExtensionManifest>(manifestUrl).catch(async () => JSON.parse(await transport.fetchText(manifestUrl)) as ExtensionManifest);
  if (canonicalizeJson(manifestDocument) !== manifestText) {
    throw new Error(`Manifest fetched from '${manifestUrl}' did not match the signed manifest payload for '${manifest.id}'.`);
  }

  const moduleCode = await transport.fetchText(moduleUrl);
  const moduleIntegrityOk = await verifyTextIntegrity(moduleCode, catalogEntry.entry.integrity.module);
  if (!moduleIntegrityOk) {
    throw new Error(`Module integrity verification failed for '${catalogEntry.entry.extensionId}'.`);
  }

  if (!signatureVerified && !trustPolicy.allowIntegrityOnly) {
    throw new Error(`Signed manifest verification is required for '${catalogEntry.entry.extensionId}'.`);
  }

  return {
    catalogEntry,
    manifest,
    signedManifest,
    moduleCode,
    signatureVerified,
    signer,
  };
}
