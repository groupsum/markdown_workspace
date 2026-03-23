# Documentation index

This directory contains the architecture, current-state, conformance, and operational documentation for `markdown_workspace`.

## Sections

### Current state
- `current-state/repository-assessment.md` — factual review of the current repository and the remaining gaps preventing independent certification.

### Architecture
- `architecture/package-topology.md` — target repo structure, package families, naming rules, and ownership boundaries.
- `architecture/extension-runtime.md` — runtime model for bundled and external extensions, lifecycle, storage, capabilities, trust policy, and host integration.
- `architecture/extension-manager.md` — responsibilities and current implementation scope of the first packaged first-party extension.
- `architecture/client-extension-ready-host.md` — Phase 6 client refactor that introduces registry-driven shell surfaces and host-safe adapters.
- `architecture/extension-package-layout.md` — canonical extension package structure and authoring contract.
- `architecture/extension-lifecycle.md` — normative discovery, validation, activation, registration, runtime, and deactivation flow.
- `architecture/extension-host-api-usage-rules.md` — rules for using host APIs instead of app internals.
- `architecture/third-party-extension-distribution.md` — external catalog format, signed manifest flow, integrity verification, cache model, and install/update/remove lifecycle.
- `architecture/theme-token-and-class-contract.md` — normative token/class/bridge contract usage model.
- `architecture/token-class-naming-guide.md` — naming rules for stable tokens, stable classes, and extracted renderer helper classes.
- `architecture/theme-mapping-guide.md` — how first-party and third-party consumers map local themes onto the shared token/class surface.
- `architecture/i18n-and-theme-interoperability.md` — Phase 9 localization and theming interoperability baseline for apps, packages, and extensions.
- `architecture/theme-studio-extension.md` — Theme Studio extension package architecture, token workflow, preview/apply/revert behavior, and export artifacts.
- `architecture/gemini-agent-extension.md` — Gemini extension package architecture, provider model, context model, and safe writeback flow.
- `architecture/shared-primitives.md` — responsibilities and current status of the shared package family.
- `architecture/renderer-editor-split.md` — rationale and package design for separate renderer and editor families.
- `architecture/renderer-packages.md` — implemented renderer family, responsibilities, and consumption model.
- `architecture/editor-packages.md` — implemented editor family, responsibilities, and consumption model.
- `architecture/package-inventory.md` — current and target package inventory.
- `architecture/dependency-boundary-map.md` — allowed dependency graph and boundary rules.

### ADRs
- `adr/ADR-0001-monorepo-and-package-topology.md`
- `adr/ADR-0002-extension-runtime-and-manifest.md`
- `adr/ADR-0003-renderer-editor-package-split.md`
- `adr/ADR-0004-theme-token-and-class-contract.md`
- `adr/ADR-0005-extension-distribution-model.md`
- `adr/ADR-0006-release-versioning-and-conformance.md`

### Conformance
- `conformance/package-certification-criteria.md` — normative criteria for “certifiably fully featured” packages and apps.
- `conformance/extension-manifest-schema.md` — normative manifest structure for extension packages.
- `conformance/extension-certification-checklist.md` — checklist for externally distributed extension packages.
- `conformance/schemas/extension-manifest.schema.json` — machine-readable schema aligned to the contract package.
- `conformance/current-certification-status.md` — honest statement of current certification state.
- `conformance/evidence-artifacts.md` — generated evidence inventory for CI, conformance, extension distribution, and release checkpoints.

### Operations
- `operations/versioning-and-support-policy.md` — naming, SemVer, support, and baseline contract version policy.
- `operations/compatibility-rules.md` — normative compatibility requirements across host, runtime, renderer, editor, themes, and external extension artifacts.
- `operations/publishing-rules.md` — normative publication and distribution rules for reusable packages and extensions.
- `operations/ci-cd.md` — root CI/CD workflow model, stage definitions, and artifact outputs.
- `operations/release-automation.md` — Changesets usage, publish workflows, extension artifact flow, and release evidence process.
- `operations/third-party-extension-authoring.md` — authoring, packaging, signing, catalog publication, and trust requirements for external extensions.

## Phase 13 note

The repository now contains the full internal Phase 13 checkpoint for third-party extension distribution and certification:
- signed manifest format and trusted-signer metadata
- extension catalog format
- integrity-checked ESM extension artifacts
- runtime install/update/remove/cache flows
- sample external extension package and generated catalog artifacts
- extension artifact validation integrated into conformance evidence

The checkpoint is internally verified and documented, but it is not yet represented as independent external certification against a separately agreed RFC corpus.
