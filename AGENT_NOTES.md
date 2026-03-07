# Agent Working Notes

## Prior notes review
- 2026-02-24: No prior autonomous loop notes existed; initialized this running log.
- 2026-02-24: Reviewed the existing loop/process guidance before beginning this burst.

## Active execution plan
- 2026-02-24 20:31:46: Plan: Implement --plan mode for execution burst logger and refresh workflow docs.
- 2026-02-24:
  1. Review repository instructions and current workflow expectations.
  2. Add a lightweight script that inserts a timestamped run-log entry into `AGENT_NOTES.md`.
  3. Document script usage in loop workflow guidance.
  4. Validate formatting changes, then commit and prepare PR summary.

## Run log
- 2026-02-24 20:31:47: Implemented --plan mode and added documentation example.
- 2026-02-24: Added `scripts/log_execution_burst.sh` to scaffold `AGENT_NOTES.md` and prepend timestamped run-log entries.
- 2026-02-24: Updated `TEST_LOOP_WORKFLOW.md` with a helper command reference for fast note capture.
- 2026-02-24: Reviewed `agents.md` and checklist constraints before making changes.
- 2026-02-24: Reviewed `agents.md` and `CHECKLIST.md` guidance before changes.
- 2026-02-24: Added `TEST_LOOP_WORKFLOW.md` with required 0-14 loop behavior.
- 2026-02-24: Updated `agents.md` to permanently enforce the autonomous loop protocol.

- 2026-02-24 20:45:12: Plan: Update screenshot guidance to require all aspect ratios and 5+ captures per ratio.
- 2026-02-24 20:46:03: Updated `client/THEME_SCREENSHOTS.md` with mandatory aspect-ratio coverage and per-ratio minimum screenshot counts.

- 2026-02-24 21:05:00: Plan: Fix mobile portrait footer status bar so it sits flush at the viewport bottom including safe-area insets.
- 2026-02-24 21:10:00: Updated mobile portrait status-bar sizing/padding and chassis bottom padding behavior to anchor footer to the bottom edge.

- 2026-02-24 21:35:00: Plan: Refine footer anchoring fix by limiting chassis padding override to portrait-only mobile and re-validate across multiple aspect-ratio classes.
- 2026-02-24 21:42:00: Updated responsive-small rules to portrait-scope chassis bottom padding override and removed keyboard-specific duplicate override.

- 2026-02-24 22:05:00: Plan: Fix project selector card layout so single-card states do not leave empty phantom columns in portrait/small viewports.
- 2026-02-24 22:12:00: Switched project grid to auto-fit minmax patterns for base and responsive breakpoints to collapse unused columns and let cards fill available width.

- 2026-02-24 22:40:00: Plan: Enforce 3-card visibility in short landscape project selector view with compact card body+footer sizing.
- 2026-02-24 22:52:00: Added short-height landscape project-grid rule with fixed 3 columns and compact card/footer metrics to keep full card content in-view.

- 2026-02-27 03:32:54: Plan: Fix portrait mobile status bar bottom anchoring so no background gap appears beneath footer/status area.
- 2026-02-27 03:32:54: Scoped portrait mobile status bar safe-area handling to offset container inset bleed and keep footer flush to viewport bottom.
- 2026-02-27 03:32:54: Captured responsive visual QA screenshots across portrait, square, landscape, and wide aspect classes after the footer anchoring fix.

- 2026-02-27 03:42:02: Plan: Remove remaining portrait mobile bottom strip so status bar sits exactly at viewport bottom with no exposed chassis background.
- 2026-02-27 03:42:02: Updated portrait mobile chassis/footer rules to remove root bottom border and keep status bar safe-area padding without negative offset hacks.
- 2026-02-27 03:42:02: Re-ran portrait/square/landscape/wide screenshot QA to verify bottom anchoring behavior.

