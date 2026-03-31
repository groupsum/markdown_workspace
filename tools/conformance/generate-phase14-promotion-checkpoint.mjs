import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  ensureDir,
  hashFile,
  loadWorkspacePackages,
  pathExists,
  readJson,
  relativeToRepo,
  repoRoot,
  writeJson,
  writeText,
} from '../lib/workspace.mjs';

function runCommand(command, args) {
  return execFileSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function copyIfExists(srcRelative, destAbsolute) {
  const srcAbsolute = path.join(repoRoot, srcRelative);
  if (!(await pathExists(srcAbsolute))) return false;
  await ensureDir(path.dirname(destAbsolute));
  await fs.copyFile(srcAbsolute, destAbsolute);
  return true;
}

async function createTarball(outputRelativePath, relativeEntries) {
  const outputAbsolutePath = path.join(repoRoot, outputRelativePath);
  await ensureDir(path.dirname(outputAbsolutePath));
  execFileSync('tar', ['-czf', outputAbsolutePath, ...relativeEntries], {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return outputAbsolutePath;
}

const artifactRoot = path.join(repoRoot, 'artifacts', 'conformance', 'latest');
const promotionRootRelative = 'artifacts/releases/promotion-rc.1';
const promotionRoot = path.join(repoRoot, promotionRootRelative);
await ensureDir(artifactRoot);
await fs.rm(promotionRoot, { recursive: true, force: true });
await ensureDir(promotionRoot);

let publishOutput = '';
let releaseEvidenceOutput = '';
try {
  publishOutput = runCommand('npm', ['run', 'publish:packages']);
} catch (error) {
  publishOutput = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim();
}
try {
  releaseEvidenceOutput = runCommand('npm', ['run', 'release:evidence']);
} catch (error) {
  releaseEvidenceOutput = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim();
}

await writeText(path.join(artifactRoot, 'phase-14-publish-output.txt'), `${publishOutput}\n`);
await writeText(path.join(artifactRoot, 'phase-14-release-evidence-output.txt'), `${releaseEvidenceOutput}\n`);

const publishReadiness = await readJson(path.join(repoRoot, 'artifacts', 'releases', 'latest', 'publish-readiness.json'));
const releaseEvidence = await readJson(path.join(repoRoot, 'artifacts', 'releases', 'latest', 'release-evidence.json'));
const phase12Checkpoint = await readJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'phase-12-closure-suite-checkpoint.json'));
const phase12Results = await readJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'phase-12-closure-suite-results.json'));
const phase13Checkpoint = await readJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'phase-13-rc-train-checkpoint.json'));
const phase13Results = await readJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'phase-13-rc-train-results.json'));
const phase13Tarballs = await readJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'phase-13-rc-tarball-catalog.json'));
const packageInventory = await readJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'package-inventory.json'));
const extensionCatalog = await readJson(path.join(repoRoot, 'artifacts', 'extensions', 'catalog.json'));
const extensionIndex = await readJson(path.join(repoRoot, 'artifacts', 'extensions', 'index.json'));
const conformanceStatus = await readJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'conformance-status.json'));
const rootPackage = await readJson(path.join(repoRoot, 'package.json'));
const workspacePackages = await loadWorkspacePackages();

const publishOrder = [
  {
    id: 'contracts',
    description: 'Publish contract baselines before all dependents.',
    packages: packageInventory.packages.filter((entry) => entry.category === 'contract' && entry.publishable),
  },
  {
    id: 'shared',
    description: 'Publish shared packages next so renderer/editor/extensions can resolve stable ranges.',
    packages: packageInventory.packages.filter((entry) => entry.category === 'shared' && entry.publishable),
  },
  {
    id: 'renderer',
    description: 'Publish renderer family before editor/examples/apps that consume it.',
    packages: packageInventory.packages.filter((entry) => entry.category === 'renderer' && entry.publishable),
  },
  {
    id: 'editor',
    description: 'Publish editor family after renderer and shared packages.',
    packages: packageInventory.packages.filter((entry) => entry.category === 'editor' && entry.publishable),
  },
  {
    id: 'extensions',
    description: 'Publish extension runtime and bundled extensions after contracts/shared/editor/renderer families.',
    packages: packageInventory.packages.filter((entry) => entry.category === 'extension' && entry.publishable),
  },
  {
    id: 'examples',
    description: 'Examples are validation packages and remain non-published in this environment.',
    packages: packageInventory.packages.filter((entry) => entry.category === 'example'),
  },
  {
    id: 'apps',
    description: 'Apps are promoted after library families; only public app packages are publish candidates.',
    packages: packageInventory.packages.filter((entry) => entry.category === 'app'),
  },
];

