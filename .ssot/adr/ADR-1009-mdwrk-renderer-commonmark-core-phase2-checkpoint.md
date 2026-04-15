# ADR-1009: ADR-0009 — renderer CommonMark-core Phase 2 checkpoint

# ADR-0009 — renderer CommonMark-core Phase 2 checkpoint

Date: 2026-03-27
Status: Accepted

## Context

The certification program requires Phase 2 to close the parser and renderer against CommonMark core before any later UI shell certification claim can be credible.

The Phase 1 checkpoint froze the release train and compatibility baselines, but the renderer family still depended on an external remark/rehype/react-markdown toolchain that is not fully present inside this checkpoint zip.

## Decision

For this Phase 2 checkpoint the repository now carries a **self-contained committed renderer dist** for the renderer family.

The checkpoint renderer family now provides:

- an internal Markdown AST surface through `parseMarkdownToAst`
- synchronous and asynchronous HTML rendering paths
- policy-controlled raw HTML behavior through `htmlHandling`
- source-position attribute emission through `sourcePositionAttributes`
- heading extraction from the internal AST
- a React wrapper that renders through the portable core renderer rather than through `react-markdown`

The renderer family versions advance to:

- `@mdwrk/markdown-renderer-core` → `1.1.0`
- `@mdwrk/markdown-renderer-react` → `1.1.0`

This checkpoint also adopts a committed **official-seeded CommonMark-core subset harness** as interim evidence until the full frozen external corpus is integrated.

## Why this is the right checkpoint decision

This checkpoint does three useful things at once:

1. it materially improves the renderer family instead of adding documentation only;
2. it removes dependence on absent external markdown/runtime packages inside the provided zip; and
3. it creates executable Phase 2 evidence in the current checkpoint through `npm run test:renderer`.

## Consequences

### Positive

- the renderer family is now executable within the provided checkpoint zip
- the root renderer test lane now passes
- the repo now has machine-readable Phase 2 renderer evidence
- raw HTML behavior is now an explicit renderer policy rather than an accidental passthrough path

### Negative / still open

- this is not yet full CommonMark 0.31.2 closure
- this is not yet default GFM closure
- the subset harness is evidence, but not the final full corpus
- the React wrapper currently prioritizes portable committed output over the earlier `components` override depth provided by `react-markdown`

## Follow-on work

The next renderer conformance closures still needed are:

- full official CommonMark corpus ingestion
- full GFM/default-profile closure
- golden AST/HTML expansion
- adapter-contract audit proving no app-local preview path diverges from the package behavior without an explicit contract
