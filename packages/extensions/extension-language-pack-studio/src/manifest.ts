import type { ExtensionManifest } from "@mdwrk/extension-manifest";
import {
  LANGUAGE_PACK_STUDIO_COMMAND_ID,
  LANGUAGE_PACK_STUDIO_EXTENSION_ID,
  LANGUAGE_PACK_STUDIO_MODAL_COMMAND_ID,
  LANGUAGE_PACK_STUDIO_MODAL_VIEW_ID,
  LANGUAGE_PACK_STUDIO_RAIL_ID,
  LANGUAGE_PACK_STUDIO_VIEW_ID,
} from "./constants.js";
import { languagePackStudioLabels } from "./i18n.js";
import { LANGUAGE_PACK_STUDIO_VERSION } from "./version.js";

export const languagePackStudioManifest: ExtensionManifest = {
  manifestVersion: 1,
  id: LANGUAGE_PACK_STUDIO_EXTENSION_ID,
  packageName: "@mdwrk/extension-language-pack-studio",
  version: LANGUAGE_PACK_STUDIO_VERSION,
  displayName: languagePackStudioLabels.manifestDisplayName,
  description: languagePackStudioLabels.manifestDescription,
  kind: "bundled",
  icon: { kind: "lucide", name: "Languages" },
  enabledByDefault: true,
  capabilities: ["view.register", "actionRail.register"],
  compatibility: {
    manifestVersion: 1,
    hostApi: "^1.0.0",
    runtime: "^1.0.0",
    app: ">=1.4.6",
    themeContract: "^1.0.0",
  },
  entry: {
    module: "./index.js",
    export: "createLanguagePackStudioBundledEntry",
  },
  contributions: {
    commands: [
      {
        id: LANGUAGE_PACK_STUDIO_COMMAND_ID,
        title: languagePackStudioLabels.commandOpenTitle,
        description: languagePackStudioLabels.commandOpenDescription,
        icon: { kind: "lucide", name: "Languages" },
      },
      {
        id: LANGUAGE_PACK_STUDIO_MODAL_COMMAND_ID,
        title: languagePackStudioLabels.commandOpenQuickTitle,
        description: languagePackStudioLabels.commandOpenQuickDescription,
        icon: { kind: "lucide", name: "SquareMenu" },
      }
    ],
    views: [
      {
        id: LANGUAGE_PACK_STUDIO_VIEW_ID,
        title: languagePackStudioLabels.viewTitle,
        description: languagePackStudioLabels.viewDescription,
        icon: { kind: "lucide", name: "Languages" },
        location: "main",
        allowMultiple: false,
        canBePinned: true,
      },
      {
        id: LANGUAGE_PACK_STUDIO_MODAL_VIEW_ID,
        title: languagePackStudioLabels.modalTitle,
        description: languagePackStudioLabels.modalDescription,
        icon: { kind: "lucide", name: "SquareMenu" },
        location: "modal",
        allowMultiple: false,
        canBePinned: false,
      }
    ],
    components: [],
    actionRail: [
      {
        id: LANGUAGE_PACK_STUDIO_RAIL_ID,
        title: languagePackStudioLabels.railTitle,
        icon: { kind: "lucide", name: "Languages" },
        group: "extensions",
        order: 10,
        target: { kind: "view", viewId: LANGUAGE_PACK_STUDIO_VIEW_ID }
      }
    ],
    settingsSections: []
  }
};
