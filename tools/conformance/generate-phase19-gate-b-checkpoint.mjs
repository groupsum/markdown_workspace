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
const phase18 = await readJson(path.join(artifactRoot, 'phase-18-certification-gate-results.json'));
const phase18Browser = await readJson(path.join(artifactRoot, 'phase-18-browser-matrix-report.json'));
const phase18Visual = await readJson(path.join(artifactRoot, 'phase-18-visual-regression-report.json'));
const phase18Packed = await readJson(path.join(artifactRoot, 'phase-18-packed-release-set-install-report.json'));

const commonmarkOfficial = runNodeJson(['packages/renderer/markdown-renderer-core/tests/commonmark-official-corpus.mjs', '--json']);
const gfmOfficial = runNodeJson(['packages/renderer/markdown-renderer-core/tests/gfm-official-corpus.mjs', '--json']);
const optionalProfiles = runNodeJson(['packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs', '--json']);

await writeJson(path.join(artifactRoot, 'phase-19-commonmark-official-summary.json'), commonmarkOfficial);
await writeJson(path.join(artifactRoot, 'phase-19-gfm-official-summary.json'), gfmOfficial);
await writeJson(path.join(artifactRoot, 'phase-19-optional-profile-summary.json'), optionalProfiles);

const browserMatrixReport = {
  ...phase18Browser,
  generatedAt: new Date().toISOString(),
  phase: 19,
  note: 'Blocked state carried forward pending a real browser-capable environment.',
};
const visualRegressionReport = {
  ...phase18Visual,
  generatedAt: new Date().toISOString(),
  phase: 19,
  note: 'Blocked state carried forward pending a real browser-driven visual-diff run.',
};
const packedInstallReport = {
  ...phase18Packed,
  generatedAt: new Date().toISOString(),
  phase: 19,
  note: 'Blocked state carried forward pending a full release-set packed install rerun in the required environment.',
};
await writeJson(path.join(artifactRoot, 'phase-19-browser-matrix-report.json'), browserMatrixReport);
await writeJson(path.join(artifactRoot, 'phase-19-visual-regression-report.json'), visualRegressionReport);
await writeJson(path.join(artifactRoot, 'phase-19-packed-release-set-install-report.json'), packedInstallReport);
await writeText(path.join(artifactRoot, 'phase-19-packed-release-set-install-log.txt'), 'Phase 19 carries forward the blocked packed-release-set install state. Re-run this lane in the required environment after the next corpus-fixing RC.\n');

