import { EXTENSION_MANIFEST_VERSION } from "@mdwrk/extension-manifest";
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
export function validateExtensionManifest(manifest) {
    const issues = [];
    if (manifest.manifestVersion !== EXTENSION_MANIFEST_VERSION) {
        issues.push({
            path: "manifestVersion",
            message: `Expected manifestVersion ${EXTENSION_MANIFEST_VERSION}, received ${String(manifest.manifestVersion)}.`,
        });
    }
    if (!isNonEmptyString(manifest.id))
        issues.push({ path: "id", message: "Extension manifest id must be a non-empty string." });
    if (!isNonEmptyString(manifest.packageName))
        issues.push({ path: "packageName", message: "Extension manifest packageName must be a non-empty string." });
    if (!isNonEmptyString(manifest.version))
        issues.push({ path: "version", message: "Extension manifest version must be a non-empty string." });
    if (!isNonEmptyString(manifest.displayName?.defaultMessage))
        issues.push({ path: "displayName.defaultMessage", message: "displayName.defaultMessage is required." });
    if (!isNonEmptyString(manifest.description?.defaultMessage))
        issues.push({ path: "description.defaultMessage", message: "description.defaultMessage is required." });
    if (!manifest.icon || !isNonEmptyString(manifest.icon.kind)) {
        issues.push({ path: "icon", message: "Extension manifest icon is required." });
    }
    if (!Array.isArray(manifest.capabilities)) {
        issues.push({ path: "capabilities", message: "Extension manifest capabilities must be an array." });
    }
    if (!manifest.compatibility) {
        issues.push({ path: "compatibility", message: "Extension manifest compatibility block is required." });
    }
    if (!manifest.entry || !isNonEmptyString(manifest.entry.module) || !isNonEmptyString(manifest.entry.export)) {
        issues.push({ path: "entry", message: "Extension manifest entry.module and entry.export are required." });
    }
    if (manifest.kind === "external") {
        if (!manifest.distribution) {
            issues.push({ path: "distribution", message: "External extension manifests must declare a distribution block." });
        }
        else if (manifest.distribution.channel !== "catalog") {
            issues.push({ path: "distribution.channel", message: "External extension manifests must use distribution.channel = 'catalog'." });
        }
    }
    if (!manifest.contributions) {
        issues.push({ path: "contributions", message: "Extension manifest contributions block is required." });
    }
    else {
        const keys = ["commands", "views", "components", "actionRail", "settingsSections"];
        for (const key of keys) {
            if (!Array.isArray(manifest.contributions[key])) {
                issues.push({ path: `contributions.${key}`, message: `contributions.${key} must be an array.` });
            }
        }
    }
    return issues;
}
//# sourceMappingURL=validation.js.map