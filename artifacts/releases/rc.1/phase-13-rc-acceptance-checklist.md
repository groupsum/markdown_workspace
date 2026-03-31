# RC.1 acceptance checklist

Date: 2026-03-29T20:04:34.436Z

- [x] changesets-complete — Five Phase 13 release-family changesets are committed.
- [x] release-status-generated — A release:status summary exists via manual fallback because the Changesets CLI could not execute in this environment.
- [x] rc-versions-generated — The root workspace and affected families carry RC.1 versions.
- [x] internal-ranges-updated — Internal dependency ranges use semver-compatible RC ranges instead of workspace protocol links.
- [x] tarballs-rebuilt — Public and private RC tarball sets were rebuilt.
- [x] extension-artifacts-regenerated — Extension artifacts and signatures were regenerated from the RC line.
- [x] release-evidence-regenerated — Release evidence and publish-readiness records were regenerated from the RC line.
- [ ] packed-install-verified — The portable subset tarball install lane is green, but the broader app install lane remains blocked in this environment.
- [x] apps-examples-validated-against-tarballs — App and example validation against RC tarball manifests is green.
- [ ] no-release-blocker-remains — Browser matrix, browser-driven visual regression, full frozen-target corpus closure, and publish readiness remain blocked.
- [x] artifact-catalogs-match-version-inventory — Tarball catalogs and package inventory were regenerated from the current RC line.
