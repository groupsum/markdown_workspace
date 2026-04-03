import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { LanguagePackStudioSidebar, LanguagePackStudioView } from "./components/LanguagePackStudioView.js";
import { LanguagePackStudioSettingsPanel } from "./components/LanguagePackStudioSettingsPanel.js";
import { LANGUAGE_PACK_STUDIO_COMMAND_ID, LANGUAGE_PACK_STUDIO_RAIL_ID, LANGUAGE_PACK_STUDIO_VIEW_ID, } from "./constants.js";
import { languagePackStudioLabels, languagePackStudioLocaleLoader } from "./i18n.js";
import { languagePackStudioManifest } from "./manifest.js";
export function createLanguagePackStudioBundledEntry(options) {
    return {
        manifest: languagePackStudioManifest,
        activation: "eager",
        async load() {
            const extension = {
                manifest: languagePackStudioManifest,
                async activate(context) {
                    context.registerLocaleCatalogLoader(languagePackStudioLocaleLoader);
                    await context.host.i18n.ensureLocale();
                    context.registerCommand({
                        id: LANGUAGE_PACK_STUDIO_COMMAND_ID,
                        title: languagePackStudioLabels.commandOpenTitle,
                        description: languagePackStudioLabels.commandOpenDescription,
                        icon: { kind: "lucide", name: "Languages" },
                        execute: async () => {
                            await context.host.views.open(LANGUAGE_PACK_STUDIO_VIEW_ID);
                        },
                    });
                    context.registerView({
                        id: LANGUAGE_PACK_STUDIO_VIEW_ID,
                        title: languagePackStudioLabels.viewTitle,
                        description: languagePackStudioLabels.viewDescription,
                        icon: { kind: "lucide", name: "Languages" },
                        location: "main",
                        allowMultiple: false,
                        canBePinned: true,
                        render: (props) => (_jsx(LanguagePackStudioView, { controller: options.controller, close: () => props.close(), formatLabel: context.host.i18n.format, shellSidebarOpen: props.workspaceSidebarOpen, onShellSidebarToggle: props.setWorkspaceSidebarOpen, embedBrowserInShellSidebar: Boolean(props.setWorkspaceSidebarOpen) })),
                        renderSidebar: () => (_jsx(LanguagePackStudioSidebar, { controller: options.controller })),
                    });
                    context.registerActionRailItem({
                        id: LANGUAGE_PACK_STUDIO_RAIL_ID,
                        title: languagePackStudioLabels.railTitle,
                        icon: { kind: "lucide", name: "Languages" },
                        group: "extensions",
                        order: 10,
                        target: { kind: "view", viewId: LANGUAGE_PACK_STUDIO_VIEW_ID },
                    });
                    context.registerSettingsSection({
                        id: `${context.extensionId}.settings`,
                        title: languagePackStudioLabels.settingsTitle,
                        description: languagePackStudioLabels.settingsDescription,
                        order: 30,
                        render: () => (_jsx(LanguagePackStudioSettingsPanel, { controller: options.controller, open: () => context.host.views.open(LANGUAGE_PACK_STUDIO_VIEW_ID), formatLabel: context.host.i18n.format })),
                    });
                },
            };
            return extension;
        },
    };
}
//# sourceMappingURL=createLanguagePackStudioBundledEntry.js.map