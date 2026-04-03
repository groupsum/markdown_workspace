import { THEME_STUDIO_DEFAULT_SETTINGS, THEME_STUDIO_SETTING_AUTO_PREVIEW, THEME_STUDIO_SETTING_COMPACT_CSS, THEME_STUDIO_SETTING_DEFAULT_AUTHOR, THEME_STUDIO_SETTING_DEFAULT_EXPORT_TARGET, THEME_STUDIO_SETTING_PACKAGE_NAME_PREFIX, } from "./constants.js";
export async function readThemeStudioSettings(options) {
    const config = "config" in options ? options.config : options;
    const [autoPreviewOnEdit, defaultExportTarget, compactCss, packageNamePrefix, defaultAuthor,] = await Promise.all([
        config.get(THEME_STUDIO_SETTING_AUTO_PREVIEW),
        config.get(THEME_STUDIO_SETTING_DEFAULT_EXPORT_TARGET),
        config.get(THEME_STUDIO_SETTING_COMPACT_CSS),
        config.get(THEME_STUDIO_SETTING_PACKAGE_NAME_PREFIX),
        config.get(THEME_STUDIO_SETTING_DEFAULT_AUTHOR),
    ]);
    return {
        autoPreviewOnEdit: autoPreviewOnEdit ?? THEME_STUDIO_DEFAULT_SETTINGS.autoPreviewOnEdit,
        defaultExportTarget: defaultExportTarget ?? THEME_STUDIO_DEFAULT_SETTINGS.defaultExportTarget,
        compactCss: compactCss ?? THEME_STUDIO_DEFAULT_SETTINGS.compactCss,
        packageNamePrefix: packageNamePrefix?.trim() || THEME_STUDIO_DEFAULT_SETTINGS.packageNamePrefix,
        defaultAuthor: defaultAuthor?.trim() || THEME_STUDIO_DEFAULT_SETTINGS.defaultAuthor,
    };
}
//# sourceMappingURL=settings.js.map