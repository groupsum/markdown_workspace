export const THEME_STUDIO_EXTENSION_ID = "core.theme-studio";
export const THEME_STUDIO_VIEW_ID = `${THEME_STUDIO_EXTENSION_ID}.view`;
export const THEME_STUDIO_RAIL_ID = `${THEME_STUDIO_EXTENSION_ID}.rail`;
export const THEME_STUDIO_COMMAND_OPEN_ID = `${THEME_STUDIO_EXTENSION_ID}.open`;
export const THEME_STUDIO_SERVICE_TOKEN = `${THEME_STUDIO_EXTENSION_ID}.service`;
export const THEME_STUDIO_SETTINGS_SECTION_PREVIEW = `${THEME_STUDIO_EXTENSION_ID}.settings.preview`;
export const THEME_STUDIO_SETTINGS_SECTION_EXPORT = `${THEME_STUDIO_EXTENSION_ID}.settings.export`;
export const THEME_STUDIO_SETTING_AUTO_PREVIEW = "autoPreviewOnEdit";
export const THEME_STUDIO_SETTING_DEFAULT_EXPORT_TARGET = "defaultExportTarget";
export const THEME_STUDIO_SETTING_COMPACT_CSS = "compactCss";
export const THEME_STUDIO_SETTING_PACKAGE_NAME_PREFIX = "packageNamePrefix";
export const THEME_STUDIO_SETTING_DEFAULT_AUTHOR = "defaultAuthor";
export const THEME_STUDIO_DEFAULT_SETTINGS = {
    autoPreviewOnEdit: true,
    defaultExportTarget: "host",
    compactCss: false,
    packageNamePrefix: "@markdown-workspace/theme-",
    defaultAuthor: "Markdown Workspace",
};
export const THEME_STUDIO_SAMPLE_MARKDOWN = `# Theme Studio Preview

Use **tokens** to style renderer and editor surfaces.

- Preview renderer bridges
- Preview editor bridges
- Export JSON and CSS artifacts

> Theme Studio uses the shared token and class contract.`;
//# sourceMappingURL=constants.js.map