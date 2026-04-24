import type { ExtensionManifest } from "@mdwrk/extension-manifest";
import {
  LANGUAGE_PACK_STUDIO_COMMAND_ID,
  LANGUAGE_PACK_STUDIO_EXPLORER_VIEW_ID,
  LANGUAGE_PACK_STUDIO_EXTENSION_ID,
  LANGUAGE_PACK_STUDIO_MODULE_ID,
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
  capabilities: ["view.register", "actionRail.register", "settings.read", "settings.write"],
  capabilityPresetIds: ["workspace.module.standard"],
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
  i18n: {
    defaultLocale: "en",
    supportedLocales: ["en"],
    catalogs: [{ locale: "en", path: "./locales/en.js" }],
  },
  contributions: {
    commands: [
      {
        id: LANGUAGE_PACK_STUDIO_COMMAND_ID,
        title: languagePackStudioLabels.commandOpenTitle,
        description: languagePackStudioLabels.commandOpenDescription,
        icon: { kind: "lucide", name: "Languages" },
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
      }
      ,
      {
        id: LANGUAGE_PACK_STUDIO_EXPLORER_VIEW_ID,
        title: { defaultMessage: "Language Pack Browser" },
        description: { defaultMessage: "Built-in and installed language pack browser." },
        icon: { kind: "lucide", name: "Languages" },
        location: "sidebar",
        allowMultiple: false,
        canBePinned: true,
      }
    ],
    components: [],
    workspaceModules: [
      {
        id: LANGUAGE_PACK_STUDIO_MODULE_ID,
        title: languagePackStudioLabels.viewTitle,
        description: languagePackStudioLabels.viewDescription,
        icon: { kind: "lucide", name: "Languages" },
        primaryViewId: LANGUAGE_PACK_STUDIO_VIEW_ID,
        explorerViewId: LANGUAGE_PACK_STUDIO_EXPLORER_VIEW_ID,
        supportedLayouts: ["single", "left", "right", "split"],
        defaultLayout: "split",
        settingsSectionId: `${LANGUAGE_PACK_STUDIO_EXTENSION_ID}.settings`,
        capabilityProfiles: ["workspace.module.base"],
        capabilityPresetIds: ["workspace.module.standard"],
        actions: [
          { commandId: LANGUAGE_PACK_STUDIO_COMMAND_ID, role: "primary", order: 10 },
        ],
      },
    ],
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
    settingsSections: [
      {
        id: `${LANGUAGE_PACK_STUDIO_EXTENSION_ID}.settings`,
        title: languagePackStudioLabels.settingsTitle,
        description: languagePackStudioLabels.settingsDescription,
        order: 30,
        schemaPath: "manifest.settingsSchema",
      }
    ]
  },
  settingsSchema: {
    version: 1,
    title: languagePackStudioLabels.settingsTitle,
    description: languagePackStudioLabels.settingsDescription,
    sections: [],
    fields: [],
  }
};
