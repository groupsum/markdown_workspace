# Final closure sequence (Phase 16)

This artifact records the final closure sequence under the certify-first policy.

## Gate A — policy correction before final closure

1. Amend the closure rule set so that certification and promotion are separate gates.
2. Freeze the final claim language:
   - repository-internal certifiably fully featured
   - repository-internal certifiably compliant
   - externally frozen CommonMark/GFM markdown target conformance for the declared profile set
3. Declare Playwright Test as the canonical real-browser matrix and visual-regression execution engine for the blocked browser lanes.

## Gate B — certification closure from RC artifacts

1. Re-run the full strict closure suite in a real execution environment.
2. Close the full official CommonMark lane.
3. Close the full official GFM lane.
4. Close the full optional-profile lane for every profile still claimed in boundary.
5. Keep the editor keyboard lane green.
6. Keep the toolbar/selection lane green.
7. Keep the preview/export lane green.
8. Keep the accessibility lane green.
9. Close the browser matrix lane.
10. Close the browser-driven visual regression lane.
11. Close the full packed tarball install lane for the full release set.
12. Keep extension activation / compatibility green.
13. Keep docs / contract-boundary green.
14. If any lane requires code changes, cut another RC and loop:
    - apply fixes
    - cut another RC
    - regenerate versions
    - regenerate tarballs
    - regenerate evidence
    - validate again from RC tarballs
15. Regenerate the full evidence bundle from a clean state.
16. Re-evaluate the hard closure rules.
17. Flip the certification gate checklist to all green.

## Gate C — promotion only after certification is complete

1. Publish from the validated RC artifacts in dependency order.
2. Validate from the published artifacts.
3. Create the real tag and GitHub release.
4. Open the real short support window on the published train.
5. Keep the support window patch-only unless a deliberate next minor is opened.
