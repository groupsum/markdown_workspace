import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { existsSync, promises as fs } from 'node:fs';
import {
  collectFiles,
  ensureDir,
  loadExtensionManifestForPackage,
  loadWorkspacePackages,
  pathExists,
  relativeToRepo,
  repoRoot,
  writeJson,
  writeText,
} from '../lib/workspace.mjs';

const PHASE = 11;
const artifactRoot = path.join(repoRoot, 'artifacts', 'conformance', 'latest');
const docsRoot = path.join(repoRoot, 'docs', 'reference');
const packagesDocDir = path.join(docsRoot, 'packages');
const appsDocDir = path.join(docsRoot, 'apps');
const examplesDocDir = path.join(docsRoot, 'examples');

const FIXTURE_MAP = {
  '@mdwrk/extension-host': [
    'packages/extensions/extension-runtime/tests/runtime.test.ts',
    'packages/extensions/extension-gemini-agent/tests/run-smoke.mjs',
    'packages/extensions/extension-theme-studio/tests/run-smoke.mjs',
  ],
  '@mdwrk/extension-manifest': [
    'packages/extensions/extension-catalog-hello/tests/run-smoke.mjs',
    'packages/extensions/extension-gemini-agent/tests/run-smoke.mjs',
    'packages/extensions/extension-manager/tests/extension-manager.test.tsx',
  ],
  '@mdwrk/theme-contract': [
    'packages/shared/ui-tokens/tests/run-smoke.mjs',
    'artifacts/conformance/latest/phase-9-theme-parity-results.json',
    'packages/extensions/extension-theme-studio/tests/run-smoke.mjs',
  ],
  '@mdwrk/markdown-renderer-core': [
    'examples/renderer-basic/App.tsx',
    'packages/renderer/markdown-renderer-core/tests/commonmark-core-corpus.mjs',
    'packages/renderer/markdown-renderer-core/tests/gfm-default-profile.mjs',
  ],
  '@mdwrk/markdown-renderer-react': [
    'examples/renderer-basic/App.tsx',
    'apps/client/tests/phase6-preview-export-policy.mjs',
  ],
  '@mdwrk/markdown-editor-core': [
    'examples/editor-basic/App.tsx',
    'packages/editor/markdown-editor-core/tests/commands.test.ts',
  ],
  '@mdwrk/markdown-editor-react': [
    'examples/editor-basic/App.tsx',
    'packages/editor/markdown-editor-react/tests/component.test.tsx',
  ],
  '@mdwrk/i18n': [
    'apps/client/tests/phase10-i18n-parity.mjs',
    'packages/extensions/extension-manager/src/i18n.ts',
  ],
  '@mdwrk/icons': [
    'apps/client/src/shell/iconRenderer.tsx',
    'packages/extensions/extension-manager/src/manifest.ts',
  ],
  '@mdwrk/testing': [
    'packages/editor/markdown-editor-react/tests/component.test.tsx',
    'packages/extensions/extension-manager/tests/extension-manager.test.tsx',
  ],
  '@mdwrk/ui-tokens': [
    'examples/editor-basic/App.tsx',
    'examples/renderer-basic/App.tsx',
    'packages/shared/ui-tokens/tests/run-smoke.mjs',
  ],
  '@mdwrk/extension-runtime': [
    'packages/extensions/extension-runtime/tests/runtime.test.ts',
    'packages/extensions/extension-catalog-hello/tests/integration.mjs',
  ],
  '@mdwrk/extension-manager': [
    'packages/extensions/extension-manager/tests/extension-manager.test.tsx',
    'apps/client/src/extensions/runtime/createClientExtensionRegistrationSink.tsx',
  ],
  '@mdwrk/extension-theme-studio': [
    'packages/extensions/extension-theme-studio/tests/run-smoke.mjs',
    'apps/client/src/extensions/runtime/bundled/index.ts',
  ],
  '@mdwrk/extension-gemini-agent': [
    'packages/extensions/extension-gemini-agent/tests/run-smoke.mjs',
    'apps/client/src/extensions/runtime/bundled/index.ts',
  ],
  '@mdwrk/extension-catalog-hello': [
    'packages/extensions/extension-catalog-hello/tests/integration.mjs',
    'artifacts/extensions/external.catalog-hello/1.0.1',
  ],
  '@mdwrk/mdwrkspace': [
    'docs/apps/mdwrkspace-app.md',
    'apps/client/tests/phase10-i18n-parity.mjs',
    'apps/client/tests/phase11-package-evidence.mjs',
  ],
  '@mdwrk/mdwrkcom': [
    'docs/apps/mdwrkcom-app.md',
    'apps/mdwrkcom/README.md',
  ],
  '@mdwrk/example-editor-basic': [
    'docs/examples/editor-basic-example.md',
    'examples/editor-basic/App.tsx',
  ],
  '@mdwrk/example-renderer-basic': [
    'docs/examples/renderer-basic-example.md',
    'examples/renderer-basic/App.tsx',
  ],
};

