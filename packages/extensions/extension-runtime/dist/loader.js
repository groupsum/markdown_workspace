import { validateExtensionManifest } from "./validation.js";
function normalizeLoadedExtension(value) {
    if (value && typeof value === "object") {
        if ("manifest" in value && "activate" in value) {
            return value;
        }
        if ("default" in value && value.default && typeof value.default === "object") {
            const nested = value.default;
            if (nested && typeof nested === "object" && "manifest" in nested && "activate" in nested) {
                return nested;
            }
        }
    }
    throw new Error("Extension loader did not return a MarkdownWorkspaceExtension object.");
}
export function createExtensionLoader() {
    return {
        async load(entry) {
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
//# sourceMappingURL=loader.js.map