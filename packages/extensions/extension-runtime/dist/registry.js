import { validateExtensionManifest } from "./validation.js";
export function createExtensionRegistry() {
    const entries = new Map();
    const register = (entry) => {
        const issues = validateExtensionManifest(entry.manifest);
        if (issues.length > 0) {
            throw new Error(`Invalid extension manifest for '${entry.manifest.id ?? "unknown"}': ${issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ")}`);
        }
        if (entries.has(entry.manifest.id)) {
            throw new Error(`Extension '${entry.manifest.id}' is already registered.`);
        }
        const source = entry.source ?? "bundled";
        const normalized = {
            ...entry,
            id: entry.manifest.id,
            source,
            activation: entry.activation ?? (source === "installed" ? "lazy" : "lazy"),
        };
        entries.set(normalized.id, normalized);
        return {
            dispose() {
                if (entries.get(normalized.id) === normalized) {
                    entries.delete(normalized.id);
                }
            },
        };
    };
    return {
        register,
        registerBundled(entry) {
            return register({ ...entry, source: "bundled" });
        },
        registerInstalled(entry) {
            return register({ ...entry, source: "installed" });
        },
        unregister(id) {
            entries.delete(id);
        },
        list() {
            return Array.from(entries.values()).sort((left, right) => {
                const sourceOrder = left.source.localeCompare(right.source);
                if (sourceOrder !== 0)
                    return sourceOrder;
                return left.manifest.displayName.defaultMessage.localeCompare(right.manifest.displayName.defaultMessage);
            });
        },
        get(id) {
            return entries.get(id);
        },
    };
}
//# sourceMappingURL=registry.js.map