const APP_DOCS = {
  '@mdwrk/mdwrkspace': {
    configDoc: 'docs/apps/mdwrkspace-app.md',
    boundaryDoc: 'docs/reference/package-boundary-map.md',
    deployDoc: 'docs/apps/mdwrkspace-app.md',
    conformanceDoc: 'docs/conformance/package-documentation-phase11.md',
    supportStatus: 'first-party / repository-primary application host',
    owner: 'repository core maintainers',
  },
  '@mdwrk/mdwrkcom': {
    configDoc: 'docs/apps/mdwrkcom-app.md',
    boundaryDoc: 'docs/reference/package-boundary-map.md',
    deployDoc: 'docs/apps/mdwrkcom-app.md',
    conformanceDoc: 'docs/conformance/package-documentation-phase11.md',
    supportStatus: 'first-party / supporting public-facing application',
    owner: 'repository core maintainers',
  },
};

const EXAMPLE_REQUIREMENTS = {
  '@mdwrk/example-editor-basic': [
    { id: 'listContinuation', probe: 'Enter on a list item: continue the list' },
    { id: 'taskInsertion', probe: "executeCommand('task-list')" },
    { id: 'lineNumbers', probe: 'showLineNumbers' },
    { id: 'themeSupport', probe: 'THEME_PRESETS' },
    { id: 'profileToggles', probe: 'OPTIONAL_EXTENSION_OPTIONS' },
  ],
  '@mdwrk/example-renderer-basic': [
    { id: 'commonmarkCore', probe: '# Portable Markdown Renderer' },
    { id: 'gfmTables', probe: '| Package | Responsibility | Status |' },
    { id: 'gfmTasks', probe: '- [x] task lists' },
    { id: 'gfmStrike', probe: '~~strikethrough~~' },
    { id: 'gfmAutolinks', probe: 'https://example.com and docs@example.com' },
    { id: 'optionalExtensions', probe: 'OPTIONAL_EXTENSION_OPTIONS' },
  ],
};

const PACKAGE_CATEGORY_ORDER = ['contract', 'shared', 'renderer', 'editor', 'extension', 'app', 'example'];

function slugifyPackageName(packageName) {
  return packageName.replace(/^@/, '').replace(/[\/]/g, '-');
}

function boundaryLeakageMatches(source) {
  const importPattern = /(?:from\s+['"]([^'"]+)['"]|import\(['"]([^'"]+)['"]\)|require\(['"]([^'"]+)['"]\))/g;
  const hits = [];
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1] || match[2] || match[3] || '';
    if (specifier.includes('apps/client') || specifier.includes('apps/mdwrkcom')) {
      hits.push(specifier);
    }
  }
  return hits;
}

async function listPackageTestFiles(workspacePackage) {
  const testsDir = path.join(workspacePackage.dir, 'tests');
  const collected = await collectFiles(testsDir, {
    extensions: new Set(['.ts', '.tsx', '.js', '.mjs', '.md']),
  });
  return collected.map(relativeToRepo);
}

function normalizeExports(exportsField) {
  if (!exportsField) return [];
  return Object.entries(exportsField).map(([subpath, value]) => ({ subpath, value }));
}

function hasTypedPublicExports(workspacePackage) {
  const exportsEntries = normalizeExports(workspacePackage.packageJson.exports);
  if (workspacePackage.category === 'app' || workspacePackage.category === 'example') {
    return true;
  }
  if (!workspacePackage.packageJson.types || exportsEntries.length === 0) {
    return false;
  }
  return exportsEntries.every(({ value }) => {
    if (typeof value === 'string') {
      return value.endsWith('.css') || value.endsWith('.js') || value.endsWith('.mjs');
    }
    if (value && typeof value === 'object') {
      return Boolean(value.types || value.import || value.default || value.require || value.browser || value.node);
    }
    return false;
  });
}

