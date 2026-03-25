import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  ensureDir,
  isCliEntry,
  loadExtensionManifestForPackage,
  loadWorkspacePackages,
  pathExists,
  repoRoot,
  satisfiesRange,
  writeJson,
} from '../lib/workspace.mjs';

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function readExportedLiteral(workspacePackage, exportName) {
  if (!workspacePackage) {
    return null;
  }

  const candidates = [
    path.join(workspacePackage.dir, 'src', 'version.ts'),
    path.join(workspacePackage.dir, 'dist', 'version.js'),
  ];

  for (const candidate of candidates) {
    if (!(await pathExists(candidate))) {
      continue;
    }

    const text = await fs.readFile(candidate, 'utf8');
    const pattern = new RegExp(
      `export\\s+const\\s+${escapeRegExp(exportName)}\\s*=\\s*(?:\"([^\"]+)\"|'([^']+)'|(\\d+))`,
    );
    const match = text.match(pattern);
    if (!match) {
      continue;
    }
    if (match[1] != null) {
      return match[1];
    }
    if (match[2] != null) {
      return match[2];
    }
    if (match[3] != null) {
      return Number.parseInt(match[3], 10);
    }
  }

  return null;
}

export async function runCompatibilityValidation() {
  const workspaces = await loadWorkspacePackages();
  const byName = new Map(workspaces.map((workspacePackage) => [workspacePackage.packageJson.name, workspacePackage]));
  const clientPackage = workspaces.find((workspacePackage) => workspacePackage.relativeDir === 'apps/client');
  const manifestContractPackage = byName.get('@mdwrk/extension-manifest');
  const hostPackage = byName.get('@mdwrk/extension-host');
  const runtimePackage = byName.get('@mdwrk/extension-runtime');
  const themeContractPackage = byName.get('@mdwrk/theme-contract');

  const platformBaselines = {
    client: clientPackage?.packageJson.version ?? null,
    manifestVersion: (await readExportedLiteral(manifestContractPackage, 'EXTENSION_MANIFEST_VERSION')) ?? 1,
    hostApi: (await readExportedLiteral(hostPackage, 'EXTENSION_HOST_API_VERSION')) ?? hostPackage?.packageJson.version ?? null,
    runtime: (await readExportedLiteral(runtimePackage, 'EXTENSION_RUNTIME_VERSION')) ?? runtimePackage?.packageJson.version ?? null,
    themeContract: (await readExportedLiteral(themeContractPackage, 'THEME_CONTRACT_VERSION')) ?? themeContractPackage?.packageJson.version ?? null,
  };

  const extensionPackages = workspaces.filter(
    (workspacePackage) => workspacePackage.category === 'extension' && workspacePackage.packageJson.name !== '@mdwrk/extension-runtime',
  );

  const results = [];
  for (const workspacePackage of extensionPackages) {
    const manifest = await loadExtensionManifestForPackage(workspacePackage);
    const errors = [];
    const warnings = [];

    if (!manifest) {
      errors.push('No compiled manifest available for compatibility validation.');
    } else {
      if (platformBaselines.manifestVersion != null && manifest.compatibility?.manifestVersion !== platformBaselines.manifestVersion) {
        errors.push(
          `Manifest compatibility version ${manifest.compatibility?.manifestVersion} does not match supported manifest schema version ${platformBaselines.manifestVersion}.`,
        );
      }
      if (platformBaselines.hostApi && manifest.compatibility?.hostApi && !satisfiesRange(platformBaselines.hostApi, manifest.compatibility.hostApi)) {
        errors.push(`Host API baseline ${platformBaselines.hostApi} does not satisfy manifest hostApi requirement ${manifest.compatibility.hostApi}.`);
      }
      if (platformBaselines.runtime && manifest.compatibility?.runtime && !satisfiesRange(platformBaselines.runtime, manifest.compatibility.runtime)) {
        errors.push(`Runtime baseline ${platformBaselines.runtime} does not satisfy manifest runtime requirement ${manifest.compatibility.runtime}.`);
      }
      if (
        platformBaselines.themeContract &&
        manifest.compatibility?.themeContract &&
        !satisfiesRange(platformBaselines.themeContract, manifest.compatibility.themeContract)
      ) {
        errors.push(
          `Theme contract baseline ${platformBaselines.themeContract} does not satisfy manifest themeContract requirement ${manifest.compatibility.themeContract}.`,
        );
      }
      if (platformBaselines.client && manifest.compatibility?.app && !satisfiesRange(platformBaselines.client, manifest.compatibility.app)) {
        errors.push(`Client version ${platformBaselines.client} does not satisfy manifest app range ${manifest.compatibility.app}.`);
      }
      if (!Array.isArray(manifest.capabilities) || manifest.capabilities.length === 0) {
        warnings.push('Manifest does not declare any capabilities.');
      }
    }

    const reactPeer = workspacePackage.packageJson.peerDependencies?.react;
    const reactDomPeer = workspacePackage.packageJson.peerDependencies?.['react-dom'];
    if (reactPeer && reactPeer !== '^19.0.0') {
      warnings.push(`React peer dependency is ${reactPeer}; workspace baseline is ^19.0.0.`);
    }
    if (reactDomPeer && reactDomPeer !== '^19.0.0') {
      warnings.push(`react-dom peer dependency is ${reactDomPeer}; workspace baseline is ^19.0.0.`);
    }

    results.push({
      packageName: workspacePackage.packageJson.name,
      path: workspacePackage.relativeDir,
      compatible: errors.length === 0,
      errors,
      warnings,
      declaredCompatibility: manifest?.compatibility ?? null,
    });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    validator: 'tools/conformance/validate-compatibility.mjs',
    ok: results.every((result) => result.compatible),
    platformBaselines,
    results,
  };

  await ensureDir(path.join(repoRoot, 'artifacts', 'conformance', 'latest'));
  await writeJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'compatibility-matrix.json'), summary);

  return summary;
}

async function main() {
  const summary = await runCompatibilityValidation();
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