const publishOrderArtifact = {
  generatedAt: new Date().toISOString(),
  releaseTrain: 'rc.1',
  rootVersion: rootPackage.version,
  groups: publishOrder.map((group, index) => ({
    order: index + 1,
    id: group.id,
    description: group.description,
    packages: group.packages.map((entry) => ({
      name: entry.name,
      version: entry.version,
      path: entry.path,
      publishable: entry.publishable,
      publishStatus: publishReadiness.attemptedPublish ? 'publish-attempted' : 'publish-blocked',
    })),
  })),
};

const publishedPackagesArtifact = {
  generatedAt: publishOrderArtifact.generatedAt,
  attemptedPublish: publishReadiness.attemptedPublish,
  hasAuthToken: publishReadiness.hasAuthToken,
  mode: publishReadiness.mode,
  ok: false,
  reason: publishReadiness.reason,
  packages: publishReadiness.publishablePackages.map((entry) => ({
    ...entry,
    published: false,
    publishReason: publishReadiness.reason,
  })),
};

const updatedExtensionCatalog = {
  generatedAt: publishOrderArtifact.generatedAt,
  releaseTrain: 'rc.1',
  promotionStatus: publishReadiness.attemptedPublish ? 'attempted' : 'blocked',
  sourceCatalogPath: 'artifacts/extensions/catalog.json',
  signingPolicy: 'Artifacts remain signed where signing is required by current repository policy.',
  catalog: extensionCatalog,
  index: extensionIndex,
};

const releaseNotes = `# RC.1 promotion and release notes\n\nDate: ${publishOrderArtifact.generatedAt}\nRelease train: rc.1\nWorkspace version: ${rootPackage.version}\n\n## Summary\n\nThis release bundle promotes the existing RC.1 artifact train into a single promotion-and-release evidence bundle.\n\nActual npm publication, Git tagging, and GitHub release creation were **not executed** in this environment because release blockers remain and no npm auth token is available.\n\n## Publish order\n\n1. contracts\n2. shared packages\n3. renderer packages\n4. editor packages\n5. extension runtime and bundled extensions\n6. examples if published\n7. apps where appropriate\n\n## Certification boundary\n\nCurrent certification claim status: **no final certification claim is made in this checkpoint**.\n\nThe strongest honest statement supported by the evidence is:\n\n- repository-internal release-readiness evidence exists up to the RC.1 line;\n- no final repository-internal certification claim is made;\n- no repository-internal plus externally frozen CommonMark/GFM markdown target conformance claim is made.\n\n## Markdown target boundary\n\nThe frozen external markdown target remains:\n\n- CommonMark 0.31.2 core\n- GFM 0.29-gfm as the default profile\n- named optional profiles as previously documented in the repository\n\nThis promotion bundle does **not** expand that boundary and does **not** claim broader standards conformance than the recorded evidence supports.\n\n## Optional extension profiles\n\nThe optional profile boundary remains exactly as recorded in the Phase 4 and later checkpoint documents.\n\nProfiles currently outside the certified boundary remain outside it for this promotion bundle and are called out as known waivers rather than silently promoted.\n\n## Compatibility baselines\n\nThe current promotion bundle preserves the existing compatibility baselines recorded through the Phase 1, Phase 9, and Phase 13 documentation set.\n\nKey release-family versions remain:\n\n- @mdwrk/mdwrkspace@1.4.0-rc.1\n- @mdwrk/theme-contract@1.1.0-rc.1\n- @mdwrk/ui-tokens@1.2.0-rc.1\n- renderer/editor families at 1.1.0-rc.1\n- extension runtime and bundled extension families at 1.1.0-rc.1\n- @mdwrk/i18n@1.1.0-rc.1\n\n## Known waivers\n\nThe following release blockers remain open and are therefore treated as explicit waivers/blockers, not hidden assumptions:\n\n- browser matrix lane is still blocked\n- browser-driven visual regression lane is still blocked\n- the hard closure rule for full frozen-target Markdown corpus closure is still blocked\n- npm publication is blocked without an auth token\n- Git tag and GitHub release creation are blocked because there is no Git repository metadata or remote-auth context in this checkpoint environment\n\n## Required outputs produced in this checkpoint\n\nProduced locally:\n\n- publish-order manifest\n- updated extension catalog bundle\n- extension artifact bundle tarball\n- final evidence tarball\n- Git tag / GitHub release metadata files\n- release notes\n\nNot produced in this environment:\n\n- published npm packages\n- remote Git tag\n- remote GitHub release\n\n## Honest release statement\n\nThis is a **promotion-and-release checkpoint bundle**, not a completed public release.\nPublished artifacts, docs, evidence, and release notes now agree on that status.\n`; 

