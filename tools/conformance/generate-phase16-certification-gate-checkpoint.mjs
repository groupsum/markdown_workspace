import path from 'node:path';
import { readJson, repoRoot, writeJson, writeText } from '../lib/workspace.mjs';

const artifactRoot = path.join(repoRoot, 'artifacts/conformance/latest');

const phase12Results = await readJson(path.join(artifactRoot, 'phase-12-closure-suite-results.json'));
const phase14Results = await readJson(path.join(artifactRoot, 'phase-14-promotion-release-results.json'));
const phase15Results = await readJson(path.join(artifactRoot, 'phase-15-stabilization-results.json'));
const phase13Results = await readJson(path.join(artifactRoot, 'phase-13-rc-train-results.json'));

const certificationPolicy = {
  generatedAt: '2026-03-30T00:00:00Z',
  model: 'certify-first-then-promote',
  certificationGate: {
    purpose: 'All strict conformance, parity, package-boundary, and evidence lanes must be green from RC artifacts before the repository may claim certification.',
    excludes: [
      'publish from validated RC artifacts',
      'live support window on published artifacts',
      'Git tag execution',
      'GitHub release execution',
      'published-artifact runtime compatibility',
    ],
  },
  promotionGate: {
    purpose: 'Only after certification is complete may the repository publish, tag, create the GitHub release, and run the live post-release support window on published artifacts.',
    includes: [
      'publish from validated RC artifacts',
      'published-artifact runtime compatibility',
      'Git tag creation',
      'GitHub release creation',
      'live support window on published artifacts',
    ],
  },
  claimLanguage: {
    repositoryInternalFullyFeatured: 'repository-internal certifiably fully featured',
    repositoryInternalCompliant: 'repository-internal certifiably compliant',
    externalMarkdownTarget: 'externally frozen CommonMark/GFM markdown target conformance for the declared profile set',
    note: 'No broader standards language may be used unless the evidence actually supports it.',
  },
  requiredBrowserTool: {
    name: 'Playwright Test',
    purpose: 'canonical real-browser matrix, accessibility, and visual-regression execution engine for final closure lanes',
  },
};

