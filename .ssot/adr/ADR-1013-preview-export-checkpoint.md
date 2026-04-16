# ADR-1013: ADR-0013 — preview, export, and render-policy Phase 6 checkpoint

# ADR-0013 — preview, export, and render-policy Phase 6 checkpoint

Date: 2026-03-28
Status: Accepted

## Context

The Phase 0 target freeze and the v1→v2 gap analysis established that the repository could not claim a fully featured UIX or a trustworthy Markdown-rendering surface while preview and export behavior still depended on implicit HTML handling and app-local rendering shortcuts.

At the end of Phase 5, the repository still had open preview/export-policy gaps in the active v2 shell:

- empty list-item normalization from v1 had not yet been restored in the active preview/export adapters
- raw HTML handling was only partially explicit, with `escape` and trusted passthrough behavior but no hardened sanitize mode closing the default preview/export policy path
- unsafe URL-bearing attributes inside raw HTML and Markdown link/image destinations were not yet normalized under a consistent preview/export policy
- app preview wrappers did not yet resolve internal Markdown links against the current file tree
- HTML export did not yet rewrite internal Markdown file links to `.html` output targets
- task-checkbox markup still exposed weaker accessibility semantics in the renderer package used by React/server surfaces

The Phase 6 plan required these closures to happen in the reusable renderer packages first, with app preview/export adapters following as explicit policy adapters rather than independent rendering engines.

## Decision

For this Phase 6 checkpoint, the repository now treats **preview, export, and render policy** as an executable, evidence-backed checkpoint lane with the following concrete decisions:

- `@mdwrk/markdown-renderer-core@1.1.0` remains the renderer-core baseline but now exposes a three-mode HTML policy surface:
  - `escape`
  - `sanitize`
  - `allow-trusted`
- sanitize mode is now a real policy path rather than a placeholder label and is used by the active client preview/export adapters when trusted HTML mode is not enabled
- rendered roots now emit `data-markdown-html-handling` for auditability and downstream adapter visibility
- blocked inline HTML containers and active-content attributes are now suppressed or sanitized under sanitize mode, and unsafe Markdown link/image destinations are normalized under the same policy
- task-checkbox preview markup now carries accessible `aria-label` and `aria-checked` semantics instead of purely hidden decorative markup
- the active client preview/export adapters restore v1-style empty-list-item normalization as a preprocessing step before handing content to the reusable renderer packages
- the active client preview now resolves internal Markdown links against the current file tree and preserves slugified heading-anchor behavior
- the active client HTML export now rewrites relative Markdown links to `.html` targets and emits explicit export-policy advisories

## Why this is the right checkpoint decision

This checkpoint closes the preview/export-policy items that were both:

- explicitly called out by the v1→v2 regression ledger or by the Phase 6 plan; and
- reasonably closeable inside the reusable renderer family and the active v2 preview/export adapters without first solving unrelated Git/settings/theme/i18n release work.

It also keeps the reusable renderer family as the authoritative rendering surface, which prevents the app shell from silently diverging from the package certification boundary.

## Consequences

### Positive

- preview and export behavior are now driven by explicit policy decisions rather than incidental passthrough
- v1 empty-list-item normalization is restored where it matters for preview/export parity
- internal Markdown links are now meaningfully resolvable in the active preview shell
- HTML export is closer to a document-quality output path because it rewrites Markdown file links and surfaces export-policy advisories
- the renderer family now has executable Phase 6 evidence covering raw HTML policy, tasks, tables, footnotes, math, citations, and HTML document export

### Negative / still open

- this checkpoint does not close broader shell/settings/Git/theme/i18n parity gaps
- citations and markdown-in-html remain outside the certified optional-profile boundary even though structural support and warnings exist
- the client app still does not typecheck end-to-end in the provided zip because the external dependency/toolchain surface is incomplete
- this checkpoint does not yet prove the entire frozen CommonMark/GFM target example-by-example

## Follow-on work

The next closure steps after this checkpoint remain:

- Git/settings/provider parity closure
- theme exposure parity and i18n closure
- status bar / action rail / broader shell parity closure
- stricter conformance corpus integration and RC evidence depth
- promotion and release closure
