# Certification gate checklist (Phase 16)

Under the certify-first policy, publication is no longer part of the certification gate.

## Certification gate

- [x] Freeze the external Markdown target and internal certification boundary.
- [x] Freeze the claim language to:
  - repository-internal certifiably fully featured
  - repository-internal certifiably compliant
  - externally frozen CommonMark/GFM markdown target conformance for the declared profile set
- [x] Keep the implemented v1 UIX parity restorations closed.
- [x] Keep extension activation / compatibility green.
- [x] Keep docs / contract-boundary validation green.
- [ ] Close the **browser matrix lane** in a real browser environment.
- [ ] Close the **browser-driven visual regression lane**.
- [ ] Close the **full packed tarball install lane** for the full release set.
- [ ] Close the hard rule **no unresolved P0 markdown conformance failures** by proving the full official frozen-target CommonMark/GFM/optional-profile closure rather than only the current subset lanes.
- [x] Keep the remaining hard closure rules green:
  - no unresolved P0 UIX parity failures
  - no unresolved forbidden-boundary violations
  - no unsigned/unverified extension artifact when signing is required
  - no package in the release set lacking docs/tests/examples/support status
- [x] Validate from RC artifacts before any claim.
- [ ] Re-run the full evidence bundle from a clean state after the final all-green certification run.

## Certification result

The repository **may not yet claim certification** because the browser matrix lane, browser-driven visual regression lane, full packed-tarball install lane, and full frozen-target Markdown hard-closure rule remain blocked.