const certificationChecks = [
  {
    id: 'policy-split-certification-vs-promotion',
    ok: true,
    detail: 'Phase 16 explicitly splits certification closure from promotion/release execution.',
  },
  {
    id: 'claim-language-frozen',
    ok: true,
    detail: 'Phase 16 explicitly freezes the final claim language to repository-internal certification plus the externally frozen CommonMark/GFM target only.',
  },
  {
    id: 'commonmark-corpus-lane-green',
    ok: phase12Results.closureLanes.commonmarkCorpusLane.status === 'green',
    detail: phase12Results.closureLanes.commonmarkCorpusLane.summary,
  },
  {
    id: 'gfm-corpus-lane-green',
    ok: phase12Results.closureLanes.gfmCorpusLane.status === 'green',
    detail: phase12Results.closureLanes.gfmCorpusLane.summary,
  },
  {
    id: 'optional-profile-lanes-green',
    ok: phase12Results.closureLanes.optionalExtensionProfileLanes.status === 'green',
    detail: phase12Results.closureLanes.optionalExtensionProfileLanes.summary,
  },
  {
    id: 'editor-keyboard-lane-green',
    ok: phase12Results.closureLanes.editorKeyboardLane.status === 'green',
    detail: phase12Results.closureLanes.editorKeyboardLane.summary,
  },
  {
    id: 'toolbar-selection-lane-green',
    ok: phase12Results.closureLanes.toolbarSelectionLane.status === 'green',
    detail: phase12Results.closureLanes.toolbarSelectionLane.summary,
  },
  {
    id: 'preview-export-lane-green',
    ok: phase12Results.closureLanes.previewExportLane.status === 'green',
    detail: phase12Results.closureLanes.previewExportLane.summary,
  },
  {
    id: 'accessibility-lane-green',
    ok: phase12Results.closureLanes.accessibilityLane.status === 'green',
    detail: phase12Results.closureLanes.accessibilityLane.summary,
  },
  {
    id: 'browser-matrix-lane-green',
    ok: phase12Results.closureLanes.browserMatrixLane.status === 'green',
    detail: phase12Results.closureLanes.browserMatrixLane.summary,
  },
  {
    id: 'visual-regression-lane-green',
    ok: phase12Results.closureLanes.visualRegressionLane.status === 'green',
    detail: phase12Results.closureLanes.visualRegressionLane.summary,
  },
  {
    id: 'packed-tarball-install-lane-green',
    ok: phase12Results.closureLanes.packedTarballInstallLane.status === 'green',
    detail: phase12Results.closureLanes.packedTarballInstallLane.summary,
  },
  {
    id: 'extension-activation-compatibility-lane-green',
    ok: phase12Results.closureLanes.extensionActivationCompatibilityLane.status === 'green',
    detail: phase12Results.closureLanes.extensionActivationCompatibilityLane.summary,
  },
  {
    id: 'docs-contract-boundary-lane-green',
    ok: phase12Results.closureLanes.docsContractBoundaryLane.status === 'green',
    detail: phase12Results.closureLanes.docsContractBoundaryLane.summary,
  },
  {
    id: 'no-unresolved-p0-markdown-conformance-failures',
    ok: phase12Results.hardClosureRules.noUnresolvedP0MarkdownConformanceFailures.status === 'green',
    detail: phase12Results.hardClosureRules.noUnresolvedP0MarkdownConformanceFailures.note,
  },
  {
    id: 'no-unresolved-p0-uix-parity-failures',
    ok: phase12Results.hardClosureRules.noUnresolvedP0UIXParityFailures.status === 'green',
    detail: phase12Results.hardClosureRules.noUnresolvedP0UIXParityFailures.note,
  },
  {
    id: 'no-unresolved-forbidden-boundary-violations',
    ok: phase12Results.hardClosureRules.noUnresolvedForbiddenBoundaryViolations.status === 'green',
    detail: phase12Results.hardClosureRules.noUnresolvedForbiddenBoundaryViolations.note,
  },
  {
    id: 'no-unsigned-or-unverified-extension-artifact',
    ok: phase12Results.hardClosureRules.noUnsignedUnverifiedExtensionArtifactWhenSigningIsRequired.status === 'green',
    detail: phase12Results.hardClosureRules.noUnsignedUnverifiedExtensionArtifactWhenSigningIsRequired.note,
  },
  {
    id: 'no-release-set-package-lacking-docs-tests-examples-support-status',
    ok: phase12Results.hardClosureRules.noReleaseSetPackageLackingDocsTestsExamplesSupportStatus.status === 'green',
    detail: phase12Results.hardClosureRules.noReleaseSetPackageLackingDocsTestsExamplesSupportStatus.note,
  },
  {
    id: 'rc-validation-from-packed-artifacts-still-green',
    ok: phase13Results.ok === true,
    detail: 'The repository still carries the Phase 13 RC validation evidence and tarball inventory as the basis for certification-from-RC artifacts.',
  },
];

const promotionChecks = [
  {
    id: 'publish-from-validated-rc-artifacts',
    ok: false,
    detail: 'Promotion remains blocked because no publish step has been executed from the validated RC artifacts in this environment.',
  },
  {
    id: 'published-artifact-runtime-compatibility',
    ok: false,
    detail: phase14Results.checks.find((entry) => entry.id === 'published-artifact-runtime-compatibility')?.detail ?? 'No published artifact runtime compatibility evidence is available.',
  },
  {
    id: 'git-tag-created',
    ok: false,
    detail: phase14Results.checks.find((entry) => entry.id === 'git-tag-created')?.detail ?? 'Git tag creation has not been executed.',
  },
  {
    id: 'github-release-created',
    ok: false,
    detail: phase14Results.checks.find((entry) => entry.id === 'github-release-created')?.detail ?? 'GitHub release creation has not been executed.',
  },
  {
    id: 'live-support-window-on-published-artifacts',
    ok: false,
    detail: phase15Results.checks.find((entry) => entry.id === 'live-published-support-window-active')?.detail ?? 'No live support window is running on published artifacts.',
  },
  {
    id: 'patch-only-rule-prepared',
    ok: phase15Results.checks.find((entry) => entry.id === 'patch-only-rule-declared')?.ok ?? false,
    detail: phase15Results.checks.find((entry) => entry.id === 'patch-only-rule-declared')?.detail ?? 'Patch-only policy not declared.',
  },
];

const certificationSummary = {
  totalChecks: certificationChecks.length,
  greenChecks: certificationChecks.filter((entry) => entry.ok).length,
  blockedChecks: certificationChecks.filter((entry) => !entry.ok).length,
};

