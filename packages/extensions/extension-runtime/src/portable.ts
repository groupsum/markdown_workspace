import type {
  ExtensionCatalogDocument,
  ExtensionCatalogEntry,
  ExtensionManifest,
  I18nLabel,
  SignedExtensionManifest,
} from "@mdwrk/extension-manifest";
import { digestText } from "./catalog.js";

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

function asLabel(value: I18nLabel | string | undefined, fallback: string): I18nLabel {
  if (typeof value === "string") {
    return { defaultMessage: value };
  }
  if (value && typeof value.defaultMessage === "string") {
    return value;
  }
  return { defaultMessage: fallback };
}

function normalizeEntryModulePath(modulePath: string | undefined): string {
  const normalized = String(modulePath || "./index.js").replace(/^\.\//, "");
  return normalized.startsWith("dist/") ? normalized : `dist/${normalized}`;
}

function readArtifactFile(
  files: ReadonlyMap<string, PortableExtensionPackageFile>,
  path: string,
): PortableExtensionPackageFile {
  const file = files.get(path);
  if (!file) {
    throw new Error(`Portable extension package is missing '${path}'.`);
  }
  return file;
}

function buildUnsignedSignedManifest(manifest: ExtensionManifest): SignedExtensionManifest {
  return {
    schemaVersion: 1,
    manifest,
    signature: {
      keyId: "unsigned-local-import",
      algorithm: "ecdsa-p256-sha256",
      signature: "",
      signedAt: new Date(0).toISOString(),
    },
  };
}

function toBlobUrl(file: PortableExtensionPackageFile): string {
  const blob = new Blob([file.content], {
    type: file.mimeType || "application/octet-stream",
  });
  return URL.createObjectURL(blob);
}

export function normalizePortableExtensionPackageArtifact(value: unknown): PortableExtensionPackageArtifact | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (record.kind !== "mdwrk-extension-package" || record.version !== 1 || !Array.isArray(record.files)) {
    return null;
  }

  const files = record.files
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry))
    .map((entry) => ({
      path: typeof entry.path === "string" ? entry.path : "",
      content: typeof entry.content === "string" ? entry.content : "",
      mimeType: typeof entry.mimeType === "string" ? entry.mimeType : undefined,
    }))
    .filter((entry) => entry.path.length > 0);

  if (files.length === 0) {
    return null;
  }

  return {
    kind: "mdwrk-extension-package",
    version: 1,
    entryId: typeof record.entryId === "string" ? record.entryId : undefined,
    catalogId: typeof record.catalogId === "string" ? record.catalogId : undefined,
    files,
  };
}

export async function createPortableExtensionCatalogRegistration(
  artifact: PortableExtensionPackageArtifact,
): Promise<PortableExtensionCatalogRegistration> {
  const files = new Map(artifact.files.map((file) => [file.path, file]));
  const manifestFile = readArtifactFile(files, "manifest.json");
  const manifest = JSON.parse(manifestFile.content) as ExtensionManifest;
  const installableFile = readArtifactFile(files, "installable.json");
  const installable = JSON.parse(installableFile.content) as { entryModulePath?: string };
  const entryModulePath = normalizeEntryModulePath(installable.entryModulePath ?? manifest.entry?.module);
  const moduleFile = readArtifactFile(files, entryModulePath);
  const signedManifest = files.has("signed-manifest.json")
    ? JSON.parse(readArtifactFile(files, "signed-manifest.json").content) as SignedExtensionManifest
    : buildUnsignedSignedManifest(manifest);

  const blobUrls: string[] = [];
  const registerBlob = (file: PortableExtensionPackageFile): string => {
    const url = toBlobUrl(file);
    blobUrls.push(url);
    return url;
  };

  const manifestUrl = registerBlob({
    path: "manifest.json",
    content: JSON.stringify(manifest, null, 2),
    mimeType: "application/json",
  });
  const signedManifestUrl = registerBlob({
    path: "signed-manifest.json",
    content: JSON.stringify(signedManifest, null, 2),
    mimeType: "application/json",
  });
  const moduleUrl = registerBlob(moduleFile);

  const entryId = artifact.entryId ?? `${manifest.id}@${manifest.version}`;
  const catalogId = artifact.catalogId ?? `portable:${manifest.id}`;
  const catalogEntry: ExtensionCatalogEntry = {
    entryId,
    extensionId: manifest.id,
    packageName: manifest.packageName,
    version: manifest.version,
    displayName: asLabel(manifest.displayName, manifest.id),
    description: asLabel(manifest.description, manifest.packageName),
    publisher: manifest.publisher,
    icon: manifest.icon,
    categories: manifest.categories ?? [],
    keywords: manifest.keywords ?? [],
    capabilities: manifest.capabilities,
    compatibility: manifest.compatibility,
    supportedLocales: manifest.i18n?.supportedLocales ?? [],
    urls: {
      manifest: manifestUrl,
      signedManifest: signedManifestUrl,
      module: moduleUrl,
      integrity: "",
    },
    integrity: {
      manifest: {
        algorithm: "sha256",
        digest: await digestText(JSON.stringify(manifest)),
      },
      module: {
        algorithm: "sha256",
        digest: await digestText(moduleFile.content),
      },
    },
    support: manifest.support,
  };

  return {
    entryId,
    catalogId,
    catalog: {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      baseUrl: "./",
      extensions: [catalogEntry],
    },
    baseUrl: manifestUrl,
    revoke() {
      for (const url of blobUrls) {
        URL.revokeObjectURL(url);
      }
    },
  };
}
