import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { readJson, repoRoot, writeJson, writeText } from '../lib/workspace.mjs';

const artifactRoot = path.join(repoRoot, 'artifacts', 'conformance', 'latest');

function runNodeJson(args) {
  const stdout = execFileSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024,
  });
  return JSON.parse(stdout);
}

function lane(status, summary, artifacts = [], notes = []) {
  return { status, summary, artifacts, notes };
}

const phase12 = await readJson(path.join(artifactRoot, 'phase-12-closure-suite-results.json'));
const phase16 = await readJson(path.join(artifactRoot, 'phase-16-certification-gate-results.json'));
const phase17Browser = await readJson(path.join(artifactRoot, 'phase-17-browser-matrix-report.json'));
const phase17Visual = await readJson(path.join(artifactRoot, 'phase-17-visual-regression-report.json'));
const phase17Packed = await readJson(path.join(artifactRoot, 'phase-17-packed-release-set-install-report.json'));

const commonmarkOfficial = runNodeJson(['packages/renderer/markdown-renderer-core/tests/commonmark-official-corpus.mjs', '--json']);
const gfmOfficial = runNodeJson(['packages/renderer/markdown-renderer-core/tests/gfm-official-corpus.mjs', '--json']);
const optionalProfiles = runNodeJson(['packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs', '--json']);

await writeJson(path.join(artifactRoot, 'phase-18-commonmark-official-summary.json'), commonmarkOfficial);
await writeJson(path.join(artifactRoot, 'phase-18-gfm-official-summary.json'), gfmOfficial);
await writeJson(path.join(artifactRoot, 'phase-18-optional-profile-summary.json'), optionalProfiles);

const browserMatrixReport = {
  ...phase17Browser,
  generatedAt: new Date().toISOString(),
  phase: 18,
  note: 'Blocked state carried forward pending a real browser-capable environment.',
};
const visualRegressionReport = {
  ...phase17Visual,
  generatedAt: new Date().toISOString(),
  phase: 18,
  note: 'Blocked state carried forward pending a real browser-driven visual-diff run.',
};
const packedInstallReport = {
  ...phase17Packed,
  generatedAt: new Date().toISOString(),
  phase: 18,
  note: 'Blocked state carried forward pending a full release-set packed install rerun in the required environment.',
};
await writeJson(path.join(artifactRoot, 'phase-18-browser-matrix-report.json'), browserMatrixReport);
await writeJson(path.join(artifactRoot, 'phase-18-visual-regression-report.json'), visualRegressionReport);
await writeJson(path.join(artifactRoot, 'phase-18-packed-release-set-install-report.json'), packedInstallReport);
await writeText(path.join(artifactRoot, 'phase-18-packed-release-set-install-log.txt'), 'Phase 18 carries forward the Phase 17 blocked packed-release-set install state. Re-run this lane in the required environment after the next parser/renderer fixes.\n');

const laneStatuses = {
  commonmarkOfficialCorpusLane: lane(commonmarkOfficial.failed === 0 ? 'green' : 'blocked', `${commonmarkOfficial.passed}/${commonmarkOfficial.total} official CommonMark corpus cases passed.`, ['artifacts/conformance/latest/phase-18-commonmark-official-summary.json']),
  gfmOfficialCorpusLane: lane(gfmOfficial.failed === 0 ? 'green' : 'blocked', `${gfmOfficial.passed}/${gfmOfficial.total} official GFM corpus cases passed.`, ['artifacts/conformance/latest/phase-18-gfm-official-summary.json']),
  optionalExtensionProfileLanes: lane(optionalProfiles.failed === 0 ? 'green' : 'blocked', `${optionalProfiles.passed}/${optionalProfiles.total} claimed optional-profile checks passed.`, ['artifacts/conformance/latest/phase-18-optional-profile-summary.json']),
  editorKeyboardLane: phase12.closureLanes.editorKeyboardLane,
  toolbarSelectionLane: phase12.closureLanes.toolbarSelectionLane,
  previewExportLane: phase12.closureLanes.previewExportLane,
  accessibilityLane: phase12.closureLanes.accessibilityLane,
  browserMatrixLane: lane('blocked', browserMatrixReport.reason || 'Browser matrix remains blocked in the current environment.', ['artifacts/conformance/latest/phase-18-browser-matrix-report.json']),
  visualRegressionLane: lane('blocked', visualRegressionReport.reason || 'Visual regression remains blocked in the current environment.', ['artifacts/conformance/latest/phase-18-visual-regression-report.json']),
  packedTarballInstallLane: lane('blocked', packedInstallReport.reason || 'Full release-set packed install remains blocked in the current environment.', ['artifacts/conformance/latest/phase-18-packed-release-set-install-report.json', 'artifacts/conformance/latest/phase-18-packed-release-set-install-log.txt']),
  extensionActivationCompatibilityLane: phase12.closureLanes.extensionActivationCompatibilityLane,
  docsContractBoundaryLane: phase12.closureLanes.docsContractBoundaryLane,
};

