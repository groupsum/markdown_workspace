import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ensureDir, isCliEntry, loadWorkspacePackages, repoRoot, writeJson } from '../lib/workspace.mjs';

export async function generateMatrices() {
  const workspaces = await loadWorkspacePackages();

  const packageGroups = [
    { name: 'contracts', build: 'build:contracts', lint: 'lint:contracts', typecheck: 'typecheck:contracts', test: 'test:contracts' },
    { name: 'shared', build: 'build:shared', lint: 'lint:shared', typecheck: 'typecheck:shared', test: 'test:shared' },
    { name: 'renderer', build: 'build:renderer', lint: 'lint:renderer', typecheck: 'typecheck:renderer', test: 'test:renderer' },
    { name: 'editor', build: 'build:editor', lint: 'lint:editor', typecheck: 'typecheck:editor', test: 'test:editor' },
    { name: 'extensions', build: 'build:extensions', lint: 'lint:extensions', typecheck: 'typecheck:extensions', test: 'test:extensions' },
  ];

  const apps = workspaces
    .filter((workspacePackage) => workspacePackage.category === 'app')
    .map((workspacePackage) => ({
      name: workspacePackage.packageJson.name,
      path: workspacePackage.relativeDir,
      build: workspacePackage.relativeDir.endsWith('client') ? 'build:client' : 'build:lander',
      lint: workspacePackage.relativeDir.endsWith('client') ? 'lint:client' : 'lint:lander',
      typecheck: workspacePackage.relativeDir.endsWith('client') ? 'typecheck:client' : 'typecheck:lander',
      test: workspacePackage.relativeDir.endsWith('client') ? 'test:client' : '',
    }));

  const publishablePackages = workspaces
    .filter((workspacePackage) => workspacePackage.publishable)
    .map((workspacePackage) => ({
      name: workspacePackage.packageJson.name,
      path: workspacePackage.relativeDir,
      category: workspacePackage.category,
    }));

  const extensionArtifacts = workspaces
    .filter((workspacePackage) => workspacePackage.category === 'extension' && workspacePackage.packageJson.name !== '@mdwrk/extension-runtime')
    .map((workspacePackage) => ({
      name: workspacePackage.packageJson.name,
      path: workspacePackage.relativeDir,
    }));

  const matrix = {
    generatedAt: new Date().toISOString(),
    packageGroups,
    apps,
    publishablePackages,
    extensionArtifacts,
  };

  await ensureDir(path.join(repoRoot, 'artifacts', 'ci'));
  await writeJson(path.join(repoRoot, 'artifacts', 'ci', 'matrices.json'), matrix);

  return matrix;
}

async function main() {
  const matrix = await generateMatrices();
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    const lines = [
      `package_groups=${JSON.stringify(matrix.packageGroups)}`,
      `apps=${JSON.stringify(matrix.apps)}`,
      `publishable_packages=${JSON.stringify(matrix.publishablePackages)}`,
      `extension_artifacts=${JSON.stringify(matrix.extensionArtifacts)}`,
    ];
    await fs.writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');
  } else {
    process.stdout.write(`${JSON.stringify(matrix, null, 2)}\n`);
  }
}

if (isCliEntry(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
