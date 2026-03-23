import { jsx as _jsx } from "react/jsx-runtime";
import { ExtensionManagerView } from "./components/ExtensionManagerView.js";
import { EXTENSION_MANAGER_COMMAND_ID, EXTENSION_MANAGER_RAIL_ID, EXTENSION_MANAGER_VIEW_ID, extensionManagerManifest, } from "./manifest.js";
import { extensionManagerLabels, extensionManagerLocaleLoader } from "./i18n.js";
export function createExtensionManagerBundledEntry(options) {
    return {
        manifest: extensionManagerManifest,
        activation: "eager",
        async load() {
            const extension = {
                manifest: extensionManagerManifest,
                async activate(context) {
                    context.registerLocaleCatalogLoader(extensionManagerLocaleLoader);
                    await context.host.i18n.ensureLocale();
                    context.registerCommand({
                        id: EXTENSION_MANAGER_COMMAND_ID,
                        title: extensionManagerLabels.commandOpenTitle,
                        description: extensionManagerLabels.commandOpenDescription,
                        icon: { kind: "lucide", name: "Puzzle" },
                        execute: async () => {
                            await context.host.views.open(EXTENSION_MANAGER_VIEW_ID);
                        },
                    });
                    context.registerView({
                        id: EXTENSION_MANAGER_VIEW_ID,
                        title: extensionManagerLabels.viewTitle,
                        description: extensionManagerLabels.viewDescription,
                        icon: { kind: "lucide", name: "Puzzle" },
                        location: "modal",
                        allowMultiple: false,
                        canBePinned: false,
                        render: (props) => (_jsx(ExtensionManagerView, { runtime: options.runtime, close: () => props.close(), formatLabel: context.host.i18n.format, defaultSettings: {
                                showCompatibility: true,
                                showDiagnostics: true,
                            } })),
                    });
                    context.registerActionRailItem({
                        id: EXTENSION_MANAGER_RAIL_ID,
                        title: extensionManagerLabels.railTitle,
                        icon: { kind: "lucide", name: "Puzzle" },
                        group: "extensions",
                        order: 0,
                        target: {
                            kind: "view",
                            viewId: EXTENSION_MANAGER_VIEW_ID,
                        },
                    });
                    await context.host.diagnostics.publish(context.extensionId, {
                        severity: "info",
                        code: "EXT_MANAGER_READY",
                        message: context.host.i18n.format(extensionManagerLabels.readyDiagnostic),
                    });
                },
            };
            return extension;
        },
    };
}
//# sourceMappingURL=createExtensionManagerBundledEntry.js.map