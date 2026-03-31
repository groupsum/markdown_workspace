import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import {
  ensureDir,
  pathExists,
  readJson,
  repoRoot,
  writeJson,
  writeText,
} from '../lib/workspace.mjs';

const artifactRoot = path.join(repoRoot, 'artifacts', 'conformance', 'latest');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024,
    shell: false,
    ...options,
  });
  return {
    ok: (result.status ?? 1) === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function runNodeJson(args) {
  const result = run(process.execPath, args);
  if (!result.stdout) {
    throw new Error(`No stdout from node ${args.join(' ')}\n${result.stderr}`);
  }
  return JSON.parse(result.stdout);
}

function lane(status, summary, artifacts = [], notes = []) {
  return { status, summary, artifacts, notes };
}

async function createBrowserMatrixReport() {
  const playwrightInstalled = await pathExists(path.join(repoRoot, 'node_modules', 'playwright'));
  const playwrightConfigPresent = await pathExists(path.join(repoRoot, 'playwright.config.ts'));
  const playwrightSpecsDir = path.join(repoRoot, 'apps', 'client', 'tests', 'playwright');
  const playwrightSpecs = await pathExists(playwrightSpecsDir)
    ? (await fs.readdir(playwrightSpecsDir)).filter((entry) => entry.endsWith('.ts') || entry.endsWith('.tsx'))
    : [];
  const binaries = {
    chromium: run('bash', ['-lc', 'command -v chromium || command -v chromium-browser || command -v google-chrome || true']).stdout.trim() || null,
    firefox: run('bash', ['-lc', 'command -v firefox || true']).stdout.trim() || null,
    webkit: run('bash', ['-lc', 'command -v safari || command -v webkit2png || true']).stdout.trim() || null,
  };
  const report = {
    generatedAt: new Date().toISOString(),
    status: 'blocked',
    playwrightInstalled,
    playwrightConfigPresent,
    playwrightSpecs,
    browsers: binaries,
    reason: playwrightInstalled
      ? 'Playwright browser execution is configured but the current checkpoint environment does not provide a complete browser matrix run.'
      : 'Playwright is not installed in the current checkpoint environment, so a real browser matrix run cannot execute here.',
  };
  await writeJson(path.join(artifactRoot, 'phase-17-browser-matrix-report.json'), report);
  return report;
}

async function createVisualRegressionReport(browserMatrixReport) {
  const phase9Visual = await readJson(path.join(artifactRoot, 'phase-9-theme-visual-baselines.json'));
  const report = {
    generatedAt: new Date().toISOString(),
    status: 'blocked',
    staticVisualBaselines: {
      count: phase9Visual.count,
      smokeThemeIds: phase9Visual.smokeThemeIds,
      indexPath: phase9Visual.indexPath,
    },
    playwrightConfigPresent: browserMatrixReport.playwrightConfigPresent,
    playwrightSpecs: browserMatrixReport.playwrightSpecs,
    reason: browserMatrixReport.playwrightInstalled
      ? 'Static HTML visual baselines are present, but a browser-driven pixel-diff run has not been executed in this environment.'
      : 'Static HTML visual baselines are present, but Playwright is not installed and no browser-driven pixel-diff run can be executed in this environment.',
  };
  await writeJson(path.join(artifactRoot, 'phase-17-visual-regression-report.json'), report);
  return report;
}

async function createPackedReleaseSetInstallReport() {
  const tempDir = path.join(repoRoot, '.tmp', 'phase17-packed-release-set-install');
  await fs.rm(tempDir, { recursive: true, force: true });
  await fs.mkdir(tempDir, { recursive: true });
  const init = run('npm', ['init', '-y'], { cwd: tempDir });
  const packDir = path.join(repoRoot, 'artifacts', 'packs');
  const tarballs = (await fs.readdir(packDir)).filter((entry) => entry.endsWith('.tgz')).sort();
  const install = run('npm', ['install', '--ignore-scripts', ...tarballs.map((entry) => path.join(packDir, entry))], {
    cwd: tempDir,
    env: { ...process.env },
  });
  const logText = [
    '# Phase 17 full release-set packed install attempt',
    '',
    '$ npm init -y',
    init.stdout || init.stderr,
    '',
    '$ npm install --ignore-scripts artifacts/packs/*.tgz',
    install.stdout || install.stderr,
    '',
  ].join('\n');
  await writeText(path.join(artifactRoot, 'phase-17-packed-release-set-install-log.txt'), logText);
  const report = {
    generatedAt: new Date().toISOString(),
    status: install.ok ? 'green' : 'blocked',
    tarballCount: tarballs.length,
    tarballs,
    reason: install.ok
      ? 'Full release-set tarballs installed successfully in the current environment.'
      : 'Full release-set tarball install remains blocked in the current environment. See the log for the current failure mode.',
    installStatus: install.status,
  };
  await writeJson(path.join(artifactRoot, 'phase-17-packed-release-set-install-report.json'), report);
  return report;
}

const phase11 = await readJson(path.join(artifactRoot, 'phase-11-package-evidence.json'));
const phase12 = await readJson(path.join(artifactRoot, 'phase-12-closure-suite-results.json'));
const phase13 = await readJson(path.join(artifactRoot, 'phase-13-rc-train-results.json'));
const phase16 = await readJson(path.join(artifactRoot, 'phase-16-certification-gate-results.json'));

const commonmarkOfficial = runNodeJson(['packages/renderer/markdown-renderer-core/tests/commonmark-official-corpus.mjs', '--json']);
const gfmOfficial = runNodeJson(['packages/renderer/markdown-renderer-core/tests/gfm-official-corpus.mjs', '--json']);
const optionalProfiles = runNodeJson(['packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs', '--json']);

await writeJson(path.join(artifactRoot, 'phase-17-commonmark-official-summary.json'), commonmarkOfficial);
await writeJson(path.join(artifactRoot, 'phase-17-gfm-official-summary.json'), gfmOfficial);
await writeJson(path.join(artifactRoot, 'phase-17-optional-profile-summary.json'), optionalProfiles);

const browserMatrixReport = await createBrowserMatrixReport();
const visualRegressionReport = await createVisualRegressionReport(browserMatrixReport);
const packedInstallReport = await createPackedReleaseSetInstallReport();

const laneStatuses = {
  commonmarkOfficialCorpusLane: lane(commonmarkOfficial.failed === 0 ? 'green' : 'blocked', `${commonmarkOfficial.passed}/${commonmarkOfficial.total} official CommonMark corpus cases passed.`, ['artifacts/conformance/latest/phase-17-commonmark-official-summary.json']),
  gfmOfficialCorpusLane: lane(gfmOfficial.failed === 0 ? 'green' : 'blocked', `${gfmOfficial.passed}/${gfmOfficial.total} official GFM corpus cases passed.`, ['artifacts/conformance/latest/phase-17-gfm-official-summary.json']),
  optionalExtensionProfileLanes: lane(optionalProfiles.failed === 0 ? 'green' : 'blocked', `${optionalProfiles.passed}/${optionalProfiles.total} claimed optional-profile checks passed.`, ['artifacts/conformance/latest/phase-17-optional-profile-summary.json']),
  editorKeyboardLane: phase12.closureLanes.editorKeyboardLane,
  toolbarSelectionLane: phase12.closureLanes.toolbarSelectionLane,
  previewExportLane: phase12.closureLanes.previewExportLane,
  accessibilityLane: phase12.closureLanes.accessibilityLane,
  browserMatrixLane: lane(browserMatrixReport.status === 'green' ? 'green' : 'blocked', browserMatrixReport.reason, ['artifacts/conformance/latest/phase-17-browser-matrix-report.json']),
  visualRegressionLane: lane(visualRegressionReport.status === 'green' ? 'green' : 'blocked', visualRegressionReport.reason, ['artifacts/conformance/latest/phase-17-visual-regression-report.json']),
  packedTarballInstallLane: lane(packedInstallReport.status === 'green' ? 'green' : 'blocked', packedInstallReport.reason, ['artifacts/conformance/latest/phase-17-packed-release-set-install-report.json', 'artifacts/conformance/latest/phase-17-packed-release-set-install-log.txt']),
  extensionActivationCompatibilityLane: phase12.closureLanes.extensionActivationCompatibilityLane,
  docsContractBoundaryLane: phase12.closureLanes.docsContractBoundaryLane,
};

const hardClosureRules = {
  noUnresolvedP0MarkdownConformanceFailures: {
    status: commonmarkOfficial.failed === 0 && gfmOfficial.failed === 0 && optionalProfiles.failed === 0 ? 'green' : 'blocked',
    note: commonmarkOfficial.failed === 0 && gfmOfficial.failed === 0 && optionalProfiles.failed === 0
      ? 'Full official CommonMark/GFM corpus lanes and the claimed optional-profile lane are all green.'
      : `Hard closure remains blocked because the full official corpus lanes still have unresolved failures (CommonMark: ${commonmarkOfficial.failed}, GFM: ${gfmOfficial.failed}, optional profiles: ${optionalProfiles.failed}).`,
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

const results = {
  generatedAt: new Date().toISOString(),
  phase: 17,
  basis: 'Gate B — certification closure from RC artifacts',
  inheritedEvidence: {
    phase11PackageEvidencePath: 'artifacts/conformance/latest/phase-11-package-evidence.json',
    phase12ClosureSuitePath: 'artifacts/conformance/latest/phase-12-closure-suite-results.json',
    phase13RcValidationPath: 'artifacts/conformance/latest/phase-13-rc-train-results.json',
    phase16CertificationPolicyPath: 'artifacts/conformance/latest/phase-16-certification-gate-results.json',
  },
  laneStatuses,
  hardClosureRules,
  summary: {
    greenLaneCount,
    blockedLaneCount,
    greenHardClosureRules: greenHardRuleCount,
    blockedHardClosureRules: blockedHardRuleCount,
    certificationReady: greenLaneCount === laneEntries.length && greenHardRuleCount === hardRuleEntries.length,
  },
  blockers: {
    certificationGate: [
      ...laneEntries.filter(([, laneDef]) => laneDef.status !== 'green').map(([id, laneDef]) => ({ id, detail: laneDef.summary })),
      ...hardRuleEntries.filter(([, rule]) => rule.status !== 'green').map(([id, rule]) => ({ id, detail: rule.note })),
    ],
  },
};

const checklist = `# Phase 17 certification gate checklist\n\n## Gate B — certification closure from RC artifacts\n\n- [ ] Close the full official CommonMark lane (${commonmarkOfficial.passed}/${commonmarkOfficial.total} passing, ${commonmarkOfficial.failed} failing).\n- [ ] Close the full official GFM lane (${gfmOfficial.passed}/${gfmOfficial.total} passing, ${gfmOfficial.failed} failing).\n- [x] Keep the claimed optional-profile lane green (${optionalProfiles.passed}/${optionalProfiles.total}).\n- [x] Keep the editor keyboard lane green.\n- [x] Keep the toolbar/selection lane green.\n- [x] Keep the preview/export lane green.\n- [x] Keep the accessibility lane green.\n- [ ] Close the browser matrix lane in a real browser environment.\n- [ ] Close the browser-driven visual regression lane.\n- [ ] Close the full packed-tarball install lane for the release set.\n- [x] Keep the extension activation/compatibility lane green.\n- [x] Keep the docs/contract-boundary lane green.\n- [ ] Re-evaluate the hard markdown closure rule to green (currently blocked by actual full-corpus failures).\n- [x] Keep the other hard closure rules green.\n- [ ] Regenerate the final evidence bundle from a fully green run.\n\n## Result\n\nCertification is **not yet available** in this checkpoint. The remaining Gate B blockers are the two official full-corpus lanes, the browser matrix lane, the browser-driven visual regression lane, the full packed-tarball install lane, and the hard markdown closure rule.\n`;

const outputLines = [
  '# Phase 17 Gate B closure rerun',
  '',
  `CommonMark official: ${commonmarkOfficial.passed}/${commonmarkOfficial.total} passing`,
  `GFM official: ${gfmOfficial.passed}/${gfmOfficial.total} passing`,
  `Optional profiles: ${optionalProfiles.passed}/${optionalProfiles.total} passing`,
  `Certification gate summary: ${greenLaneCount}/${laneEntries.length} lanes green, ${greenHardRuleCount}/${hardRuleEntries.length} hard rules green`,
  '',
  'Blocked certification items:',
  ...results.blockers.certificationGate.map((entry) => `- ${entry.id}: ${entry.detail}`),
  '',
].join('\n');

await ensureDir(artifactRoot);
await writeJson(path.join(artifactRoot, 'phase-17-certification-gate-results.json'), results);
await writeJson(path.join(artifactRoot, 'phase-17-certification-gate-checkpoint.json'), {
  phase: 17,
  generatedAt: results.generatedAt,
  checkpointType: 'gate-b-certification-closure-rerun',
  packageEvidencePassed: phase11.summary?.passedChecks ?? phase11.passedChecks ?? null,
  rcEvidenceOk: phase13.ok === true,
  certificationPolicyModel: phase16.policy?.model ?? 'certify-first-then-promote',
  officialCorpus: {
    commonmark: { total: commonmarkOfficial.total, passed: commonmarkOfficial.passed, failed: commonmarkOfficial.failed },
    gfm: { total: gfmOfficial.total, passed: gfmOfficial.passed, failed: gfmOfficial.failed },
  },
  summary: results.summary,
  currentState: {
    certifiablyFullyFeatured: false,
    repositoryInternallyRfcCompliant: false,
    fullyMarkdownSpecCompliant: false,
  },
});
await writeText(path.join(artifactRoot, 'phase-17-certification-gate-checklist.md'), checklist);
await writeText(path.join(artifactRoot, 'phase-17-gate-b-output.txt'), outputLines);
await writeJson(path.join(artifactRoot, 'phase-17-evidence-bundle-manifest.json'), {
  generatedAt: results.generatedAt,
  phase: 17,
  files: [
    'artifacts/conformance/latest/phase-17-commonmark-official-summary.json',
    'artifacts/conformance/latest/phase-17-gfm-official-summary.json',
    'artifacts/conformance/latest/phase-17-optional-profile-summary.json',
    'artifacts/conformance/latest/phase-17-browser-matrix-report.json',
    'artifacts/conformance/latest/phase-17-visual-regression-report.json',
    'artifacts/conformance/latest/phase-17-packed-release-set-install-report.json',
    'artifacts/conformance/latest/phase-17-packed-release-set-install-log.txt',
    'artifacts/conformance/latest/phase-17-certification-gate-results.json',
    'artifacts/conformance/latest/phase-17-certification-gate-checkpoint.json',
    'artifacts/conformance/latest/phase-17-certification-gate-checklist.md',
  ],
});

console.log(JSON.stringify(results, null, 2));
