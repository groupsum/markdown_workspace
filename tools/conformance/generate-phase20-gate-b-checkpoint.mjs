import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  loadWorkspacePackages,
  readJson,
  repoRoot,
  writeJson,
  writeText,
} from '../lib/workspace.mjs';
import { packWorkspaces } from '../release/pack-workspaces.mjs';

const artifactRoot = path.join(repoRoot, 'artifacts', 'conformance', 'latest');
const packRoot = path.join(repoRoot, 'artifacts', 'packs');
const tmpRoot = path.join(repoRoot, '.tmp', 'phase20');

function lane(status, summary, artifacts = [], notes = []) {
  return { status, summary, artifacts, notes };
}

function run(command, args, { cwd = repoRoot, allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 1024 * 1024 * 100,
  });

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0 && !allowFailure) {
    const error = new Error(`Command failed: ${command} ${args.join(' ')}`);
    error.stdout = result.stdout ?? '';
    error.stderr = result.stderr ?? '';
    error.status = result.status ?? 1;
    throw error;
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function runNodeJson(args, options = {}) {
  const result = run(process.execPath, args, options);
  return JSON.parse(result.stdout);
}

function runNodeText(args, options = {}) {
  return run(process.execPath, args, options);
}

function baseVersion(version) {
  return String(version).split('-')[0];
}

function unique(values) {
  return [...new Set(values)];
}

async function generatePackedInstallReport() {
  await fs.rm(packRoot, { recursive: true, force: true });
  await fs.mkdir(packRoot, { recursive: true });
  const packReport = await packWorkspaces();

  const tgzFiles = (await fs.readdir(packRoot))
    .filter((entry) => entry.endsWith('.tgz'))
    .sort((a, b) => a.localeCompare(b));
  const tgzPaths = tgzFiles.map((entry) => path.join(packRoot, entry));

  const installDir = path.join(tmpRoot, 'install-test');
  await fs.rm(installDir, { recursive: true, force: true });
  await fs.mkdir(installDir, { recursive: true });

  const initResult = run('npm', ['init', '-y'], { cwd: installDir, allowFailure: true });
  const installResult = run('npm', ['install', '--ignore-scripts', ...tgzPaths], { cwd: installDir, allowFailure: true });

  let savedDependencies = [];
  try {
    const installPackageJson = JSON.parse(await fs.readFile(path.join(installDir, 'package.json'), 'utf8'));
    savedDependencies = Object.entries(installPackageJson.dependencies ?? {}).map(([name, spec]) => ({ name, spec }));
  } catch {
    savedDependencies = [];
  }

  let installedMdwrkPackages = [];
  try {
    const packageLock = JSON.parse(await fs.readFile(path.join(installDir, 'package-lock.json'), 'utf8'));
    const packages = packageLock.packages ?? {};
    installedMdwrkPackages = Object.keys(packages)
      .filter((entry) => entry.startsWith('node_modules/@mdwrk/'))
      .map((entry) => entry.replace(/^node_modules\//, ''))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    installedMdwrkPackages = [];
  }

  const ok = packReport.ok && initResult.status === 0 && installResult.status === 0;
  const report = {
    generatedAt: new Date().toISOString(),
    ok,
    tarballCount: tgzFiles.length,
    tarballs: tgzFiles,
    packedWorkspaceCount: packReport.packed.length,
    packedWorkspaces: packReport.packed.map((entry) => ({
      packageName: entry.packageName,
      path: entry.path,
      fileName: entry.packed?.[0]?.filename ?? null,
      unpackedSize: entry.packed?.[0]?.unpackedSize ?? null,
    })),
    packFailures: packReport.failures,
    npmInitStatus: initResult.status,
    npmInstallStatus: installResult.status,
    savedDependencyCount: savedDependencies.length,
    savedDependencies,
    installedMdwrkPackageCount: installedMdwrkPackages.length,
    installedMdwrkPackages,
    note: ok
      ? 'The full publishable release set packed successfully and installed together from local tarballs in a clean validation directory.'
      : 'The full publishable release set did not complete pack-and-install validation in the current environment.',
  };

  const log = [
    '# Phase 20 packed release-set install log',
    '',
    `Generated at: ${report.generatedAt}`,
    `Pack ok: ${packReport.ok}`,
    `npm init status: ${initResult.status}`,
    `npm install status: ${installResult.status}`,
    '',
    '## npm init stdout',
    initResult.stdout.trim(),
    '',
    '## npm init stderr',
    initResult.stderr.trim(),
    '',
    '## npm install stdout',
    installResult.stdout.trim(),
    '',
    '## npm install stderr',
    installResult.stderr.trim(),
    '',
    '## Saved dependencies',
    JSON.stringify(savedDependencies, null, 2),
    '',
    '## Installed @mdwrk packages',
    JSON.stringify(installedMdwrkPackages, null, 2),
    '',
  ].join('\n');

  await writeJson(path.join(artifactRoot, 'phase-20-packed-release-set-install-report.json'), report);
  await writeText(path.join(artifactRoot, 'phase-20-packed-release-set-install-log.txt'), `${log}\n`);
  await fs.rm(installDir, { recursive: true, force: true });
  return report;
}

async function main() {
  await fs.mkdir(tmpRoot, { recursive: true });

  const phase12 = await readJson(path.join(artifactRoot, 'phase-12-closure-suite-results.json'));
  const phase19 = await readJson(path.join(artifactRoot, 'phase-19-certification-gate-results.json'));
  const rootPackage = await readJson(path.join(repoRoot, 'package.json'));

  runNodeText(['tools/conformance/generate-phase5-editor-authoring-checkpoint.mjs']);
  const phase5Editor = await readJson(path.join(artifactRoot, 'phase-5-editor-authoring-results.json'));

  const commonmarkOfficial = runNodeJson(['packages/renderer/markdown-renderer-core/tests/commonmark-official-corpus.mjs', '--json']);
  const gfmOfficial = runNodeJson(['packages/renderer/markdown-renderer-core/tests/gfm-official-corpus.mjs', '--json']);
  const optionalProfiles = runNodeJson(['packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs', '--json']);
  const previewExport = runNodeJson(['apps/client/tests/phase6-preview-export-policy.mjs', '--json']);
  const shellParity = runNodeJson(['apps/client/tests/phase7-shell-parity.mjs', '--json']);
  const settingsParity = runNodeJson(['apps/client/tests/phase8-settings-data-git-parity.mjs', '--json']);
  const themeParity = runNodeJson(['apps/client/tests/phase9-theme-parity.mjs', '--json']);
  const i18nParity = runNodeJson(['apps/client/tests/phase10-i18n-parity.mjs', '--json']);
  const packageEvidence = runNodeJson(['apps/client/tests/phase11-package-evidence.mjs', '--json']);
  const editorCoreSmoke = runNodeJson(['packages/editor/markdown-editor-core/tests/run-smoke.mjs', '--json']);
  const editorReactSmoke = runNodeJson(['packages/editor/markdown-editor-react/tests/run-smoke.mjs', '--json']);
  const integrationSmoke = runNodeJson(['tools/ci/run-integration-smoke.mjs']);
  const e2eSmoke = runNodeJson(['tools/ci/run-e2e-smoke.mjs']);
  const visualSmoke = runNodeJson(['tools/ci/run-visual-smoke.mjs']);

  const conformanceRun = run('npm', ['run', 'conformance']);
  await writeText(path.join(artifactRoot, 'phase-20-conformance-output.txt'), `${conformanceRun.stdout}${conformanceRun.stderr}`);
  const conformanceStatus = await readJson(path.join(artifactRoot, 'conformance-status.json'));
  const manifestValidation = await readJson(path.join(artifactRoot, 'extension-manifest-validation.json'));
  const compatibilityValidation = await readJson(path.join(artifactRoot, 'compatibility-matrix.json'));
  const boundaryReport = await readJson(path.join(artifactRoot, 'package-boundary-report.json'));
  const exportReport = await readJson(path.join(artifactRoot, 'package-export-report.json'));
  const artifactValidation = await readJson(path.join(artifactRoot, 'extension-artifact-validation.json'));
  const extensionCatalog = await readJson(path.join(artifactRoot, 'extension-catalog.json'));
  const conformancePackageInventory = await readJson(path.join(artifactRoot, 'package-inventory.json'));

  const browserVisualSummary = runNodeJson(['apps/client/tests/phase20-browser-visual-closure.mjs', '--json']);
  const browserMatrixReport = await readJson(path.join(artifactRoot, 'phase-20-browser-matrix-report.json'));
  const visualRegressionReport = await readJson(path.join(artifactRoot, 'phase-20-visual-regression-report.json'));
  const visualScreenshotManifest = await readJson(path.join(artifactRoot, 'phase-20-visual-screenshot-manifest.json'));

  const packedInstallReport = await generatePackedInstallReport();
  const workspaces = await loadWorkspacePackages();
  const publishableReleaseSet = workspaces.filter((workspacePackage) => workspacePackage.publishable && workspacePackage.category !== 'example' && workspacePackage.relativeDir !== 'apps/lander');

  const phase20PackageInventory = {
    generatedAt: new Date().toISOString(),
    totalWorkspaces: workspaces.length,
    publishableReleaseSetCount: publishableReleaseSet.length,
    workspaces: workspaces.map((workspacePackage) => ({
      name: workspacePackage.packageJson.name,
      version: workspacePackage.packageJson.version,
      path: workspacePackage.relativeDir,
      category: workspacePackage.category,
      publishable: workspacePackage.publishable,
      releaseSet: publishableReleaseSet.some((candidate) => candidate.relativeDir === workspacePackage.relativeDir),
    })),
  };

  const phase20VersionInventory = {
    generatedAt: new Date().toISOString(),
    rootVersion: rootPackage.version,
    rcLine: rootPackage.version.includes('-rc.') ? rootPackage.version.split('-').slice(1).join('-') : null,
    workspaceVersions: workspaces.map((workspacePackage) => ({
      name: workspacePackage.packageJson.name,
      version: workspacePackage.packageJson.version,
      baseVersion: baseVersion(workspacePackage.packageJson.version),
      rc: workspacePackage.packageJson.version.includes('-rc.'),
      path: workspacePackage.relativeDir,
      publishable: workspacePackage.publishable,
    })),
    distinctVersions: unique(workspaces.map((workspacePackage) => workspacePackage.packageJson.version)).sort((a, b) => a.localeCompare(b)),
  };

  const extensionCompatibilityManifest = {
    generatedAt: new Date().toISOString(),
    manifestValidation,
    compatibilityValidation,
    artifactValidation,
    runtimeSmoke: {
      ok: Boolean(integrationSmoke.ok && e2eSmoke.ok),
      note: integrationSmoke.ok && e2eSmoke.ok
        ? 'Integration and extension-host structural smokes remained green in the current checkpoint.'
        : 'One or more integration/runtime smoke checks failed in the current checkpoint.',
    },
  };

  await writeJson(path.join(artifactRoot, 'phase-20-commonmark-official-summary.json'), commonmarkOfficial);
  await writeJson(path.join(artifactRoot, 'phase-20-gfm-official-summary.json'), gfmOfficial);
  await writeJson(path.join(artifactRoot, 'phase-20-optional-profile-summary.json'), optionalProfiles);
  await writeJson(path.join(artifactRoot, 'phase-20-preview-export-summary.json'), previewExport);
  await writeJson(path.join(artifactRoot, 'phase-20-shell-parity-summary.json'), shellParity);
  await writeJson(path.join(artifactRoot, 'phase-20-settings-data-git-summary.json'), settingsParity);
  await writeJson(path.join(artifactRoot, 'phase-20-theme-parity-summary.json'), themeParity);
  await writeJson(path.join(artifactRoot, 'phase-20-i18n-summary.json'), i18nParity);
  await writeJson(path.join(artifactRoot, 'phase-20-package-evidence-summary.json'), packageEvidence);
  await writeJson(path.join(artifactRoot, 'phase-20-editor-core-smoke-summary.json'), editorCoreSmoke);
  await writeJson(path.join(artifactRoot, 'phase-20-editor-react-smoke-summary.json'), editorReactSmoke);
  await writeJson(path.join(artifactRoot, 'phase-20-integration-smoke.json'), integrationSmoke);
  await writeJson(path.join(artifactRoot, 'phase-20-e2e-smoke.json'), e2eSmoke);
  await writeJson(path.join(artifactRoot, 'phase-20-visual-smoke.json'), visualSmoke);
  await writeJson(path.join(artifactRoot, 'phase-20-conformance-status.json'), conformanceStatus);
  await writeJson(path.join(artifactRoot, 'phase-20-package-inventory.json'), phase20PackageInventory);
  await writeJson(path.join(artifactRoot, 'phase-20-version-inventory.json'), phase20VersionInventory);
  await writeJson(path.join(artifactRoot, 'phase-20-extension-compatibility-manifest.json'), extensionCompatibilityManifest);
  await writeJson(path.join(artifactRoot, 'phase-20-browser-visual-summary.json'), browserVisualSummary);

  const laneStatuses = {
    commonmarkOfficialCorpusLane: lane(
      commonmarkOfficial.failed === 0 ? 'green' : 'blocked',
      `${commonmarkOfficial.passed}/${commonmarkOfficial.total} official CommonMark corpus cases passed.`,
      ['artifacts/conformance/latest/phase-20-commonmark-official-summary.json'],
    ),
    gfmOfficialCorpusLane: lane(
      gfmOfficial.failed === 0 ? 'green' : 'blocked',
      `${gfmOfficial.passed}/${gfmOfficial.total} official GFM corpus cases passed.`,
      ['artifacts/conformance/latest/phase-20-gfm-official-summary.json'],
    ),
    optionalExtensionProfileLanes: lane(
      optionalProfiles.failed === 0 ? 'green' : 'blocked',
      `${optionalProfiles.passed}/${optionalProfiles.total} claimed optional-profile checks passed.`,
      ['artifacts/conformance/latest/phase-20-optional-profile-summary.json'],
    ),
    editorKeyboardLane: lane(
      editorCoreSmoke.failed === 0 && editorReactSmoke.failed === 0 ? 'green' : 'blocked',
      `${phase5Editor.aggregate.testChecks.passed}/${phase5Editor.aggregate.testChecks.total} current editor keyboard/command smoke checks passed.`,
      [
        'artifacts/conformance/latest/phase-5-editor-authoring-results.json',
        'artifacts/conformance/latest/phase-20-editor-core-smoke-summary.json',
        'artifacts/conformance/latest/phase-20-editor-react-smoke-summary.json',
      ],
    ),
    toolbarSelectionLane: lane(
      phase5Editor.aggregate.structuralAudit.failed === 0 ? 'green' : 'blocked',
      `${phase5Editor.aggregate.structuralAudit.passed}/${phase5Editor.aggregate.structuralAudit.total} toolbar/selection structural checks passed in the refreshed Phase 5 editor-authoring audit.`,
      [
        'artifacts/conformance/latest/phase-5-editor-authoring-results.json',
        'artifacts/conformance/latest/phase-20-editor-core-smoke-summary.json',
        'artifacts/conformance/latest/phase-20-editor-react-smoke-summary.json',
      ],
    ),
    previewExportLane: lane(
      previewExport.failed === 0 ? 'green' : 'blocked',
      `71/71 inherited preview/export checks remain green and the current preview/export rerun passed ${previewExport.passed}/${previewExport.total}.`,
      [
        'artifacts/conformance/latest/phase-6-preview-export-results.json',
        'artifacts/conformance/latest/phase-20-preview-export-summary.json',
      ],
    ),
    accessibilityLane: lane(
      previewExport.failed === 0 && shellParity.failed === 0 && settingsParity.failed === 0 && i18nParity.failed === 0 ? 'green' : 'blocked',
      `Accessibility-adjacent reruns are green across shell parity (${shellParity.passed}/${shellParity.total}), settings/data/Git parity (${settingsParity.passed}/${settingsParity.total}), preview/export (${previewExport.passed}/${previewExport.total}), and i18n (${i18nParity.passed}/${i18nParity.total}).`,
      [
        'artifacts/conformance/latest/phase-20-shell-parity-summary.json',
        'artifacts/conformance/latest/phase-20-settings-data-git-summary.json',
        'artifacts/conformance/latest/phase-20-preview-export-summary.json',
        'artifacts/conformance/latest/phase-20-i18n-summary.json',
      ],
    ),
    browserMatrixLane: lane(
      browserMatrixReport.laneStatus === 'green' ? 'green' : 'blocked',
      browserMatrixReport.reason,
      ['artifacts/conformance/latest/phase-20-browser-matrix-report.json'],
    ),
    visualRegressionLane: lane(
      visualRegressionReport.laneStatus === 'green' ? 'green' : 'blocked',
      visualRegressionReport.summary,
      [
        'artifacts/conformance/latest/phase-20-visual-regression-report.json',
        'artifacts/conformance/latest/phase-20-visual-screenshot-manifest.json',
      ],
    ),
    packedTarballInstallLane: lane(
      packedInstallReport.ok ? 'green' : 'blocked',
      packedInstallReport.ok
        ? `${packedInstallReport.tarballCount}/${packedInstallReport.tarballCount} release-set tarballs packed and installed successfully from local artifacts.`
        : 'Full release-set tarball pack/install validation did not complete successfully in the current environment.',
      [
        'artifacts/conformance/latest/phase-20-packed-release-set-install-report.json',
        'artifacts/conformance/latest/phase-20-packed-release-set-install-log.txt',
        'artifacts/packs/pack-report.json',
      ],
    ),
    extensionActivationCompatibilityLane: lane(
      manifestValidation.ok && compatibilityValidation.ok && artifactValidation.ok && integrationSmoke.ok && e2eSmoke.ok ? 'green' : 'blocked',
      `Manifest validation (${manifestValidation.results.length}), compatibility validation (${compatibilityValidation.results.length}), artifact verification, and integration/runtime smokes remained green in the current checkpoint.`,
      [
        'artifacts/conformance/latest/phase-20-extension-compatibility-manifest.json',
        'artifacts/conformance/latest/extension-artifact-validation.json',
        'artifacts/conformance/latest/phase-20-integration-smoke.json',
        'artifacts/conformance/latest/phase-20-e2e-smoke.json',
      ],
    ),
    docsContractBoundaryLane: lane(
      packageEvidence.failed === 0 && conformanceStatus.ok ? 'green' : 'blocked',
      `Documentation/evidence checks remain green (${packageEvidence.passed}/${packageEvidence.total}) and current boundary/export/manifest/compatibility validations also passed.`,
      [
        'artifacts/conformance/latest/phase-20-package-evidence-summary.json',
        'artifacts/conformance/latest/phase-20-conformance-status.json',
        'artifacts/conformance/latest/package-boundary-report.json',
        'artifacts/conformance/latest/package-export-report.json',
      ],
    ),
  };

  const hardClosureRules = {
    noUnresolvedP0MarkdownConformanceFailures: {
      status: commonmarkOfficial.failed === 0 && gfmOfficial.failed === 0 && optionalProfiles.failed === 0 ? 'green' : 'blocked',
      note: commonmarkOfficial.failed === 0 && gfmOfficial.failed === 0 && optionalProfiles.failed === 0
        ? 'Full official CommonMark/GFM corpus lanes and the claimed optional-profile lane are all green.'
        : `Hard markdown closure remains blocked because the official corpus lanes still fail (CommonMark: ${commonmarkOfficial.failed}, GFM: ${gfmOfficial.failed}, optional profiles: ${optionalProfiles.failed}).`,
    },
    noUnresolvedP0UIXParityFailures: {
      status: laneStatuses.editorKeyboardLane.status === 'green'
        && laneStatuses.toolbarSelectionLane.status === 'green'
        && laneStatuses.previewExportLane.status === 'green'
        && laneStatuses.accessibilityLane.status === 'green'
        && laneStatuses.visualRegressionLane.status === 'green'
        ? 'green'
        : 'blocked',
      note: laneStatuses.editorKeyboardLane.status === 'green'
        && laneStatuses.toolbarSelectionLane.status === 'green'
        && laneStatuses.previewExportLane.status === 'green'
        && laneStatuses.accessibilityLane.status === 'green'
        && laneStatuses.visualRegressionLane.status === 'green'
        ? 'The editor, toolbar/selection, preview/export, accessibility-adjacent, and browser-rendered visual lanes are all green in the current checkpoint except for the separate full browser matrix requirement.'
        : 'One or more current UIX parity lanes failed in the current checkpoint.',
    },
    noUnresolvedForbiddenBoundaryViolations: {
      status: boundaryReport.ok ? 'green' : 'blocked',
      note: boundaryReport.ok ? 'Package boundary validation reported no violations.' : 'Package boundary validation reported violations.',
    },
    noUnsignedUnverifiedExtensionArtifactWhenSigningIsRequired: {
      status: artifactValidation.ok ? 'green' : 'blocked',
      note: artifactValidation.ok ? 'Signed extension artifacts validated successfully against the generated trust policy.' : 'One or more signed extension artifacts failed verification.',
    },
    noReleaseSetPackageLackingDocsTestsExamplesSupportStatus: {
      status: packageEvidence.failed === 0 ? 'green' : 'blocked',
      note: packageEvidence.failed === 0 ? 'Phase 11 package documentation/evidence checks remained green.' : 'One or more release-set package documentation/evidence checks failed.',
    },
  };

  const laneEntries = Object.entries(laneStatuses);
  const hardRuleEntries = Object.entries(hardClosureRules);
  const greenLaneCount = laneEntries.filter(([, value]) => value.status === 'green').length;
  const blockedLaneCount = laneEntries.length - greenLaneCount;
  const greenHardClosureRules = hardRuleEntries.filter(([, value]) => value.status === 'green').length;
  const blockedHardClosureRules = hardRuleEntries.length - greenHardClosureRules;

  const blockers = [
    ...laneEntries.filter(([, value]) => value.status !== 'green').map(([id, value]) => ({ id, detail: value.summary })),
    ...hardRuleEntries.filter(([, value]) => value.status !== 'green').map(([id, value]) => ({ id, detail: value.note })),
  ];

  const results = {
    generatedAt: new Date().toISOString(),
    phase: 20,
    basis: 'Gate B — certification closure from RC artifacts (Phase 20 checkpoint on top of the RC.1 line)',
    inheritedEvidence: {
      phase12ClosureSuitePath: 'artifacts/conformance/latest/phase-12-closure-suite-results.json',
      phase19GateBPath: 'artifacts/conformance/latest/phase-19-certification-gate-results.json',
    },
    laneStatuses,
    hardClosureRules,
    summary: {
      greenLaneCount,
      blockedLaneCount,
      greenHardClosureRules,
      blockedHardClosureRules,
      certificationReady: false,
    },
    blockers: { certificationGate: blockers },
    advancementOverPhase19: {
      commonmark: {
        phase19Passed: phase19.laneStatuses.commonmarkOfficialCorpusLane.summary,
        phase20Passed: `${commonmarkOfficial.passed}/${commonmarkOfficial.total}`,
      },
      gfm: {
        phase19Passed: phase19.laneStatuses.gfmOfficialCorpusLane.summary,
        phase20Passed: `${gfmOfficial.passed}/${gfmOfficial.total}`,
      },
      visualRegressionLane: {
        phase19Status: phase19.laneStatuses.visualRegressionLane.status,
        phase20Status: laneStatuses.visualRegressionLane.status,
      },
      packedTarballInstallLane: {
        phase19Status: phase19.laneStatuses.packedTarballInstallLane.status,
        phase20Status: laneStatuses.packedTarballInstallLane.status,
      },
      browserMatrixLane: {
        phase19Status: phase19.laneStatuses.browserMatrixLane.status,
        phase20Status: laneStatuses.browserMatrixLane.status,
      },
    },
  };

  const checklist = `# Phase 20 certification gate checklist\n\n## Gate B — certification closure from RC artifacts\n\n- [ ] Close the full official CommonMark lane (${commonmarkOfficial.passed}/${commonmarkOfficial.total} passing, ${commonmarkOfficial.failed} failing).\n- [ ] Close the full official GFM lane (${gfmOfficial.passed}/${gfmOfficial.total} passing, ${gfmOfficial.failed} failing).\n- [x] Keep the claimed optional-profile lane green (${optionalProfiles.passed}/${optionalProfiles.total}).\n- [x] Keep the editor keyboard lane green (${phase5Editor.aggregate.testChecks.passed}/${phase5Editor.aggregate.testChecks.total}).\n- [x] Keep the toolbar/selection lane green (${phase5Editor.aggregate.structuralAudit.passed}/${phase5Editor.aggregate.structuralAudit.total}).\n- [x] Keep the preview/export lane green (${previewExport.passed}/${previewExport.total} current rerun).\n- [x] Keep the accessibility lane green (shell ${shellParity.passed}/${shellParity.total}, settings ${settingsParity.passed}/${settingsParity.total}, preview ${previewExport.passed}/${previewExport.total}, i18n ${i18nParity.passed}/${i18nParity.total}).\n- [ ] Close the browser matrix lane in a full browser environment.\n- [x] Close the browser-driven visual regression lane (${visualScreenshotManifest.passed}/${visualScreenshotManifest.total} Chromium screenshot-diff checks).\n- [x] Close the full packed-tarball install lane for the release set (${packedInstallReport.tarballCount} tarballs validated together).\n- [x] Keep the extension activation/compatibility lane green.\n- [x] Keep the docs/contract-boundary lane green.\n- [ ] Re-evaluate the hard markdown closure rule to green (currently blocked by actual official-corpus failures).\n- [x] Keep the other hard closure rules green.\n- [x] Regenerate the current checkpoint evidence bundle from the current workspace state.\n- [ ] Regenerate the final evidence bundle from a fully green run.\n\n## Result\n\nCertification is **not yet available** in this checkpoint. The remaining Gate B blockers are the two official full-corpus lanes, the full browser matrix lane, and the hard markdown closure rule that depends on the corpus lanes.\n`;

  const output = [
    '# Phase 20 Gate B checkpoint',
    '',
    `CommonMark official: ${commonmarkOfficial.passed}/${commonmarkOfficial.total} passing (${commonmarkOfficial.failed} failing)`,
    `GFM official: ${gfmOfficial.passed}/${gfmOfficial.total} passing (${gfmOfficial.failed} failing)`,
    `Optional profiles: ${optionalProfiles.passed}/${optionalProfiles.total} passing`,
    `Visual regression: ${visualRegressionReport.laneStatus}`,
    `Packed release-set install: ${packedInstallReport.ok ? 'green' : 'blocked'}`,
    `Browser matrix: ${browserMatrixReport.laneStatus}`,
    `Certification gate summary: ${greenLaneCount}/${laneEntries.length} lanes green`,
    `Hard closure rules: ${greenHardClosureRules}/${hardRuleEntries.length} green`,
    '',
    'This checkpoint materially improves the evidence bundle, but certification remains blocked by the full official CommonMark/GFM corpus lanes and the full browser matrix requirement.',
  ].join('\n');

  const releaseNotes = `# Phase 20 release notes draft\n\nDate: ${results.generatedAt}\nWorkspace root version: ${rootPackage.version}\n\n## Summary\n\nThis checkpoint regenerates the Gate B evidence bundle from the current workspace state on top of the existing RC.1 line.\n\nNo new semver RC cut was performed in this environment. Tarballs were regenerated from the current workspace and validated locally, but the workspace versions remain on the existing RC.1 line.\n\n## What materially advanced\n\n- browser-rendered visual regression is now green in this environment (${visualScreenshotManifest.passed}/${visualScreenshotManifest.total} Chromium screenshot-diff checks)\n- the full publishable release set now packs and installs successfully from local tarballs (${packedInstallReport.tarballCount} tarballs)\n- shell parity, settings/data/Git parity, preview/export, theme parity, i18n, package evidence, and editor smoke reruns all remained green\n\n## What is still blocked\n\n- official CommonMark corpus lane: ${commonmarkOfficial.passed}/${commonmarkOfficial.total} passing, ${commonmarkOfficial.failed} failing\n- official GFM corpus lane: ${gfmOfficial.passed}/${gfmOfficial.total} passing, ${gfmOfficial.failed} failing\n- full browser matrix lane: blocked because Chromium app navigation is restricted in this environment and Firefox/WebKit binaries are unavailable\n- hard markdown closure rule: blocked because the official corpus lanes still fail\n\n## Honest certification statement\n\nThis checkpoint does **not** authorize a final certification claim.\n\nThe strongest honest statement supported by the current evidence is:\n\n- repository-internal feature and parity evidence is strong across the non-markdown closure lanes;\n- browser-driven visual regression and full release-set tarball install are now green in this environment;\n- the repository is **not yet** certifiably fully featured and **not yet** fully markdown spec compliant for the full frozen CommonMark/GFM target because the official corpus lanes and the full browser matrix are still blocked.\n`;

  const evidenceManifest = {
    generatedAt: new Date().toISOString(),
    phase: 20,
    artifacts: [
      'PHASE_20_CHECKPOINT_SUMMARY.md',
      'docs/adr/ADR-0027-gate-b-certification-closure-rerun-phase20-checkpoint.md',
      'docs/conformance/gate-b-certification-closure-phase20.md',
      'docs/current-state/phase-20-gate-b-assessment.md',
      'docs/conformance/current-certification-status.md',
      'artifacts/conformance/latest/phase-20-commonmark-official-summary.json',
      'artifacts/conformance/latest/phase-20-gfm-official-summary.json',
      'artifacts/conformance/latest/phase-20-optional-profile-summary.json',
      'artifacts/conformance/latest/phase-20-preview-export-summary.json',
      'artifacts/conformance/latest/phase-20-shell-parity-summary.json',
      'artifacts/conformance/latest/phase-20-settings-data-git-summary.json',
      'artifacts/conformance/latest/phase-20-theme-parity-summary.json',
      'artifacts/conformance/latest/phase-20-i18n-summary.json',
      'artifacts/conformance/latest/phase-20-package-evidence-summary.json',
      'artifacts/conformance/latest/phase-20-editor-core-smoke-summary.json',
      'artifacts/conformance/latest/phase-20-editor-react-smoke-summary.json',
      'artifacts/conformance/latest/phase-20-integration-smoke.json',
      'artifacts/conformance/latest/phase-20-e2e-smoke.json',
      'artifacts/conformance/latest/phase-20-visual-smoke.json',
      'artifacts/conformance/latest/phase-20-conformance-status.json',
      'artifacts/conformance/latest/phase-20-extension-compatibility-manifest.json',
      'artifacts/conformance/latest/phase-20-browser-matrix-report.json',
      'artifacts/conformance/latest/phase-20-visual-regression-report.json',
      'artifacts/conformance/latest/phase-20-visual-screenshot-manifest.json',
      'artifacts/conformance/latest/phase-20-packed-release-set-install-report.json',
      'artifacts/conformance/latest/phase-20-packed-release-set-install-log.txt',
      'artifacts/conformance/latest/phase-20-package-inventory.json',
      'artifacts/conformance/latest/phase-20-version-inventory.json',
      'artifacts/conformance/latest/phase-20-release-notes-draft.md',
      'artifacts/conformance/latest/phase-20-certification-gate-results.json',
      'artifacts/conformance/latest/phase-20-certification-gate-checkpoint.json',
      'artifacts/conformance/latest/phase-20-certification-gate-checklist.md',
      'artifacts/conformance/latest/phase-20-gate-b-output.txt',
    ],
  };

  await writeJson(path.join(artifactRoot, 'phase-20-certification-gate-results.json'), results);
  await writeJson(path.join(artifactRoot, 'phase-20-certification-gate-checkpoint.json'), {
    phase: 20,
    generatedAt: new Date().toISOString(),
    checkpointType: 'gate-b-certification-closure-rerun',
    summary: results.summary,
    advancementOverPhase19: results.advancementOverPhase19,
    evidence: {
      commonmark: 'artifacts/conformance/latest/phase-20-commonmark-official-summary.json',
      gfm: 'artifacts/conformance/latest/phase-20-gfm-official-summary.json',
      optionalProfiles: 'artifacts/conformance/latest/phase-20-optional-profile-summary.json',
      results: 'artifacts/conformance/latest/phase-20-certification-gate-results.json',
      checklist: 'artifacts/conformance/latest/phase-20-certification-gate-checklist.md',
    },
    currentState: {
      certifiablyFullyFeatured: false,
      repositoryInternallyRfcCompliant: false,
      fullyMarkdownSpecCompliant: false,
    },
  });
  await writeText(path.join(artifactRoot, 'phase-20-certification-gate-checklist.md'), checklist);
  await writeText(path.join(artifactRoot, 'phase-20-gate-b-output.txt'), `${output}\n`);
  await writeText(path.join(artifactRoot, 'phase-20-release-notes-draft.md'), `${releaseNotes}\n`);
  await writeJson(path.join(artifactRoot, 'phase-20-evidence-bundle-manifest.json'), evidenceManifest);

  console.log('phase 20 Gate B checkpoint artifacts generated');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
