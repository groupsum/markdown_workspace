# ADR-1011: ADR-0011: Optional profile boundary Phase 4 checkpoint

# ADR-0011: Optional profile boundary Phase 4 checkpoint

Date: 2026-03-28
Status: Accepted

## Context

The Phase 0 target freeze named a set of optional Markdown profiles that could be claimed only if they were explicitly named, toggleable, and fully tested.

By the end of the Phase 3 checkpoint, the repository had executable CommonMark-core and default-GFM lanes, but optional-profile support was still not formally closed.

## Decision

The repository now freezes the Phase 4 optional-profile boundary as follows:

### In-scope optional profiles for the Phase 4 checkpoint

- front matter / metadata
- footnotes
- definition lists
- math
- superscript
- subscript
- smart punctuation

These profiles are now:

- named in the renderer family
- toggleable through app configuration
- propagated through preview and export wrappers
- represented in editor command surfaces where a checkpoint UX exists
- covered by executable package-level evidence

### Explicitly out-of-scope optional profiles for the Phase 4 checkpoint

- citations
- markdown-in-html

These remain named and toggleable, but they are **not** part of the certified optional-profile boundary in this checkpoint.

Reasons:

- citations still lack bibliography resolution
- markdown-in-html depends on trusted HTML policy and remains experimental in this checkpoint

## Consequences

The repository may now honestly claim that it has a named optional-profile checkpoint, but it may **not** yet claim that every named optional profile is inside the certified boundary.

The certification boundary remains honest only if:

- experimental profiles stay documented as outside the certified optional-profile boundary; and
- future claims do not silently treat those profiles as fully closed until they have dedicated evidence and policy closure.

## Implementation notes

The Phase 4 checkpoint adds:

- a reusable optional-profile registry in the renderer core
- app-level settings and persistence for profile toggles and trusted HTML behavior
- profile-aware preview/export routing
- warnings when experimental profiles or trusted-HTML-dependent profiles affect preview/export behavior

## Non-decisions

This ADR does **not** close:

- full frozen-target CommonMark/GFM corpus closure
- full UIX parity closure for the client app
- Git/settings, restore/import, theme exposure, language selection, or extension-settings closure
- bibliography resolution for citations
- final trusted HTML certification policy for markdown-in-html
