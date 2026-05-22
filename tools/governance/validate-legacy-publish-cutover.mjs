import { isCliEntry, loadWorkspacePackages } from '../lib/workspace.mjs';
import { getLegacyPackageMigration } from '../release/legacy-package-migration.mjs';
import { buildPackagePublishGraph } from '../release/build-publish-graph.mjs';

const EXPLICIT_LEGACY_RETIRED_PACKAGES = new Set([
  '@mdwrk/mdwrkspace',
  '@mdwrk/page-template-demo-content-pack',
]);

function isRetiredLegacyPublishSurface(workspacePackage) {
  return Boolean(
    getLegacyPackageMigration(workspacePackage.packageJson.name)
    || EXPLICIT_LEGACY_RETIRED_PACKAGES.has(workspacePackage.packageJson.name),
  );
}

export async function validateLegacyPublishCutover() {
  const workspaces = await loadWorkspacePackages();
  const failures = [];

  for (const workspacePackage of workspaces) {
    if (!isRetiredLegacyPublishSurface(workspacePackage)) {
      continue;
    }
    if (workspacePackage.packageJson.private !== true) {
      failures.push(`${workspacePackage.packageJson.name} must be private in markdown_workspace after migration cutover.`);
    }
  }

  const publishGraph = buildPackagePublishGraph(workspaces);
  for (const workspacePackage of publishGraph.orderedPackages) {
    if (isRetiredLegacyPublishSurface(workspacePackage)) {
      failures.push(`${workspacePackage.packageJson.name} must not appear in the markdown_workspace publish graph.`);
    }
  }

  const result = {
    ok: failures.length === 0,
    failures,
    retiredPackageNames: [...EXPLICIT_LEGACY_RETIRED_PACKAGES].sort(),
  };

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return result;
}

async function main() {
  const result = await validateLegacyPublishCutover();
  if (!result.ok) {
    process.exitCode = 1;
  }
}

if (isCliEntry(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