const hardClosureRules = {
  noUnresolvedP0MarkdownConformanceFailures: {
    status: commonmarkOfficial.failed === 0 && gfmOfficial.failed === 0 && optionalProfiles.failed === 0 ? 'green' : 'blocked',
    note: commonmarkOfficial.failed === 0 && gfmOfficial.failed === 0 && optionalProfiles.failed === 0
      ? 'Full official CommonMark/GFM corpus lanes and the claimed optional-profile lane are all green.'
      : `Hard markdown closure remains blocked because the official corpus lanes still fail (CommonMark: ${commonmarkOfficial.failed}, GFM: ${gfmOfficial.failed}, optional profiles: ${optionalProfiles.failed}).`,
  },
  noUnresolvedP0UIXParityFailures: phase12.hardClosureRules.noUnresolvedP0UIXParityFailures,
  noUnresolvedForbiddenBoundaryViolations: phase12.hardClosureRules.noUnresolvedForbiddenBoundaryViolations,
  noUnsignedUnverifiedExtensionArtifactWhenSigningIsRequired: phase12.hardClosureRules.noUnsignedUnverifiedExtensionArtifactWhenSigningIsRequired,
  noReleaseSetPackageLackingDocsTestsExamplesSupportStatus: phase12.hardClosureRules.noReleaseSetPackageLackingDocsTestsExamplesSupportStatus,
};

const laneEntries = Object.entries(laneStatuses);
const hardRuleEntries = Object.entries(hardClosureRules);
const greenLaneCount = laneEntries.filter(([, laneDef]) => laneDef.status === 'green').length;
const blockedLaneCount = laneEntries.length - greenLaneCount;
const greenHardRuleCount = hardRuleEntries.filter(([, rule]) => rule.status === 'green').length;
const blockedHardRuleCount = hardRuleEntries.length - greenHardRuleCount;

const blockers = [
  ...laneEntries.filter(([, laneDef]) => laneDef.status !== 'green').map(([id, laneDef]) => ({ id, detail: laneDef.summary })),
  ...hardRuleEntries.filter(([, rule]) => rule.status !== 'green').map(([id, rule]) => ({ id, detail: rule.note })),
];

const results = {
  generatedAt: new Date().toISOString(),
  phase: 18,
  basis: 'Gate B — certification closure from RC artifacts (continuation checkpoint)',
  inheritedEvidence: {
    phase12ClosureSuitePath: 'artifacts/conformance/latest/phase-12-closure-suite-results.json',
    phase16CertificationPolicyPath: 'artifacts/conformance/latest/phase-16-certification-gate-results.json',
    phase17GateBPath: 'artifacts/conformance/latest/phase-17-certification-gate-results.json',
  },
  laneStatuses,
  hardClosureRules,
  summary: {
    greenLaneCount,
    blockedLaneCount,
    greenHardClosureRules: greenHardRuleCount,
    blockedHardClosureRules: blockedHardRuleCount,
    certificationReady: false,
  },
  blockers: { certificationGate: blockers },
  improvementOverPhase17: {
    commonmark: {
      phase17Passed: 360,
      phase18Passed: commonmarkOfficial.passed,
      deltaPassed: commonmarkOfficial.passed - 360,
      phase17Failed: 292,
      phase18Failed: commonmarkOfficial.failed,
      deltaFailed: commonmarkOfficial.failed - 292,
    },
    gfm: {
      phase17Passed: 370,
      phase18Passed: gfmOfficial.passed,
      deltaPassed: gfmOfficial.passed - 370,
      phase17Failed: 302,
      phase18Failed: gfmOfficial.failed,
      deltaFailed: gfmOfficial.failed - 302,
    },
  },
};

