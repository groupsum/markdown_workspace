# Release groups

Date: 2026-03-27

## Purpose

This document freezes the Phase 1 release groups for the current v2 monorepo.
It uses the current workspace package graph as the release foundation rather than inventing a new topology.

The release groups defined here are normative for the certification program.
A machine-readable mirror of the per-package release metadata is published at `artifacts/conformance/latest/package-release-matrix.json`.
They determine:

- which packages move together in a release train
- which owner lane is accountable for each package
- which SemVer policy applies
- which compatibility baseline each package must satisfy
- which promotion path each package follows

## Owner lanes frozen in this checkpoint

The repository does not need a large org chart to satisfy this checkpoint.
Phase 1 freezes **owner lanes** that can later map to specific people or teams.

| Owner lane | Responsibility |
|---|---|
| Repository Operations | root workspace policy, release orchestration, evidence, and promotion controls |
| Platform Contracts | manifest, host, and theme compatibility anchors |
| Markdown Runtime | renderer packages and Markdown conformance engine surfaces |
| Markdown Authoring | editor packages and authoring behavior surfaces |
| Shared Primitives | i18n, tokens, icons, and testing primitives |
| Extension Platform | runtime and first-party/sample extension packages |
| Client Workspace | the main MdWrk client app package |
| Documentation Site | the lander app and document-site presentation layer |
| Developer Experience | examples and package demonstration surfaces |

## Release-group summary

| Release group | Packages | Owner lane | Changesets linkage | Release intent |
|---|---|---|---|---|
| workspace-root | `markdown_workspace` | Repository Operations | independent | repository policy and release-train control |
| contracts | `@mdwrk/extension-manifest`, `@mdwrk/extension-host`, `@mdwrk/theme-contract` | Platform Contracts | independent anchors | keep compatibility baselines stable |
| renderer | `@mdwrk/markdown-renderer-core`, `@mdwrk/markdown-renderer-react` | Markdown Runtime | linked | ship Markdown/rendering features together |
| editor | `@mdwrk/markdown-editor-core`, `@mdwrk/markdown-editor-react` | Markdown Authoring | linked | ship authoring features together |
| shared | `@mdwrk/i18n`, `@mdwrk/ui-tokens`, `@mdwrk/icons`, `@mdwrk/testing` | Shared Primitives | `i18n` + `ui-tokens` linked; icons/testing independent | ship shared platform surfaces without forcing unrelated patch bumps |
| extensions | `@mdwrk/extension-runtime`, `@mdwrk/extension-workspace-files`, `@mdwrk/extension-git-ops`, `@mdwrk/extension-manager`, `@mdwrk/extension-theme-studio`, `@mdwrk/extension-gemini-agent`, `@mdwrk/extension-catalog-hello` | Extension Platform | runtime family linked | keep runtime-facing extension surfaces compatible across the train |
| apps | `@mdwrk/mdwrkspace`, `@mdwrk/mdwrkcom` | Client Workspace / Documentation Site | independent | promote application surfaces after package evidence is green |
| examples | `@mdwrk/example-editor-basic`, `@mdwrk/example-renderer-basic` | Developer Experience | independent | validate and demonstrate released package families |

## Package release matrix

