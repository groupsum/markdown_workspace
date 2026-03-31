# Phase 12 certification checklist closure

| Item | Status | Notes |
| --- | --- | --- |
| commonmarkCorpusLane | GREEN | 20/20 CommonMark corpus cases passed in the current subset lane. |
| gfmCorpusLane | GREEN | 7/7 default GFM corpus cases passed in the current subset lane. |
| optionalExtensionProfileLanes | GREEN | 8/8 optional profile cases passed in the current named-extension lane. |
| editorKeyboardLane | GREEN | 17/17 editor keyboard/command smoke checks remain green. |
| toolbarSelectionLane | GREEN | 40/40 toolbar/selection structural checks remain green from the Phase 5 checkpoint artifact. |
| previewExportLane | GREEN | 71/71 preview/export checks remain green, plus 5/5 current app preview/export checks. |
| accessibilityLane | GREEN | Accessibility-adjacent evidence remains green across preview/export (5/5), shell parity (11/11), and i18n (23/23) artifacts. |
| browserMatrixLane | BLOCKED | The provided checkpoint container does not include a full Playwright/browser matrix. Existing structural smoke scripts remain available, but a true browser matrix lane cannot be marked green here. |
| visualRegressionLane | BLOCKED | Static CSS digests and HTML baselines are present, but there is no browser-captured pixel diff run in this environment. |
| packedTarballInstallLane | BLOCKED | Portable subset install succeeded, but the full app tarball install remains blocked by unavailable registry dependencies in this environment. |
| extensionActivationCompatibilityLane | GREEN | Manifest validation (4), compatibility (4), signed artifact verification (1), and runtime smoke (pass) were evaluated. |
| docsContractBoundaryLane | GREEN | 193/193 documentation/evidence checks remain green and current package boundary/export validations also passed. |
| noUnresolvedP0MarkdownConformanceFailures | BLOCKED | Executed subset lanes are green, but the repository still does not run a full official end-to-end frozen CommonMark/GFM corpus and optional-profile closure across the entire declared boundary. |
| noUnresolvedP0UIXParityFailures | GREEN | The living v1→v2 parity ledger no longer shows open user-visible P0 parity rows and the shell/settings/theme/i18n/package evidence checkpoint artifacts remain green. |
| noUnresolvedForbiddenBoundaryViolations | GREEN | Package boundary validation reported no violations. |
| noUnsignedUnverifiedExtensionArtifactWhenSigningIsRequired | GREEN | Signed catalog artifacts validated successfully against the generated trust policy. |
| noReleaseSetPackageLackingDocsTestsExamplesSupportStatus | GREEN | Phase 11 package documentation/evidence matrix recorded no failing workspace entries. |
