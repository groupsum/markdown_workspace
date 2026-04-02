import React from "react";
import type { MarkdownWorkspaceExtension } from "@mdwrk/extension-host";
import type { BundledExtensionCatalogEntry } from "@mdwrk/extension-runtime";
import { LanguagePackStudioView } from "./components/LanguagePackStudioView.js";
import {
  LANGUAGE_PACK_STUDIO_COMMAND_ID,
  LANGUAGE_PACK_STUDIO_MODAL_COMMAND_ID,
  LANGUAGE_PACK_STUDIO_MODAL_VIEW_ID,
  LANGUAGE_PACK_STUDIO_RAIL_ID,
  LANGUAGE_PACK_STUDIO_VIEW_ID,
} from "./constants.js";
import { languagePackStudioLabels } from "./i18n.js";
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
          context.registerCommand({
            id: LANGUAGE_PACK_STUDIO_COMMAND_ID,
            title: languagePackStudioLabels.commandOpenTitle,
            description: languagePackStudioLabels.commandOpenDescription,
            icon: { kind: "lucide", name: "Languages" },
            execute: async () => {
              await context.host.views.open(LANGUAGE_PACK_STUDIO_VIEW_ID);
            },
          });
          context.registerCommand({
            id: LANGUAGE_PACK_STUDIO_MODAL_COMMAND_ID,
            title: languagePackStudioLabels.commandOpenQuickTitle,
            description: languagePackStudioLabels.commandOpenQuickDescription,
            icon: { kind: "lucide", name: "SquareMenu" },
            execute: async () => {
              await context.host.views.open(LANGUAGE_PACK_STUDIO_MODAL_VIEW_ID);
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
            render: (props) => (
              <LanguagePackStudioView
                controller={options.controller}
                close={() => (props as { close: () => Promise<void> }).close()}
                openQuickActions={() => context.host.views.open(LANGUAGE_PACK_STUDIO_MODAL_VIEW_ID)}
                formatLabel={context.host.i18n.format}
                mode="pane"
              />
            ),
          });
          context.registerView({
            id: LANGUAGE_PACK_STUDIO_MODAL_VIEW_ID,
            title: languagePackStudioLabels.modalTitle,
            description: languagePackStudioLabels.modalDescription,
            icon: { kind: "lucide", name: "SquareMenu" },
            location: "modal",
            allowMultiple: false,
            canBePinned: false,
            render: (props) => (
              <LanguagePackStudioView
                controller={options.controller}
                close={() => (props as { close: () => Promise<void> }).close()}
                formatLabel={context.host.i18n.format}
                mode="modal"
              />
            ),
          });
          context.registerActionRailItem({
            id: LANGUAGE_PACK_STUDIO_RAIL_ID,
            title: languagePackStudioLabels.railTitle,
            icon: { kind: "lucide", name: "Languages" },
            group: "extensions",
            order: 10,
            target: { kind: "view", viewId: LANGUAGE_PACK_STUDIO_VIEW_ID },
          });
        },
      };
      return extension;
    },
  };
}