- 2026-02-27 05:11:09: Plan: Eliminate persistent portrait bottom gap by enabling full-bleed viewport safe-area behavior on mobile.
- 2026-02-27 05:11:09: Added `viewport-fit=cover` to the viewport meta tag so the app can extend into safe-area regions and footer anchoring can reach the physical bottom edge.
- 2026-02-27 05:11:09: Revalidated portrait/square/landscape/wide screenshots after viewport safe-area fix.

- 2026-02-27 05:15:32: Plan: Resolve persistent portrait footer gap by anchoring the status bar to the viewport bottom independently from grid row sizing.
- 2026-02-27 05:15:32: Updated portrait-mobile footer behavior to use fixed bottom anchoring with explicit safe-area height/padding and matching chassis bottom padding reservation.
- 2026-02-27 05:15:32: Re-captured 5 responsive screenshots (portrait x2, square, landscape, wide) to verify no bottom gap regression.

- 2026-02-27 05:27:09: Plan: Set portrait mobile action-rail row height token to `0px` so the requested aspect-ratio layout removes rail-row height.
- 2026-02-27 05:27:09: Added portrait-only `--rail-height: 0px` override in small/portrait responsive rules while preserving fixed-bottom status-bar anchoring.
- 2026-02-27 05:27:09: Captured updated responsive screenshots across portrait/square/landscape/wide for rail-height verification.

## Network/PCAP review notes
- 2026-02-24: No runtime services or traffic capture executed in this documentation-and-tooling update.

## Open issues
- None identified in this documentation-and-tooling change.

## Change requests
- Consider adding a pre-commit check that validates `AGENT_NOTES.md` includes a current-day run-log entry when files are modified.

## Feature requests
- Optional `--plan` mode for `scripts/log_execution_burst.sh` has been implemented; monitor for follow-up ergonomics.

## Bugs
- None recorded during this documentation-and-tooling update.

- 2026-03-02 11:17:13: Plan: Fix portrait mobile header tab visibility by allocating explicit tab-row height in portrait-only mobile media rules.
- 2026-03-02 11:17:13: Added portrait-only mobile `--header-height` and `--tab-height` overrides so the tab strip remains visible in the two-row mobile header layout.
- 2026-03-02 12:00:00: Plan: Move view toolbar to bottom for touch/mobile portrait while preserving non-portrait theme layouts.
- 2026-03-02 12:00:00: Added a portrait-touch override in shared editor CSS that forces themed toolbars into bottom row placement with safe-area bottom padding.
- 2026-03-02 12:00:00: Captured multi-aspect screenshots (portrait/square/landscape/wide/ultrawide) to validate toolbar placement.
- 2026-03-02 13:45:42: Plan: Increment publishable package versions and capture mobile editor workspace screenshots for new-file flow.
- 2026-03-02 13:45:42: Bumped `client` and `lander` package versions via patch release increments.
- 2026-03-02 13:45:42: Captured mobile editor screenshots showing workspace load, opening a new file, and typing into the editor.

- 2026-03-02 14:12:52: Plan: Keep mobile portrait view toolbar anchored at bottom row and expand screenshot coverage for responsive QA.
- 2026-03-02 14:12:52: Updated `theme-micropress` portrait rules so the toolbar uses the bottom grid row with safe-area bottom padding instead of top floating placement.
- 2026-03-02 14:12:52: Captured expanded multi-aspect screenshots to verify toolbar placement behavior after the fix.

- 2026-03-02 14:23:57: Refined portrait-touch toolbar override in shared editor CSS and micropress theme to enforce bottom anchoring behavior and maintain editor content spacing.
- 2026-03-02 14:23:57: Rebuilt client and captured 6 responsive screenshots (portrait x2, square, landscape, wide, ultrawide) for toolbar placement QA evidence.

