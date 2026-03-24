import { jsx as _jsx } from "react/jsx-runtime";
import { THEME_STUDIO_COMMAND_OPEN_ID, THEME_STUDIO_RAIL_ID, THEME_STUDIO_SERVICE_TOKEN, THEME_STUDIO_VIEW_ID, } from "./constants.js";
import { themeStudioLabels, themeStudioLocaleLoader } from "./i18n.js";
import { themeStudioManifest } from "./manifest.js";
import { createThemeStudioService } from "./service.js";
import { ThemeStudioView } from "./components/ThemeStudioView.js";
export function createThemeStudioBundledEntry() {
    return {
        manifest: themeStudioManifest,
        activation: "eager",
        async load() {
            const extension = {
                manifest: themeStudioManifest,
                async activate(context) {
                    context.registerLocaleCatalogLoader(themeStudioLocaleLoader);
                    await context.host.i18n.ensureLocale();
                    const service = createThemeStudioService({
                        context,
                        formatLabel: context.host.i18n.format,
                    });
                    context.registerService(THEME_STUDIO_SERVICE_TOKEN, service);
                    await service.refresh();
                    context.registerCommand({
                        id: THEME_STUDIO_COMMAND_OPEN_ID,
                        title: themeStudioLabels.commandOpenTitle,
                        description: themeStudioLabels.commandOpenDescription,
                        icon: { kind: "lucide", name: "Palette" },
                        keywords: ["theme", "studio", "palette", "tokens"],
                        execute: async () => {
                            await context.host.views.open(THEME_STUDIO_VIEW_ID);
                        },
                    });
                    context.registerView({
                        id: THEME_STUDIO_VIEW_ID,
                        title: themeStudioLabels.viewTitle,
                        description: themeStudioLabels.viewDescription,
                        icon: { kind: "lucide", name: "Palette" },
                        location: "modal",
                        allowMultiple: false,
                        canBePinned: false,
                        render: (props) => (_jsx(ThemeStudioView, { service: service, close: () => props.close(), formatLabel: context.host.i18n.format })),
                    });
                    context.registerActionRailItem({
                        id: THEME_STUDIO_RAIL_ID,
                        title: themeStudioLabels.railTitle,
                        icon: { kind: "lucide", name: "Palette" },
                        group: "appearance",
                        order: 10,
                        target: {
                            kind: "view",
                            viewId: THEME_STUDIO_VIEW_ID,
                        },
                    });
                    context.registerSettingsSection({
                        id: `${context.extensionId}.settings`,
                        title: themeStudioLabels.settingsTitle,
                        description: themeStudioLabels.settingsDescription,
                        order: 20,
                        schemaPath: "manifest.settingsSchema",
                    });
                    await context.host.diagnostics.publish(context.extensionId, {
                        severity: "info",
                        code: "EXT_THEME_STUDIO_READY",
                        message: context.host.i18n.format(themeStudioLabels.diagnosticsReady),
                    });
                },
            };
            return extension;
        },
    };
}
//# sourceMappingURL=createThemeStudioBundledEntry.js.map