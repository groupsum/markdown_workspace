import path from 'node:path';
import {
  ensureDir,
  isCliEntry,
  loadWorkspacePackages,
  pathExists,
  readJson,
  repoRoot,
  writeJson,
  writeText,
} from '../lib/workspace.mjs';

export async function generateReleaseEvidence() {
  const workspaces = await loadWorkspacePackages();
  const releaseRoot = path.join(repoRoot, 'artifacts', 'releases', 'latest');
  await ensureDir(releaseRoot);

  const packReportPath = path.join(repoRoot, 'artifacts', 'packs', 'pack-report.json');
  const extensionCatalogPath = path.join(repoRoot, 'artifacts', 'extensions', 'catalog.json');
  const conformanceStatusPath = path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'conformance-status.json');

  const releaseEvidence = {
    generatedAt: new Date().toISOString(),
    generator: 'tools/release/generate-release-evidence.mjs',
    workspacePackageCount: workspaces.length,
    publishableWorkspaceCount: workspaces.filter((workspacePackage) => workspacePackage.publishable).length,
    git: {
      sha: process.env.GITHUB_SHA ?? null,
      ref: process.env.GITHUB_REF ?? null,
      runId: process.env.GITHUB_RUN_ID ?? null,
    },
    inputs: {
      packReport: (await pathExists(packReportPath)) ? 'artifacts/packs/pack-report.json' : null,
      extensionCatalog: (await pathExists(extensionCatalogPath)) ? 'artifacts/extensions/catalog.json' : null,
      conformanceStatus: (await pathExists(conformanceStatusPath)) ? 'artifacts/conformance/latest/conformance-status.json' : null,
    },
    packages: workspaces
      .filter((workspacePackage) => workspacePackage.publishable)
      .map((workspacePackage) => ({
        name: workspacePackage.packageJson.name,
        version: workspacePackage.packageJson.version,
        path: workspacePackage.relativeDir,
        category: workspacePackage.category,
      })),
  };

  await writeJson(path.join(releaseRoot, 'release-evidence.json'), releaseEvidence);
  await writeText(
    path.join(releaseRoot, 'README.md'),
    [
      '# Release evidence',
      '',
      'This directory aggregates package pack reports, extension artifact catalogs, and conformance status for a release candidate.',
      '',
      `Generated at: ${releaseEvidence.generatedAt}`,
      '',
    ].join('\n'),
  );

  return releaseEvidence;
}

async function main() {
  const report = await generateReleaseEvidence();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (isCliEntry(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