- 2026-03-02 14:37:28: Plan: Fix portrait mobile view-toolbar anchoring regression by removing pointer-gated media conditions and re-validate with expanded screenshot coverage.
- 2026-03-02 14:37:28: Updated shared and micropress portrait media queries to `max-width + max-aspect-ratio` and adjusted bottom anchor offset to include safe-area inset.

- 2026-03-02 14:41:06: Revalidated portrait toolbar placement and captured expanded evidence set (10 screenshots) across micropress/default/zinc plus square/landscape/wide aspect classes.
- 2026-03-02 14:41:06: Bumped `client` and `lander` package versions via patch increments and refreshed package-lock metadata.

- 2026-03-02 14:53:40: Plan: Keep portrait mobile view-toolbar at bottom while preventing overlap with action rail; replace fixed overlay behavior with in-pane bottom-row placement.
- 2026-03-02 14:53:40: Updated portrait mobile editor/theme rules so toolbar renders in the pane bottom row (non-overlay), restored portrait rail height, and captured expanded 10-shot QA set across themes/aspect classes.
- 2026-03-02 14:53:40: Bumped `client`/`lander` package versions and refreshed lockfiles after validation build.

- 2026-03-02 15:11:06: Plan: Keep portrait toolbar bottom-aligned even when sidebar is expanded, so toolbar remains visible and never overlaps the action rail.
- 2026-03-02 15:11:06: Added portrait mobile sidebar+stage coexistence rule so the stage (with toolbar bottom row) remains visible with sidebar open; captured 10 new screenshots including sidebar-open/collapsed theme states.
- 2026-03-02 15:11:06: Bumped package versions and lockfiles after validation build.

- 2026-03-02 20:59:53: Plan: Enforce exact portrait stacking order (editor/preview content -> view toolbar -> action rail -> status bar) across themes.
- 2026-03-02 20:59:53: Added portrait bottom-row overrides for default/zinc/acid/anodized themes and refined portrait workspace stacking so action rail remains below the editor toolbar while sidebar can stay visible above stage.
- 2026-03-02 20:59:53: Captured an expanded 14-screenshot QA set across three themes and five aspect classes, then bumped package versions and lockfiles.

- 2026-03-02 21:16:55: Plan: Remove residual portrait gap between action rail and status bar while preserving editor->toolbar->rail->status ordering.
- 2026-03-02 21:16:55: Replaced portrait fixed-footer status bar behavior with in-flow status row positioning to eliminate the rail/status gap and captured an extensive 14-shot QA set across themes/aspect classes.
- 2026-03-02 21:16:55: Bumped package versions and lockfiles after validation build.

- 2026-03-02 21:28:55: Plan: Remove remaining portrait gap beneath status bar at viewport bottom.
- 2026-03-02 21:28:55: Set portrait status bar to in-flow positioning with zero chassis bottom padding and no bottom border bleed so the status bar sits flush to the viewbox bottom; captured 13 screenshot QA set.
- 2026-03-02 21:28:55: Bumped package versions and lockfiles after validation build.

- 2026-03-02 21:45:28: Plan: eliminate any remaining portrait seam under status bar by removing portrait grid row gap between rail and status rows.
- 2026-03-02 21:45:28: Added portrait `row-gap: 0` on chassis scaler and revalidated 13 screenshots across themes/aspects confirming status bar sits flush to viewbox bottom.
- 2026-03-02 21:45:28: Bumped package versions and lockfiles after validation build.

- 2026-03-03 01:14:31: Plan: Produce extensive mobile landscape markdown-editor screenshots (excluding project selector) including keyboard-activated states and document capture protocol updates.
- 2026-03-03 01:14:31: Captured 8 landscape mobile markdown-editor screenshots spanning split/editor/preview states plus 3 keyboard-active simulated viewport states.
- 2026-03-03 01:14:31: Updated `client/THEME_SCREENSHOTS.md` with a dedicated landscape editor capture protocol to keep future runs aligned with this request type.

