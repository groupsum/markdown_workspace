# Extension workspace surfaces claim

This claim covers the shell architecture and persistence rules for Theme Studio, Language Pack Studio, and Extension Manager.

## Claim

- Theme Studio, Language Pack Studio, and Extension Manager must render as workspace panes or settings content, not standalone modals
- each surface must expose grouped extension-wide actions through `view-toolbar`, `view-toolbar-group`, and `view-toolbar-btn`
- each surface must support a collapsible `workspace-sidebar`-backed shell plus single-pane and split-screen layouts using `editor-pane-column`
- each surface must implement a dedicated browser sidebar for its domain objects: themes, language packs, and extensions/catalog entries
- when active in the workspace shell, each browser sidebar must occupy the shared sidebar slot in place of the file explorer
- Theme Studio must render the theme editor on the left stage pane and the previewer on the right stage pane in split mode
- built-in and installed language packs must be visible together, and any language pack including built-ins can be enabled or disabled
- imported language packs and installed extensions must persist through IndexedDB-backed device storage
- extension-contributed UI labels must remain format-driven and resolve through an `en` fallback
- the settings menu must provide concrete content for Theme Studio, Language Pack Studio, and Extension Manager instead of placeholder-only sections

## Gate

- command: `vitest extension-manager + language-pack controller coverage`
- command: `playwright screenshot matrix across portrait, square, landscape, wide, and ultrawide`

## Scope

- `apps/client/src/features/i18n/languagePackStore.ts`
- `apps/client/src/features/i18n/languagePackStudioController.ts`
- `apps/client/src/features/i18n/LanguagePackManagerPanel.tsx`
- `apps/client/src/extensions/runtime/createClientExtensionRegistrationSink.tsx`
- `packages/extensions/extension-manager/src/components/ExtensionManagerView.tsx`
- `packages/extensions/extension-manager/src/components/ExtensionManagerSettingsPanel.tsx`
- `packages/extensions/extension-theme-studio/src/components/ThemeStudioView.tsx`
- `packages/extensions/extension-theme-studio/src/components/ThemeStudioSettingsPanel.tsx`
- `packages/extensions/extension-language-pack-studio/src/components/LanguagePackStudioView.tsx`
- `packages/extensions/extension-language-pack-studio/src/components/LanguagePackStudioSettingsPanel.tsx`