const promotionSummary = {
  totalChecks: promotionChecks.length,
  greenChecks: promotionChecks.filter((entry) => entry.ok).length,
  blockedChecks: promotionChecks.filter((entry) => !entry.ok).length,
};

const certificationGateChecklist = `# Certification gate checklist (Phase 16)

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
`;

const promotionGateChecklist = `# Promotion gate checklist (Phase 16)

Under the certify-first policy, these items are **real release requirements** but do not block the certification statement.

## Promotion gate

- [ ] Publish from the validated RC artifacts in dependency order.
- [ ] Validate install, activation, and runtime compatibility from the published artifacts.
- [ ] Create the real Git tag.
- [ ] Create the real GitHub release.
- [ ] Open the live support window on the published train.
- [x] Keep the support window patch-only unless a deliberate next minor is opened.

## Promotion result

Promotion is **not yet available** because no publication has happened in the checkpoint environment.
`;

const finalClosureSequence = `# Final closure sequence (Phase 16)

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
`;

const results = {
  generatedAt: '2026-03-30T00:00:00Z',
  phase: 16,
  policy: certificationPolicy,
  certificationGate: {
    ...certificationSummary,
    certificationReady: certificationSummary.blockedChecks === 0,
    checks: certificationChecks,
    blockers: certificationChecks.filter((entry) => !entry.ok).map((entry) => ({ id: entry.id, detail: entry.detail })),
  },
  promotionGate: {
    ...promotionSummary,
    promotionReady: promotionSummary.blockedChecks === 0,
    checks: promotionChecks,
    blockers: promotionChecks.filter((entry) => !entry.ok).map((entry) => ({ id: entry.id, detail: entry.detail })),
  },
  inheritedEvidence: {
    phase12: {
      closureSuitePath: 'artifacts/conformance/latest/phase-12-closure-suite-results.json',
      blockedLanes: Object.entries(phase12Results.closureLanes)
        .filter(([, value]) => value.status === 'blocked')
        .map(([id]) => id),
      blockedHardClosureRules: Object.entries(phase12Results.hardClosureRules)
        .filter(([, value]) => value.status === 'blocked')
        .map(([id]) => id),
    },
    phase14: {
      promotionResultsPath: 'artifacts/conformance/latest/phase-14-promotion-release-results.json',
      blockedChecks: phase14Results.checks.filter((entry) => !entry.ok).map((entry) => entry.id),
    },
    phase15: {
      stabilizationResultsPath: 'artifacts/conformance/latest/phase-15-stabilization-results.json',
      blockedChecks: phase15Results.checks.filter((entry) => !entry.ok).map((entry) => entry.id),
    },
  },
};

const checkpoint = {
  generatedAt: results.generatedAt,
  phase: 16,
  checkpointType: 'certification-gate-policy-correction-and-final-closure-sequencing',
  ok: false,
  certificationReady: results.certificationGate.certificationReady,
  promotionReady: results.promotionGate.promotionReady,
  evidenceFiles: [
    'artifacts/conformance/latest/phase-16-certification-gate-results.json',
    'artifacts/conformance/latest/phase-16-certification-gate-checkpoint.json',
    'artifacts/conformance/latest/phase-16-certification-gate-checklist.md',
    'artifacts/conformance/latest/phase-16-promotion-gate-checklist.md',
    'artifacts/conformance/latest/phase-16-final-closure-sequence.md',
    'artifacts/conformance/latest/phase-16-certification-gate-output.txt',
  ],
  note: 'Phase 16 does not claim certification. It corrects the repo policy so publication is no longer part of the certification gate and records the final closure sequence under a certify-first-then-promote model.',
};

await writeJson(path.join(artifactRoot, 'phase-16-certification-gate-results.json'), results);
await writeJson(path.join(artifactRoot, 'phase-16-certification-gate-checkpoint.json'), checkpoint);
await writeJson(path.join(artifactRoot, 'phase-16-closure-policy.json'), certificationPolicy);
await writeText(path.join(artifactRoot, 'phase-16-certification-gate-checklist.md'), certificationGateChecklist);
await writeText(path.join(artifactRoot, 'phase-16-promotion-gate-checklist.md'), promotionGateChecklist);
await writeText(path.join(artifactRoot, 'phase-16-final-closure-sequence.md'), finalClosureSequence);
await writeText(path.join(artifactRoot, 'phase-16-certification-gate-output.txt'), JSON.stringify(results, null, 2));

console.log('phase 16 certification-gate checkpoint artifacts generated');
