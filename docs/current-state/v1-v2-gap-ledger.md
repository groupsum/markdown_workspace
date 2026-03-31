# v1 → v2 gap ledger

Date: 2026-03-28
Purpose: living closure ledger for the concrete features that must be implemented or re-implemented in v2 before a fully featured UIX claim is honest.

This ledger uses:

- **v1** as the parity reference for end-user feature completeness
- **v2** as the implementation base

It intentionally excludes two behaviors from the must-reimplement set:

- reverting preview heading slug IDs
- hard-reverting Tab behavior to raw space insertion everywhere

## Required client, package, and settings closures

| Area | Feature to implement or re-implement in v2 | Type | Where in v2 | Current checkpoint status |
|---|---|---:|---|---|
| Settings / Git | Auth mode selector: PAT vs OIDC | Re-implement | core settings registry + Git settings panel | Closed — Phase 8 |
| Settings / Git | PAT provider selector | Re-implement | core Git settings panel | Closed — Phase 8 |
| Settings / Git | PAT token input | Re-implement | core Git settings panel | Closed — Phase 8 |
| Settings / Git | PAT token status / readiness feedback | Re-implement | core Git settings panel | Closed — Phase 8 |
| Settings / Git | PAT-backed repository operations / normalization / inference | Re-implement | Git integration layer + settings actions | Closed — Phase 8 |
| Settings / Git | GitHub PAT support | Re-implement | core Git provider integration | Closed — Phase 8 |
| Settings / Git | GitLab PAT support | Re-implement | core Git provider integration | Closed — Phase 8 |
| Settings / Git | Gitea PAT support | Re-implement | core Git provider integration | Closed — Phase 8 |
| Settings / Git | Manual repository refresh event support | Re-implement | Git settings actions + sync event bus | Closed — Phase 8 |
| Settings / Git | Automatic repository refresh after relevant auth/config changes | Implement | Git integration layer | Closed — Phase 8 |
| Settings / Git | TEST_LINK button wiring | Re-implement | Git settings actions | Closed — Phase 8 |
| Settings / Session | Exposed line numbers toggle | Re-implement | Session State settings section | Closed — Phase 5 |
| Settings / Session | Persistent line numbers preference | Re-implement | session state store + settings binding | Closed — Phase 5 |
| Settings / Data | Restore workspace from JSON | Re-implement | Storage Ops settings section + import/restore pipeline | Closed — Phase 8 |
| Settings / Data | Functional restore-state flow, not placeholder | Re-implement | Storage Ops settings section | Closed — Phase 8 |
| Settings / Data | PWA app version visible in settings as a secondary location | Re-implement | Storage Ops or About/version card | Closed — Phase 8 |
| Settings / Extensions | Real schema-backed extension settings forms | Finish | `apps/client/src/features/settings/*` + settings host | Closed — Phase 8 |
| Settings / Extensions | Extension settings persistence | Finish | settings store + extension runtime registration sink | Closed — Phase 8 |
| Settings / Extensions | Extension Manager settings section registration | Finish | extension registration + settings registry | Closed — Phase 8 |
| Settings / Schema renderer | Multiline string field support | Finish | `SettingsSchemaRenderer` | Closed — Phase 8 |
| Settings / Schema renderer | Numeric constraints (`min`, `max`, `step`) | Finish | `SettingsSchemaRenderer` | Closed — Phase 8 |
| Settings / Schema renderer | Multiselect field UI | Finish | `SettingsSchemaRenderer` | Closed — Phase 8 |
| Editor | Bullet list toolbar action | Re-implement | editor toolbar + editor command set | Closed — Phase 5 |
| Editor | Task checkbox creation toolbar action | Re-implement | editor toolbar + editor command set | Closed — Phase 5 |
| Editor | Indent toolbar action | Re-implement | editor toolbar + editor command set | Closed — Phase 5 |
| Editor | Dedent toolbar action | Re-implement | editor toolbar + editor command set | Closed — Phase 5 |
| Editor | Toolbar selection-state active highlighting | Re-implement | editor toolbar state binding | Closed — Phase 5 |
| Editor | Enter-key continuation for ordered / unordered / task lists | Re-implement | editor behavior layer | Closed — Phase 5 |
| Editor | Line-number gutter rendering fidelity: fully vertical gutter, numbers on line rows only, gutter rhythm matches editor line rhythm | Implement | editor layout/CSS + line-number renderer | Closed — Phase 5 |
| Editor | Underline button only if implemented as explicit non-Markdown extension | Optional implement | editor toolbar + serializer | Open, extension-only |
| Preview | Empty list-item normalization before render | Re-implement | preview transform/render pipeline | Closed — Phase 6 |
| Action rail | Import Markdown rail action | Re-implement | action-rail registry | Closed — Phase 7 |
| Action rail / i18n | Localized navigation `aria-label` | Re-implement | action-rail host / shell nav container | Closed — Phase 7 |
| Status bar | Runtime shell label in status bar | Re-implement | status bar component | Closed — Phase 7 |
| Status bar | Build identifier in status bar | Re-implement | status bar component | Closed — Phase 7 |
| Status bar | Update-ready badge in status bar | Re-implement | status bar component | Closed — Phase 7 |
| Layout behavior | v1-style split-view heuristic parity | Re-implement | app shell responsive layout logic | Closed — Phase 7 |
| Themes | `research-science` theme selectable | Re-implement | active theme registry / selector | Closed — Phase 9 |
| Themes | `ferrous-monolith` theme selectable | Re-implement | active theme registry / selector | Closed — Phase 9 |
| Themes | `tensioned-technical-skeleton` theme selectable | Re-implement | active theme registry / selector | Closed — Phase 9 |
| Themes | `optical-vellum-drafting-grid` theme selectable | Re-implement | active theme registry / selector | Closed — Phase 9 |
| Themes | `heavy-gauge-tectonic` theme selectable | Re-implement | active theme registry / selector | Closed — Phase 9 |
| Themes | `galvanized-cellular` theme selectable | Re-implement | active theme registry / selector | Closed — Phase 9 |
| Themes | `pressed-chromium` theme selectable | Re-implement | active theme registry / selector | Closed — Phase 9 |
| i18n / Core app | Core `es` locale pack | Re-implement | shared i18n package + core app locale registration | Closed — Phase 10 |
| i18n / Core app | Core `fr` locale pack | Re-implement | shared i18n package + core app locale registration | Closed — Phase 10 |
| i18n / Core app | Core `pt` locale pack | Re-implement | shared i18n package + core app locale registration | Closed — Phase 10 |
| i18n / Core app | Core `ur` locale pack | Re-implement | shared i18n package + core app locale registration | Closed — Phase 10 |
| i18n / UI | Visible language selector UI | Implement | settings UI, and optionally project selector/header | Closed — Phase 10 |
| i18n / Core app | Broader core shell string catalog coverage | Implement | shared i18n catalogs + core UI registrations | Closed — Phase 10 (audited shell/settings boundary) |
| CSS tokens | `--editor-line-height` | Re-implement | shared/root token contract | Closed — Phase 9 (formal portable contract; variable restored in Phase 5) |
| CSS tokens | `--editor-line-rhythm` | Re-implement | shared/root token contract | Closed — Phase 9 (formal portable contract; variable restored in Phase 5) |
| CSS tokens | `--line-number-gutter-width` | Re-implement | shared/root token contract | Closed — Phase 9 (formal portable contract; variable restored in Phase 5) |
| CSS tokens | `--markdown-heading-line-height` | Re-implement | shared/root token contract | Closed — Phase 9 (formal portable contract; variable restored in Phase 5) |
| CSS tokens | `--markdown-line-height` | Re-implement | shared/root token contract | Closed — Phase 9 (formal portable contract; variable restored in Phase 5) |
| CSS tokens | `--mobile-expandable-rail-width` | Re-implement | shared/root token contract | Closed — Phase 9 (formal portable contract; variable restored in Phase 5) |
| CSS tokens | `--mobile-rail-expanded-width` | Re-implement | shared/root token contract | Closed — Phase 9 (formal portable contract; variable restored in Phase 5) |

## Intentionally preserved v2 improvements

The following are preserved by policy and are not listed as regressions to reverse:

- slugified preview heading IDs
- registry-driven shell composition
- extracted renderer/editor package families
- extension-capable locale loader architecture
- theme/token/class contract packaging
- stronger default structural indentation model


## Additional Phase 8 note

Phase 8 also makes the previously decorative `SAVE_CONFIG` Git settings action functional through the app controller save path and repository-refresh dispatch.

## Additional Phase 9 note

Phase 9 closes the previously open theme exposure parity rows and elevates the rhythm/mobile-width CSS variables into the formal portable theme contract.

## Additional Phase 10 note

Phase 10 restores the visible language selector and the core locale inventory while moving the audited shell/settings/header/status/action-rail strings into an explicitly catalog-driven boundary.