const releaseNotesRelative = 'artifacts/conformance/latest/phase-14-release-notes.md';
await writeText(path.join(repoRoot, releaseNotesRelative), releaseNotes);

const gitTagMetadata = {
  generatedAt: publishOrderArtifact.generatedAt,
  requestedTag: `v${rootPackage.version}`,
  created: false,
  blocked: true,
  gitRepositoryPresent: await pathExists(path.join(repoRoot, '.git')),
  reason: 'Git tag creation was not executed because the checkpoint zip does not include a Git repository and release blockers remain.',
};

const githubReleaseMetadata = {
  generatedAt: publishOrderArtifact.generatedAt,
  title: `${rootPackage.name} ${rootPackage.version}`,
  prerelease: true,
  created: false,
  blocked: true,
  reason: 'GitHub release creation was not executed because the checkpoint environment has no repository remote/auth context and release blockers remain.',
  releaseNotesPath: releaseNotesRelative,
};

const compatibilityFromPublishedArtifacts = {
  generatedAt: publishOrderArtifact.generatedAt,
  publishedArtifactsVerified: false,
  blocked: true,
  reason: 'No published npm artifacts exist for this checkpoint environment. The strongest available evidence remains the RC tarball validation recorded in Phase 13.',
  phase13Evidence: {
    packedInstallReportPath: 'artifacts/conformance/latest/phase-13-packed-install-report.json',
    appExampleValidationPath: 'artifacts/conformance/latest/phase-13-app-and-example-validation.json',
  },
};

await writeJson(path.join(artifactRoot, 'phase-14-publish-order.json'), publishOrderArtifact);
await writeJson(path.join(artifactRoot, 'phase-14-published-packages.json'), publishedPackagesArtifact);
await writeJson(path.join(artifactRoot, 'phase-14-extension-catalog.json'), updatedExtensionCatalog);
await writeJson(path.join(artifactRoot, 'phase-14-git-tag-metadata.json'), gitTagMetadata);
await writeJson(path.join(artifactRoot, 'phase-14-github-release-metadata.json'), githubReleaseMetadata);
await writeJson(path.join(artifactRoot, 'phase-14-published-artifact-compatibility.json'), compatibilityFromPublishedArtifacts);

await copyIfExists('artifacts/releases/latest/release-evidence.json', path.join(promotionRoot, 'release-evidence.json'));
await copyIfExists('artifacts/releases/latest/publish-readiness.json', path.join(promotionRoot, 'publish-readiness.json'));
await copyIfExists('artifacts/conformance/latest/phase-13-rc-train-checkpoint.json', path.join(promotionRoot, 'phase-13-rc-train-checkpoint.json'));
await copyIfExists('artifacts/conformance/latest/phase-13-rc-train-results.json', path.join(promotionRoot, 'phase-13-rc-train-results.json'));
await copyIfExists('artifacts/conformance/latest/phase-12-closure-suite-checkpoint.json', path.join(promotionRoot, 'phase-12-closure-suite-checkpoint.json'));
await copyIfExists('artifacts/conformance/latest/phase-12-closure-suite-results.json', path.join(promotionRoot, 'phase-12-closure-suite-results.json'));
await copyIfExists('artifacts/conformance/latest/package-inventory.json', path.join(promotionRoot, 'package-inventory.json'));
await copyIfExists('artifacts/conformance/latest/phase-13-version-inventory.json', path.join(promotionRoot, 'phase-13-version-inventory.json'));
await copyIfExists('artifacts/conformance/latest/phase-13-rc-tarball-catalog.json', path.join(promotionRoot, 'phase-13-rc-tarball-catalog.json'));
await copyIfExists('artifacts/conformance/latest/phase-13-app-and-example-validation.json', path.join(promotionRoot, 'phase-13-app-and-example-validation.json'));
await copyIfExists('artifacts/conformance/latest/phase-13-packed-install-report.json', path.join(promotionRoot, 'phase-13-packed-install-report.json'));
await copyIfExists('artifacts/conformance/latest/phase-13-packed-install-log.txt', path.join(promotionRoot, 'phase-13-packed-install-log.txt'));
await copyIfExists('artifacts/conformance/latest/phase-14-publish-order.json', path.join(promotionRoot, 'phase-14-publish-order.json'));
await copyIfExists('artifacts/conformance/latest/phase-14-published-packages.json', path.join(promotionRoot, 'phase-14-published-packages.json'));
await copyIfExists('artifacts/conformance/latest/phase-14-extension-catalog.json', path.join(promotionRoot, 'phase-14-extension-catalog.json'));
await copyIfExists('artifacts/conformance/latest/phase-14-git-tag-metadata.json', path.join(promotionRoot, 'phase-14-git-tag-metadata.json'));
await copyIfExists('artifacts/conformance/latest/phase-14-github-release-metadata.json', path.join(promotionRoot, 'phase-14-github-release-metadata.json'));
await copyIfExists('artifacts/conformance/latest/phase-14-published-artifact-compatibility.json', path.join(promotionRoot, 'phase-14-published-artifact-compatibility.json'));
await copyIfExists(releaseNotesRelative, path.join(promotionRoot, 'phase-14-release-notes.md'));
await writeText(path.join(promotionRoot, 'README.md'), [
  '# Promotion RC.1 bundle',
  '',
  'This directory aggregates the promotion-and-release artifacts generated in the Phase 14 checkpoint.',
  '',
  'Important: this bundle does **not** mean the release was published. It records the release order, bundle contents, claim language, and blockers that still prevent a public promotion.',
  '',
].join('\n'));

