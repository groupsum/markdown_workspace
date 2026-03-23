import path from 'node:path';
import {
  ensureDir,
  isCliEntry,
  loadExtensionManifestForPackage,
  loadWorkspacePackages,
  repoRoot,
  satisfiesRange,
  writeJson,
} from '../lib/workspace.mjs';

export async function runCompatibilityValidation() {
  const workspaces = await loadWorkspacePackages();
  const byName = new Map(workspaces.map((workspacePackage) => [workspacePackage.packageJson.name, workspacePackage]));
  const clientPackage = workspaces.find((workspacePackage) => workspacePackage.relativeDir === 'apps/client');
  const hostPackage = byName.get('@markdown-workspace/extension-host');
  const runtimePackage = byName.get('@markdown-workspace/extension-runtime');
  const themeContractPackage = byName.get('@markdown-workspace/theme-contract');

  const extensionPackages = workspaces.filter(
    (workspacePackage) => workspacePackage.category === 'extension' && workspacePackage.packageJson.name !== '@markdown-workspace/extension-runtime',
  );

  const results = [];
  for (const workspacePackage of extensionPackages) {
    const manifest = await loadExtensionManifestForPackage(workspacePackage);
    const errors = [];
    const warnings = [];

    if (!manifest) {
      errors.push('No compiled manifest available for compatibility validation.');
    } else {
      if (hostPackage && manifest.compatibility?.hostApi && manifest.compatibility.hostApi !== hostPackage.packageJson.version) {
        errors.push(`Host API compatibility ${manifest.compatibility.hostApi} does not match workspace host package version ${hostPackage.packageJson.version}.`);
      }
      if (runtimePackage && manifest.compatibility?.runtime && manifest.compatibility.runtime !== runtimePackage.packageJson.version) {
        errors.push(`Runtime compatibility ${manifest.compatibility.runtime} does not match workspace runtime version ${runtimePackage.packageJson.version}.`);
      }
      if (themeContractPackage && manifest.compatibility?.themeContract && manifest.compatibility.themeContract !== themeContractPackage.packageJson.version) {
        errors.push(`Theme contract compatibility ${manifest.compatibility.themeContract} does not match workspace theme contract version ${themeContractPackage.packageJson.version}.`);
      }
      if (clientPackage && manifest.compatibility?.app && !satisfiesRange(clientPackage.packageJson.version, manifest.compatibility.app)) {
        errors.push(`Client version ${clientPackage.packageJson.version} does not satisfy manifest app range ${manifest.compatibility.app}.`);
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
    workspaceVersions: {
      client: clientPackage?.packageJson.version ?? null,
      extensionHost: hostPackage?.packageJson.version ?? null,
      extensionRuntime: runtimePackage?.packageJson.version ?? null,
      themeContract: themeContractPackage?.packageJson.version ?? null,
    },
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
