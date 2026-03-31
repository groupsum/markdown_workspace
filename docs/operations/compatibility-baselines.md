# Compatibility baselines

Date: 2026-03-27

## Purpose

This document freezes the compatibility anchors used by the Phase 1 release train.
It sits alongside `docs/operations/compatibility-rules.md` and makes the baseline versions and promotion gates explicit for the current workspace checkpoint.

## Baseline identifiers

| Baseline id | Value | Meaning |
|---|---|---|
| `baseline.node20-npm10` | Node `>=20 <23`, npm `>=10` | repository execution baseline |
| `baseline.contract.manifest-v1` | manifest schema version `1` | extension manifest schema anchor |
| `baseline.contract.host-api-v1` | host API baseline `1.0.0` | extension host contract anchor |
| `baseline.contract.runtime-v1` | runtime baseline `1.0.0` | extension runtime contract anchor |
| `baseline.contract.theme-v1` | theme contract baseline `1.1.0` | shared theme/token compatibility anchor after the Phase 9 contract expansion |
| `baseline.client.react19` | React / ReactDOM `^19.0.0` peers for binders/extensions unless a package documents a tighter app-only runtime | React compatibility baseline |
| `baseline.markdown.core-cm0312-gfm029` | CommonMark `0.31.2` + GFM `0.29-gfm` default profile | external Markdown target frozen in Phase 0 |
| `baseline.markdown.authoring-policy.phase0` | editor behavior must remain consistent with the frozen Phase 0 Markdown target/policy decisions | editor behavioral compatibility anchor |
| `baseline.shared.i18n-v1` | package-local locale registration and fallback-chain model from the current shared i18n package | shared i18n anchor |
| `baseline.shared.ui-tokens-theme-v1` | token bridge remains compatible with `@mdwrk/theme-contract@^1.1.0` | shared token/theme anchor after the Phase 9 bridge expansion |
| `baseline.shared.workspace-internal` | no additional external contract beyond SemVer + workspace boundary rules | internal utility baseline |

## Compatibility rules locked in this checkpoint

### 1. Contract baselines are the anchors
Contract packages are the normative anchors for compatibility evaluation.
Feature trains must respect the manifest schema, host API, runtime API, and theme contract baselines unless a later checkpoint explicitly changes them.

### 2. Internal dependency ranges remain semver-compatible
Workspace packages must continue to use semver-compatible ranges rather than exact-patch pinning for internal dependencies whenever the public surface is still compatible.

### 3. Activation compatibility remains mandatory
Extension activation compatibility must continue to validate:

- manifest compatibility
- host/runtime compatibility
- theme contract compatibility where relevant
- capability grants

### 4. Packed tarball install validation is mandatory
Pack generation already exists in the repo via `npm run pack:packages`.
For this checkpoint, the rule is frozen that **packed tarball install validation is a mandatory release gate**, not an optional afterthought.
The current checkpoint also now includes a package-graph audit proving that internal workspace dependency ranges remain semver-compatible in the audited zip.

That means promotion to RC/release must include:

- pack generation
- tarball metadata validation
- installation validation from the packed artifacts in a clean consumer environment
- evidence capture in the release bundle

### 5. Promotion cannot outrun compatibility evidence
A package family may not be promoted on the certification train if its declared compatibility baseline has not been revalidated in the current release evidence.

## Package-family baseline map

| Family | Required compatibility baseline(s) |
|---|---|
| contracts | contract baseline itself; no speculative version drift |
| renderer | Node baseline + frozen Markdown target; React baseline for React binding |
| editor | Node baseline + frozen authoring policy; React baseline for React binding |
| shared i18n/ui-tokens | Node baseline + shared package anchor (`i18n` or theme contract bridge) |
| shared icons/testing | Node baseline + workspace boundary rules |
| extension runtime family | Node baseline + manifest/host/runtime/theme baselines + React baseline where relevant |
| client app | Node baseline + React baseline + contract baselines + semver-compatible internal package ranges |
| lander | Node baseline + renderer/ui-token compatibility + app runtime dependencies |
| examples | Node baseline + semver-compatible package consumption for the examples they demonstrate |

## Validation and promotion hooks

The current repository already includes the following relevant scripts and workflows:

- `npm run validate:compatibility`
- `npm run pack:packages`
- `npm run release:evidence`
- `npm run release:prepare`
- `.github/workflows/publish-packages.yml`
- `.github/workflows/publish-extensions.yml`

## Honest current state

This checkpoint freezes the baseline and the policy.
It does **not** yet prove that every later certification gate is already closed.

In particular, the repo now treats packed tarball install validation as required policy, but the final dedicated install-evidence lane still belongs to a later strict-conformance closure phase.

## Phase 9 execution note

Phase 9 executes the first intentional move of the portable theme/token baseline after the original Phase 1 freeze.
The major line remains stable at `1.x`, so extension/runtime compatibility logic remains compatible with the frozen major-line anchor, while the active minor baseline is now `1.1.0`.
