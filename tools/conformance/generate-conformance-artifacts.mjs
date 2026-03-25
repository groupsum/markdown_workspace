import path from 'node:path';
import {
  ensureDir,
  hashFile,
  isCliEntry,
  loadExtensionManifestForPackage,
  loadWorkspacePackages,
  repoRoot,
  writeJson,
  writeText,
} from '../lib/workspace.mjs';
import { runBoundaryCheck } from './check-package-boundaries.mjs';
import { runCompatibilityValidation } from './validate-compatibility.mjs';
import { runExportValidation } from './validate-package-exports.mjs';
import { runManifestValidation } from './validate-extension-manifests.mjs';
import { validateExtensionArtifacts } from './validate-extension-artifacts.mjs';

export async function generateConformanceArtifacts() {
  const workspaces = await loadWorkspacePackages();
  const manifestReport = await runManifestValidation();
  const compatibilityReport = await runCompatibilityValidation();
  const boundaryReport = await runBoundaryCheck();
  const exportReport = await runExportValidation();
  const artifactReport = await validateExtensionArtifacts();

  const extensionCatalog = [];
  for (const workspacePackage of workspaces.filter((candidate) => candidate.category === 'extension' && candidate.packageJson.name !== '@mdwrk/extension-runtime')) {
    const manifest = await loadExtensionManifestForPackage(workspacePackage);
    if (!manifest) {
      continue;
    }
    extensionCatalog.push({
      id: manifest.id,
      packageName: manifest.packageName,
      version: manifest.version,
      enabledByDefault: manifest.enabledByDefault,
      capabilities: manifest.capabilities,
      locales: manifest.i18n?.supportedLocales ?? [],
      compatibility: manifest.compatibility,
    });
  }

  const packageInventory = workspaces.map((workspacePackage) => ({
    name: workspacePackage.packageJson.name,
    version: workspacePackage.packageJson.version,
    path: workspacePackage.relativeDir,
    category: workspacePackage.category,
    publishable: workspacePackage.publishable,
  }));

  const inventoryDigest = await hashFile(path.join(repoRoot, 'docs', 'architecture', 'package-inventory.md')).catch(() => null);

  const conformanceStatus = {
    generatedAt: new Date().toISOString(),
    ok: manifestReport.ok && compatibilityReport.ok && boundaryReport.ok && exportReport.ok && artifactReport.ok,
    checks: {
      extensionManifests: manifestReport.ok,
      compatibilityMatrix: compatibilityReport.ok,
      packageBoundaries: boundaryReport.ok,
      packageExports: exportReport.ok,
      extensionArtifacts: artifactReport.ok,
    },
    notes: [
      'Static conformance evidence is generated in-repo for checkpointing.',
      'Full browser-driven E2E and pixel-level visual regression remain future hardening work.',
      'Third-party external artifact verification now checks signed manifests, module integrity, and sample trust-policy alignment.',
    ],
  };

  const conformanceRoot = path.join(repoRoot, 'artifacts', 'conformance', 'latest');
  await ensureDir(conformanceRoot);
  await writeJson(path.join(conformanceRoot, 'package-inventory.json'), {
    generatedAt: new Date().toISOString(),
    packages: packageInventory,
    inventoryDigest,
  });
  await writeJson(path.join(conformanceRoot, 'extension-catalog.json'), {
    generatedAt: new Date().toISOString(),
    extensions: extensionCatalog,
  });
  await writeJson(path.join(conformanceRoot, 'conformance-status.json'), conformanceStatus);
  await writeJson(path.join(conformanceRoot, 'extension-artifact-validation.json'), artifactReport);
  await writeText(
    path.join(conformanceRoot, 'README.md'),
    [
      '# Conformance artifacts',
      '',
      'This directory contains generated static evidence for the Phase 13 CI/CD, conformance, and third-party extension distribution checkpoint.',
      '',
      'Files include:',
      '- `extension-manifest-validation.json`',
      '- `compatibility-matrix.json`',
      '- `package-boundary-report.json`',
      '- `package-export-report.json`',
      '- `package-inventory.json`',
      '- `extension-catalog.json`',
      '- `extension-artifact-validation.json`',
      '- `extension-artifact-integrity.json`',
      '- `extension-trust-policy.json`',
      '- `conformance-status.json`',
      '',
    ].join('\n'),
  );

  return conformanceStatus;
}

async function main() {
  const report = await generateConformanceArtifacts();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
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