- 2026-03-03 01:21:42: Plan: In mobile landscape when keyboard is open and viewport is half-height, move markdown toolbar to the right edge and stack controls vertically.
- 2026-03-03 01:21:42: Implement base editor responsive override keyed on `body.keyboard-open` + coarse landscape short-height constraints, then revalidate with screenshots/build.
- 2026-03-03 01:25:53: Added landscape keyboard-open short-height CSS override to dock the editor toolbar at right edge with vertical control stacking (including bold/italic buttons).
- 2026-03-03 01:25:53: Rebuilt client and captured 8 landscape markdown-editor screenshots in keyboard-open states confirming right-side vertical toolbar behavior.
- 2026-03-03 01:36:51: Plan: Keep bold/italic controls visible in landscape half-height keyboard-open mode by prioritizing their order in the right-side vertical toolbar.
- 2026-03-03 01:36:51: Added bold/italic-specific toolbar classes and keyboard-open landscape ordering rules; captured 8 landscape editor screenshots confirming right-side vertical bold/italic visibility.
- 2026-03-03 01:36:51: Bumped package versions and lockfiles after the toolbar visibility fix validation build.
- 2026-03-03 01:50:18: Plan: Keep landscape mobile editor toolbar right-docked and vertical for both keyboard-open half-height and full-height states.
- 2026-03-03 01:50:18: Replaced keyboard-open-only landscape override with a mobile-landscape-wide override plus short-height compaction so bold/italic remain vertical on the right in both states.
- 2026-03-03 01:58:30: Finalized landscape mobile toolbar behavior so right-side vertical bold/italic controls persist in both full-height (keyboard-closed) and half-height (keyboard-open) editor states.
- 2026-03-03 01:58:30: Captured 8 landscape editor screenshots covering split/editor/preview for full-height and keyboard-open states; validated right-side vertical toolbar behavior in both modes.
- 2026-03-03 01:58:30: Bumped package versions and lockfiles after final landscape toolbar behavior verification build.

