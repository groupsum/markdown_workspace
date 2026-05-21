import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { getLegacyPackageMigration, LEGACY_PACKAGE_MIGRATIONS } from '../release/legacy-package-migration.mjs';
import { isCliEntry, loadWorkspacePackages, repoRoot } from '../lib/workspace.mjs';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function validateWorkspacePackage(workspacePackage) {
  const migration = getLegacyPackageMigration(workspacePackage.packageJson.name);
  if (!migration) {
    return null;
  }

  const packageJson = workspacePackage.packageJson;
  const expectedPostinstall = 'node ../../../tools/release/warn-deprecated-package.mjs';

  assert(packageJson.repository?.url === migration.targetRepo, `${packageJson.name} repository.url must point to ${migration.targetRepo}`);
  assert(packageJson.repository?.directory === migration.targetDirectory, `${packageJson.name} repository.directory must point to ${migration.targetDirectory}`);
  assert(packageJson.bugs?.url === `${migration.targetRepo}/issues`, `${packageJson.name} bugs.url must point to ${migration.targetRepo}/issues`);
  assert(packageJson.scripts?.postinstall === expectedPostinstall, `${packageJson.name} postinstall must be ${expectedPostinstall}`);

  const readmePath = path.join(workspacePackage.dir, 'README.md');
  const readme = await readFile(readmePath, 'utf8');
  assert(readme.includes('## Maintenance Status'), `${packageJson.name} README must include a Maintenance Status section`);
  assert(readme.includes(migration.targetUrl), `${packageJson.name} README must point to ${migration.targetUrl}`);

  return packageJson.name;
}

export async function validateLegacyPackageBridge() {
  const workspaces = await loadWorkspacePackages();
  const workspaceNames = new Set(workspaces.map((workspacePackage) => workspacePackage.packageJson.name).filter(Boolean));

  for (const migration of LEGACY_PACKAGE_MIGRATIONS) {
    assert(workspaceNames.has(migration.packageName), `Missing workspace for legacy bridge package ${migration.packageName}`);
  }

  const validated = [];
  for (const workspacePackage of workspaces) {
    const validatedName = await validateWorkspacePackage(workspacePackage);
    if (validatedName) {
      validated.push(validatedName);
    }
  }

  const report = {
    ok: true,
    repoRoot,
    validatedPackages: validated.sort(),
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  return report;
}

async function main() {
  await validateLegacyPackageBridge();
}

if (isCliEntry(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