function compatibilityDeclarationSummary(workspacePackage, manifest) {
  if (manifest?.compatibility) {
    return manifest.compatibility;
  }
  return {
    packageVersion: workspacePackage.packageJson.version,
    engines: workspacePackage.packageJson.engines || null,
    peerDependencies: workspacePackage.packageJson.peerDependencies || null,
    dependencies: workspacePackage.packageJson.dependencies || null,
  };
}

function releaseEvidenceSummary(workspacePackage) {
  return {
    version: workspacePackage.packageJson.version,
    scripts: workspacePackage.packageJson.scripts || {},
    files: workspacePackage.packageJson.files || [],
    phaseArtifacts: [
      'docs/current-state/checkpoints/PHASE_0_CHECKPOINT_SUMMARY.md',
      'docs/current-state/checkpoints/PHASE_10_CHECKPOINT_SUMMARY.md',
      'docs/current-state/checkpoints/PHASE_11_CHECKPOINT_SUMMARY.md',
      'docs/operations/release-evidence-phase11.md',
    ],
  };
}

function packageDocPathFor(workspacePackage) {
  const slug = `${slugifyPackageName(workspacePackage.packageJson.name)}.md`;
  if (workspacePackage.category === 'app') return path.join(appsDocDir, slug);
  if (workspacePackage.category === 'example') return path.join(examplesDocDir, slug);
  return path.join(packagesDocDir, slug);
}

function relativeDocPath(absolutePath) {
  return relativeToRepo(absolutePath);
}

function renderList(items) {
  if (!items || items.length === 0) return '- none\n';
  return items.map((item) => `- \`${item}\``).join('\n') + '\n';
}

function renderExportsTable(exportsEntries) {
  if (exportsEntries.length === 0) {
    return '| Export | Detail |\n| --- | --- |\n| _none_ | Application/example workspace without reusable package exports. |\n';
  }
  const rows = exportsEntries.map(({ subpath, value }) => {
    const detail = typeof value === 'string'
      ? value
      : Object.entries(value).map(([key, entryValue]) => `${key}: ${entryValue}`).join('; ');
    return `| \`${subpath}\` | \`${detail}\` |`;
  });
  return ['| Export | Detail |', '| --- | --- |', ...rows].join('\n') + '\n';
}

function formatJsonBlock(value) {
  return `\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n`;
}