- 2026-03-05 02:30:28: Plan: In mobile portrait, remove the separator between strikethrough and bold in the editor toolbar and capture extensive create/edit-new-file screenshots.
- 2026-03-05 02:30:28: Added portrait-only CSS override to hide `.view-toolbar-divider--pre-inline`, removing the divider between strikethrough and bold on mobile portrait.
- 2026-03-05 02:30:28: Captured 6 mobile portrait screenshots covering initial view, entering workspace, new-file creation, active editing, toolbar formatting actions, and final edited state.
- 2026-03-05 02:30:28: Bumped `client` and `lander` package versions (patch) and rebuilt client to validate the change.
- 2026-03-05 02:37:41: Plan: Address screenshot feedback by updating repo screenshot policy to prioritize file-editing views and recapture mobile portrait evidence focused on create/edit flows.
- 2026-03-05 02:37:41: Updated `agents.md` with a new editing-view screenshot-priority addendum (click through project selection by default, focus coverage on editor states).
- 2026-03-05 02:37:41: Re-captured an editing-focused mobile portrait screenshot set (8 captures) that clicks through selection screens and emphasizes new-file creation + active editor states.
- 2026-03-05 02:37:41: Bumped `client` and `lander` package versions (patch) and rebuilt `client` successfully after policy update.
- 2026-03-05 02:44:43: Plan: Provide a proper mobile portrait screenshot set focused on file editing views/states (not project selection) per latest review feedback.
- 2026-03-05 02:44:43: Captured 10 mobile portrait screenshots centered on active file editing (typing, bold/strike adjacency, italic/underline/list edits, preview/editor mode checks).
- 2026-03-05 03:01:57: Plan: Keep the mobile portrait toolbar on a single horizontal line so Redo remains on the same line as the other controls, then capture extensive editing-focused proof screenshots.
- 2026-03-05 03:01:57: Updated portrait mobile toolbar group to `flex-wrap: nowrap` so toolbar controls stay on a single horizontal row and Redo no longer wraps to a second line.
- 2026-03-05 03:01:57: Captured 13 editing-focused mobile portrait screenshots proving toolbar alignment and Redo/Undo interactions.
- 2026-03-05 03:01:57: Bumped `client`/`lander` versions and rebuilt `client` to validate the responsive toolbar adjustment.
- 2026-03-05 03:01:57: Re-captured a final 12-image mobile portrait editing screenshot set after the nowrap fix, including toolbar left/mid/right scroll positions and Undo/Redo action states as proof.
- 2026-03-05 03:10:56: Plan: Fix remaining mobile portrait redo wrap by overriding theme-level toolbar-group wrapping in each theme's portrait mobile media query, then recapture proof screenshots.
- 2026-03-05 03:10:56: Added portrait-mobile `flex-wrap: nowrap` overrides for `.view-toolbar-group` in default, zinc, acid-etched, anodized-billet, and micropress theme media queries to prevent theme-level wrap regressions.
- 2026-03-05 03:10:56: Captured a 12-image multi-theme mobile portrait screenshot set (left/right toolbar positions plus undo/redo action states) confirming Redo remains on the same row.
- 2026-03-05 03:10:56: Bumped `client`/`lander` package versions and rebuilt `client` after the theme-level wrap fix.
- 2026-03-05 03:10:56: Re-ran targeted micropress portrait captures after a transient browser crash and verified Undo/Redo remain on the same single-row toolbar in right-scroll state.
- 2026-03-07 06:04:03: Plan: Fix markdown preview parsing so an empty nested bullet (`\t- `) under an ordered item does not get promoted into an unintended `<h2>` heading.
- 2026-03-07 06:04:03: Added `normalizeEmptyListItemsForPreview` and applied it to both `EditorPane` and shared `PreviewPane` markdown renders so empty bullet markers become explicit list-item content (`&nbsp;`) before parsing.
- 2026-03-07 06:04:03: Added/updated vitest coverage for normalization + preview rendering regression, ran full `npm run test:run`, and captured editor/preview screenshots with DOM proof (`preview_h2_count 0`, `preview_li_count 2`).
- 2026-03-07 06:40:00: Plan: Fix highest-bar (header) spacing by increasing top margin/offset and right-edge breathing room for the right-most control group.
- 2026-03-07 06:40:00: Adjusted header top-bar padding and header button-group top/right margins to align controls and remove right-edge crowding.
- 2026-03-07 06:40:00: Bumped `client` and `lander` package versions (patch) for this UI/CSS change.
- 2026-03-07 07:05:00: Plan: Rework top-bar spacing fix to target the in-app highest bar (work/git modes) and avoid broad header container offsets.
- 2026-03-07 07:05:00: Reverted global `.app-header` padding change; added mode-scoped top/right spacing adjustments on `.header-controls` and `.header-btn-group` for app views.
- 2026-03-07 07:20:00: Plan: In mobile portrait UI, set `.header-btn-group` right margin to 10px for improved control spacing near the right edge.
- 2026-03-07 07:20:00: Added portrait-mobile override in `responsive-small.css` so `.header-btn-group` (including work/git mode variants) uses `margin-right: 10px`.
- 2026-03-07 07:20:00: Bumped `client` and `lander` package versions (patch) for this UI/CSS change.
- 2026-03-07 09:10:37: Plan: In mobile landscape editor UI, hide toolbar divider elements while keeping split-view control enabled and interactive.
- 2026-03-07 09:10:37: Updated base editor landscape media rules to hide `.view-toolbar-divider`/`.view-toolbar-divider--pre-inline`; moved split-button hide rule to portrait-only mobile; updated split-eligibility logic to allow split in mobile landscape based on viewport orientation.
- 2026-03-07 09:10:37: Rebuilt `client` successfully (`npm run build`), captured mobile-landscape editor screenshot evidence, and bumped `client`/`lander` package versions (patch) per repository versioning policy.
