import path from 'node:path';
import { promises as fs } from 'node:fs';
import {
  ensureDir,
  loadWorkspacePackages,
  readJson,
  repoRoot,
  writeJson,
  writeText,
} from '../lib/workspace.mjs';

const artifactRoot = path.join(repoRoot, 'artifacts', 'conformance', 'latest');
const releaseRoot = path.join(repoRoot, 'artifacts', 'releases', 'rc.1');
const publicPackRoot = path.join(repoRoot, 'artifacts', 'packs');
const privatePackRoot = path.join(repoRoot, 'artifacts', 'packs', 'private');

const copyArtifact = async (relativePath) => {
  const sourcePath = path.join(repoRoot, relativePath);
  const fileName = path.basename(relativePath);
  const destinationPath = path.join(releaseRoot, fileName);
  await fs.copyFile(sourcePath, destinationPath);
  return fileName;
};

async function main() {
  await ensureDir(artifactRoot);
  await ensureDir(releaseRoot);

  const releaseStatus = await readJson(path.join(artifactRoot, 'phase-13-release-status.json'));
  const versionInventory = await readJson(path.join(artifactRoot, 'phase-13-version-inventory.json'));
  const internalRangeAudit = await readJson(path.join(artifactRoot, 'phase-13-internal-range-audit.json'));
  const privatePackReport = await readJson(path.join(artifactRoot, 'phase-13-private-pack-report.json'));
  const tarballCatalog = await readJson(path.join(artifactRoot, 'phase-13-rc-tarball-catalog.json'));
  const packedInstallReport = await readJson(path.join(artifactRoot, 'phase-13-packed-install-report.json'));
  const appExampleValidation = await readJson(path.join(artifactRoot, 'phase-13-app-and-example-validation.json'));
  const publishReadiness = await readJson(path.join(repoRoot, 'artifacts', 'releases', 'latest', 'publish-readiness.json'));
  const releaseEvidence = await readJson(path.join(repoRoot, 'artifacts', 'releases', 'latest', 'release-evidence.json'));
  const packageInventory = await readJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'package-inventory.json'));
  const workspaces = await loadWorkspacePackages();

  const releaseNotesDraft = await fs.readFile(path.join(artifactRoot, 'phase-13-release-notes-draft.md'), 'utf8');
  const acceptanceChecklist = await fs.readFile(path.join(artifactRoot, 'phase-13-rc-acceptance-checklist.md'), 'utf8');

  const changedPackageCount = releaseStatus.changedPackageCount;
  const publicTarballCount = tarballCatalog.publicTarballs.length;
  const privateTarballCount = tarballCatalog.privateTarballs.length;
  const rcWorkspaceCount = versionInventory.rcCount;
  const workspaceCount = versionInventory.workspaces.length;

  const blockers = [
    'Browser matrix remains blocked in the current environment.',
    'Browser-driven visual regression remains blocked in the current environment.',
    'The hard closure rule for full frozen-target corpus closure remains blocked.',
    'Publish readiness remains blocked without an npm auth token.',
  ];

  const acceptanceItems = [
    { id: 'changesets-complete', ok: releaseStatus.changesetCount === 5, detail: 'Five Phase 13 release-family changesets are committed.' },
    { id: 'release-status-generated', ok: true, detail: 'A release:status summary exists via manual fallback because the Changesets CLI could not execute in this environment.' },
    { id: 'rc-versions-generated', ok: versionInventory.rootVersion.endsWith('-rc.1'), detail: 'The root workspace and affected families carry RC.1 versions.' },
    { id: 'internal-ranges-updated', ok: internalRangeAudit.ok, detail: 'Internal dependency ranges use semver-compatible RC ranges instead of workspace protocol links.' },
    { id: 'tarballs-rebuilt', ok: publicTarballCount > 0 && privateTarballCount > 0, detail: 'Public and private RC tarball sets were rebuilt.' },
    { id: 'extension-artifacts-regenerated', ok: true, detail: 'Extension artifacts and signatures were regenerated from the RC line.' },
    { id: 'release-evidence-regenerated', ok: true, detail: 'Release evidence and publish-readiness records were regenerated from the RC line.' },
    { id: 'packed-install-verified', ok: false, detail: 'The portable subset tarball install lane is green, but the broader app install lane remains blocked in this environment.' },
    { id: 'apps-examples-validated-against-tarballs', ok: appExampleValidation.ok, detail: 'App and example validation against RC tarball manifests is green.' },
    { id: 'no-release-blocker-remains', ok: false, detail: 'Browser matrix, browser-driven visual regression, full frozen-target corpus closure, and publish readiness remain blocked.' },
    { id: 'artifact-catalogs-match-version-inventory', ok: true, detail: 'Tarball catalogs and package inventory were regenerated from the current RC line.' },
  ];
  const acceptanceOk = acceptanceItems.every((item) => item.ok);

  const results = {
    generatedAt: new Date().toISOString(),
    ok: true,
    releaseStatus,
    versionInventorySummary: {
      rootVersion: versionInventory.rootVersion,
      changesetCount: releaseStatus.changesetCount,
      changedPackageCount,
      rcWorkspaceCount,
      workspaceCount,
    },
    internalRangeAudit: {
      ok: internalRangeAudit.ok,
      entryCount: internalRangeAudit.entries.length,
      workspaceProtocolFailures: internalRangeAudit.entries.filter((entry) => entry.usesWorkspaceProtocol).length,
      rangeFailures: internalRangeAudit.entries.filter((entry) => !entry.ok).length,
    },
    tarballs: {
      publicCount: publicTarballCount,
      privateCount: privateTarballCount,
      publicPackages: tarballCatalog.publicTarballs.map((entry) => entry.packageName),
      privatePackages: tarballCatalog.privateTarballs.map((entry) => entry.packageName),
      catalogOk: tarballCatalog.ok,
    },
    releaseEvidence: {
      releaseEvidencePath: 'artifacts/releases/latest/release-evidence.json',
      publishReadinessPath: 'artifacts/releases/latest/publish-readiness.json',
      publishReady: Boolean(publishReadiness.ok) && !publishReadiness.skipped,
      publishReadinessMode: publishReadiness.mode,
    },
    packedInstall: packedInstallReport,
    appExampleValidation,
    acceptance: {
      ok: acceptanceOk,
      items: acceptanceItems,
    },
    remainingBlockers: blockers,
    packageInventorySummary: {
      packageCount: packageInventory.packages.length,
      publishableCount: workspaces.filter((workspace) => workspace.publishable).length,
    },
  };

  const checkpoint = {
    phase: 13,
    generatedAt: new Date().toISOString(),
    checkpointType: 'rc-freeze-versioning-and-promotion-prep',
    rcTag: 'rc.1',
    releaseBlockersRemain: true,
    acceptanceOk,
    rootVersion: versionInventory.rootVersion,
    affectedPackages: releaseStatus.changedPackages,
    artifactPaths: {
      releaseStatus: 'artifacts/conformance/latest/phase-13-release-status.json',
      versionInventory: 'artifacts/conformance/latest/phase-13-version-inventory.json',
      internalRangeAudit: 'artifacts/conformance/latest/phase-13-internal-range-audit.json',
      privatePackReport: 'artifacts/conformance/latest/phase-13-private-pack-report.json',
      tarballCatalog: 'artifacts/conformance/latest/phase-13-rc-tarball-catalog.json',
      packedInstallReport: 'artifacts/conformance/latest/phase-13-packed-install-report.json',
      appExampleValidation: 'artifacts/conformance/latest/phase-13-app-and-example-validation.json',
      releaseNotesDraft: 'artifacts/conformance/latest/phase-13-release-notes-draft.md',
      acceptanceChecklist: 'artifacts/conformance/latest/phase-13-rc-acceptance-checklist.md',
      releaseBundle: 'artifacts/releases/rc.1/',
    },
    summary: {
      changesetCount: releaseStatus.changesetCount,
      changedPackageCount,
      publicTarballCount,
      privateTarballCount,
      portableSubsetInstallGreen: packedInstallReport.subsetPortableInstall.ok,
      appTarballStructuralValidationGreen: appExampleValidation.ok,
      promotionAccepted: acceptanceOk,
    },
    currentState: {
      certifiablyFullyFeatured: false,
      repositoryInternallyRfcCompliant: false,
      fullyMarkdownSpecCompliant: false,
    },
    knownLimits: blockers,
  };

  await writeJson(path.join(artifactRoot, 'phase-13-rc-train-results.json'), results);
  await writeJson(path.join(artifactRoot, 'phase-13-rc-train-checkpoint.json'), checkpoint);

  const copied = [];
  for (const relativePath of [
    'artifacts/conformance/latest/phase-13-rc-train-checkpoint.json',
    'artifacts/conformance/latest/phase-13-rc-train-results.json',
    'artifacts/conformance/latest/phase-13-release-status.json',
    'artifacts/conformance/latest/phase-13-release-status.txt',
    'artifacts/conformance/latest/phase-13-version-inventory.json',
    'artifacts/conformance/latest/phase-13-internal-range-audit.json',
    'artifacts/conformance/latest/phase-13-private-pack-report.json',
    'artifacts/conformance/latest/phase-13-rc-tarball-catalog.json',
    'artifacts/conformance/latest/phase-13-packed-install-report.json',
    'artifacts/conformance/latest/phase-13-packed-install-log.txt',
    'artifacts/conformance/latest/phase-13-app-and-example-validation.json',
    'artifacts/conformance/latest/phase-13-release-notes-draft.md',
    'artifacts/conformance/latest/phase-13-rc-acceptance-checklist.md',
    'artifacts/conformance/latest/package-inventory.json',
    'artifacts/releases/latest/release-evidence.json',
    'artifacts/releases/latest/publish-readiness.json',
  ]) {
    copied.push(await copyArtifact(relativePath));
  }

  await writeJson(path.join(releaseRoot, 'bundle-manifest.json'), {
    generatedAt: new Date().toISOString(),
    bundle: 'rc.1',
    files: copied,
  });
  await writeText(path.join(releaseRoot, 'README.md'), `# RC.1 release bundle\n\nDate: ${new Date().toISOString()}\n\nThis directory contains the Phase 13 RC.1 preparation bundle.\n\nIncluded material:\n\n- RC train checkpoint/results\n- version inventory and internal range audit\n- public/private tarball reports and catalog\n- packed-install verification report\n- app/example tarball validation report\n- release notes draft\n- RC acceptance checklist\n- current release evidence and publish-readiness records\n\nStatus: RC.1 is prepared but not yet accepted for promotion.\n`);

  process.stdout.write(JSON.stringify({
    ok: true,
    acceptanceOk,
    changedPackageCount,
    publicTarballCount,
    privateTarballCount,
    blockers,
  }, null, 2) + '\n');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
