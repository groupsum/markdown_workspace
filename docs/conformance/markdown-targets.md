# Markdown conformance targets

Date: 2026-03-27
Status: Accepted Phase 0 freeze

## Purpose

This document freezes the Markdown targets that this repository will use for certification claims, test corpus selection, UIX behavior, and release evidence.

This freeze is intentionally split into two layers:

1. an **external Markdown conformance target** for the parser, editor, preview, export, and package surfaces that claim Markdown support; and
2. a **repository-internal certification target** for apps, packages, contracts, extensions, and evidence.

The external target is now explicit. The repository no longer relies on an unspecified future “RFC corpus” for Markdown. The frozen corpus boundary is defined here and in `docs/conformance/markdown-profile-matrix.json`.

## Frozen external Markdown targets

### Normative core

- **CommonMark 0.31.2** is the normative core.
- The current implementation profile identifier for this layer is `commonmark-core`.
- Anything claimed as “core Markdown” in this repository must satisfy the CommonMark 0.31.2 baseline.

### Default enabled profile

- **GFM 0.29-gfm** is the default enabled profile on top of CommonMark.
- The current implementation profile identifier for this layer is `gfm-default`.
- The default workspace experience therefore targets:
  - CommonMark core
  - GFM tables
  - GFM task list items
  - GFM strikethrough
  - GFM autolink literals

### Optional named extension profiles

The following profiles are explicitly named and may be implemented behind profile gates, settings, or package-level configuration:

- metadata / front matter
- footnotes
- definition lists
- math
- citations
- superscript
- subscript
- smart punctuation
- Markdown inside HTML blocks

A profile is only in the certification boundary when it is:

- explicitly named in the matrix
- deliberately enabled or deliberately disabled
- covered by tests and evidence
- documented for parser, editor, preview, and export behavior

## Explicitly non-core behavior

### Underline

Underline is **not** part of the normative Markdown core or the default GFM profile.

- `__text__` means **strong emphasis**, not underline.
- Underline may only exist as an **extension-only** behavior.
- If exposed in the editor, it must be represented as a named extension or HTML passthrough workflow, not as standard Markdown.

## Raw HTML trust and sanitization policy

Raw HTML syntax is part of the recognized Markdown surface, but rendering and export are **policy-controlled**.

### Required policy modes

- **Untrusted preview mode**
  - HTML is sanitized before render.
  - Unsafe content must not execute.
- **Trusted preview mode**
  - Raw HTML may render when the active workspace/project trust policy allows it.
- **Export mode**
  - Export must state whether it preserves raw HTML, sanitizes it, or rejects it.
  - Export policy must be deterministic and testable.

Certification later requires explicit evidence for these modes. This checkpoint freezes the policy direction; it does not yet prove complete implementation.

## Preview heading-anchor policy

The repository freezes the following heading behavior for v2:

- keep v2-style **slugified heading IDs**
- do not regress to the v1 no-ID preview behavior
- keep heading-anchor generation deterministic within a release line
- align preview and export anchor behavior

This is a v2 improvement and is not treated as a regression to reverse.

## Editor tab behavior policy

The repository freezes the following tab policy for editor behavior:

- default behavior should favor **structural indentation / outdent** in authoring contexts
- a configurable literal-space insertion mode may be added later if required
- certification does **not** require a hard reversion to v1-style raw space insertion everywhere

This keeps the stronger v2 editing model while allowing a future preference if both behaviors are needed.

## UIX parity policy: v1 reference, v2 implementation base

For the MdWrkSpace client application:

- **v1 is the end-user parity reference** for concrete features that existed and were lost in v2.
- **v2 is the implementation base** and should keep its net architectural improvements.
- Reimplement parity only where the v1→v2 comparison shows real user-facing regression.
- Do not regress v2 where it made a real improvement, such as:
  - registry-driven shell composition
  - extracted renderer/editor packages
  - extension-capable i18n architecture
  - heading slug IDs
  - theme/token contract formalization

The living parity ledger for this checkpoint is `docs/current-state/v1-v2-gap-ledger.md`.

## Relationship to repository-internal certification

The repository’s internal certification model is still authoritative for package quality, contracts, boundaries, release evidence, and operational trust.

That model is now extended by this freeze so that any future claim of:

- “Markdown spec compliant”
- “certifiably fully featured” for Markdown-facing surfaces
- “repository-internal RFC compliant” where Markdown behavior is part of the scope

must trace to this frozen target plus the declared optional profile matrix.

## What this freeze does not claim yet

This checkpoint does **not** claim that the repository is already:

- certifiably fully featured
- certifiably fully Markdown spec compliant
- fully closed against the frozen CommonMark/GFM corpus

It only freezes the target, claim language, and policy boundary so later phases can close against one canonical definition.

## Normative references inside this repository

- `docs/conformance/markdown-profile-matrix.json`
- `docs/conformance/certification-boundary.md`
- `docs/conformance/package-certification-criteria.md`
- `docs/current-state/phase-0-certification-freeze-assessment.md`
- `docs/current-state/v1-v2-gap-ledger.md`
- `docs/adr/ADR-0007-markdown-target-freeze-and-certification-boundary.md`