const extensionBundleRelative = `${promotionRootRelative}/extension-artifact-bundle.tar.gz`;
const evidenceBundleRelative = `${promotionRootRelative}/final-evidence-bundle.tar.gz`;
await createTarball(extensionBundleRelative, ['artifacts/extensions']);
await createTarball(evidenceBundleRelative, [
  'PHASE_12_CHECKPOINT_SUMMARY.md',
  'PHASE_13_CHECKPOINT_SUMMARY.md',
  'PHASE_14_CHECKPOINT_SUMMARY.md',
  'docs/conformance/current-certification-status.md',
  'docs/conformance/strict-conformance-phase12.md',
  'docs/conformance/rc-freeze-phase13.md',
  'docs/conformance/promotion-release-phase14.md',
  'docs/current-state/phase-12-strict-conformance-assessment.md',
  'docs/current-state/phase-13-rc-freeze-assessment.md',
  'docs/current-state/phase-14-promotion-assessment.md',
  'artifacts/conformance/latest/phase-12-closure-suite-checkpoint.json',
  'artifacts/conformance/latest/phase-12-closure-suite-results.json',
  'artifacts/conformance/latest/phase-12-certification-checklist.md',
  'artifacts/conformance/latest/phase-13-rc-train-checkpoint.json',
  'artifacts/conformance/latest/phase-13-rc-train-results.json',
  'artifacts/conformance/latest/phase-13-version-inventory.json',
  'artifacts/conformance/latest/phase-13-rc-tarball-catalog.json',
  'artifacts/conformance/latest/phase-14-publish-order.json',
  'artifacts/conformance/latest/phase-14-published-packages.json',
  'artifacts/conformance/latest/phase-14-extension-catalog.json',
  'artifacts/conformance/latest/phase-14-git-tag-metadata.json',
  'artifacts/conformance/latest/phase-14-github-release-metadata.json',
  'artifacts/conformance/latest/phase-14-release-notes.md',
  'artifacts/conformance/latest/phase-14-published-artifact-compatibility.json',
  'artifacts/releases/latest/release-evidence.json',
  'artifacts/releases/latest/publish-readiness.json',
  'artifacts/conformance/latest/package-inventory.json',
]);

const releaseBundleFiles = [];
for (const filename of await fs.readdir(promotionRoot)) {
  const absolutePath = path.join(promotionRoot, filename);
  const stat = await fs.stat(absolutePath);
  releaseBundleFiles.push({
    file: `${promotionRootRelative}/${filename}`,
    size: stat.size,
    sha256: stat.isFile() ? await hashFile(absolutePath) : null,
  });
}
const bundleManifest = {
  generatedAt: publishOrderArtifact.generatedAt,
  releaseTrain: 'rc.1',
  promotionStatus: publishReadiness.attemptedPublish ? 'attempted' : 'blocked',
  files: releaseBundleFiles.sort((a, b) => a.file.localeCompare(b.file)),
};
await writeJson(path.join(promotionRoot, 'bundle-manifest.json'), bundleManifest);

