import path from 'node:path';
import {
  ensureDir,
  isCliEntry,
  loadWorkspacePackages,
  pathExists,
  repoRoot,
  writeJson,
} from '../lib/workspace.mjs';

function needsPublishValidation(workspacePackage) {
  if (!workspacePackage.publishable) {
    return false;
  }
  if (workspacePackage.category === 'example') {
    return false;
  }
  if (workspacePackage.relativeDir === 'apps/lander') {
    return false;
  }
  return true;
}

export async function runExportValidation() {
  const workspaces = await loadWorkspacePackages();
  const results = [];

  for (const workspacePackage of workspaces) {
    const pkg = workspacePackage.packageJson;
    const errors = [];
    const warnings = [];
    const readmePath = path.join(workspacePackage.dir, 'README.md');

    if (!pkg.name) {
      errors.push('package.json name is required.');
    }
    if (!pkg.version) {
      errors.push('package.json version is required.');
    }
    if (!pkg.type) {
      warnings.push('package.json type is not declared.');
    }
    if (!pkg.license) {
      warnings.push('package.json license is not declared.');
    }
    if (!(await pathExists(readmePath))) {
      warnings.push('README.md is missing.');
    }

    if (needsPublishValidation(workspacePackage)) {
      if (!Array.isArray(pkg.files) || pkg.files.length === 0) {
        errors.push('Publishable package must declare package.json files.');
      }
      if (!pkg.exports || typeof pkg.exports !== 'object') {
        errors.push('Publishable package must declare package.json exports.');
      }
      if (!pkg.publishConfig || pkg.publishConfig.access !== 'public') {
        errors.push('Publishable package must declare publishConfig.access=public.');
      }
      if (!pkg.scripts?.build) {
        errors.push('Publishable package must declare a build script.');
      }
      if (!pkg.scripts?.prepack) {
        warnings.push('Publishable package should declare a prepack script.');
      }
      if (!pkg.engines?.node) {
        warnings.push('Publishable package should declare a supported Node engine range.');
      }
      if (!pkg.main && workspacePackage.category !== 'app') {
        warnings.push('Publishable package should declare main.');
      }
      if (!pkg.types && workspacePackage.category !== 'app') {
        warnings.push('Publishable package should declare types.');
      }
    }

    if (workspacePackage.category === 'extension' && workspacePackage.packageJson.name !== '@mdwrk/extension-runtime') {
      if (!pkg.exports?.['./manifest']) {
        errors.push('Extension package must export ./manifest.');
      }
      if (!pkg.exports?.['./version']) {
        warnings.push('Extension package should export ./version.');
      }
    }

    results.push({
      packageName: pkg.name ?? null,
      path: workspacePackage.relativeDir,
      publishable: needsPublishValidation(workspacePackage),
      ok: errors.length === 0,
      errors,
      warnings,
    });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    validator: 'tools/conformance/validate-package-exports.mjs',
    ok: results.every((result) => result.ok),
    results,
  };

  await ensureDir(path.join(repoRoot, 'artifacts', 'conformance', 'latest'));
  await writeJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'package-export-report.json'), summary);

  return summary;
}

async function main() {
  const summary = await runExportValidation();
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (!summary.ok) {
    process.exitCode = 1;
  }
}

if (isCliEntry(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
