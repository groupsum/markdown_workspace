import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import { ensureDir, loadWorkspacePackages, relativeToRepo, repoRoot, toPosix } from '../lib/workspace.mjs';

const workspacePackages = await loadWorkspacePackages();
const workspaceByName = new Map(
  workspacePackages
    .filter((workspacePackage) => typeof workspacePackage.packageJson.name === 'string')
    .map((workspacePackage) => [workspacePackage.packageJson.name, workspacePackage]),
);

async function main() {
  if (await supportsDirectoryLinks()) {
    await runNpm(['ci'], { cwd: repoRoot });
    return;
  }

  console.warn('Directory links are unavailable in this workspace. Falling back to copy-based installs.');
  await removeNodeModules();
  await runNpm(['install', '--workspaces=false', '--package-lock=false', '--no-save'], { cwd: repoRoot });

  for (const workspacePackage of workspacePackages) {
    const specs = collectInstallSpecs(workspacePackage);
    if (specs.length === 0) {
      continue;
    }

    console.log(`Installing ${specs.length} dependencies for ${workspacePackage.packageJson.name ?? workspacePackage.relativeDir}`);
    await runNpm(['install', '--workspaces=false', '--package-lock=false', '--no-save', '--install-links', ...specs], {
      cwd: workspacePackage.dir,
    });
  }
}

async function supportsDirectoryLinks() {
  const probeRoot = path.join(repoRoot, '.tmp', 'link-support-probe');
  const sourceDir = path.join(probeRoot, 'source');
  const linkDir = path.join(probeRoot, 'link');

  await fs.rm(probeRoot, { recursive: true, force: true });
  await ensureDir(sourceDir);

  try {
    await fs.symlink(sourceDir, linkDir, process.platform === 'win32' ? 'junction' : 'dir');
    return true;
  } catch {
    return false;
  } finally {
    await fs.rm(probeRoot, { recursive: true, force: true });
  }
}

async function removeNodeModules() {
  const targets = [path.join(repoRoot, 'node_modules')];
  for (const workspacePackage of workspacePackages) {
    targets.push(path.join(workspacePackage.dir, 'node_modules'));
  }

  for (const target of targets) {
    await fs.rm(target, { recursive: true, force: true });
  }
}

function collectInstallSpecs(workspacePackage) {
  const installMap = new Map();
  const dependencySections = ['dependencies', 'devDependencies', 'optionalDependencies'];

  for (const section of dependencySections) {
    const entries = Object.entries(workspacePackage.packageJson[section] ?? {});
    for (const [dependencyName, range] of entries) {
      if (installMap.has(dependencyName)) {
        continue;
      }

      const internalWorkspace = workspaceByName.get(dependencyName);
      if (internalWorkspace) {
        installMap.set(
          dependencyName,
          `${dependencyName}@file:${relativeFileSpec(workspacePackage.dir, internalWorkspace.dir)}`,
        );
        continue;
      }

      installMap.set(dependencyName, `${dependencyName}@${range}`);
    }
  }

  return [...installMap.values()];
}

function relativeFileSpec(fromDir, toDir) {
  const relativePath = toPosix(path.relative(fromDir, toDir));
  if (!relativePath || relativePath === '') {
    return '.';
  }
  if (relativePath.startsWith('.')) {
    return relativePath;
  }
  return `./${relativePath}`;
}

function runNpm(args, options) {
  const npmExecPath = process.env.npm_execpath;
  if (!npmExecPath) {
    throw new Error('npm_execpath is not available');
  }

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [npmExecPath, ...args], {
      cwd: options.cwd,
      env: process.env,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const cwdLabel = relativeToRepo(options.cwd);
      reject(new Error(`npm ${args.join(' ')} failed in ${cwdLabel} with exit code ${code}`));
    });
  });
}

await main();