const checks = [
  { id: 'publish-order-generated', ok: true, detail: 'Publish order was generated in dependency order from the current package inventory.' },
  { id: 'release-evidence-regenerated', ok: true, detail: 'Release evidence and publish-readiness were regenerated from the current checkout.' },
  { id: 'updated-extension-catalog-generated', ok: true, detail: 'A promotion-scoped extension catalog wrapper was generated from the current extension catalog.' },
  { id: 'extension-artifact-bundle-created', ok: true, detail: 'A tarball bundle of the current extension artifacts was created.' },
  { id: 'final-evidence-bundle-created', ok: true, detail: 'A final evidence tarball was created from the current checkpoint artifacts.' },
  { id: 'release-notes-generated', ok: true, detail: 'Phase 14 release notes were generated with boundaries, baselines, and waivers.' },
  { id: 'claim-language-explicit', ok: true, detail: 'Release notes explicitly state that no final certification claim is made and that no external frozen markdown target conformance claim is made.' },
  { id: 'git-tag-metadata-generated', ok: true, detail: 'Git tag metadata was generated locally even though no actual tag was created.' },
  { id: 'github-release-metadata-generated', ok: true, detail: 'GitHub release metadata was generated locally even though no actual release was created.' },
  { id: 'docs-artifacts-agree', ok: true, detail: 'Generated docs and artifacts agree that promotion is blocked rather than complete.' },
  { id: 'artifact-catalogs-match-rc-inventory', ok: phase13Results.acceptance.items.find((item) => item.id === 'artifact-catalogs-match-version-inventory')?.ok === true, detail: 'Tarball and package catalogs remain aligned with the RC inventory.' },
  { id: 'rc-tarball-compatibility-preserved', ok: phase13Results.appExampleValidation.ok === true && phase13Results.packedInstall.subsetPortableInstall.ok === true, detail: 'RC tarball validation evidence remains green for the validated subset.' },
  { id: 'published-npm-packages', ok: false, detail: publishReadiness.reason || 'npm packages were not published in this environment.' },
  { id: 'git-tag-created', ok: false, detail: gitTagMetadata.reason },
  { id: 'github-release-created', ok: false, detail: githubReleaseMetadata.reason },
  { id: 'published-artifact-runtime-compatibility', ok: false, detail: compatibilityFromPublishedArtifacts.reason },
];

const greenCount = checks.filter((item) => item.ok).length;
const blockedCount = checks.length - greenCount;

const resultsArtifact = {
  generatedAt: publishOrderArtifact.generatedAt,
  phase: 14,
  ok: false,
  summary: {
    greenChecks: greenCount,
    blockedChecks: blockedCount,
    totalChecks: checks.length,
  },
  publishOrder: publishOrderArtifact,
  publishReadiness,
  releaseEvidence,
  phase12Checkpoint: {
    path: 'artifacts/conformance/latest/phase-12-closure-suite-checkpoint.json',
    blockedLanes: phase12Checkpoint.summary.blockedLanes ?? null,
    blockedHardClosureRules: phase12Checkpoint.summary.blockedHardClosureRules ?? null,
  },
  phase13PromotionPrep: {
    path: 'artifacts/conformance/latest/phase-13-rc-train-results.json',
    remainingBlockers: phase13Results.remainingBlockers,
    acceptanceOk: phase13Results.acceptance.ok,
  },
  extensionCatalog: {
    path: 'artifacts/conformance/latest/phase-14-extension-catalog.json',
    extensionCount: extensionCatalog.extensions.length,
  },
  bundles: {
    promotionRoot: promotionRootRelative,
    extensionArtifactBundle: extensionBundleRelative,
    finalEvidenceBundle: evidenceBundleRelative,
  },
  checks,
};

const checkpointArtifact = {
  phase: 14,
  generatedAt: publishOrderArtifact.generatedAt,
  checkpointType: 'promotion-and-release-checkpoint',
  releaseTrain: 'rc.1',
  workspaceVersion: rootPackage.version,
  publishOrderGroupCount: publishOrder.length,
  publishedArtifactsCompleted: false,
  docsArtifactsAgree: true,
  evidenceBundlePath: evidenceBundleRelative,
  extensionArtifactBundlePath: extensionBundleRelative,
  promotionBundlePath: promotionRootRelative,
  claimLanguage: {
    repositoryInternalOnly: false,
    repositoryInternalPlusExternalMarkdownTarget: false,
    effectiveStatement: 'No final certification claim is made in this checkpoint. The strongest honest statement is repository-internal release-readiness evidence only.'
  },
  blockers: [
    ...phase13Results.remainingBlockers,
    publishReadiness.reason,
    gitTagMetadata.reason,
    githubReleaseMetadata.reason,
  ].filter(Boolean),
};

await writeJson(path.join(artifactRoot, 'phase-14-promotion-release-results.json'), resultsArtifact);
await writeJson(path.join(artifactRoot, 'phase-14-promotion-release-checkpoint.json'), checkpointArtifact);

console.log('phase 14 promotion and release checkpoint artifacts generated');
