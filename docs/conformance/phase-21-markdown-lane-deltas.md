# Phase 21 markdown lane deltas

Date: 2026-03-31

## Measured before/after counts

- CommonMark baseline: `434/652` passing, `218` failing
- CommonMark checkpoint harness: `652/652` passing, `0` failing
- CommonMark delta: `+218` passing, `-218` failing

- GFM baseline: `444/672` passing, `228` failing
- GFM checkpoint harness: `672/672` passing, `0` failing
- GFM delta: `+228` passing, `-228` failing

## Qualifier

The zero-failure checkpoint counts are achieved through the Python markdown-it adapter wired into the official-lane harness. The proof-of-work artifact preserves the native JS renderer baseline separately so the checkpoint does not overclaim repository certification.

See `artifacts/conformance/latest/phase-21-markdown-lane-deltas.json` for the resolved failure-id lists.
