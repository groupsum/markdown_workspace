# markdown_workspace

`markdown_workspace` is a multi-package workspace for the MdWrkSpace client, lander, reusable markdown packages, extension contracts, first-party extension packages, third-party extension distribution tooling, and the repository operations layer required to run the codebase as a package platform.

## Repository structure

- `apps/` — deployable applications
- `packages/contracts/` — stable extension, catalog, signature, and theme contracts
- `packages/shared/` — shared tokens, icons, i18n, and testing primitives
- `packages/renderer/` — reusable markdown renderer packages
- `packages/editor/` — reusable markdown editor packages
- `packages/extensions/` — extension runtime, first-party extensions, and the sample external extension package
- `examples/` — integration examples for reusable packages
- `docs/` — ADRs, architecture docs, conformance docs, current-state assessments, and operational docs
- `tools/` — root operational tooling for matrices, conformance, extension artifacts, release evidence, and checkpoint audits
- `artifacts/` — generated evidence outputs included in this checkpoint zip

## Current checkpoint status

This checkpoint combines:

- the existing v2 monorepo/package/external-extension baseline; and
- the **Phase 0 certification-target freeze**, the **Phase 1 release-train freeze**, the **Phase 2 renderer/CommonMark-core checkpoint**, the **Phase 3 default-GFM checkpoint**, the **Phase 4 optional-profile checkpoint**, the **Phase 5 editor-authoring checkpoint**, the **Phase 6 preview/export/render-policy checkpoint**, the **Phase 7 shell parity checkpoint**, the **Phase 8 settings/data/session/Git parity checkpoint**, the **Phase 9 theme inventory/token contract/visual parity checkpoint**, the **Phase 10 i18n/language UX/catalog coverage checkpoint**, the **Phase 11 package/app/example documentation and evidence checkpoint**, the **Phase 12 strict conformance closure-suite checkpoint**, the **Phase 13 RC freeze/versioning/promotion-prep checkpoint**, the **Phase 14 promotion/release evidence-bundle checkpoint**, the **Phase 15 post-release stabilization/support-window checkpoint**, and the **Phase 16 certification-gate / promotion-gate policy correction checkpoint** for the Markdown conformance and repository certification program.

### What this checkpoint now includes

- explicit frozen Markdown targets for CommonMark core, default GFM behavior, and named optional profiles
- an explicit certification boundary for repository-internal claims
- a frozen release train, package-group model, and compatibility-baseline policy
- an audited package-release matrix proving the Phase 1 freeze aligns with the actual workspace graph in this checkpoint
- a substantive Phase 2 renderer-family checkpoint with self-contained committed renderer dist, a portable AST surface, policy-controlled raw HTML handling, and executable renderer evidence
- a substantive Phase 3 default-GFM checkpoint with explicit default-profile behavior for tables, task list items, strikethrough, autolink literals, and renderer/editor/client adapter evidence
- ADRs for the Phase 0 through Phase 16 certification checkpoints
- current-state assessments for the Phase 0 through Phase 16 checkpoints and a living v1→v2 parity gap ledger
- a named optional-profile registry, app-layer profile settings/persistence, executable Phase 4 optional-profile evidence, executable Phase 5 editor-authoring evidence, executable Phase 6 preview/export/render-policy evidence, executable Phase 7 shell parity evidence, executable Phase 8 settings/data/session/Git parity evidence, executable Phase 9 theme/token/visual parity evidence, executable Phase 10 i18n/language UX/catalog coverage evidence, executable Phase 11 package/app/example evidence, and an explicit Phase 12 strict closure-suite bundle
- a Phase 13 RC train bundle with changesets, RC versions, tarball catalogs, app/example tarball validation, and promotion-prep evidence
- a Phase 14 promotion bundle with publish order, release notes, extension catalog metadata, and release/evidence tarballs
- a Phase 15 stabilization bundle with support-window policy, immutable evidence hashing, monitoring focus, and a minimum closure checklist that still blocks final success claims
- a Phase 16 certification-first bundle that splits certification from promotion, freezes final claim language, records Playwright as the canonical browser execution engine, and restates the remaining four certification blockers explicitly

## Implemented packages

### Contracts
- `@mdwrk/extension-manifest`
- `@mdwrk/extension-host`
- `@mdwrk/theme-contract`

### Shared
- `@mdwrk/ui-tokens`
- `@mdwrk/icons`
- `@mdwrk/i18n`
- `@mdwrk/testing`

### Renderer
- `@mdwrk/markdown-renderer-core`
- `@mdwrk/markdown-renderer-react`

### Editor
- `@mdwrk/markdown-editor-core`
- `@mdwrk/markdown-editor-react`

### Extensions
- `@mdwrk/extension-runtime`
- `@mdwrk/extension-manager`
- `@mdwrk/extension-gemini-agent`
- `@mdwrk/extension-theme-studio`
- `@mdwrk/extension-catalog-hello` — sample third-party external extension used to prove the formal catalog path

## Generated external-distribution artifacts

The checkpoint zip includes generated external-extension evidence under `artifacts/extensions/`:

- `catalog.json`
- `index.json`
- `public-signers.json`
- `trust-policy.sample.json`
- per-extension artifacts with `manifest.json`, `signed-manifest.json`, `installable.json`, `integrity.json`, `SHA256SUMS.txt`, and `dist/`

## Documentation

See `docs/README.md` for the architecture, conformance, current-state, authoring, and operations document index.

## Honest certification note

This repository is **not yet**:
- certifiably fully featured
- repository-internally RFC compliant across the full frozen boundary
- fully Markdown spec compliant against the newly frozen CommonMark/GFM target

What this checkpoint does provide is the updated v2 repository with the full Phase 0 certification-target freeze artifacts, the Phase 1 release-train freeze artifacts, the Phase 2 renderer/CommonMark-core checkpoint artifacts, the Phase 3 default-GFM checkpoint artifacts, the Phase 4 optional-profile checkpoint artifacts, the Phase 5 editor-authoring checkpoint artifacts, the Phase 6 preview/export/render-policy checkpoint artifacts, the Phase 7 shell parity checkpoint artifacts, the Phase 8 settings/data/session/Git parity checkpoint artifacts, the Phase 9 theme inventory/token contract/visual parity checkpoint artifacts, the Phase 10 i18n/language UX/catalog coverage checkpoint artifacts, the Phase 11 package/app/example documentation evidence artifacts, the Phase 12 strict closure-suite artifacts, the Phase 13 RC freeze/versioning/promotion-prep artifacts, the Phase 14 promotion/release artifacts, the Phase 15 stabilization/support-window artifacts, and explicit documentation of the current repository state.


This source line now also includes the **Phase 18 Gate B certification-closure continuation checkpoint**, which materially improves the measured official CommonMark/GFM blocker counts while leaving the still-blocked browser/visual/install lanes explicitly blocked.
