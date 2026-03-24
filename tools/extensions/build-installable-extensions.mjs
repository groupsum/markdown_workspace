import path from 'node:path';
import {
  copyRecursive,
  ensureDir,
  hashFile,
  isCliEntry,
  loadExtensionManifestForPackage,
  loadWorkspacePackages,
  pathExists,
  repoRoot,
  resetDir,
  writeJson,
  writeText,
} from '../lib/workspace.mjs';

function normalizeEntrypointModulePath(modulePath) {
  const normalized = String(modulePath || './index.js').replace(/^\.\//, '');
  return normalized.startsWith('dist/') ? normalized : `dist/${normalized}`;
}

function createCatalogEntryId(extensionId, version) {
  return `${extensionId}@${version}`;
}

export async function buildInstallableExtensions() {
  const workspaces = await loadWorkspacePackages();
  const extensionPackages = workspaces.filter(
    (workspacePackage) => workspacePackage.category === 'extension' && workspacePackage.packageJson.name !== '@markdown-workspace/extension-runtime',
  );

  const allArtifacts = [];
  const catalogEntries = [];
  const failures = [];

  const artifactsRoot = path.join(repoRoot, 'artifacts', 'extensions');
  await resetDir(artifactsRoot);

  for (const workspacePackage of extensionPackages) {
    const manifest = await loadExtensionManifestForPackage(workspacePackage);
    if (!manifest) {
      failures.push({ packageName: workspacePackage.packageJson.name, reason: 'Manifest export could not be resolved.' });
      continue;
    }

    const versionRoot = path.join(artifactsRoot, manifest.id, manifest.version);
    const distDir = path.join(workspacePackage.dir, 'dist');
    if (!(await pathExists(distDir))) {
      failures.push({ packageName: workspacePackage.packageJson.name, reason: 'dist/ directory is missing; build the package before bundling artifacts.' });
      continue;
    }

    await ensureDir(versionRoot);
    await copyRecursive(distDir, path.join(versionRoot, 'dist'));
    if (await pathExists(path.join(workspacePackage.dir, 'README.md'))) {
      await copyRecursive(path.join(workspacePackage.dir, 'README.md'), path.join(versionRoot, 'README.md'));
    }
    if (await pathExists(path.join(repoRoot, 'LICENSE'))) {
      await copyRecursive(path.join(repoRoot, 'LICENSE'), path.join(versionRoot, 'LICENSE'));
    }

    const artifactPackageJson = {
      ...workspacePackage.packageJson,
      browserInstallable: manifest.kind === 'external',
      bundledBy: 'tools/extensions/build-installable-extensions.mjs',
    };

    const manifestArtifactPath = path.join(versionRoot, 'manifest.json');
    await writeJson(path.join(versionRoot, 'package.json'), artifactPackageJson);
    await writeJson(manifestArtifactPath, manifest);

    const entryModulePath = normalizeEntrypointModulePath(manifest.entry?.module);
    const entryModuleAbsolutePath = path.join(versionRoot, entryModulePath);
    if (!(await pathExists(entryModuleAbsolutePath))) {
      failures.push({ packageName: workspacePackage.packageJson.name, reason: `Expected entry module '${entryModulePath}' was not found in the artifact.` });
      continue;
    }

    const installable = {
      id: manifest.id,
      packageName: manifest.packageName,
      version: manifest.version,
      format: 'esm-directory',
      entry: manifest.entry,
      distDirectory: 'dist',
      entryModulePath,
      exports: workspacePackage.packageJson.exports,
      capabilities: manifest.capabilities,
      supportedLocales: manifest.i18n?.supportedLocales ?? [],
      generatedAt: new Date().toISOString(),
    };
    await writeJson(path.join(versionRoot, 'installable.json'), installable);

    const artifactPath = path.relative(repoRoot, versionRoot).split(path.sep).join('/');
    const artifactRecord = {
      id: manifest.id,
      packageName: manifest.packageName,
      version: manifest.version,
      kind: manifest.kind,
      artifactPath,
      entryModulePath,
      supportedLocales: manifest.i18n?.supportedLocales ?? [],
      generatedAt: new Date().toISOString(),
    };
    allArtifacts.push(artifactRecord);

    if (manifest.kind === 'external' || manifest.distribution?.channel === 'catalog') {
      catalogEntries.push({
        entryId: createCatalogEntryId(manifest.id, manifest.version),
        extensionId: manifest.id,
        packageName: manifest.packageName,
        version: manifest.version,
        displayName: manifest.displayName,
        description: manifest.description,
        publisher: manifest.publisher,
        icon: manifest.icon,
        categories: manifest.categories ?? [],
        keywords: manifest.keywords ?? [],
        capabilities: manifest.capabilities,
        compatibility: manifest.compatibility,
        supportedLocales: manifest.i18n?.supportedLocales ?? [],
        urls: {
          manifest: `${artifactPath}/manifest.json`,
          signedManifest: `${artifactPath}/signed-manifest.json`,
          module: `${artifactPath}/${entryModulePath}`,
          integrity: `${artifactPath}/integrity.json`,
        },
        integrity: {
          manifest: {
            algorithm: 'sha256',
            digest: await hashFile(manifestArtifactPath),
          },
          module: {
            algorithm: 'sha256',
            digest: await hashFile(entryModuleAbsolutePath),
          },
        },
        support: manifest.support,
      });
    }
  }

  const index = {
    generatedAt: new Date().toISOString(),
    generator: 'tools/extensions/build-installable-extensions.mjs',
    ok: failures.length === 0,
    artifacts: allArtifacts,
    failures,
  };

  const catalog = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    generator: 'tools/extensions/build-installable-extensions.mjs',
    baseUrl: './',
    ok: failures.length === 0,
    extensions: catalogEntries,
    failures,
  };

  await writeJson(path.join(artifactsRoot, 'index.json'), index);
  await writeJson(path.join(artifactsRoot, 'catalog.json'), catalog);
  await writeText(
    path.join(artifactsRoot, 'README.md'),
    [
      '# Extension artifacts',
      '',
      'This directory contains browser-installable ESM extension payloads generated from the workspace extension packages.',
      '',
      '- `index.json` lists every generated artifact package.',
      '- `catalog.json` lists only externally installable catalog entries.',
      '- each external catalog entry references `manifest.json`, `signed-manifest.json`, `installable.json`, and the ESM entry module under `dist/`.',
      '- `public-signers.json` and `trust-policy.sample.json` are generated by the signing step.',
      '',
      'Integrity and signature metadata are generated by `tools/extensions/sign-extension-artifacts.mjs`.',
      '',
    ].join('\n'),
  );

  return catalog;
}

async function main() {
  const catalog = await buildInstallableExtensions();
  process.stdout.write(`${JSON.stringify(catalog, null, 2)}\n`);
  if (!catalog.ok) {
    process.exitCode = 1;
  }
}

if (isCliEntry(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
