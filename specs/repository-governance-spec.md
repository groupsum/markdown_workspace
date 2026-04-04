# Repository Governance Specification

## Purpose

This specification defines repository cleanliness, documentation governance, and CI-enforced conformance checks for `markdown_workspace`.

## Validation Rules

### 1) Tree validation
- Required top-level directories must exist: `apps`, `packages`, `docs`, `tools`, `specs`, `.github`.
- Required governance files must exist: `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `LICENSE`, `AGENTS.md`, `specs/README.md`.

### 2) Doc-pointer validation
- Root `README.md` must contain a `## Documentation Pointers` section.
- Root `README.md` must reference these paths:
  - `docs/README.md`
  - `specs/README.md`
  - `CONTRIBUTING.md`
  - `CODE_OF_CONDUCT.md`
  - `LICENSE`
  - `AGENTS.md`

### 3) Root-clutter validation
- Top-level repository files and folders are restricted to the allowlist in `tools/governance/validate-root-clutter.mjs`.
- New top-level files must be intentionally added to the allowlist with a governance review.

### 4) Generated-artifact protection
- Generated artifact roots must include guardrail documentation:
  - `artifacts/README.md`
  - `artifacts/extensions/README.md`
  - `artifacts/verification/build-verification.md`

### 5) Claim-language lint
- Root-level public overview documentation must not claim unsupported certification status.
- Prohibited language includes absolute statements asserting final/full certification without evidence links.
- Claims must be evidence-linked and scope-bounded.

### 6) WIP-notes validation
- `WIP*.md` and `*WIP*.md` files are disallowed at the repository root.
- Temporary work notes should live under `docs/current-state/` and be converted to durable docs before merge.

### 7) Release-note validation
- Any `.changeset/*.md` file (except `.changeset/README.md`) must include:
  - A frontmatter summary block (`---`)
  - At least one package bump entry (`'@scope/pkg': patch|minor|major`)

## Test and CI Requirements
- Each governance rule must have a dedicated validation command.
- CI must execute all governance checks in pull requests and pushes.
- Failure messages must reference this specification file to guide maintainers.
