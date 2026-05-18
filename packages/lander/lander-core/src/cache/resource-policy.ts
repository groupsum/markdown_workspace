// @ts-ignore This package may compile without Node ambient types, but its ESM runtime is Node.
import { createHash } from "node:crypto";

export type LanderCacheResourceClass = "immutable" | "mutable-revalidate" | "no-store";

export interface LanderCacheResourceInput {
  path: string;
  content: string | Uint8Array;
  resourceClass?: LanderCacheResourceClass;
  contentType?: string;
  lastModified?: Date | string;
  compressionEligible?: boolean;
}

export interface LanderCacheManifestEntry {
  path: string;
  resourceClass: LanderCacheResourceClass;
  contentType?: string;
  compressionEligible: boolean;
  etag: string;
  lastModified: string;
  cacheControl: string;
  headers: Record<string, string>;
}

export interface LanderCacheHeaderManifest {
  version: 1;
  generatedAt: string;
  entries: LanderCacheManifestEntry[];
}

export interface LanderCacheHeaderLookupOptions {
  indexFile?: string;
}

const IMMUTABLE_MAX_AGE_SECONDS = 31_536_000;
const TEXT_COMPATIBLE_TYPES = [
  "text/",
  "application/javascript",
  "application/json",
  "application/ld+json",
  "application/manifest+json",
  "application/xml",
  "application/xhtml+xml",
  "image/svg+xml",
];

export function normalizeCacheResourcePath(value: string): string {
  const path = String(value ?? "").trim().replace(/\\/g, "/").replace(/[?#].*$/, "");
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function sha256Hex(content: string | Uint8Array): string {
  return createHash("sha256").update(content).digest("hex");
}

export function buildStrongEtag(content: string | Uint8Array): string {
  return `"sha256-${sha256Hex(content)}"`;
}

export function formatHttpDate(value: Date | string | undefined): string {
  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  if (Number.isNaN(date.valueOf())) {
    throw new Error(`Invalid HTTP date value: ${String(value)}`);
  }
  return date.toUTCString();
}

export function inferCacheResourceClass(pathValue: string): LanderCacheResourceClass {
  const resourcePath = normalizeCacheResourcePath(pathValue);
  if (/\/assets\/[^/]+\.[a-f0-9]{8,}\.(?:css|js|mjs|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(resourcePath)) {
    return "immutable";
  }
  if (/\/(?:sitemap\.xml|robots\.txt|llms(?:-full)?\.txt|content-index\.json|content-registry\.json|jsonld-graph\.json|cache-header-manifest\.json)$/i.test(resourcePath)) {
    return "mutable-revalidate";
  }
  if (/\/index\.(?:html|md)$/i.test(resourcePath) || resourcePath.endsWith("/")) {
    return "mutable-revalidate";
  }
  return "mutable-revalidate";
}

export function cacheControlForResourceClass(resourceClass: LanderCacheResourceClass): string {
  switch (resourceClass) {
    case "immutable":
      return `public, max-age=${IMMUTABLE_MAX_AGE_SECONDS}, immutable`;
    case "mutable-revalidate":
      return "no-cache";
    case "no-store":
      return "no-store";
    default:
      return assertNever(resourceClass);
  }
}

export function isCompressionEligibleContentType(contentType: string | undefined): boolean {
  const normalized = String(contentType ?? "").toLowerCase().split(";")[0].trim();
  return TEXT_COMPATIBLE_TYPES.some((prefix) => normalized === prefix.replace(/\/$/, "") || normalized.startsWith(prefix));
}

export function buildCacheManifestEntry(input: LanderCacheResourceInput): LanderCacheManifestEntry {
  const resourceClass = input.resourceClass ?? inferCacheResourceClass(input.path);
  const cacheControl = cacheControlForResourceClass(resourceClass);
  const lastModified = formatHttpDate(input.lastModified);
  const etag = buildStrongEtag(input.content);
  const compressionEligible = input.compressionEligible ?? isCompressionEligibleContentType(input.contentType);
  const headers: Record<string, string> = {
    "Cache-Control": cacheControl,
  };

  if (resourceClass !== "no-store") {
    headers.ETag = etag;
    headers["Last-Modified"] = lastModified;
  }
  if (input.contentType) headers["Content-Type"] = input.contentType;

  return {
    path: normalizeCacheResourcePath(input.path),
    resourceClass,
    contentType: input.contentType,
    compressionEligible,
    etag,
    lastModified,
    cacheControl,
    headers,
  };
}

export function buildCacheHeaderManifest(inputs: LanderCacheResourceInput[], generatedAt: Date | string = new Date()): LanderCacheHeaderManifest {
  return {
    version: 1,
    generatedAt: formatHttpDate(generatedAt),
    entries: inputs
      .map(buildCacheManifestEntry)
      .sort((left, right) => left.path.localeCompare(right.path)),
  };
}

export function createCacheHeaderLookup(
  manifest: LanderCacheHeaderManifest,
  options: LanderCacheHeaderLookupOptions = {},
): (requestPath: string) => Record<string, string> | undefined {
  const indexFile = options.indexFile ?? "index.html";
  const byPath = new Map(manifest.entries.map((entry) => [normalizeCacheResourcePath(entry.path), entry.headers]));

  return (requestPath: string) => {
    const normalized = normalizeCacheResourcePath(requestPath);
    const direct = byPath.get(normalized);
    if (direct) return { ...direct };
    const indexPath = normalized.endsWith("/")
      ? `${normalized}${indexFile}`
      : `${normalized}/${indexFile}`;
    const indexHeaders = byPath.get(normalizeCacheResourcePath(indexPath));
    return indexHeaders ? { ...indexHeaders } : undefined;
  };
}

export function headersForCacheResource(
  manifest: LanderCacheHeaderManifest,
  requestPath: string,
  options: LanderCacheHeaderLookupOptions = {},
): Record<string, string> | undefined {
  return createCacheHeaderLookup(manifest, options)(requestPath);
}

function assertNever(value: never): never {
  throw new Error(`Unsupported cache resource class: ${String(value)}`);
}
