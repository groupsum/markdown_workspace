import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { getLegacyPackageMigration } from './legacy-package-migration.mjs';

async function readInstalledPackageName() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  return packageJson.name ?? null;
}

async function main() {
  const packageName = process.env.npm_package_name || await readInstalledPackageName();
  const migration = getLegacyPackageMigration(packageName);

  if (!migration) {
    return;
  }

  const lines = [
    '',
    '===============================================',
    `[deprecated] ${packageName}`,
    'This package is in a legacy bridge release line from groupsum/markdown_workspace.',
    `Active maintenance moved to ${migration.targetRepo}.`,
    `Package source of truth: ${migration.targetUrl}`,
    'You can keep installing this package name, but new source changes land in the extracted repo.',
    '===============================================',
    '',
  ];

  process.stderr.write(`${lines.join('\n')}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
