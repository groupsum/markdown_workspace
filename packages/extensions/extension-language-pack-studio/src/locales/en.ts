import type { ExtensionLocaleCatalog } from "@mdwrk/extension-host";
import { languagePackStudioLabels } from "../i18n.js";

export const languagePackStudioEnCatalog: ExtensionLocaleCatalog = {
  locale: "en",
  messages: {
    [languagePackStudioLabels.manifestDisplayName.key!]: languagePackStudioLabels.manifestDisplayName.defaultMessage,
    [languagePackStudioLabels.manifestDescription.key!]: languagePackStudioLabels.manifestDescription.defaultMessage,
    [languagePackStudioLabels.commandOpenTitle.key!]: languagePackStudioLabels.commandOpenTitle.defaultMessage,
    [languagePackStudioLabels.commandOpenDescription.key!]: languagePackStudioLabels.commandOpenDescription.defaultMessage,
    [languagePackStudioLabels.viewTitle.key!]: languagePackStudioLabels.viewTitle.defaultMessage,
    [languagePackStudioLabels.viewDescription.key!]: languagePackStudioLabels.viewDescription.defaultMessage,
    [languagePackStudioLabels.railTitle.key!]: languagePackStudioLabels.railTitle.defaultMessage,
    [languagePackStudioLabels.settingsTitle.key!]: languagePackStudioLabels.settingsTitle.defaultMessage,
    [languagePackStudioLabels.settingsDescription.key!]: languagePackStudioLabels.settingsDescription.defaultMessage,
  },
};
