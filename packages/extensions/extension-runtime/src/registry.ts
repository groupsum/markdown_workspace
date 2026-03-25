import type { Disposable } from "@mdwrk/extension-host";
import type {
  BundledExtensionCatalogEntry,
  InstalledExtensionCatalogEntry,
  RegisteredRuntimeExtensionCatalogEntry,
  RuntimeExtensionCatalogEntry,
} from "./types.js";
import { validateExtensionManifest } from "./validation.js";

export interface ExtensionRegistry {
  register(entry: RuntimeExtensionCatalogEntry): Disposable;
  registerBundled(entry: BundledExtensionCatalogEntry): Disposable;
  registerInstalled(entry: InstalledExtensionCatalogEntry): Disposable;
  unregister(id: string): void;
  list(): readonly RegisteredRuntimeExtensionCatalogEntry[];
  get(id: string): RegisteredRuntimeExtensionCatalogEntry | undefined;
}

export function createExtensionRegistry(): ExtensionRegistry {
  const entries = new Map<string, RegisteredRuntimeExtensionCatalogEntry>();

  const register = (entry: RuntimeExtensionCatalogEntry): Disposable => {
    const issues = validateExtensionManifest(entry.manifest);
    if (issues.length > 0) {
      throw new Error(`Invalid extension manifest for '${entry.manifest.id ?? "unknown"}': ${issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ")}`);
    }
    if (entries.has(entry.manifest.id)) {
      throw new Error(`Extension '${entry.manifest.id}' is already registered.`);
    }
    const source = entry.source ?? "bundled";
    const normalized: RegisteredRuntimeExtensionCatalogEntry = {
      ...entry,
      id: entry.manifest.id,
      source,
      activation: entry.activation ?? (source === "installed" ? "lazy" : "lazy"),
    } as RegisteredRuntimeExtensionCatalogEntry;
    entries.set(normalized.id, normalized);
    return {
      dispose(): void {
        if (entries.get(normalized.id) === normalized) {
          entries.delete(normalized.id);
        }
      },
    };
  };

  return {
    register,
    registerBundled(entry: BundledExtensionCatalogEntry): Disposable {
      return register({ ...entry, source: "bundled" });
    },
    registerInstalled(entry: InstalledExtensionCatalogEntry): Disposable {
      return register({ ...entry, source: "installed" });
    },
    unregister(id: string): void {
      entries.delete(id);
    },
    list(): readonly RegisteredRuntimeExtensionCatalogEntry[] {
      return Array.from(entries.values()).sort((left, right) => {
        const sourceOrder = left.source.localeCompare(right.source);
        if (sourceOrder !== 0) return sourceOrder;
        return left.manifest.displayName.defaultMessage.localeCompare(right.manifest.displayName.defaultMessage);
      });
    },
    get(id: string): RegisteredRuntimeExtensionCatalogEntry | undefined {
      return entries.get(id);
    },
  };
}
