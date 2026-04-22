import { EXTENSION_MANIFEST_VERSION } from "@mdwrk/extension-manifest";
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const WORKSPACE_MODULE_LAYOUTS = new Set(["single", "left", "right", "split"]);
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
        if (manifest.contributions.workspaceModules !== undefined) {
            if (!Array.isArray(manifest.contributions.workspaceModules)) {
                issues.push({ path: "contributions.workspaceModules", message: "contributions.workspaceModules must be an array." });
            }
            else {
                const settingsIds = new Set((manifest.contributions.settingsSections ?? []).map((section) => section.id));
                const viewIds = new Set((manifest.contributions.views ?? []).map((view) => view.id));
                for (const [index, module] of manifest.contributions.workspaceModules.entries()) {
                    const path = `contributions.workspaceModules.${index}`;
                    if (!isNonEmptyString(module.id))
                        issues.push({ path: `${path}.id`, message: "Workspace module id must be a non-empty string." });
                    if (!isNonEmptyString(module.primaryViewId))
                        issues.push({ path: `${path}.primaryViewId`, message: "Workspace module primaryViewId is required." });
                    if (!isNonEmptyString(module.explorerViewId))
                        issues.push({ path: `${path}.explorerViewId`, message: "Workspace module explorerViewId is required." });
                    if (!isNonEmptyString(module.settingsSectionId)) {
                        issues.push({ path: `${path}.settingsSectionId`, message: "Workspace module settingsSectionId is required." });
                    }
                    else if (!settingsIds.has(module.settingsSectionId)) {
                        issues.push({ path: `${path}.settingsSectionId`, message: "Workspace module settingsSectionId must reference a registered settings section." });
                    }
                    if (module.primaryViewId && !viewIds.has(module.primaryViewId)) {
                        issues.push({ path: `${path}.primaryViewId`, message: "Workspace module primaryViewId must reference a contributed view." });
                    }
                    if (module.explorerViewId && !viewIds.has(module.explorerViewId)) {
                        issues.push({ path: `${path}.explorerViewId`, message: "Workspace module explorerViewId must reference a contributed view." });
                    }
                    if (!Array.isArray(module.supportedLayouts) || module.supportedLayouts.length === 0) {
                        issues.push({ path: `${path}.supportedLayouts`, message: "Workspace module supportedLayouts must contain at least one layout." });
                    }
                    else {
                        for (const layout of module.supportedLayouts) {
                            if (!WORKSPACE_MODULE_LAYOUTS.has(layout)) {
                                issues.push({ path: `${path}.supportedLayouts`, message: `Unsupported workspace module layout '${String(layout)}'.` });
                            }
                        }
                    }
                    if (!WORKSPACE_MODULE_LAYOUTS.has(module.defaultLayout)) {
                        issues.push({ path: `${path}.defaultLayout`, message: `Unsupported workspace module defaultLayout '${String(module.defaultLayout)}'.` });
                    }
                    else if (Array.isArray(module.supportedLayouts) && !module.supportedLayouts.includes(module.defaultLayout)) {
                        issues.push({ path: `${path}.defaultLayout`, message: "Workspace module defaultLayout must be included in supportedLayouts." });
                    }
                }
            }
        }
    }
    return issues;
}
//# sourceMappingURL=validation.js.map