| Package | Path | Release group | Owner lane | Current version | Planned next line | SemVer policy | Compatibility declaration | Promotion path |
|---|---|---|---|---:|---|---|---|---|
| `markdown_workspace` | `.` | workspace-root | Repository Operations | `0.1.5` | `0.2.0` | Minor for certification-program train changes; patch for tooling/docs-only repository changes. | `baseline.node20-npm10 + workspace-release-policy.v2` | policy-freeze -> changeset orchestration -> release evidence -> repository promotion |
| `@mdwrk/mdwrkspace` | `apps/client` | apps | Client Workspace | `1.3.52` | `1.4.0` | Minor for feature-bearing UIX/markdown capability expansion; patch for fixes and dependency uplift. | `baseline.node20-npm10 + baseline.client.react19 + baseline.contract.manifest-v1 + baseline.contract.host-api-v1 + baseline.contract.runtime-v1 + baseline.contract.theme-v1` | changeset -> ci:workspace:verify:publish -> pack -> release evidence -> npm publish -> app promotion |
| `@mdwrk/mdwrkcom` | `apps/mdwrkcom` | apps | Documentation Site | `0.0.11` | `0.0.12 (default) / 0.1.0 if public document semantics change` | Patch for dependency-only uplift; 0.1.0 when renderer/export/document semantics visibly change. | `baseline.node20-npm10 + baseline.client.react19 + baseline.markdown.core-cm0312-gfm029 + baseline.shared.ui-tokens-theme-v1` | dependency uplift -> ci:workspace:verify -> static-site build -> site promotion |
| `@mdwrk/extension-host` | `packages/contracts/extension-host` | contracts | Platform Contracts | `1.0.1` | `1.0.x (hold host API baseline)` | Compatibility anchor. Stay on 1.0.x unless the public host API contract changes. | `baseline.contract.manifest-v1 + baseline.contract.host-api-v1 + baseline.contract.theme-v1` | changeset -> ci:workspace:verify:publish -> pack -> release evidence -> npm publish |
| `@mdwrk/extension-manifest` | `packages/contracts/extension-manifest` | contracts | Platform Contracts | `1.0.0` | `1.0.x (hold contract baseline)` | Compatibility anchor. Stay on 1.0.x unless the public manifest schema contract changes. | `baseline.contract.manifest-v1` | changeset -> ci:workspace:verify:publish -> pack -> release evidence -> npm publish |
| `@mdwrk/theme-contract` | `packages/contracts/theme-contract` | contracts | Platform Contracts | `1.0.0` | `1.0.x (hold theme-contract baseline)` | Compatibility anchor. Stay on 1.0.x unless the theme contract changes. | `baseline.contract.theme-v1` | changeset -> ci:workspace:verify:publish -> pack -> release evidence -> npm publish |
| `@mdwrk/markdown-editor-core` | `packages/editor/markdown-editor-core` | editor | Markdown Authoring | `1.0.1` | `1.1.0` | Minor for authoring command/behavior expansion; patch for correctness fixes. Linked with editor React binding. | `baseline.node20-npm10 + baseline.markdown.authoring-policy.phase0` | linked changeset -> ci:workspace:verify:publish -> pack -> release evidence -> npm publish |
| `@mdwrk/markdown-editor-react` | `packages/editor/markdown-editor-react` | editor | Markdown Authoring | `1.0.2` | `1.1.0` | Minor for authoring command/behavior expansion; patch for correctness fixes. Linked with editor core. | `baseline.node20-npm10 + baseline.client.react19 + editor-core:^1.0.1 + ui-tokens:^1.0.1` | linked changeset -> ci:workspace:verify:publish -> pack -> release evidence -> npm publish |
| `@mdwrk/extension-catalog-hello` | `packages/extensions/extension-catalog-hello` | extensions | Extension Platform | `1.0.1` | `1.1.0` | Minor when the sample external-extension path expands; patch for fixes. Linked with extension runtime family for the certification train. | `baseline.node20-npm10 + baseline.contract.manifest-v1 + baseline.contract.host-api-v1 + baseline.contract.runtime-v1` | linked changeset -> ci:workspace:verify:publish -> extension bundle/sign -> pack -> release evidence -> npm publish |
| `@mdwrk/extension-gemini-agent` | `packages/extensions/extension-gemini-agent` | extensions | Extension Platform | `1.0.1` | `1.1.0` | Minor for host/runtime/settings/i18n surface expansion; patch for fixes. Linked with extension runtime family. | `baseline.node20-npm10 + baseline.client.react19 + baseline.contract.manifest-v1 + baseline.contract.host-api-v1 + baseline.contract.runtime-v1` | linked changeset -> ci:workspace:verify:publish -> extension bundle/sign -> pack -> release evidence -> npm publish |
| `@mdwrk/extension-git-ops` | `packages/extensions/extension-git-ops` | extensions | Extension Platform | `1.0.0` | `1.1.0` | Minor for source-control workspace-module surface expansion; patch for fixes. Linked with extension runtime family. | `baseline.node20-npm10 + baseline.client.react19 + baseline.contract.manifest-v1 + baseline.contract.host-api-v1 + baseline.contract.runtime-v1` | linked changeset -> ci:workspace:verify:publish -> extension bundle/sign -> pack -> release evidence -> npm publish |
| `@mdwrk/extension-manager` | `packages/extensions/extension-manager` | extensions | Extension Platform | `1.0.1` | `1.1.0` | Minor for host/runtime/settings/i18n surface expansion; patch for fixes. Linked with extension runtime family. | `baseline.node20-npm10 + baseline.client.react19 + baseline.contract.manifest-v1 + baseline.contract.host-api-v1 + baseline.contract.runtime-v1` | linked changeset -> ci:workspace:verify:publish -> extension bundle/sign -> pack -> release evidence -> npm publish |
| `@mdwrk/extension-runtime` | `packages/extensions/extension-runtime` | extensions | Extension Platform | `1.0.1` | `1.1.0` | Minor for runtime/settings/i18n/host-facing capability expansion; patch for fixes. Linked with the first-party extension family. | `baseline.node20-npm10 + baseline.contract.manifest-v1 + baseline.contract.host-api-v1 + baseline.contract.runtime-v1 + baseline.contract.theme-v1` | linked changeset -> ci:workspace:verify:publish -> extension bundle/sign -> pack -> release evidence -> npm publish |
| `@mdwrk/extension-theme-studio` | `packages/extensions/extension-theme-studio` | extensions | Extension Platform | `1.0.1` | `1.1.0` | Minor for host/runtime/settings/i18n surface expansion; patch for fixes. Linked with extension runtime family. | `baseline.node20-npm10 + baseline.client.react19 + baseline.contract.manifest-v1 + baseline.contract.host-api-v1 + baseline.contract.runtime-v1 + baseline.contract.theme-v1 + ui-tokens:^1.0.1` | linked changeset -> ci:workspace:verify:publish -> extension bundle/sign -> pack -> release evidence -> npm publish |
| `@mdwrk/extension-workspace-files` | `packages/extensions/extension-workspace-files` | extensions | Extension Platform | `1.0.0` | `1.1.0` | Minor for file workspace-module and action surface expansion; patch for fixes. Linked with extension runtime family. | `baseline.node20-npm10 + baseline.client.react19 + baseline.contract.manifest-v1 + baseline.contract.host-api-v1 + baseline.contract.runtime-v1` | linked changeset -> ci:workspace:verify:publish -> extension bundle/sign -> pack -> release evidence -> npm publish |
| `@mdwrk/markdown-renderer-core` | `packages/renderer/markdown-renderer-core` | renderer | Markdown Runtime | `1.0.0` | `1.1.0` | Minor for Markdown/profile/render capability expansion; patch for conformance and correctness fixes. Linked with renderer React binding. | `baseline.node20-npm10 + baseline.markdown.core-cm0312-gfm029` | linked changeset -> ci:workspace:verify:publish -> pack -> release evidence -> npm publish |
| `@mdwrk/markdown-renderer-react` | `packages/renderer/markdown-renderer-react` | renderer | Markdown Runtime | `1.0.1` | `1.1.0` | Minor for Markdown/profile/render capability expansion; patch for conformance and correctness fixes. Linked with renderer core. | `baseline.node20-npm10 + baseline.markdown.core-cm0312-gfm029 + baseline.client.react19 + renderer-core:^1.0.0 + ui-tokens:^1.0.1` | linked changeset -> ci:workspace:verify:publish -> pack -> release evidence -> npm publish |
| `@mdwrk/i18n` | `packages/shared/i18n` | shared | Shared Primitives | `1.0.0` | `1.1.0` | Minor when locale registry or catalog surfaces expand; patch for fixes. Linked with ui-tokens for the shared certification train. | `baseline.node20-npm10 + baseline.shared.i18n-v1` | linked changeset -> ci:workspace:verify:publish -> pack -> release evidence -> npm publish |
| `@mdwrk/icons` | `packages/shared/icons` | shared | Shared Primitives | `1.0.0` | `1.0.1 (default patch)` | Patch by default; move to minor only if the public icon API expands. | `baseline.node20-npm10 + baseline.shared.workspace-internal` | changeset -> ci:workspace:verify:publish -> pack -> release evidence -> npm publish |
| `@mdwrk/testing` | `packages/shared/testing` | shared | Shared Primitives | `1.0.0` | `1.0.1 (default patch)` | Patch by default; move to minor only if the public test helper API expands. | `baseline.node20-npm10 + baseline.shared.workspace-internal` | changeset -> ci:workspace:verify:publish -> pack -> release evidence -> npm publish |
| `@mdwrk/ui-tokens` | `packages/shared/ui-tokens` | shared | Shared Primitives | `1.0.1` | `1.1.0` | Minor when token or bridge surfaces expand; patch for fixes. Linked with i18n for the shared certification train. | `baseline.node20-npm10 + baseline.contract.theme-v1` | linked changeset -> ci:workspace:verify:publish -> pack -> release evidence -> npm publish |
| `@mdwrk/example-editor-basic` | `examples/editor-basic` | examples | Developer Experience | `0.1.1` | `0.1.2 (default) / 0.2.0 if the example API surface expands` | Patch for dependency refresh or demo fixes; minor when the demo surface materially expands. | `baseline.node20-npm10 + baseline.client.react19 + @mdwrk/markdown-editor-react:^1.0.2 + @mdwrk/markdown-renderer-react:^1.0.1` | dependency uplift -> ci:workspace:verify -> example build/smoke -> demo refresh |
| `@mdwrk/example-renderer-basic` | `examples/renderer-basic` | examples | Developer Experience | `0.1.1` | `0.1.2 (default) / 0.2.0 if the example API surface expands` | Patch for dependency refresh or demo fixes; minor when the demo surface materially expands. | `baseline.node20-npm10 + baseline.client.react19 + @mdwrk/markdown-renderer-react:^1.0.1` | dependency uplift -> ci:workspace:verify -> example build/smoke -> demo refresh |

## Exit-criteria closure for this checkpoint

Phase 1 requires that every package now has:

- a frozen release group
- a frozen owner lane
- a SemVer policy
- a compatibility declaration
- a promotion path

This document, together with `docs/operations/version-train.md`, `docs/operations/compatibility-baselines.md`, and `artifacts/conformance/latest/phase-1-release-train-freeze.json`, is the canonical Phase 1 source of truth.

## Honest status

This checkpoint freezes the release train.
It does **not** perform the actual version bump or claim that the repository has already reached final certification closure.
