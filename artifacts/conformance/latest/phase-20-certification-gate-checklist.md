# Phase 20 certification gate checklist

## Gate B — certification closure from RC artifacts

- [ ] Close the full official CommonMark lane (434/652 passing, 218 failing).
- [ ] Close the full official GFM lane (444/672 passing, 228 failing).
- [x] Keep the claimed optional-profile lane green (8/8).
- [x] Keep the editor keyboard lane green (17/17).
- [x] Keep the toolbar/selection lane green (40/40).
- [x] Keep the preview/export lane green (5/5 current rerun).
- [x] Keep the accessibility lane green (shell 11/11, settings 34/34, preview 5/5, i18n 23/23).
- [ ] Close the browser matrix lane in a full browser environment.
- [x] Close the browser-driven visual regression lane (12/12 Chromium screenshot-diff checks).
- [x] Close the full packed-tarball install lane for the release set (17 tarballs validated together).
- [x] Keep the extension activation/compatibility lane green.
- [x] Keep the docs/contract-boundary lane green.
- [ ] Re-evaluate the hard markdown closure rule to green (currently blocked by actual official-corpus failures).
- [x] Keep the other hard closure rules green.
- [x] Regenerate the current checkpoint evidence bundle from the current workspace state.
- [ ] Regenerate the final evidence bundle from a fully green run.

## Result

Certification is **not yet available** in this checkpoint. The remaining Gate B blockers are the two official full-corpus lanes, the full browser matrix lane, and the hard markdown closure rule that depends on the corpus lanes.
