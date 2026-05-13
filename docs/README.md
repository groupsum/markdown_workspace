# Documentation index

[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.docs.readme&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/docs/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)

> Governance pointers: `../README.md`, `../.ssot/specs/SPEC-2001-specs-index.yaml`, `../.ssot/specs/SPEC-2002-repository-governance.yaml`, `../AGENTS.md`, `../CONTRIBUTING.md`, `../CODE_OF_CONDUCT.md`, and `../LICENSE`.

This directory contains the architecture, current-state, conformance, and operational documentation for MdWrk.

## Sections

### Current state
- `current-state/certifiability-phase-1-honest-scope.md` — current honest certifiability scope freeze for `bnd:repo-certifiability-current-scope`.
- `current-state/phase-22-browser-matrix-assessment.md` — latest browser-install and real-browser-matrix checkpoint assessment.
- `current-state/phase-21-markdown-and-playwright-assessment.md` — prior markdown lane and Playwright browser-matrix implementation checkpoint assessment.
- `current-state/phase-20-gate-b-assessment.md` — prior Gate B checkpoint assessment.
- `current-state/phase-19-gate-b-assessment.md` — prior Gate B checkpoint assessment.
- `current-state/phase-18-gate-b-assessment.md` — prior Gate B continuation assessment.
- `current-state/phase-17-gate-b-assessment.md` — prior Gate B certification-closure rerun checkpoint assessment.
- `current-state/phase-16-certification-gate-assessment.md` — prior checkpoint assessment for the certification-gate / promote-second checkpoint.
- `current-state/phase-15-stabilization-assessment.md` — prior checkpoint assessment for the post-release stabilization/support-window checkpoint.
- `current-state/phase-14-promotion-assessment.md` — prior checkpoint assessment for the promotion/release evidence-bundle checkpoint.
- `current-state/phase-13-rc-freeze-assessment.md` — prior checkpoint assessment for the executable RC freeze/versioning/promotion-prep checkpoint.
- `current-state/phase-12-strict-conformance-assessment.md` — prior checkpoint assessment for the strict conformance closure suite checkpoint.
- `current-state/phase-11-package-documentation-assessment.md` — prior checkpoint assessment for the executable package/app/example documentation and evidence checkpoint.
- `current-state/phase-10-i18n-language-assessment.md` — prior checkpoint assessment for the executable i18n/language-UX/catalog-coverage checkpoint.
- `current-state/phase-9-theme-parity-assessment.md` — prior checkpoint assessment for the executable theme inventory/token contract/visual parity checkpoint.
- `current-state/phase-8-settings-data-git-assessment.md` — prior checkpoint assessment for the executable settings/data/session/Git parity checkpoint.
- `current-state/phase-7-shell-parity-assessment.md` — prior checkpoint assessment for the executable shell parity checkpoint.
- `current-state/phase-6-preview-export-assessment.md` — prior checkpoint assessment for the executable preview/export/render-policy checkpoint.
- `current-state/phase-5-editor-authoring-assessment.md` — prior checkpoint assessment for the executable editor-authoring checkpoint.
- `current-state/phase-4-optional-profiles-assessment.md` — prior checkpoint assessment for the executable optional-profile checkpoint.
- `current-state/phase-3-gfm-default-profile-assessment.md` — prior checkpoint assessment for the executable default-GFM checkpoint.
- `current-state/phase-2-renderer-commonmark-assessment.md` — prior checkpoint assessment for the executable renderer/CommonMark-core checkpoint.
- `current-state/phase-1-release-train-freeze-assessment.md` — Phase 1 checkpoint assessment for the release-train freeze, compatibility-baseline freeze, and current open closure areas.
- `current-state/phase-1-package-graph-audit.md` — audited verification that every release unit in the current zip is mapped to the frozen Phase 1 release matrix.
- `current-state/phase-0-certification-freeze-assessment.md` — Phase 0 checkpoint assessment for the Markdown target freeze and repository boundary freeze.
- `current-state/v1-v2-gap-ledger.md` — living ledger of v1→v2 parity gaps that must close for a fully featured UIX claim.
- `current-state/repository-assessment.md` — historical Phase 13 publish-stability assessment.

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
- `adr/ADR-0007-markdown-target-freeze-and-certification-boundary.md`
- `adr/ADR-0008-release-train-groups-and-compatibility-baselines.md`
- `adr/ADR-0009-renderer-commonmark-core-phase2-checkpoint.md`
- `adr/ADR-0010-gfm-default-profile-phase3-checkpoint.md`
- `adr/ADR-0011-optional-profile-boundary-phase4-checkpoint.md`
- `adr/ADR-0012-editor-semantics-and-authoring-ux-phase5-checkpoint.md`
- `adr/ADR-0013-preview-export-and-render-policy-phase6-checkpoint.md`
- `adr/ADR-0014-shell-parity-phase7-checkpoint.md`
- `adr/ADR-0015-settings-data-git-parity-phase8-checkpoint.md`
- `adr/ADR-0016-theme-inventory-token-contract-and-visual-parity-phase9-checkpoint.md` — decision record for the Phase 9 theme/token/visual parity checkpoint.
- `adr/ADR-0017-i18n-language-ux-and-catalog-coverage-phase10-checkpoint.md` — decision record for the Phase 10 i18n/language-UX/catalog-coverage checkpoint.
- `adr/ADR-0018-package-documentation-examples-boundaries-and-evidence-phase11-checkpoint.md` — decision record for the Phase 11 package/app/example documentation and evidence checkpoint.
- `adr/ADR-0019-strict-conformance-closure-suite-phase12-checkpoint.md` — decision record for the Phase 12 strict conformance closure suite checkpoint.
- `adr/ADR-0020-rc-freeze-versioning-and-promotion-prep-phase13-checkpoint.md` — decision record for the Phase 13 RC freeze/versioning/promotion-prep checkpoint.
- `adr/ADR-0021-promotion-and-release-phase14-checkpoint.md` — decision record for the Phase 14 promotion/release evidence-bundle checkpoint.
- `adr/ADR-0022-post-release-stabilization-and-support-window-phase15-checkpoint.md` — decision record for the Phase 15 post-release stabilization/support-window checkpoint.
- `adr/ADR-0023-certification-before-promotion-phase16-checkpoint.md` — decision record for the Phase 16 certification-before-promotion policy correction checkpoint.
- `adr/ADR-0024-gate-b-certification-closure-rerun-phase17-checkpoint.md` — decision record for the Phase 17 Gate B certification-closure rerun checkpoint.