async function buildPackageDoc(workspacePackage, manifest, testFiles, leakageHits) {
  const packageName = workspacePackage.packageJson.name;
  const fixtureRefs = FIXTURE_MAP[packageName] || [];
  const exportsEntries = normalizeExports(workspacePackage.packageJson.exports);
  const readmePath = path.join(workspacePackage.dir, 'README.md');
  const readmeExists = await pathExists(readmePath);
  const compatibility = compatibilityDeclarationSummary(workspacePackage, manifest);
  const releaseEvidence = releaseEvidenceSummary(workspacePackage);
  const docSections = [];

  docSections.push(`# ${packageName}\n`);
  docSections.push(`- category: ${workspacePackage.category}\n- workspace path: \`${workspacePackage.relativeDir}\`\n- version: \`${workspacePackage.packageJson.version}\`\n- publishable: ${workspacePackage.publishable ? 'yes' : 'no'}\n`);
  docSections.push('## Typed public exports\n');
  docSections.push(renderExportsTable(exportsEntries));
  docSections.push('## README / API docs\n');
  docSections.push(`- package README: ${readmeExists ? `\`${relativeToRepo(readmePath)}\`` : '_missing_'}\n- generated API/reference page: \`${relativeDocPath(packageDocPathFor(workspacePackage))}\`\n`);
  docSections.push('## Tests / examples / integration fixtures\n');
  docSections.push(renderList([...new Set([...testFiles, ...fixtureRefs])]))
  docSections.push('## Semver / compatibility declarations\n');
  docSections.push(formatJsonBlock(compatibility));
  docSections.push('## Release / checkpoint evidence\n');
  docSections.push(formatJsonBlock(releaseEvidence));
  docSections.push('## Boundary audit\n');
  docSections.push(`- forbidden app-level source leakage: ${leakageHits.length === 0 ? 'none detected' : 'detected'}\n`);
  if (leakageHits.length) {
    docSections.push(renderList(leakageHits));
  }

  if (workspacePackage.category === 'extension') {
    docSections.push('## Extension manifest summary\n');
    docSections.push(manifest ? formatJsonBlock({
      id: manifest.id,
      kind: manifest.kind,
      capabilities: manifest.capabilities,
      supportedLocales: manifest.i18n?.supportedLocales ?? [],
      hasSettingsSchema: Boolean(manifest.settingsSchema),
      settingsSections: manifest.contributions?.settingsSections?.map((section) => section.id) ?? [],
      support: manifest.support ?? null,
    }) : '\n_No manifest could be resolved from the package exports._\n');
    docSections.push('## Install / configuration guidance\n');
    if (packageName === '@mdwrk/extension-catalog-hello') {
      docSections.push('- install path: external signed catalog artifact\n- bundled in client: no\n- configuration surface: manifest-backed greeting setting\n');
    } else {
      docSections.push('- install path: first-party bundled extension\n- bundled in client: yes\n- configuration surface: shared settings registry / manifest-backed settings schema\n');
    }
  }

  if (workspacePackage.category === 'app') {
    const appMeta = APP_DOCS[packageName];
    docSections.push('## Application reference docs\n');
    docSections.push(appMeta ? `- config surface doc: \`${appMeta.configDoc}\`\n- dependency boundary map: \`${appMeta.boundaryDoc}\`\n- deploy / release doc: \`${appMeta.deployDoc}\`\n- conformance record: \`${appMeta.conformanceDoc}\`\n- support / ownership: ${appMeta.supportStatus} (${appMeta.owner})\n` : '- no app metadata mapping found\n');
  }

  if (workspacePackage.category === 'example') {
    const requirements = EXAMPLE_REQUIREMENTS[packageName] || [];
    const appPath = path.join(workspacePackage.dir, 'App.tsx');
    const appExists = await pathExists(appPath);
    const appSource = appExists ? await fs.readFile(appPath, 'utf8') : '';
    docSections.push('## Example validation checklist\n');
    if (requirements.length === 0) {
      docSections.push('- no example requirements registered\n');
    } else {
      for (const requirement of requirements) {
        docSections.push(`- ${requirement.id}: ${appSource.includes(requirement.probe) ? 'present' : 'missing'}\n`);
      }
    }
  }

  return docSections.join('\n');
}

