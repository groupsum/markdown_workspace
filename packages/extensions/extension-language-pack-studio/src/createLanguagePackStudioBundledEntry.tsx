import React from "react";
import type { MarkdownWorkspaceExtension } from "@mdwrk/extension-host";
import type { BundledExtensionCatalogEntry } from "@mdwrk/extension-runtime";
import { LanguagePackStudioSidebar, LanguagePackStudioView } from "./components/LanguagePackStudioView.js";
import { LanguagePackStudioSettingsPanel } from "./components/LanguagePackStudioSettingsPanel.js";
import {
  LANGUAGE_PACK_STUDIO_COMMAND_ID,
  LANGUAGE_PACK_STUDIO_RAIL_ID,
  LANGUAGE_PACK_STUDIO_VIEW_ID,
} from "./constants.js";
import { languagePackStudioLabels, languagePackStudioLocaleLoader } from "./i18n.js";
import { languagePackStudioManifest } from "./manifest.js";
import type { LanguagePackStudioEntryOptions } from "./types.js";

export function createLanguagePackStudioBundledEntry(options: LanguagePackStudioEntryOptions): BundledExtensionCatalogEntry {
  return {
    manifest: languagePackStudioManifest,
    activation: "eager",
    async load() {
      const extension: MarkdownWorkspaceExtension = {
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

          context.registerView(({
            id: LANGUAGE_PACK_STUDIO_VIEW_ID,
            title: languagePackStudioLabels.viewTitle,
            description: languagePackStudioLabels.viewDescription,
            icon: { kind: "lucide", name: "Languages" },
            location: "main",
            allowMultiple: false,
            canBePinned: true,
            render: (props) => (
              <LanguagePackStudioView
                controller={options.controller}
                close={() => (props as { close: () => Promise<void> }).close()}
                formatLabel={context.host.i18n.format}
                shellSidebarOpen={(props as { workspaceSidebarOpen?: boolean }).workspaceSidebarOpen}
                onShellSidebarToggle={(props as { setWorkspaceSidebarOpen?: (open: boolean) => void }).setWorkspaceSidebarOpen}
                embedBrowserInShellSidebar={Boolean((props as { setWorkspaceSidebarOpen?: (open: boolean) => void }).setWorkspaceSidebarOpen)}
              />
            ),
            renderSidebar: () => (
              <LanguagePackStudioSidebar
                controller={options.controller}
              />
            ),
          } as unknown) as never);

          context.registerActionRailItem({
            id: LANGUAGE_PACK_STUDIO_RAIL_ID,
            title: languagePackStudioLabels.railTitle,
            icon: { kind: "lucide", name: "Languages" },
            group: "extensions",
            order: 10,
            target: { kind: "view", viewId: LANGUAGE_PACK_STUDIO_VIEW_ID },
          });

          context.registerSettingsSection(({
            id: `${context.extensionId}.settings`,
            title: languagePackStudioLabels.settingsTitle,
            description: languagePackStudioLabels.settingsDescription,
            order: 30,
            render: () => (
              <LanguagePackStudioSettingsPanel
                controller={options.controller}
                open={() => context.host.views.open(LANGUAGE_PACK_STUDIO_VIEW_ID)}
                formatLabel={context.host.i18n.format}
              />
            ),
          } as unknown) as never);
        },
      };
      return extension;
    },
  };
}
