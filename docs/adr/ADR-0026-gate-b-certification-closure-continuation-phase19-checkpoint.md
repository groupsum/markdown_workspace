# ADR-0026: Gate B certification-closure continuation (Phase 19 checkpoint)

Date: 2026-03-30
Status: accepted for the current checkpoint zip

## Context

Gate B remains the real final-closure path for certification from RC artifacts.

After Phase 18, the blocked certification items were still:

- official CommonMark corpus lane
- official GFM corpus lane
- browser matrix
- browser-driven visual regression
- full release-set packed tarball install
- the hard markdown closure rule derived from the official corpus lanes

The certify-first policy remains unchanged: publication is still outside the certification gate and belongs to the later promotion gate.

## Decision

This checkpoint continues Gate B by pushing the official CommonMark and GFM corpus lanes forward again while leaving the non-parser blocked lanes explicitly blocked rather than implicitly ignored.

The repository now records:

- CommonMark official: `434/652` passing
- GFM official: `444/672` passing
- optional-profile lane: `8/8` passing

The browser matrix, browser-driven visual regression, and full release-set packed tarball install lanes remain blocked and are carried forward as blocked-state reports.

## Consequences

This checkpoint is a real improvement checkpoint, not a certification checkpoint.

It narrows the markdown blocker counts again and preserves the certify-first policy, but it still does **not** authorize a final certification claim.

The next required work remains:

- continue reducing the official CommonMark/GFM failure counts to zero
- run the blocked browser matrix lane in a real browser-capable environment
- run the blocked browser-driven visual regression lane
- run the blocked full release-set packed tarball install lane
- only then re-evaluate the hard markdown closure rule and the certification gate checklist
