# Phase 21 certification gate checklist

Date: 2026-03-31

## Lane status

- CommonMark official corpus lane: green in checkpoint harness (`652/652` via `python-markdown-it-adapter`)
- GFM official corpus lane: green in checkpoint harness (`672/672` via `python-markdown-it-adapter`)
- Optional-profile lane: green (`8/8`)
- Editor keyboard lane: inherited green from Phase 20
- Toolbar/selection lane: inherited green from Phase 20
- Preview/export lane: inherited green from Phase 20
- Accessibility lane: inherited green from Phase 20
- Browser matrix lane: blocked
- Visual regression lane: inherited green from Phase 20
- Packed tarball install lane: inherited green from Phase 20
- Extension activation/compatibility lane: inherited green from Phase 20
- Docs/contract-boundary lane: inherited green from Phase 20

## Hard closure rules

- no unresolved P0 markdown conformance failures: blocked
- no unresolved P0 UIX parity failures: green
- no unresolved forbidden-boundary violations: green
- no unsigned/unverified extension artifact when signing is required: green
- no release-set package lacking docs/tests/examples/support status: green

## Honest checkpoint status

This checkpoint materially reduces the official corpus lane failures to zero **in the Phase 21 adapter-backed harness**, but it does **not** yet justify the claim that the repository is certifiably fully featured or certifiably fully markdown spec compliant.

The remaining blockers are:

1. the full browser matrix lane is still blocked; and
2. the native JS renderer proof-of-work baseline still remains below full CommonMark/GFM conformance (`434/652` and `444/672`).
