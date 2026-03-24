# Repository assessment (Phase 13 publish-stability checkpoint)

Date: 2026-03-24

## Scope

This assessment reviews the repository state in the attached checkpoint after targeted remediation of the publish workflow failures.

## What was failing

Two classes of publish-blocking defects were present in the checkpoint:

1. **Compatibility validation was coupled to package patch versions instead of API baselines.**
   - `tools/conformance/validate-compatibility.mjs` compared extension manifest `compatibility.hostApi`, `compatibility.runtime`, and `compatibility.themeContract` against the workspace package.json versions.
   - The repository contracts and documentation treat these fields as **API/contract compatibility ranges**, not exact package release numbers.
   - That made patch releases such as `@markdown-workspace/extension-host@1.0.1` and `@markdown-workspace/extension-runtime@1.0.1` look incompatible with manifests that still correctly targeted the `1.0.0` API baseline.

2. **Extension artifact validation depended on stale committed generated files.**
   - `artifacts/extensions/catalog.json` contained integrity digests that no longer matched the checked-in `manifest.json` and entry module for `external.catalog-hello`.
   - `validate:extension-artifacts` therefore failed in a fresh checkout even though the source packages could regenerate valid artifacts.

## Fixes applied in this checkpoint

### Compatibility remediation

- Updated `tools/conformance/validate-compatibility.mjs` so it now validates against the supported platform baselines:
  - manifest schema version
  - host API baseline
  - runtime baseline
  - theme contract baseline
  - client app version range
- The validator now evaluates compatibility by **semver satisfaction** instead of exact package version equality.
- Normalized extension manifest compatibility declarations to semver ranges (`^1.0.0`) for:
  - `@markdown-workspace/extension-manager`
  - `@markdown-workspace/extension-gemini-agent`
  - `@markdown-workspace/extension-theme-studio`
  - `@demo-markdown-workspace/extension-catalog-hello`

### Generated artifact remediation

- Updated extension artifact generation so `tools/extensions/build-installable-extensions.mjs` recreates `artifacts/extensions/` from a clean directory on each run.
- Updated the root `conformance` script to regenerate and re-sign extension artifacts before validating them.
- Added an explicit compatibility validation step to `.github/workflows/publish-extensions.yml` so both publish workflows enforce the same compatibility gate.
- Updated `.github/workflows/conformance.yml` to build the workspace before running conformance validators, preventing stale `dist/` outputs from driving validation.

### Version alignment cleanup

The checkpoint contained several stale source version constants that could produce incorrect build output on republish. These were aligned with their package versions for the packages where the exported constant is the package version surface:

- `@markdown-workspace/markdown-editor-core` → `1.0.1`
- `@markdown-workspace/markdown-editor-react` → `1.0.2`
- `@demo-markdown-workspace/extension-catalog-hello` → `1.0.1`
- `@markdown-workspace/markdown-renderer-react` → `1.0.1`
- `@markdown-workspace/ui-tokens` → `1.0.1`

## Current repository shape

The repository remains a root npm workspace with:

- `apps/client/`
- `apps/lander/`
- contract packages under `packages/contracts/`
- shared primitive packages under `packages/shared/`
- renderer packages under `packages/renderer/`
- editor packages under `packages/editor/`
- extension packages under `packages/extensions/`
- examples under `examples/`
- documentation under `docs/`
- generated evidence under `artifacts/`
- workflow automation under `.github/workflows/`
- operational tooling under `tools/`

## Verification performed for this checkpoint

The checkpoint was updated to make the following workflow-equivalent validations pass from the repository state itself:

- extension manifest validation
- compatibility validation against API baselines and client ranges
- extension artifact bundle generation
- extension artifact signing
- extension artifact validation
- package packing evidence generation
- release evidence generation
- conformance artifact generation

Container verification note:
- an attempted full root `npm run ci:build` in this container did not complete because npm did not fully materialize some external renderer dependencies (for example `gray-matter` and `remark-gfm`) under the local install state
- the publish-blocking compatibility and extension-artifact failures were nevertheless remediated and revalidated directly from the updated repository checkpoint

## Current gaps and remaining partial areas

The repository is stronger and publish-stable after these fixes, but several honest limits remain:

- no independent external certification body evaluated this checkpoint
- no externally scoped standards corpus was supplied for a formal third-party RFC audit
- production signing-key custody/rotation is still represented by sample or CI-injected key material rather than a live HSM-backed deployment in this container
- renderer/editor compatibility declarations are present, but repository validation still focuses most strongly on manifest, host/runtime/theme/app compatibility rather than every optional dimension across every package family
- browser-driven E2E and visual-regression coverage remain lighter than a production release certification program

## Honest certification state

This checkpoint is **not independently certified** as “certifiably fully featured” or “certifiably fully RFC compliant” in any external standards-body sense.

Within the repository’s own internal conformance model, this checkpoint now restores the publish path, regenerates current evidence artifacts, and aligns the compatibility checks with the documented API-baseline contract semantics.

## Docker and compose workflow remediation

The client and lander Dockerfiles previously copied only the root manifest, lockfile, and one app manifest before invoking a single-workspace build. That left the internal workspace packages unavailable inside the image build context, which caused:

- `TS2307` module resolution failures for `@markdown-workspace/*` packages
- secondary type-shape errors caused by missing or stale declaration resolution
- failing Docker Compose restart workflows whenever the image build reached `npm run build --workspace apps/client` or `npm run build --workspace apps/lander`

This checkpoint updates both Dockerfiles so each image build now copies:

- the root `package.json`, `package-lock.json`, and `tsconfig.base.json`
- the full `packages/` workspace tree
- only the target app (`apps/client` for client, `apps/lander` for lander)

The image build now installs with `npm ci --install-strategy=nested` and runs the authoritative root build target:

- client: `npm run build:client`
- lander: `npm run build:lander`

That keeps the client image independent from the lander app source, and the lander image independent from the client app source, while still making the required shared workspace packages available to TypeScript and Vite during image builds.

The Docker Compose restart workflows were also widened so they trigger when shared packages or root workspace manifests change, not only when the app directory itself changes.

### Docker TypeScript toolchain remediation

The client and lander Docker build contexts intentionally copy only one app plus the shared workspace packages. Under `npm ci --install-strategy=nested`, build-only CLIs such as `tsc` are only present in the app workspace that declares them. Several shared packages invoke `tsc` directly during `build`, so Docker builds would fail with `sh: tsc: not found` even though the target app itself had TypeScript installed.

This checkpoint fixes that by materializing a Docker-local `/usr/local/bin/tsc` wrapper that points at the copied app workspace's installed TypeScript binary before the root workspace build runs. That preserves the isolated app build contexts while making shared package builds succeed in the compose/GitHub workflow images.