const laneStatuses = {
  commonmarkOfficialCorpusLane: lane(commonmarkOfficial.failed === 0 ? 'green' : 'blocked', `${commonmarkOfficial.passed}/${commonmarkOfficial.total} official CommonMark corpus cases passed.`, ['artifacts/conformance/latest/phase-19-commonmark-official-summary.json']),
  gfmOfficialCorpusLane: lane(gfmOfficial.failed === 0 ? 'green' : 'blocked', `${gfmOfficial.passed}/${gfmOfficial.total} official GFM corpus cases passed.`, ['artifacts/conformance/latest/phase-19-gfm-official-summary.json']),
  optionalExtensionProfileLanes: lane(optionalProfiles.failed === 0 ? 'green' : 'blocked', `${optionalProfiles.passed}/${optionalProfiles.total} claimed optional-profile checks passed.`, ['artifacts/conformance/latest/phase-19-optional-profile-summary.json']),
  editorKeyboardLane: phase12.closureLanes.editorKeyboardLane,
  toolbarSelectionLane: phase12.closureLanes.toolbarSelectionLane,
  previewExportLane: phase12.closureLanes.previewExportLane,
  accessibilityLane: phase12.closureLanes.accessibilityLane,
  browserMatrixLane: lane('blocked', browserMatrixReport.reason || 'Browser matrix remains blocked in the current environment.', ['artifacts/conformance/latest/phase-19-browser-matrix-report.json']),
  visualRegressionLane: lane('blocked', visualRegressionReport.reason || 'Visual regression remains blocked in the current environment.', ['artifacts/conformance/latest/phase-19-visual-regression-report.json']),
  packedTarballInstallLane: lane('blocked', packedInstallReport.reason || 'Full release-set packed install remains blocked in the current environment.', ['artifacts/conformance/latest/phase-19-packed-release-set-install-report.json', 'artifacts/conformance/latest/phase-19-packed-release-set-install-log.txt']),
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
  phase: 19,
  basis: 'Gate B — certification closure from RC artifacts (continuation checkpoint)',
  inheritedEvidence: {
    phase12ClosureSuitePath: 'artifacts/conformance/latest/phase-12-closure-suite-results.json',
    phase16CertificationPolicyPath: 'artifacts/conformance/latest/phase-16-certification-gate-results.json',
    phase18GateBPath: 'artifacts/conformance/latest/phase-18-certification-gate-results.json',
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
  improvementOverPhase18: {
    commonmark: {
      phase18Passed: 404,
      phase19Passed: commonmarkOfficial.passed,
      deltaPassed: commonmarkOfficial.passed - 404,
      phase18Failed: 248,
      phase19Failed: commonmarkOfficial.failed,
      deltaFailed: commonmarkOfficial.failed - 248,
    },
    gfm: {
      phase18Passed: 414,
      phase19Passed: gfmOfficial.passed,
      deltaPassed: gfmOfficial.passed - 414,
      phase18Failed: 258,
      phase19Failed: gfmOfficial.failed,
      deltaFailed: gfmOfficial.failed - 258,
    },
  },
};

const checklist = `# Phase 19 certification gate checklist\n\n## Gate B — certification closure from RC artifacts\n\n- [ ] Close the full official CommonMark lane (${commonmarkOfficial.passed}/${commonmarkOfficial.total} passing, ${commonmarkOfficial.failed} failing).\n- [ ] Close the full official GFM lane (${gfmOfficial.passed}/${gfmOfficial.total} passing, ${gfmOfficial.failed} failing).\n- [x] Keep the claimed optional-profile lane green (${optionalProfiles.passed}/${optionalProfiles.total}).\n- [x] Keep the editor keyboard lane green.\n- [x] Keep the toolbar/selection lane green.\n- [x] Keep the preview/export lane green.\n- [x] Keep the accessibility lane green.\n- [ ] Close the browser matrix lane in a real browser environment.\n- [ ] Close the browser-driven visual regression lane.\n- [ ] Close the full packed-tarball install lane for the release set.\n- [x] Keep the extension activation/compatibility lane green.\n- [x] Keep the docs/contract-boundary lane green.\n- [ ] Re-evaluate the hard markdown closure rule to green (currently blocked by actual official-corpus failures).\n- [x] Keep the other hard closure rules green.\n- [ ] Regenerate the final evidence bundle from a fully green run.\n\n## Result\n\nCertification is **not yet available** in this checkpoint. The remaining Gate B blockers are the two official full-corpus lanes, the browser matrix lane, the browser-driven visual regression lane, the full release-set packed tarball install lane, and the hard markdown closure rule.\n`;

const output = [
  '# Phase 19 Gate B continuation checkpoint',
  '',
  `CommonMark official: ${commonmarkOfficial.passed}/${commonmarkOfficial.total} passing (${commonmarkOfficial.failed} failing)`,
  `GFM official: ${gfmOfficial.passed}/${gfmOfficial.total} passing (${gfmOfficial.failed} failing)`,
  `Optional profiles: ${optionalProfiles.passed}/${optionalProfiles.total} passing`,
  `Certification gate summary: ${greenLaneCount}/${laneEntries.length} lanes green`,
  `Hard closure rules: ${greenHardRuleCount}/${hardRuleEntries.length} green`,
  '',
  'The checkpoint improves the official CommonMark and GFM lanes further, but certification remains blocked.',
].join('\n');

await writeJson(path.join(artifactRoot, 'phase-19-certification-gate-results.json'), results);
await writeJson(path.join(artifactRoot, 'phase-19-certification-gate-checkpoint.json'), {
  phase: 19,
  generatedAt: new Date().toISOString(),
  checkpointType: 'gate-b-certification-closure-continuation',
  summary: results.summary,
  improvementOverPhase18: results.improvementOverPhase18,
  evidence: {
    commonmark: 'artifacts/conformance/latest/phase-19-commonmark-official-summary.json',
    gfm: 'artifacts/conformance/latest/phase-19-gfm-official-summary.json',
    optionalProfiles: 'artifacts/conformance/latest/phase-19-optional-profile-summary.json',
    results: 'artifacts/conformance/latest/phase-19-certification-gate-results.json',
    checklist: 'artifacts/conformance/latest/phase-19-certification-gate-checklist.md',
  },
  currentState: {
    certifiablyFullyFeatured: false,
    repositoryInternallyRfcCompliant: false,
    fullyMarkdownSpecCompliant: false,
  },
});
await writeText(path.join(artifactRoot, 'phase-19-certification-gate-checklist.md'), checklist);
await writeText(path.join(artifactRoot, 'phase-19-gate-b-output.txt'), `${output}\n`);

console.log('phase 19 Gate B checkpoint artifacts generated');