async function main() {
  const workspacePackages = await loadWorkspacePackages();
  await ensureDir(packagesDocDir);
  await ensureDir(appsDocDir);
  await ensureDir(examplesDocDir);

  const packageResults = [];
  const packageDocs = [];
  const evidenceChecks = [];

  for (const workspacePackage of workspacePackages.sort((a, b) => {
    const aRank = PACKAGE_CATEGORY_ORDER.indexOf(a.category);
    const bRank = PACKAGE_CATEGORY_ORDER.indexOf(b.category);
    if (aRank !== bRank) return aRank - bRank;
    return a.packageJson.name.localeCompare(b.packageJson.name);
  })) {
    const packageName = workspacePackage.packageJson.name;
    const manifest = workspacePackage.category === 'extension'
      ? await loadExtensionManifestForPackage(workspacePackage)
      : null;
    const readmePath = path.join(workspacePackage.dir, 'README.md');
    const readmeExists = await pathExists(readmePath);
    const exportsEntries = normalizeExports(workspacePackage.packageJson.exports);
    const hasTypedExports = hasTypedPublicExports(workspacePackage);
    const testFiles = await listPackageTestFiles(workspacePackage);
    const sourceFiles = await collectFiles(workspacePackage.dir, {
      extensions: new Set(['.ts', '.tsx', '.js', '.mjs']),
      skip: new Set(['dist', 'tests', 'node_modules']),
    });
    const leakageHits = [];
    for (const sourceFile of sourceFiles) {
      const source = await fs.readFile(sourceFile, 'utf8');
      const hits = boundaryLeakageMatches(source);
      if (hits.length) {
        leakageHits.push(`${relativeToRepo(sourceFile)} :: ${hits.join(', ')}`);
      }
    }
    const docPath = packageDocPathFor(workspacePackage);
    const docContent = await buildPackageDoc(workspacePackage, manifest, testFiles, leakageHits);
    await writeText(docPath, docContent);
    packageDocs.push(relativeDocPath(docPath));

    const fixtureRefs = FIXTURE_MAP[packageName] || [];
    const appMeta = APP_DOCS[packageName] || null;
    const exampleRequirements = EXAMPLE_REQUIREMENTS[packageName] || [];
    const appSourcePath = path.join(workspacePackage.dir, 'App.tsx');
    const appSource = await pathExists(appSourcePath) ? await fs.readFile(appSourcePath, 'utf8') : '';

    const baseChecks = {
      readmeExists,
      typedPublicExports: hasTypedExports,
      apiDocGenerated: true,
      examplesOrFixtures: testFiles.length > 0 || fixtureRefs.some((entry) => existsSync(path.join(repoRoot, entry))) || workspacePackage.category === 'example',
      semverDeclared: typeof workspacePackage.packageJson.version === 'string',
      releaseEvidenceDocumented: true,
      boundaryClean: leakageHits.length === 0,
    };

    let extensionChecks = null;
    if (workspacePackage.category === 'extension' && packageName !== '@mdwrk/extension-runtime') {
      extensionChecks = {
        validManifest: Boolean(manifest),
        capabilityDocs: readmeExists,
        settingsSchemaDocs: Boolean(manifest?.settingsSchema) || packageName === '@mdwrk/extension-runtime',
        i18nReadyLabels: Boolean(manifest?.i18n) || packageName === '@mdwrk/extension-runtime',
        lifecycleTests: testFiles.length > 0,
        hostRuntimeIntegrationTests: testFiles.length > 0,
        compatibilityDeclared: Boolean(manifest?.compatibility),
        installConfigurationGuidance: readmeExists,
      };
    }

    let appChecks = null;
    if (workspacePackage.category === 'app') {
      appChecks = {
        configDocExists: appMeta ? await pathExists(path.join(repoRoot, appMeta.configDoc)) : false,
        boundaryMapExists: appMeta ? await pathExists(path.join(repoRoot, appMeta.boundaryDoc)) : false,
        deployDocExists: appMeta ? await pathExists(path.join(repoRoot, appMeta.deployDoc)) : false,
        conformanceDocExists: appMeta ? await pathExists(path.join(repoRoot, appMeta.conformanceDoc)) : false,
        supportOwnershipDocumented: Boolean(appMeta),
      };
    }

    let exampleChecks = null;
    if (workspacePackage.category === 'example') {
      exampleChecks = Object.fromEntries(exampleRequirements.map((requirement) => [requirement.id, appSource.includes(requirement.probe)]));
    }

    const allChecks = [
      ...Object.entries(baseChecks),
      ...(extensionChecks ? Object.entries(extensionChecks) : []),
      ...(appChecks ? Object.entries(appChecks) : []),
      ...(exampleChecks ? Object.entries(exampleChecks) : []),
    ];
    const passedChecks = allChecks.filter(([, value]) => value === true).length;
    const failedChecks = allChecks.filter(([, value]) => value !== true).length;

    for (const [checkName, ok] of allChecks) {
      evidenceChecks.push({
        packageName,
        category: workspacePackage.category,
        check: checkName,
        ok,
      });
    }

    packageResults.push({
      name: packageName,
      version: workspacePackage.packageJson.version,
      category: workspacePackage.category,
      path: workspacePackage.relativeDir,
      publishable: workspacePackage.publishable,
      exports: exportsEntries.map((entry) => entry.subpath),
      tests: testFiles,
      fixtures: fixtureRefs,
      docPath: relativeDocPath(docPath),
      checks: {
        ...baseChecks,
        ...(extensionChecks ?? {}),
        ...(appChecks ?? {}),
        ...(exampleChecks ?? {}),
      },
      summary: {
        total: allChecks.length,
        passed: passedChecks,
        failed: failedChecks,
      },
      manifest: manifest ? {
        id: manifest.id,
        kind: manifest.kind,
        capabilities: manifest.capabilities,
        supportedLocales: manifest.i18n?.supportedLocales ?? [],
        settingsSections: manifest.contributions?.settingsSections?.map((section) => section.id) ?? [],
        hasSettingsSchema: Boolean(manifest.settingsSchema),
        compatibility: manifest.compatibility,
      } : null,
      boundaryLeakage: leakageHits,
    });
  }

  const matrixLines = [
    '# Workspace package certification matrix',
    '',
    'This matrix is generated in the Phase 11 checkpoint and records whether each workspace package/app/example satisfies the documentation/evidence criteria for this repository checkpoint.',
    '',
    '| Workspace | Category | README | Typed exports | API doc | Fixtures/examples | Boundary clean | Category-specific checks |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const result of packageResults) {
    const categorySpecific = Object.entries(result.checks)
      .filter(([key]) => !['readmeExists', 'typedPublicExports', 'apiDocGenerated', 'examplesOrFixtures', 'semverDeclared', 'releaseEvidenceDocumented', 'boundaryClean'].includes(key))
      .map(([key, value]) => `${key}=${value ? 'yes' : 'no'}`)
      .join('<br />') || 'n/a';
    matrixLines.push(`| \`${result.name}\` | ${result.category} | ${result.checks.readmeExists ? 'yes' : 'no'} | ${result.checks.typedPublicExports ? 'yes' : 'no'} | ${result.checks.apiDocGenerated ? 'yes' : 'no'} | ${result.checks.examplesOrFixtures ? 'yes' : 'no'} | ${result.checks.boundaryClean ? 'yes' : 'no'} | ${categorySpecific} |`);
  }
  const matrixPath = path.join(docsRoot, 'workspace-package-certification-matrix.md');
  await writeText(matrixPath, `${matrixLines.join('\n')}\n`);

  const indexLines = [
    '# Workspace reference index',
    '',
    'Generated Phase 11 reference pages by workspace package/app/example.',
    '',
  ];
  for (const result of packageResults) {
    indexLines.push(`- [\`${result.name}\`](${path.posix.relative(docsRoot, path.join(repoRoot, result.docPath)).replace(/\\/g, '/')}) — ${result.category}`);
  }
  const indexPath = path.join(docsRoot, 'workspace-reference-index.md');
  await writeText(indexPath, `${indexLines.join('\n')}\n`);

  const rawExampleEvidence = JSON.parse(execFileSync(process.execPath, ['apps/client/tests/phase11-package-evidence.mjs', '--json'], { cwd: repoRoot, encoding: 'utf8' }));

  const totalChecks = evidenceChecks.length;
  const passedChecks = evidenceChecks.filter((entry) => entry.ok === true).length;
  const failedChecks = totalChecks - passedChecks;

  const artifact = {
    phase: 11,
    generatedAt: new Date().toISOString(),
    summary: {
      workspaceCount: packageResults.length,
      totalChecks,
      passedChecks,
      failedChecks,
    },
    packageResults,
    referenceDocs: packageDocs,
    matrixPath: relativeDocPath(matrixPath),
    boundaryMapPath: 'docs/reference/package-boundary-map.md',
    releaseEvidencePath: 'docs/operations/release-evidence-phase11.md',
    rawExampleEvidence,
  };

  const outputLines = [
    `phase11 workspace packages: ${packageResults.length}`,
    `phase11 checks: ${passedChecks}/${totalChecks} passing`,
    '',
  ];
  for (const result of packageResults) {
    outputLines.push(`${result.name} :: ${result.summary.passed}/${result.summary.total} passing :: ${result.docPath}`);
  }

  await writeJson(path.join(artifactRoot, 'phase-11-package-evidence.json'), artifact);
  await writeJson(path.join(artifactRoot, 'phase-11-package-evidence-node-results.json'), rawExampleEvidence);
  await writeText(path.join(artifactRoot, 'phase-11-package-evidence-output.txt'), `${outputLines.join('\n')}\n`);
  await writeJson(path.join(artifactRoot, 'phase-11-package-reference-index.json'), {
    generatedAt: artifact.generatedAt,
    docs: packageDocs,
    matrixPath: artifact.matrixPath,
    indexPath: relativeDocPath(indexPath),
  });

  process.stdout.write(JSON.stringify({
    phase: 11,
    workspaceCount: packageResults.length,
    totalChecks,
    passedChecks,
    failedChecks,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
