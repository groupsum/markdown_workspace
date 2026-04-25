import type { ExtensionLocaleCatalog } from "@mdwrk/extension-host";
import { languagePackStudioLabels } from "../i18n.js";

export const languagePackStudioEnCatalog: ExtensionLocaleCatalog = {
  locale: "en",
  messages: Object.fromEntries(
    Object.values(languagePackStudioLabels).map((label) => [label.key!, label.defaultMessage]),
  ),
};
