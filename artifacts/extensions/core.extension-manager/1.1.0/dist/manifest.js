import { EXTENSION_MANAGER_COMMAND_ID, EXTENSION_MANAGER_EXTENSION_ID, EXTENSION_MANAGER_RAIL_ID, EXTENSION_MANAGER_VIEW_ID, } from "./constants.js";
import { extensionManagerLabels } from "./i18n.js";
import { EXTENSION_MANAGER_VERSION } from "./version.js";
export const extensionManagerManifest = {
    manifestVersion: 1,
    id: EXTENSION_MANAGER_EXTENSION_ID,
    packageName: "@mdwrk/extension-manager",
    version: EXTENSION_MANAGER_VERSION,
    displayName: extensionManagerLabels.manifestDisplayName,
    description: extensionManagerLabels.manifestDescription,
    kind: "bundled",
    icon: { kind: "lucide", name: "Puzzle" },
    enabledByDefault: true,
    capabilities: ["view.register", "actionRail.register", "settings.read", "settings.write"],
    compatibility: {
        manifestVersion: 1,
        hostApi: "^1.0.0",
        runtime: "^1.0.0",
        app: ">=1.3.49",
        themeContract: "^1.0.0",
    },
    entry: {
        module: "./index.js",
        export: "createExtensionManagerBundledEntry",
    },
    i18n: {
        defaultLocale: "en",
        supportedLocales: ["en", "es"],
        catalogs: [
            { locale: "en", path: "./locales/en.js" },
            { locale: "es", path: "./locales/es.js" },
        ],
    },
    contributions: {
        commands: [
            {
                id: EXTENSION_MANAGER_COMMAND_ID,
                title: extensionManagerLabels.commandOpenTitle,
                description: extensionManagerLabels.commandOpenDescription,
                icon: { kind: "lucide", name: "Puzzle" },
                keywords: ["extension", "manager", "bundled"],
            },
        ],
        views: [
            {
                id: EXTENSION_MANAGER_VIEW_ID,
                title: extensionManagerLabels.viewTitle,
                description: extensionManagerLabels.viewDescription,
                icon: { kind: "lucide", name: "Puzzle" },
                location: "modal",
                allowMultiple: false,
                canBePinned: false,
            },
        ],
        components: [],
        actionRail: [
            {
                id: EXTENSION_MANAGER_RAIL_ID,
                title: extensionManagerLabels.railTitle,
                icon: { kind: "lucide", name: "Puzzle" },
                group: "extensions",
                order: 0,
                target: {
                    kind: "view",
                    viewId: EXTENSION_MANAGER_VIEW_ID,
                },
            },
        ],
        settingsSections: [
            {
                id: `${EXTENSION_MANAGER_EXTENSION_ID}.settings`,
                title: extensionManagerLabels.settingsTitle,
                description: extensionManagerLabels.viewDescription,
                order: 10,
                schemaPath: "manifest.settingsSchema",
            },
        ],
    },
    settingsSchema: {
        version: 1,
        title: extensionManagerLabels.settingsTitle,
        sections: [
            {
                id: "display",
                title: extensionManagerLabels.settingsDisplayTitle,
                description: extensionManagerLabels.settingsDisplayDescription,
            },
        ],
        fields: [
            {
                key: "showCompatibilityByDefault",
                kind: "boolean",
                sectionId: "display",
                label: extensionManagerLabels.showCompatibilityLabel,
                description: extensionManagerLabels.showCompatibilityDescription,
                defaultValue: true,
            },
            {
                key: "showDiagnosticsByDefault",
                kind: "boolean",
                sectionId: "display",
                label: extensionManagerLabels.showDiagnosticsLabel,
                description: extensionManagerLabels.showDiagnosticsDescription,
                defaultValue: true,
            },
        ],
    },
};
export { EXTENSION_MANAGER_COMMAND_ID, EXTENSION_MANAGER_EXTENSION_ID, EXTENSION_MANAGER_RAIL_ID, EXTENSION_MANAGER_VIEW_ID, } from "./constants.js";
//# sourceMappingURL=manifest.js.map