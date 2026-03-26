# Dependency boundary map

## Allowed dependency direction

```text
apps
  ↓
extensions / editor / renderer / shared / contracts
  ↓
shared / contracts
```

Applications sit at the top. Contracts and shared primitives sit at the bottom.

## Boundary rules

### Rule 1 — packages never depend on apps
No package under `packages/` may import from `apps/`.

### Rule 2 — apps may compose packages freely
Applications are the composition layer and may depend on multiple package families.

### Rule 3 — contracts define stable surfaces
Contracts must remain implementation-light and free of app-specific dependencies.

### Rule 4 — extensions depend on host contracts, not app internals
Extension packages consume `mdwrk/extension-host` and related contracts instead of importing client components/hooks directly.

### Rule 5 — renderer/editor remain independently reusable
Renderer and editor packages may depend on shared/contract packages, but not on applications or extension packages unless explicitly documented.

### Rule 6 — shared style packages define reusable styling surfaces
`mdwrk/ui-tokens` owns the extracted styling surface. Applications may import it and override its tokens, but reusable packages must not import application-local stylesheets.

### Rule 7 — external catalog artifacts are deployment outputs, not package dependencies
Browser-installable third-party extensions are consumed through signed catalog entries and integrity-checked ESM artifacts. Applications and packages do not depend on those artifact directories at build time.

### Rule 8 — client internals must respect app/shell/features boundaries
Inside `apps/client`:
- `src/app/` composes runtime providers and bootstrap logic
- `src/shell/` renders registry-driven surfaces
- `src/features/` owns host-side registries and services
- `src/extensions/host/` owns host-safe adapters
- `src/extensions/runtime/` owns client-specific integration of the shared extension runtime package

## Package-family dependency guidance

| From | May depend on |
|---|---|
| apps | contracts, shared, renderer, editor, extensions |
| extensions | contracts, shared, renderer, editor (only when explicitly intended), extension runtime helpers |
| renderer | contracts, shared |
| editor | contracts, shared, renderer-core only if explicitly documented |
| shared | contracts |
| contracts | minimal external dependencies only |
| external artifact directories | no source imports; runtime/network access only |

## Current-repo deviations from the target map

Current remaining deviations:
- application and library concerns still coexist in `apps/client/`
- client UI for interactive third-party catalog browsing/install/remove remains narrower than the runtime API surface
- forbidden import checks exist, but they are still lightweight and not a full graph-enforced policy engine

Resolved by earlier phases:
- renderer logic is no longer independently implemented in both applications
- source-mode editor behavior now flows through the shared editor package family

Resolved in Phase 6:
- action rail, command palette, settings, and view surfaces are no longer hardcoded-only shell branches
- core client features now register through the same registry-driven surfaces intended for future extensions

Resolved in Phase 7:
- runtime lifecycle, compatibility, diagnostics, and persisted extension state now live in `packages/extensions/extension-runtime/`
- `apps/client` consumes that runtime package rather than keeping the runtime implementation in app-local code only

Resolved in Phase 8:
- the first packaged first-party extension is implemented in `packages/extensions/extension-manager/`
- `apps/client` consumes the packaged Extension Manager through the shared runtime rather than a client-local operator console implementation

Resolved in Phase 10:
- the packaged Gemini workflow extension is implemented in `packages/extensions/extension-gemini-agent/`
- `apps/client` consumes the Gemini extension through the shared runtime rather than through ad hoc app-local imports
- the client host capability baseline now explicitly grants `network.fetch` for bundled web extensions

Resolved in Phase 11:
- the packaged Theme Studio extension is implemented in `packages/extensions/extension-theme-studio/`
- `apps/client` consumes Theme Studio through the shared runtime rather than through app-local theme tooling
- renderer/editor theme interoperability is now exercised inside a first-party extension package

Resolved in Phase 13:
- the runtime now owns third-party catalog registration, trust-policy evaluation, signed-manifest verification, integrity-checked ESM install/update/remove flows, and cache rehydration
- the sample external extension package is authored and built as an npm package, then published to the browser-installable artifact path through tooling rather than being imported into applications directly

## CI enforcement

The current workspace CI includes:
- forbidden import checks
- package boundary linting
- compatibility validation
- extension artifact validation

Future hardening can still add stricter dependency-graph policy enforcement and ownership validation.
