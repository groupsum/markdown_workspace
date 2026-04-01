import { THEME_STUDIO_COMMAND_OPEN_ID, THEME_STUDIO_DEFAULT_SETTINGS, THEME_STUDIO_EXTENSION_ID, THEME_STUDIO_RAIL_ID, THEME_STUDIO_SETTINGS_SECTION_EXPORT, THEME_STUDIO_SETTINGS_SECTION_PREVIEW, THEME_STUDIO_SETTING_AUTO_PREVIEW, THEME_STUDIO_SETTING_COMPACT_CSS, THEME_STUDIO_SETTING_DEFAULT_AUTHOR, THEME_STUDIO_SETTING_DEFAULT_EXPORT_TARGET, THEME_STUDIO_SETTING_PACKAGE_NAME_PREFIX, THEME_STUDIO_VIEW_ID, } from "./constants.js";
import { themeStudioLabels } from "./i18n.js";
import { THEME_STUDIO_VERSION } from "./version.js";
export const themeStudioManifest = {
    manifestVersion: 1,
    id: THEME_STUDIO_EXTENSION_ID,
    packageName: "@mdwrk/extension-theme-studio",
    version: THEME_STUDIO_VERSION,
    displayName: themeStudioLabels.manifestDisplayName,
    description: themeStudioLabels.manifestDescription,
    kind: "bundled",
    icon: { kind: "lucide", name: "Palette" },
    enabledByDefault: true,
    capabilities: [
        "theme.read",
        "theme.write",
        "settings.read",
        "settings.write",
        "notification.publish",
        "view.register",
        "actionRail.register",
    ],
    compatibility: {
        manifestVersion: 1,
        hostApi: "^1.0.0",
        runtime: "^1.0.0",
        app: ">=1.3.49",
        themeContract: "^1.0.0",
        renderer: "^1.0.0",
        editor: "^1.0.0",
    },
    entry: {
        module: "./index.js",
        export: "createThemeStudioBundledEntry",
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
                id: THEME_STUDIO_COMMAND_OPEN_ID,
                title: themeStudioLabels.commandOpenTitle,
                description: themeStudioLabels.commandOpenDescription,
                icon: { kind: "lucide", name: "Palette" },
                keywords: ["theme", "studio", "tokens", "preview", "export"],
            },
        ],
        views: [
            {
                id: THEME_STUDIO_VIEW_ID,
                title: themeStudioLabels.viewTitle,
                description: themeStudioLabels.viewDescription,
                icon: { kind: "lucide", name: "Palette" },
                location: "modal",
                allowMultiple: false,
                canBePinned: false,
            },
        ],
        components: [],
        actionRail: [
            {
                id: THEME_STUDIO_RAIL_ID,
                title: themeStudioLabels.railTitle,
                icon: { kind: "lucide", name: "Palette" },
                group: "appearance",
                order: 10,
                target: {
                    kind: "view",
                    viewId: THEME_STUDIO_VIEW_ID,
                },
            },
        ],
        settingsSections: [
            {
                id: `${THEME_STUDIO_EXTENSION_ID}.settings`,
                title: themeStudioLabels.settingsTitle,
                description: themeStudioLabels.settingsDescription,
                order: 20,
                schemaPath: "manifest.settingsSchema",
            },
        ],
    },
    settingsSchema: {
        version: 1,
        title: themeStudioLabels.settingsTitle,
        description: themeStudioLabels.settingsDescription,
        sections: [
            {
                id: THEME_STUDIO_SETTINGS_SECTION_PREVIEW,
                title: themeStudioLabels.settingsPreviewTitle,
                description: themeStudioLabels.settingsPreviewDescription,
            },
            {
                id: THEME_STUDIO_SETTINGS_SECTION_EXPORT,
                title: themeStudioLabels.settingsExportTitle,
                description: themeStudioLabels.settingsExportDescription,
            },
        ],
        fields: [
            {
                key: THEME_STUDIO_SETTING_AUTO_PREVIEW,
                kind: "boolean",
                sectionId: THEME_STUDIO_SETTINGS_SECTION_PREVIEW,
                label: themeStudioLabels.autoPreviewLabel,
                description: themeStudioLabels.autoPreviewDescription,
                defaultValue: THEME_STUDIO_DEFAULT_SETTINGS.autoPreviewOnEdit,
            },
            {
                key: THEME_STUDIO_SETTING_DEFAULT_EXPORT_TARGET,
                kind: "select",
                sectionId: THEME_STUDIO_SETTINGS_SECTION_EXPORT,
                label: themeStudioLabels.defaultExportTargetLabel,
                description: themeStudioLabels.defaultExportTargetDescription,
                defaultValue: THEME_STUDIO_DEFAULT_SETTINGS.defaultExportTarget,
                options: [
                    { value: "host", label: { defaultMessage: "Host" } },
                    { value: "renderer", label: { defaultMessage: "Renderer" } },
                    { value: "editor", label: { defaultMessage: "Editor" } },
                ],
            },
            {
                key: THEME_STUDIO_SETTING_COMPACT_CSS,
                kind: "boolean",
                sectionId: THEME_STUDIO_SETTINGS_SECTION_EXPORT,
                label: themeStudioLabels.compactCssLabel,
                description: themeStudioLabels.compactCssDescription,
                defaultValue: THEME_STUDIO_DEFAULT_SETTINGS.compactCss,
            },
            {
                key: THEME_STUDIO_SETTING_PACKAGE_NAME_PREFIX,
                kind: "string",
                sectionId: THEME_STUDIO_SETTINGS_SECTION_EXPORT,
                label: themeStudioLabels.packagePrefixLabel,
                description: themeStudioLabels.packagePrefixDescription,
                defaultValue: THEME_STUDIO_DEFAULT_SETTINGS.packageNamePrefix,
            },
            {
                key: THEME_STUDIO_SETTING_DEFAULT_AUTHOR,
                kind: "string",
                sectionId: THEME_STUDIO_SETTINGS_SECTION_EXPORT,
                label: themeStudioLabels.defaultAuthorLabel,
                description: themeStudioLabels.defaultAuthorDescription,
                defaultValue: THEME_STUDIO_DEFAULT_SETTINGS.defaultAuthor,
            },
        ],
    },
};
export { THEME_STUDIO_COMMAND_OPEN_ID, THEME_STUDIO_EXTENSION_ID, THEME_STUDIO_RAIL_ID, THEME_STUDIO_VIEW_ID, } from "./constants.js";
//# sourceMappingURL=manifest.js.map