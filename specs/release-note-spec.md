# Release Note Validation Spec

At least one release-note artifact must exist in `artifacts/conformance/latest`.

The highest available phase release-note file (for example `phase-20-release-notes-draft.md`) must include required headings:

- `## Summary`
- `## What is still blocked`
- `## Honest certification statement`

Automated validator: `tools/governance/validate-release-notes.mjs`.
