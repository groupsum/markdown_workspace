# ADR-1014: ADR-0014: Shell parity Phase 7 checkpoint

# ADR-0014: Shell parity Phase 7 checkpoint

Date: 2026-03-28
Status: Accepted

## Context

The v2 shell architecture is stronger than v1 because it is registry-driven and extension-ready, but the v1→v2 parity review identified several concrete shell regressions that still blocked any honest “fully featured UIX” claim.

The concrete regressions for this phase were:

- missing status-bar runtime shell label
- missing status-bar build identifier
- missing status-bar update-ready badge
- missing Import Markdown rail action
- missing localized action-rail navigation `aria-label`
- stricter-than-v1 split-view gating on mobile landscape

The repository also needed to preserve the v2 improvements rather than regress them:

- registry-driven shell composition
- extension-injected rail items
- reusable renderer/editor package split
- top update banner and general shell modernization

## Decision

We restore the missing v1 shell affordances inside the v2 shell architecture rather than reintroducing the v1 shell implementation wholesale.

The accepted implementation decisions for this checkpoint are:

1. Keep the registry-driven shell, but restore v1 parity at the shell surface.
2. Restore status-bar parity by surfacing:
   - runtime shell label (`BROWSER` vs `PWA`)
   - shell version
   - build identifier
   - update-ready badge
3. Restore Import Markdown as a first-class core command and action-rail item.
4. Bridge the import action through a hidden shell file input so the command surface remains decoupled from DOM file-picking mechanics.
5. Restore localized action-rail navigation semantics by letting the ActionRail host subscribe to locale changes and recompute the rail `aria-label`.
6. Restore v1 split-view parity through a reusable policy helper rather than hard-coding the rule back into the editor pane.
7. Restore repository-refresh event dispatch at the cloud-sync command surface, even though broader Git PAT/settings parity remains outside this phase.

## Consequences

### Positive

- v2 keeps its stronger shell architecture while regaining the concrete end-user shell affordances that v1 had.
- action-rail accessibility semantics are stronger than before because the host now rerenders when locale changes.
- split-view policy is now explicit and reusable rather than being implicit inside a single component.
- Import Markdown is restored without abandoning the command/registry model.

### Remaining limits

This checkpoint does not close:

- Git PAT/settings parity
- restore-from-JSON parity
- theme selection parity
- language-selection parity
- extension settings/schema completion
- final browser-driven and visual certification evidence

## Evidence

This checkpoint is backed by:

- `node apps/client/tests/phase7-shell-parity.mjs --json`
- `node tools/conformance/generate-phase7-shell-checkpoint.mjs`
- `artifacts/conformance/latest/phase-7-shell-parity-checkpoint.json`
- `artifacts/conformance/latest/phase-7-shell-parity-results.json`
