import type { MarkdownWorkspaceExtension } from "@markdown-workspace/extension-host";
import { validateExtensionManifest } from "./validation.js";
import type { RegisteredRuntimeExtensionCatalogEntry } from "./types.js";

export interface ExtensionLoader {
  load(entry: RegisteredRuntimeExtensionCatalogEntry): Promise<MarkdownWorkspaceExtension>;
}

function normalizeLoadedExtension(value: unknown): MarkdownWorkspaceExtension {
  if (value && typeof value === "object") {
    if ("manifest" in value && "activate" in value) {
      return value as MarkdownWorkspaceExtension;
    }
    if ("default" in value && value.default && typeof value.default === "object") {
      const nested = value.default as unknown;
      if (nested && typeof nested === "object" && "manifest" in nested && "activate" in nested) {
        return nested as MarkdownWorkspaceExtension;
      }
    }
  }
  throw new Error("Extension loader did not return a MarkdownWorkspaceExtension object.");
}

export function createExtensionLoader(): ExtensionLoader {
  return {
    async load(entry: RegisteredRuntimeExtensionCatalogEntry): Promise<MarkdownWorkspaceExtension> {
      const loaded = normalizeLoadedExtension(await entry.load());
      const issues = validateExtensionManifest(loaded.manifest);
      if (issues.length > 0) {
        throw new Error(`Loaded extension manifest is invalid: ${issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ")}`);
      }
      if (loaded.manifest.id !== entry.manifest.id) {
        throw new Error(`Loaded extension manifest id '${loaded.manifest.id}' does not match registered id '${entry.manifest.id}'.`);
      }
      if (loaded.manifest.version !== entry.manifest.version) {
        throw new Error(`Loaded extension version '${loaded.manifest.version}' does not match registered version '${entry.manifest.version}'.`);
      }
      return loaded;
    },
  };
}
