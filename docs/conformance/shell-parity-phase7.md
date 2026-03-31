# Phase 7 shell parity conformance note

Date: 2026-03-28
Boundary: header, status bar, action rail, and responsive split-view parity

## Scope

This checkpoint closes the shell-surface parity items that were explicitly called out in the v1→v2 audit as blocking a fully featured UIX claim.

The in-scope surfaces for Phase 7 are:

- status bar
- action rail
- shell import flow
- split-view layout policy
- shell-level refresh-event dispatch for cloud sync

The out-of-scope surfaces for Phase 7 remain:

- Git PAT and provider settings parity
- restore-from-JSON
- theme exposure parity
- visible language-selection UI
- extension settings/schema completion

## Implemented in this checkpoint

### Status bar
The client shell now restores:

- runtime shell label (`BROWSER` or `PWA`)
- shell version
- build identifier from `__APP_BUILD_ID__`
- update-ready badge

This parity is implemented in:

- `apps/client/components/Chassis/Footer/Footer.tsx`
- `apps/client/constants.ts`
- `apps/client/vite.config.ts`
- `apps/client/vite.lib.config.ts`

### Action rail
The action rail now restores:

- localized navigation `aria-label`
- `aria-pressed` on actionable stateful buttons
- the Import Markdown action as both a command and a rail item

This parity is implemented in:

- `apps/client/components/Chassis/ActionRail/ActionRail.tsx`
- `apps/client/src/shell/ActionRailHost.tsx`
- `apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx`
- `apps/client/src/shell/iconRenderer.tsx`

### Import Markdown flow
The shell now supports a full command-to-import bridge:

- command invocation from the action rail or command surface
- hidden shell file input dispatch via `MARKDOWN_IMPORT_REQUEST_EVENT`
- `.md` / `.markdown` import into the active project
- open-and-select behavior for the first imported file

This parity is implemented in:

- `apps/client/src/shell/AppShell.tsx`
- `apps/client/hooks/useApp.ts`
- `apps/client/hooks/useFileManager.ts`

### Responsive split view
The client now restores v1 parity for mobile landscape split allowance through a reusable helper:

- `viewport.width > 900 || (viewport.width <= 1024 && viewport.width > viewport.height)`

This parity is implemented in:

- `apps/client/src/features/layout/splitViewPolicy.ts`
- `apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx`

### Cloud sync refresh event
The shell command surface again emits a refresh event:

- `lattice:gh:refresh-repos`

This closes a shell-surface parity gap even though deeper Git/settings behavior remains outside Phase 7.

## Executed evidence

The following commands were executed successfully in the provided checkpoint environment:

- `node apps/client/tests/phase7-shell-parity.mjs --json`
- `node tools/conformance/generate-phase7-shell-checkpoint.mjs`

Recorded results:

- `artifacts/conformance/latest/phase-7-shell-parity-node-results.json`
- `artifacts/conformance/latest/phase-7-shell-parity-results.json`
- `artifacts/conformance/latest/phase-7-shell-parity-checkpoint.json`
- `artifacts/conformance/latest/phase-7-shell-parity-output.txt`

## Recorded results

This checkpoint records:

- 11/11 executable shell-parity checks passing
- 14/14 structural parity audit checks passing

## Current certification meaning

This checkpoint is sufficient to treat the shell parity lane as a real repository checkpoint.
It is not sufficient to claim that the repository is already:

- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant across the full frozen CommonMark/GFM target

Those broader claims remain blocked by open work in Git/settings parity, restore/import parity, theme and i18n parity, extension settings completion, and later release-candidate evidence.