### Conformance
- `conformance/markdown-targets.md` — frozen external Markdown target, raw HTML policy, underline policy, heading-anchor policy, tab policy, and v1/v2 parity policy.
- `conformance/markdown-profile-matrix.json` — machine-readable Markdown profile matrix for the frozen target.
- `conformance/certification-boundary.md` — exact scope for repository-internal certification and Markdown conformance claims.
- `conformance/package-certification-criteria.md` — normative criteria for “certifiably fully featured” packages and apps.
- `conformance/extension-manifest-schema.md` — normative manifest structure for extension packages.
- `conformance/extension-certification-checklist.md` — checklist for externally distributed extension packages.
- `conformance/schemas/extension-manifest.schema.json` — machine-readable schema aligned to the contract package.
- `conformance/current-certification-status.md` — honest statement of current certification state.
- `conformance/renderer-commonmark-core-phase2.md` — Phase 2 renderer-family checkpoint scope, evidence, and limits.
- `conformance/gfm-default-profile-phase3.md` — Phase 3 default-GFM checkpoint scope, evidence, enabled features, and limits.
- `conformance/optional-profiles-phase4.md` — Phase 4 optional-profile checkpoint scope, in-scope vs out-of-scope profiles, evidence, and limits.
- `conformance/editor-authoring-phase5.md` — Phase 5 editor-authoring checkpoint scope, evidence, and limits.
- `conformance/preview-export-phase6.md` — Phase 6 preview/export/render-policy checkpoint scope, evidence, and limits.
- `conformance/markdown-profile-snapshot-claim.md` — claim and gate definition for stable markdown-profile snapshots during toggle operations.
- `conformance/shell-parity-phase7.md` — Phase 7 shell parity checkpoint scope, evidence, and limits.
- `conformance/settings-data-git-phase8.md` — Phase 8 settings/data/session/Git parity checkpoint scope, evidence, and limits.
- `conformance/theme-parity-phase9.md` — Phase 9 theme inventory, token contract, and visual parity checkpoint scope, evidence, and limits.
- `conformance/i18n-language-phase10.md` — Phase 10 i18n, language UX, and catalog coverage checkpoint scope, evidence, and limits.
- `conformance/package-documentation-phase11.md` — Phase 11 package documentation, examples, boundary, and evidence checkpoint scope, evidence, and limits.
- `conformance/strict-conformance-phase12.md` — Phase 12 strict closure-suite scope, lane status, bundle contents, and limits.
- `conformance/rc-freeze-phase13.md` — Phase 13 RC freeze/versioning/promotion-prep scope, evidence, and limits.
- `conformance/promotion-release-phase14.md` — Phase 14 promotion/release checkpoint scope, evidence, and limits.
- `conformance/post-release-stabilization-phase15.md` — Phase 15 post-release stabilization/support-window checkpoint scope, evidence, and limits.
- `conformance/certification-gate-phase16.md` — Phase 16 certification-gate / promotion-gate split, evidence, and limits.
- `conformance/gate-b-certification-closure-phase17.md` — Phase 17 Gate B certification-closure rerun scope, measured blockers, evidence, and limits.
- `conformance/evidence-artifacts.md` — generated evidence inventory for CI, conformance, extension distribution, and release checkpoints.
- `artifacts/conformance/latest/package-release-matrix.json` — machine-readable Phase 1 package release matrix with release group, owner, SemVer, compatibility, and promotion metadata for every release unit.
- `artifacts/conformance/latest/phase-1-package-graph-audit.json` — machine-readable audit proving the Phase 1 freeze matches the current package graph.
- `artifacts/conformance/latest/phase-2-renderer-commonmark-checkpoint.json` — machine-readable Phase 2 renderer-family checkpoint summary.
- `artifacts/conformance/latest/phase-2-commonmark-subset-results.json` — machine-readable CommonMark-core subset results for the Phase 2 checkpoint.
- `artifacts/conformance/latest/phase-3-gfm-default-profile-checkpoint.json` — machine-readable Phase 3 default-GFM checkpoint summary.
- `artifacts/conformance/latest/phase-3-gfm-default-profile-results.json` — machine-readable default-GFM results and adapter/example audits captured in the Phase 3 checkpoint.
- `artifacts/conformance/latest/phase-4-optional-profiles-checkpoint.json` — machine-readable Phase 4 optional-profile checkpoint summary.
- `artifacts/conformance/latest/phase-4-optional-profiles-results.json` — machine-readable optional-profile results and app/settings/example audits captured in the Phase 4 checkpoint.
- `artifacts/conformance/latest/phase-5-editor-authoring-checkpoint.json` — machine-readable Phase 5 editor-authoring checkpoint summary.
- `artifacts/conformance/latest/phase-5-editor-authoring-results.json` — machine-readable editor-authoring results and app/surface audits captured in the Phase 5 checkpoint.
- `artifacts/conformance/latest/phase-6-preview-export-checkpoint.json` — machine-readable Phase 6 preview/export/render-policy checkpoint summary.
- `artifacts/conformance/latest/phase-6-preview-export-results.json` — machine-readable preview/export/render-policy results and adapter audits captured in the Phase 6 checkpoint.
- `artifacts/conformance/latest/phase-7-shell-parity-checkpoint.json` — machine-readable Phase 7 shell parity checkpoint summary.
- `artifacts/conformance/latest/phase-7-shell-parity-results.json` — machine-readable shell parity results and structural audits captured in the Phase 7 checkpoint.
- `artifacts/conformance/latest/phase-8-settings-data-git-checkpoint.json` — machine-readable Phase 8 settings/data/session/Git parity checkpoint summary.
- `artifacts/conformance/latest/phase-8-settings-data-git-results.json` — machine-readable settings/data/session/Git parity results and structural audits captured in the Phase 8 checkpoint.
- `artifacts/conformance/latest/phase-9-theme-parity-checkpoint.json` — machine-readable Phase 9 theme/token/visual parity checkpoint summary.
- `artifacts/conformance/latest/phase-9-theme-parity-results.json` — machine-readable Phase 9 theme/token/visual parity results and structural audits captured in the Phase 9 checkpoint.
- `artifacts/conformance/latest/phase-9-theme-parity-node-results.json` — raw executable theme-parity lane output captured in the Phase 9 checkpoint.
- `artifacts/conformance/latest/phase-9-ui-tokens-test-output.txt` — captured shared-token package test output from the Phase 9 checkpoint.
- `artifacts/conformance/latest/phase-9-theme-visual-baselines.json` — manifest for the static HTML visual baseline set generated in the Phase 9 checkpoint.
- `artifacts/conformance/latest/phase-10-i18n-checkpoint.json` — machine-readable Phase 10 i18n/language-UX/catalog-coverage checkpoint summary.
- `artifacts/conformance/latest/phase-10-i18n-results.json` — machine-readable Phase 10 i18n/language-UX/catalog-coverage results and structural audits captured in the Phase 10 checkpoint.
- `artifacts/conformance/latest/phase-10-i18n-parity-node-results.json` — raw executable Phase 10 i18n parity lane output captured in the Phase 10 checkpoint.
- `artifacts/conformance/latest/phase-10-i18n-test-output.txt` — captured shared i18n package test output from the Phase 10 checkpoint.
- `artifacts/conformance/latest/phase-11-package-evidence.json` — machine-readable Phase 11 package/app/example evidence matrix.
- `artifacts/conformance/latest/phase-11-package-evidence-node-results.json` — raw executable Phase 11 package/example evidence lane output.
- `artifacts/conformance/latest/phase-11-package-evidence-output.txt` — human-readable Phase 11 package evidence summary.
- `artifacts/conformance/latest/phase-11-package-reference-index.json` — generated Phase 11 reference-doc index.
- `artifacts/conformance/latest/phase-12-closure-suite-checkpoint.json` — machine-readable Phase 12 strict closure-suite checkpoint summary.
- `artifacts/conformance/latest/phase-12-closure-suite-results.json` — machine-readable Phase 12 lane and hard-rule status bundle.
- `artifacts/conformance/latest/phase-12-release-evidence-bundle-manifest.json` — machine-readable manifest of the Phase 12 release-evidence bundle contents.
- `artifacts/conformance/latest/phase-12-commonmark-corpus-summary.json` — current CommonMark subset corpus lane summary captured in Phase 12.
- `artifacts/conformance/latest/phase-12-gfm-corpus-summary.json` — current GFM subset corpus lane summary captured in Phase 12.
- `artifacts/conformance/latest/phase-12-optional-profile-lanes.json` — current optional-profile lane summary captured in Phase 12.
- `artifacts/conformance/latest/phase-12-preview-export-lane.json` — current app preview/export lane summary captured in Phase 12.
- `artifacts/conformance/latest/phase-12-browser-matrix-report.json` — current browser-matrix availability report.
- `artifacts/conformance/latest/phase-12-visual-regression-report.json` — current visual-regression status report.
- `artifacts/conformance/latest/phase-12-packed-tarball-install-report.json` — current packed tarball install lane report.
- `artifacts/conformance/latest/phase-12-packed-tarball-install-log.txt` — raw packed tarball install lane log.
- `artifacts/conformance/latest/phase-12-extension-compatibility-manifest.json` — current extension activation/compatibility evidence bundle.
- `artifacts/conformance/latest/phase-12-changeset-version-inventory.json` — current changeset/version inventory for the release set.
- `artifacts/conformance/latest/phase-12-release-notes-draft.md` — generated release notes draft for the Phase 12 checkpoint.
- `artifacts/conformance/latest/phase-12-certification-checklist.md` — generated certification checklist closure document for the Phase 12 checkpoint.
- `artifacts/conformance/latest/phase-12-snapshot-manifests.json` — snapshot manifest bundle linking structural visual smoke and static HTML baselines.
- `artifacts/conformance/latest/phase-12-conformance-command-output.txt` — captured output of the current `npm run conformance` execution in the Phase 12 checkpoint.
- `artifacts/conformance/latest/phase-14-promotion-release-checkpoint.json` — machine-readable Phase 14 promotion/release checkpoint summary.
- `artifacts/conformance/latest/phase-14-promotion-release-results.json` — machine-readable Phase 14 promotion/release results and blocker bundle.
- `artifacts/conformance/latest/phase-15-stabilization-checkpoint.json` — machine-readable Phase 15 post-release stabilization/support-window checkpoint summary.
- `artifacts/conformance/latest/phase-15-stabilization-results.json` — machine-readable Phase 15 post-release stabilization/support-window results bundle.
- `artifacts/conformance/latest/phase-15-evidence-integrity-manifest.json` — immutable evidence manifest preserving the Phase 12 through Phase 14 release chain in Phase 15.
- `artifacts/releases/support-window-rc.1/` — support-window bundle preserving the prepared promotion train evidence.
- `artifacts/releases/promotion-rc.1/` — promotion-scoped release bundle with tarball bundles, notes, and release metadata.
- `artifacts/conformance/latest/phase-9-packed-example-smoke.json` — structural smoke manifest for the Phase 9 theme baseline subset.

