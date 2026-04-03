import type { I18nLabel } from "@mdwrk/extension-manifest";

const key = (suffix: string) => `core.language-pack-studio.${suffix}`;
const label = (suffix: string, defaultMessage: string): I18nLabel => ({
  key: key(suffix),
  defaultMessage,
});

export const languagePackStudioLabels = {
  manifestDisplayName: label("manifest.displayName", "Language Pack Studio"),
  manifestDescription: label("manifest.description", "Bundled language-pack studio for importing, exporting, enabling, disabling, activating, creating, and auditing portable language packs."),
  commandOpenTitle: label("commands.open.title", "Open Language Pack Studio"),
  commandOpenDescription: label("commands.open.description", "Open the language-pack studio workspace pane."),
  viewTitle: label("views.main.title", "Language Pack Studio"),
  viewDescription: label("views.main.description", "Browse installed language packs, inspect missing tokens, and create or export locale artifacts."),
  railTitle: label("rail.title", "Language Packs"),
} as const;
