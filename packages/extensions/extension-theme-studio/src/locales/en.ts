import { THEME_STUDIO_EXTENSION_ID } from "../constants.js";
import { themeStudioLabels } from "../i18n.js";

export const themeStudioEnCatalog = {
  locale: "en",
  messages: {
    ...Object.fromEntries(Object.values(themeStudioLabels).map((label) => [label.key!, label.defaultMessage])),
    [`${THEME_STUDIO_EXTENSION_ID}.manifest.displayName`]: "Theme Studio",
    [`${THEME_STUDIO_EXTENSION_ID}.manifest.description`]: "Bundled theme authoring extension for inspecting tokens, previewing renderer/editor bridges, and exporting portable theme artifacts.",
    [`${THEME_STUDIO_EXTENSION_ID}.commands.open.title`]: "Open Theme Studio",
    [`${THEME_STUDIO_EXTENSION_ID}.commands.open.description`]: "Open the bundled theme authoring workspace.",
    [`${THEME_STUDIO_EXTENSION_ID}.view.title`]: "Theme Studio",
    [`${THEME_STUDIO_EXTENSION_ID}.view.description`]: "Inspect, preview, apply, revert, and export themes against the formal token/class contract.",
    [`${THEME_STUDIO_EXTENSION_ID}.rail.title`]: "Theme Studio",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.header.title`]: "Theme Studio",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.header.subtitle`]: "Token inspector, class relationship inspector, live renderer/editor previews, and portable theme exports.",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.actions.close`]: "Close",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.actions.refresh`]: "Refresh",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.actions.preview`]: "Preview draft",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.actions.apply`]: "Apply draft",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.actions.revert`]: "Revert draft",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.actions.export`]: "Generate exports",
    [`${THEME_STUDIO_EXTENSION_ID}.status.ready`]: "Ready",
    [`${THEME_STUDIO_EXTENSION_ID}.status.busy`]: "Working…",
    [`${THEME_STUDIO_EXTENSION_ID}.status.applied`]: "Draft applied",
    [`${THEME_STUDIO_EXTENSION_ID}.status.reverted`]: "Draft reverted",
    [`${THEME_STUDIO_EXTENSION_ID}.status.exported`]: "Exports generated",
    [`${THEME_STUDIO_EXTENSION_ID}.settings.shortcut.kicker`]: "Theme Studio",
    [`${THEME_STUDIO_EXTENSION_ID}.settings.shortcut.title`]: "Theme Studio",
    [`${THEME_STUDIO_EXTENSION_ID}.settings.shortcut.description`]: "Open the pane workspace to inspect token bridges, preview renderer/editor output, and export portable theme artifacts.",
    [`${THEME_STUDIO_EXTENSION_ID}.settings.stats.themeId`]: "Theme ID",
    [`${THEME_STUDIO_EXTENSION_ID}.settings.stats.tokens`]: "TOKENS",
    [`${THEME_STUDIO_EXTENSION_ID}.settings.stats.relationships`]: "RELATIONSHIPS",
    [`${THEME_STUDIO_EXTENSION_ID}.settings.stats.status`]: "STATUS",
    [`${THEME_STUDIO_EXTENSION_ID}.settings.chips.paneOnly`]: "Pane only",
    [`${THEME_STUDIO_EXTENSION_ID}.settings.chips.splitSingle`]: "SPLIT + SINGLE",
    [`${THEME_STUDIO_EXTENSION_ID}.settings.chips.englishFallback`]: "English fallback",
    [`${THEME_STUDIO_EXTENSION_ID}.settings.actions.openStudio`]: "Open studio"
  }
} as const;
