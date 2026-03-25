import path from 'node:path';
import {
  ensureDir,
  isCliEntry,
  loadExtensionManifestForPackage,
  loadWorkspacePackages,
  normalizeLabel,
  repoRoot,
  writeJson,
} from '../lib/workspace.mjs';

function validateManifest(workspacePackage, manifest) {
  const errors = [];
  const warnings = [];

  if (!manifest) {
    errors.push('Missing manifest export or compiled manifest module.');
    return { valid: false, errors, warnings };
  }

  if (manifest.packageName !== workspacePackage.packageJson.name) {
    errors.push(`manifest.packageName ${manifest.packageName} does not match package.json name ${workspacePackage.packageJson.name}.`);
  }
  if (manifest.version !== workspacePackage.packageJson.version) {
    errors.push(`manifest.version ${manifest.version} does not match package.json version ${workspacePackage.packageJson.version}.`);
  }
  if (manifest.manifestVersion !== 1) {
    errors.push(`manifest.manifestVersion must be 1; received ${manifest.manifestVersion}.`);
  }
  if (!manifest.id || typeof manifest.id !== 'string') {
    errors.push('manifest.id must be a non-empty string.');
  }
  if (!normalizeLabel(manifest.displayName)) {
    errors.push('manifest.displayName must resolve to a non-empty label.');
  }
  if (!normalizeLabel(manifest.description)) {
    errors.push('manifest.description must resolve to a non-empty label.');
  }
  if (!manifest.icon || typeof manifest.icon !== 'object') {
    errors.push('manifest.icon must be declared.');
  }
  if (typeof manifest.enabledByDefault !== 'boolean') {
    errors.push('manifest.enabledByDefault must be boolean.');
  }
  if (!Array.isArray(manifest.capabilities)) {
    errors.push('manifest.capabilities must be an array.');
  }
  if (!manifest.compatibility || typeof manifest.compatibility !== 'object') {
    errors.push('manifest.compatibility must be present.');
  }
  if (!manifest.entry || typeof manifest.entry !== 'object') {
    errors.push('manifest.entry must be present.');
  } else {
    if (!manifest.entry.module) {
      errors.push('manifest.entry.module is required.');
    }
    if (!manifest.entry.export) {
      errors.push('manifest.entry.export is required.');
    }
  }
  if (!manifest.i18n || typeof manifest.i18n !== 'object') {
    errors.push('manifest.i18n must be present.');
  } else {
    if (!manifest.i18n.defaultLocale) {
      errors.push('manifest.i18n.defaultLocale is required.');
    }
    if (!Array.isArray(manifest.i18n.supportedLocales) || manifest.i18n.supportedLocales.length === 0) {
      errors.push('manifest.i18n.supportedLocales must be a non-empty array.');
    }
    if (manifest.i18n.catalogs != null && (!Array.isArray(manifest.i18n.catalogs) || manifest.i18n.catalogs.length === 0)) {
      errors.push('manifest.i18n.catalogs must be omitted or a non-empty array.');
    }
  }
  if (!manifest.contributions || typeof manifest.contributions !== 'object') {
    errors.push('manifest.contributions must be present.');
  } else {
    const contributionKeys = ['commands', 'views', 'components', 'actionRail', 'settingsSections'];
    for (const key of contributionKeys) {
      if (!Array.isArray(manifest.contributions[key])) {
        errors.push(`manifest.contributions.${key} must be an array.`);
      }
    }
  }
  if (!manifest.settingsSchema || typeof manifest.settingsSchema !== 'object') {
    errors.push('manifest.settingsSchema must be present.');
  } else {
    if (manifest.settingsSchema.version !== 1) {
      warnings.push(`settings schema version is ${manifest.settingsSchema.version}; expected 1.`);
    }
    if (!Array.isArray(manifest.settingsSchema.sections)) {
      errors.push('manifest.settingsSchema.sections must be an array.');
    }
    if (!Array.isArray(manifest.settingsSchema.fields)) {
      errors.push('manifest.settingsSchema.fields must be an array.');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export async function runManifestValidation() {
  const workspaces = await loadWorkspacePackages();
  const extensionPackages = workspaces.filter(
    (workspacePackage) => workspacePackage.category === 'extension' && workspacePackage.packageJson.name !== '@mdwrk/extension-runtime',
  );

  const results = [];
  for (const workspacePackage of extensionPackages) {
    const manifest = await loadExtensionManifestForPackage(workspacePackage);
    const validation = validateManifest(workspacePackage, manifest);
    results.push({
      packageName: workspacePackage.packageJson.name,
      path: workspacePackage.relativeDir,
      manifestId: manifest?.id ?? null,
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
    });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    validator: 'tools/conformance/validate-extension-manifests.mjs',
    ok: results.every((result) => result.valid),
    results,
  };

  await ensureDir(path.join(repoRoot, 'artifacts', 'conformance', 'latest'));
  await writeJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'extension-manifest-validation.json'), summary);

  return summary;
}

async function main() {
  const summary = await runManifestValidation();
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
