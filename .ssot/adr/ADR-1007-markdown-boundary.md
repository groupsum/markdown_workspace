# ADR-1007: ADR-0007: Markdown target freeze and certification boundary

# ADR-0007: Markdown target freeze and certification boundary

- Status: Accepted
- Date: 2026-03-27

## Context

The repository already has repository-internal conformance documentation, package contracts, extension contracts, and release evidence tooling.

However, the Markdown target itself remained underspecified for certification language.
The workspace still lacked one canonical answer to all of the following:

- what counts as core Markdown
- what counts as default Markdown behavior
- what counts as optional extension behavior
- which v1 client behaviors must be restored in v2 for a fully featured UIX claim
- what “repository-internal RFC compliant” means once an external Markdown target is intentionally adopted

Without that freeze, later implementation phases risk testing against inconsistent targets and making release claims that are broader than the actual evidence.

## Decision

Adopt the following certification and Markdown target policy.

### External Markdown target

- Freeze **CommonMark 0.31.2** as the normative core.
- Freeze **GFM 0.29-gfm** as the default enabled profile on top of CommonMark.
- Freeze the following optional named profiles:
  - metadata / front matter
  - footnotes
  - definition lists
  - math
  - citations
  - superscript
  - subscript
  - smart punctuation
  - Markdown inside HTML blocks

### Underline policy

- Underline is not standard Markdown in this repository.
- `__text__` remains strong emphasis.
- Underline may only exist as an explicit custom extension or HTML passthrough workflow.

### Raw HTML policy

- Raw HTML syntax is recognized as part of the Markdown surface.
- Rendering and export are policy-controlled.
- Untrusted preview sanitizes HTML.
- Trusted preview/export may permit raw HTML by explicit policy.

### Preview heading policy

- Preserve v2 slugified heading IDs.
- Do not revert to the v1 no-anchor behavior.
- Require deterministic heading-anchor behavior across preview/export in a release line.

### Tab behavior policy

- Preserve v2 structural indentation as the default policy.
- Do not hard-revert to global literal-space insertion.
- A future preference may expose literal-space insertion as an alternative mode.

### UIX parity policy

- Treat v1 as the parity reference for concrete client feature regressions.
- Treat v2 as the implementation base.
- Reimplement lost end-user features where v2 regressed them.
- Keep net v2 improvements where the comparison shows an actual improvement.

### Boundary policy

- `docs/conformance/certification-boundary.md` becomes normative for claim scope.
- `docs/conformance/markdown-profile-matrix.json` becomes the machine-readable profile freeze.
- `docs/current-state/v1-v2-gap-ledger.md` becomes the live parity closure ledger for the client app.

## Consequences

- parser, editor, preview, export, and settings work must now target the frozen Markdown matrix
- future certification claims must reference the explicit Markdown target rather than an unspecified external RFC corpus
- the client app must close the documented v1→v2 feature regressions before claiming a fully featured UIX
- conformance evidence must later add frozen-target corpus lanes for CommonMark, GFM, and any optional profile claimed in scope
- repository documentation must describe the current certification state honestly until all closure gates are green