const checklist = `# Phase 18 certification gate checklist\n\n## Gate B — certification closure from RC artifacts\n\n- [ ] Close the full official CommonMark lane (${commonmarkOfficial.passed}/${commonmarkOfficial.total} passing, ${commonmarkOfficial.failed} failing).\n- [ ] Close the full official GFM lane (${gfmOfficial.passed}/${gfmOfficial.total} passing, ${gfmOfficial.failed} failing).\n- [x] Keep the claimed optional-profile lane green (${optionalProfiles.passed}/${optionalProfiles.total}).\n- [x] Keep the editor keyboard lane green.\n- [x] Keep the toolbar/selection lane green.\n- [x] Keep the preview/export lane green.\n- [x] Keep the accessibility lane green.\n- [ ] Close the browser matrix lane in a real browser environment.\n- [ ] Close the browser-driven visual regression lane.\n- [ ] Close the full packed-tarball install lane for the release set.\n- [x] Keep the extension activation/compatibility lane green.\n- [x] Keep the docs/contract-boundary lane green.\n- [ ] Re-evaluate the hard markdown closure rule to green (currently blocked by actual official-corpus failures).\n- [x] Keep the other hard closure rules green.\n- [ ] Regenerate the final evidence bundle from a fully green run.\n\n## Result\n\nCertification is **not yet available** in this checkpoint. The remaining Gate B blockers are the two official full-corpus lanes, the browser matrix lane, the browser-driven visual regression lane, the full release-set packed tarball install lane, and the hard markdown closure rule.\n`;

const output = [
  '# Phase 18 Gate B continuation checkpoint',
  '',
  `CommonMark official: ${commonmarkOfficial.passed}/${commonmarkOfficial.total} passing (${commonmarkOfficial.failed} failing)`,
  `GFM official: ${gfmOfficial.passed}/${gfmOfficial.total} passing (${gfmOfficial.failed} failing)`,
  `Optional profiles: ${optionalProfiles.passed}/${optionalProfiles.total} passing`,
  `Certification gate summary: ${greenLaneCount}/${laneEntries.length} lanes green, ${greenHardRuleCount}/${hardRuleEntries.length} hard rules green`,
  '',
  'Remaining certification blockers:',
  ...blockers.map((entry) => `- ${entry.id}: ${entry.detail}`),
  '',
].join('\n');

await writeJson(path.join(artifactRoot, 'phase-18-certification-gate-results.json'), results);
await writeJson(path.join(artifactRoot, 'phase-18-certification-gate-checkpoint.json'), {
  phase: 18,
  generatedAt: results.generatedAt,
  checkpointType: 'gate-b-certification-closure-continuation',
  certificationPolicyModel: phase16.policy?.model ?? 'certify-first-then-promote',
  officialCorpus: {
    commonmark: { total: commonmarkOfficial.total, passed: commonmarkOfficial.passed, failed: commonmarkOfficial.failed },
    gfm: { total: gfmOfficial.total, passed: gfmOfficial.passed, failed: gfmOfficial.failed },
  },
  summary: results.summary,
  improvementOverPhase17: results.improvementOverPhase17,
  currentState: {
    certifiablyFullyFeatured: false,
    repositoryInternallyRfcCompliant: false,
    fullyMarkdownSpecCompliant: false,
  },
});
await writeText(path.join(artifactRoot, 'phase-18-certification-gate-checklist.md'), checklist);
await writeText(path.join(artifactRoot, 'phase-18-gate-b-output.txt'), output);
await writeJson(path.join(artifactRoot, 'phase-18-evidence-bundle-manifest.json'), {
  generatedAt: results.generatedAt,
  phase: 18,
  files: [
    'artifacts/conformance/latest/phase-18-commonmark-official-summary.json',
    'artifacts/conformance/latest/phase-18-gfm-official-summary.json',
    'artifacts/conformance/latest/phase-18-optional-profile-summary.json',
    'artifacts/conformance/latest/phase-18-browser-matrix-report.json',
    'artifacts/conformance/latest/phase-18-visual-regression-report.json',
    'artifacts/conformance/latest/phase-18-packed-release-set-install-report.json',
    'artifacts/conformance/latest/phase-18-packed-release-set-install-log.txt',
    'artifacts/conformance/latest/phase-18-certification-gate-results.json',
    'artifacts/conformance/latest/phase-18-certification-gate-checkpoint.json',
    'artifacts/conformance/latest/phase-18-certification-gate-checklist.md',
  ],
});

console.log(JSON.stringify(results, null, 2));
