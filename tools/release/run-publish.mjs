import { spawn } from 'node:child_process';
import path from 'node:path';
import {
  ensureDir,
  isCliEntry,
  loadWorkspacePackages,
  repoRoot,
  writeJson,
} from '../lib/workspace.mjs';

function envFlag(name, defaultValue = false) {
  const value = process.env[name];
  if (value == null || value === '') {
    return defaultValue;
  }
  return /^(1|true|yes|on)$/i.test(String(value).trim());
}

function toScope(packageName) {
  if (typeof packageName !== 'string' || !packageName.startsWith('@') || !packageName.includes('/')) {
    return null;
  }
  return packageName.split('/')[0];
}

function publishMode() {
  const runningInCi = envFlag('CI') || envFlag('GITHUB_ACTIONS');
  if (!runningInCi) {
    return 'local';
  }
  return envFlag('NPM_PUBLISH_ENABLED') ? 'ci-enabled' : 'ci-disabled';
}

export async function runPublish() {
  const workspaces = await loadWorkspacePackages();
  const publishablePackages = workspaces
    .filter((workspacePackage) => workspacePackage.publishable)
    .map((workspacePackage) => ({
      name: workspacePackage.packageJson.name,
      version: workspacePackage.packageJson.version,
      path: workspacePackage.relativeDir,
      category: workspacePackage.category,
      access: workspacePackage.packageJson.publishConfig?.access ?? null,
    }));

  const mode = publishMode();
  const hasAuthToken = Boolean(process.env.NPM_TOKEN || process.env.NODE_AUTH_TOKEN);
  const shouldAttemptPublish = mode !== 'ci-disabled' && hasAuthToken;

  const report = {
    generatedAt: new Date().toISOString(),
    generator: 'tools/release/run-publish.mjs',
    mode,
    hasAuthToken,
    attemptedPublish: shouldAttemptPublish,
    skipped: false,
    ok: true,
    reason: null,
    scopes: Array.from(new Set(publishablePackages.map((entry) => toScope(entry.name)).filter(Boolean))).sort(),
    publishablePackages,
  };

  const releaseRoot = path.join(repoRoot, 'artifacts', 'releases', 'latest');
  await ensureDir(releaseRoot);

  if (!hasAuthToken) {
    report.skipped = true;
    report.reason = 'Skipping npm publish because no NPM token is available.';
    await writeJson(path.join(releaseRoot, 'publish-readiness.json'), report);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return report;
  }

  if (mode === 'ci-disabled') {
    report.skipped = true;
    report.reason = 'Skipping npm publish in CI because NPM_PUBLISH_ENABLED is not true.';
    await writeJson(path.join(releaseRoot, 'publish-readiness.json'), report);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return report;
  }

  try {
    await new Promise((resolve, reject) => {
      const child = spawn('npx', ['@changesets/cli', 'publish'], {
        cwd: repoRoot,
        env: process.env,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });

      child.on('error', reject);
      child.on('exit', (code, signal) => {
        if (code === 0) {
          resolve();
          return;
        }
        reject(new Error(signal ? `changesets publish terminated with signal ${signal}.` : `changesets publish exited with code ${code}.`));
      });
    });
  } catch (error) {
    report.ok = false;
    report.reason = error.message;
    await writeJson(path.join(releaseRoot, 'publish-readiness.json'), report);
    throw error;
  }

  await writeJson(path.join(releaseRoot, 'publish-readiness.json'), report);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  return report;
}

async function main() {
  const report = await runPublish();
  if (!report.ok) {
    process.exitCode = 1;
  }
}

if (isCliEntry(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