### Operations
- `operations/version-train.md` — frozen next-version plan and linked Changesets group policy for the current release train.
- `operations/release-groups.md` — package-to-release-group, owner, SemVer policy, compatibility declaration, and promotion-path matrix.
- `operations/compatibility-baselines.md` — frozen compatibility anchors for the release train, including mandatory packed-tarball validation policy.
- `operations/versioning-and-support-policy.md` — naming, SemVer, support, and baseline contract version policy.
- `operations/compatibility-rules.md` — normative compatibility requirements across host, runtime, renderer, editor, themes, and external extension artifacts.
- `operations/publishing-rules.md` — normative publication and distribution rules for reusable packages and extensions.
- `operations/ci-cd.md` — root CI/CD workflow model, stage definitions, and artifact outputs.
- `operations/release-automation.md` — Changesets usage, publish workflows, extension artifact flow, and release evidence process.
- `operations/third-party-extension-authoring.md` — authoring, packaging, signing, catalog publication, and trust requirements for external extensions.

## Latest checkpoint note

The repository now contains all of the following:

- the earlier Phase 13 publish-stability / extension-distribution baseline
- the Phase 0 certification-target freeze for the Markdown/UIX certification program
- the Phase 1 release-train, package-group, and compatibility-baseline freeze
- the Phase 2 executable renderer/CommonMark-core checkpoint
- the Phase 3 executable default-GFM checkpoint
- the Phase 4 executable optional-profile checkpoint
- the Phase 5 executable editor-authoring checkpoint
- the Phase 6 executable preview/export/render-policy checkpoint
- the Phase 7 executable shell parity checkpoint
- the Phase 8 executable settings/data/session/Git parity checkpoint
- the Phase 9 executable theme inventory/token contract/visual parity checkpoint
- the Phase 10 executable i18n/language-UX/catalog-coverage checkpoint
- the Phase 11 package/app/example documentation and evidence checkpoint
- the Phase 12 executable strict conformance closure-suite checkpoint
- the Phase 13 executable RC freeze/versioning/promotion-prep checkpoint
- the Phase 14 promotion/release evidence-bundle checkpoint
- the Phase 15 post-release stabilization/support-window checkpoint
- the Phase 16 certification-before-promotion checkpoint
- the Phase 17 Gate B certification-closure rerun checkpoint
- the Phase 18 through Phase 20 Gate B continuation checkpoints
- the Phase 21 markdown lane and Playwright browser-matrix implementation checkpoint
- the Phase 22 browser-install and real-browser-matrix execution checkpoint
- the Certifiability Phase 1 honest current-scope freeze

The repository is better specified than before, but it is not yet represented as final certification against the frozen Markdown target or the full repository boundary.


## Phase 22

- `docs/current-state/phase-22-browser-matrix-assessment.md` — current browser-matrix assessment.
- `docs/conformance/current-certification-status.md` — current certification status.
- `artifacts/conformance/latest/phase-22-browser-matrix-report.json` — machine-readable browser-matrix report.
