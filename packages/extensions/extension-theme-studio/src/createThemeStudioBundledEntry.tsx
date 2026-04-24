import React from "react";
import type { MarkdownWorkspaceExtension } from "@mdwrk/extension-host";
import type { BundledExtensionCatalogEntry } from "@mdwrk/extension-runtime";
import {
  THEME_STUDIO_COMMAND_OPEN_ID,
  THEME_STUDIO_RAIL_ID,
  THEME_STUDIO_SERVICE_TOKEN,
  THEME_STUDIO_VIEW_ID,
} from "./constants.js";
import { themeStudioLabels, themeStudioLocaleLoader } from "./i18n.js";
import { themeStudioManifest } from "./manifest.js";
import { createThemeStudioService } from "./service.js";
import { ThemeStudioSidebar, ThemeStudioView } from "./components/ThemeStudioView.js";
import { ThemeStudioSettingsPanel } from "./components/ThemeStudioSettingsPanel.js";

export function createThemeStudioBundledEntry(): BundledExtensionCatalogEntry {
  return {
    manifest: themeStudioManifest,
    activation: "eager",
    async load() {
      const extension: MarkdownWorkspaceExtension = {
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

          context.registerWorkspaceModule({
            ...themeStudioManifest.contributions.workspaceModules![0],
            render: (props) => (
              <ThemeStudioView
                service={service}
                close={() => (props as { close: () => Promise<void> }).close()}
                formatLabel={context.host.i18n.format}
                shellSidebarOpen={(props as { workspaceSidebarOpen?: boolean }).workspaceSidebarOpen}
                onShellSidebarToggle={(props as { setWorkspaceSidebarOpen?: (open: boolean) => void }).setWorkspaceSidebarOpen}
                embedBrowserInShellSidebar={Boolean((props as { setWorkspaceSidebarOpen?: (open: boolean) => void }).setWorkspaceSidebarOpen)}
              />
            ),
            renderExplorer: () => (
              <ThemeStudioSidebar
                service={service}
                formatLabel={context.host.i18n.format}
              />
            ),
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

          context.registerSettingsSection(({
            id: `${context.extensionId}.settings`,
            title: themeStudioLabels.settingsTitle,
            description: themeStudioLabels.settingsDescription,
            order: 20,
            schemaPath: "manifest.settingsSchema",
            schema: themeStudioManifest.settingsSchema,
            render: () => (
              <ThemeStudioSettingsPanel
                service={service}
                open={() => context.host.views.open(THEME_STUDIO_VIEW_ID)}
                formatLabel={context.host.i18n.format}
              />
            ),
          } as unknown) as never);

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
