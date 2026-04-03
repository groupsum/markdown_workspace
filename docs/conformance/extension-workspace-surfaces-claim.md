# Extension workspace surfaces claim

This claim covers the shell architecture and persistence rules for Theme Studio, Language Pack Studio, and Extension Manager.

## Claim

- Theme Studio, Language Pack Studio, and Extension Manager must render as workspace panes or settings content, not standalone modals
- each surface must expose grouped extension-wide actions through `view-toolbar`, `view-toolbar-group`, and `view-toolbar-btn`
- each surface must support a collapsible sidebar plus single-pane and split-screen layouts
- built-in and installed language packs must be visible together, and any language pack including built-ins can be enabled or disabled
- imported language packs and installed extensions must persist through IndexedDB-backed device storage
- extension-contributed UI labels must remain format-driven and resolve through an `en` fallback

## Gate

- command: `vitest extension-manager + language-pack controller coverage`
- command: `playwright screenshot matrix across portrait, square, landscape, wide, and ultrawide`

## Scope

- `apps/client/src/features/i18n/languagePackStore.ts`
- `apps/client/src/features/i18n/languagePackStudioController.ts`
- `apps/client/src/features/i18n/LanguagePackManagerPanel.tsx`
- `packages/extensions/extension-manager/src/components/ExtensionManagerView.tsx`
- `packages/extensions/extension-theme-studio/src/components/ThemeStudioView.tsx`
- `packages/extensions/extension-language-pack-studio/src/components/LanguagePackStudioView.tsx`
