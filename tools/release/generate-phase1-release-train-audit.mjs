import path from 'node:path';
import { createHash } from 'node:crypto';
import { loadWorkspacePackages, readJson, repoRoot, writeJson } from '../lib/workspace.mjs';

const phase1Path = path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'phase-1-release-train-freeze.json');
const changesetConfigPath = path.join(repoRoot, '.changeset', 'config.json');
const rootPackageJsonPath = path.join(repoRoot, 'package.json');
const releaseMatrixPath = path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'package-release-matrix.json');
const auditPath = path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'phase-1-package-graph-audit.json');

function normalizeGroup(group) {
  return [...group].sort();
}

function normalizeGroups(groups) {
  return [...groups]
    .map(normalizeGroup)
    .sort((a, b) => a.join('|').localeCompare(b.join('|')));
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function isExactSemver(version) {
  return typeof version === 'string' && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version.trim());
}

function countBy(items, selector) {
  const counts = {};
  for (const item of items) {
    const key = selector(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

const phase1 = await readJson(phase1Path);
const rootPackageJson = await readJson(rootPackageJsonPath);
const workspacePackages = await loadWorkspacePackages();
const changesetConfig = await readJson(changesetConfigPath);

const actualReleaseUnits = [
  {
    packageName: rootPackageJson.name,
    relativeDir: '.',
    version: rootPackageJson.version,
    publishable: false,
    category: 'workspace-root',
  },
  ...workspacePackages.map((workspacePackage) => ({
    packageName: workspacePackage.packageJson.name,
    relativeDir: workspacePackage.relativeDir,
    version: workspacePackage.packageJson.version,
    publishable: workspacePackage.publishable,
    category: workspacePackage.category,
    packageJson: workspacePackage.packageJson,
  })),
];

const declaredByName = new Map(phase1.packages.map((entry) => [entry.packageName, entry]));
const actualByName = new Map(actualReleaseUnits.map((entry) => [entry.packageName, entry]));

const unmappedWorkspacePackages = actualReleaseUnits
  .filter((entry) => !declaredByName.has(entry.packageName))
  .map((entry) => ({
    packageName: entry.packageName,
    path: entry.relativeDir,
    currentVersion: entry.version,
  }));

const extraDeclaredPackages = phase1.packages
  .filter((entry) => !actualByName.has(entry.packageName))
  .map((entry) => ({
    packageName: entry.packageName,
    path: entry.path,
    currentVersion: entry.currentVersion,
  }));

const requiredMetadataFields = [
  'releaseGroup',
  'ownerLane',
  'semverPolicy',
  'compatibilityDeclaration',
  'promotionPath',
  'plannedVersionLine',
];

const packagesMissingMetadata = phase1.packages.flatMap((entry) => {
  const missingFields = requiredMetadataFields.filter((field) => {
    const value = entry[field];
    return typeof value !== 'string' || value.trim().length === 0;
  });
  return missingFields.length > 0
    ? [{ packageName: entry.packageName, missingFields }]
    : [];
});

const exactPinnedInternalWorkspaceDependencies = [];
const workspaceNames = new Set(workspacePackages.map((workspacePackage) => workspacePackage.packageJson.name));
for (const workspacePackage of workspacePackages) {
  for (const dependencyField of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    const dependencyMap = workspacePackage.packageJson[dependencyField] || {};
    for (const [dependencyName, dependencyVersion] of Object.entries(dependencyMap)) {
      if (workspaceNames.has(dependencyName) && isExactSemver(dependencyVersion)) {
        exactPinnedInternalWorkspaceDependencies.push({
          packageName: workspacePackage.packageJson.name,
          packagePath: workspacePackage.relativeDir,
          dependencyField,
          dependencyName,
          dependencyVersion,
        });
      }
    }
  }
}

const linkedGroupsExpected = normalizeGroups(phase1.linkedChangesetGroups || []);
const linkedGroupsActual = normalizeGroups(changesetConfig.linked || []);
const linkedChangesetGroupsMatchFreezePlan = JSON.stringify(linkedGroupsExpected) === JSON.stringify(linkedGroupsActual);

const packageReleaseMatrix = {
  generatedAt: new Date().toISOString(),
  checkpoint: 'phase-1-release-train-freeze',
  sourceArtifact: 'artifacts/conformance/latest/phase-1-release-train-freeze.json',
  releaseUnitCount: phase1.packages.length,
  releaseGroupCounts: countBy(phase1.packages, (entry) => entry.releaseGroup),
  ownerLaneCounts: countBy(phase1.packages, (entry) => entry.ownerLane),
  linkedChangesetGroups: phase1.linkedChangesetGroups,
  packages: phase1.packages,
};
packageReleaseMatrix.inventoryDigest = sha256(JSON.stringify(packageReleaseMatrix.packages));
packageReleaseMatrix.releasePlanDigest = sha256(JSON.stringify({
  releaseGroups: packageReleaseMatrix.releaseGroupCounts,
  ownerLanes: packageReleaseMatrix.ownerLaneCounts,
  linkedChangesetGroups: packageReleaseMatrix.linkedChangesetGroups,
}));

const auditArtifact = {
  generatedAt: new Date().toISOString(),
  checkpoint: 'phase-1-release-train-freeze',
  status: phase1.status,
  counts: {
    releaseUnitsDocumented: phase1.packages.length,
    workspacePackagesDetected: workspacePackages.length,
    auditedReleaseUnitsDetected: actualReleaseUnits.length,
    releaseGroupCounts: packageReleaseMatrix.releaseGroupCounts,
    ownerLaneCounts: packageReleaseMatrix.ownerLaneCounts,
  },
  assertions: {
    allWorkspacePackagesMapped: unmappedWorkspacePackages.length === 0,
    noUnexpectedDeclaredPackages: extraDeclaredPackages.length === 0,
    allPackagesHaveRequiredPhase1Metadata: packagesMissingMetadata.length === 0,
    linkedChangesetGroupsMatchFreezePlan,
    noExactPinnedInternalWorkspaceDependencies: exactPinnedInternalWorkspaceDependencies.length === 0,
  },
  linkedChangesetGroupsExpected: phase1.linkedChangesetGroups,
  linkedChangesetGroupsActual: changesetConfig.linked || [],
  unmappedWorkspacePackages,
  extraDeclaredPackages,
  packagesMissingMetadata,
  exactPinnedInternalWorkspaceDependencies,
  notes: [
    'This audit validates the Phase 1 freeze against the actual workspace package graph in the checkpoint zip.',
    'Phase 1 remains a release-train and compatibility-baseline freeze; it does not claim final feature or Markdown certification closure.',
  ],
  digests: {
    packageReleaseMatrix: packageReleaseMatrix.inventoryDigest,
    releasePlan: packageReleaseMatrix.releasePlanDigest,
  },
};

await writeJson(releaseMatrixPath, packageReleaseMatrix);
await writeJson(auditPath, auditArtifact);
