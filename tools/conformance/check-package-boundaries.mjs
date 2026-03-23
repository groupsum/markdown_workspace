import path from 'node:path';
import {
  collectFiles,
  ensureDir,
  findOwningWorkspace,
  getWorkspaceByName,
  isCliEntry,
  loadWorkspacePackages,
  readText,
  relativeToRepo,
  repoRoot,
  writeJson,
} from '../lib/workspace.mjs';

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css']);
const SOURCE_SKIP = new Set(['dist', 'node_modules', 'coverage', 'artifacts']);

const ALLOWED_DEPENDENCY_CATEGORIES = {
  contract: new Set(['contract']),
  shared: new Set(['contract', 'shared']),
  renderer: new Set(['contract', 'shared', 'renderer']),
  editor: new Set(['contract', 'shared', 'renderer', 'editor']),
  extension: new Set(['contract', 'shared', 'renderer', 'editor', 'extension']),
  app: new Set(['contract', 'shared', 'renderer', 'editor', 'extension', 'app']),
  example: new Set(['contract', 'shared', 'renderer', 'editor', 'extension']),
  other: new Set(['contract', 'shared', 'renderer', 'editor', 'extension', 'app', 'example', 'other']),
};

const IMPORT_PATTERNS = [
  /(?:import|export)\s+(?:[^'"`]*?\s+from\s+)?["'`]([^"'`]+)["'`]/g,
  /import\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  /require\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  /@import\s+["'`]([^"'`]+)["'`]/g,
];

function extractSpecifiers(sourceText) {
  const specifiers = new Set();
  for (const pattern of IMPORT_PATTERNS) {
    for (const match of sourceText.matchAll(pattern)) {
      const specifier = match[1];
      if (specifier) {
        specifiers.add(specifier);
      }
    }
  }
  return [...specifiers].sort();
}

function resolveRelativeImport(sourceFile, specifier) {
  const basePath = path.resolve(path.dirname(sourceFile), specifier);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    `${basePath}.mjs`,
    `${basePath}.cjs`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
    path.join(basePath, 'index.js'),
    path.join(basePath, 'index.mjs'),
    path.join(basePath, 'index.css'),
  ];
  return candidates[0];
}

function categorizeImport(specifier, workspaceByName) {
  let bestMatch = null;
  for (const workspaceName of workspaceByName.keys()) {
    if (specifier === workspaceName || specifier.startsWith(`${workspaceName}/`)) {
      if (!bestMatch || workspaceName.length > bestMatch.length) {
        bestMatch = workspaceName;
      }
    }
  }
  return bestMatch ? workspaceByName.get(bestMatch) : null;
}

export async function runBoundaryCheck() {
  const workspaces = await loadWorkspacePackages();
  const workspaceByName = getWorkspaceByName(workspaces);
  const violations = [];
  const scannedFiles = [];

  for (const workspacePackage of workspaces) {
    const files = await collectFiles(workspacePackage.dir, { extensions: SOURCE_EXTENSIONS, skip: SOURCE_SKIP });
    for (const file of files) {
      const relativeFile = relativeToRepo(file);
      if (relativeFile.includes('/dist/') || relativeFile.startsWith('artifacts/')) {
        continue;
      }
      scannedFiles.push(relativeFile);
      const sourceText = await readText(file);
      const specifiers = extractSpecifiers(sourceText);
      for (const specifier of specifiers) {
        if (specifier.startsWith('.') || specifier.startsWith('/')) {
          const resolved = resolveRelativeImport(file, specifier);
          const targetWorkspace = findOwningWorkspace(workspaces, resolved);
          if (targetWorkspace && targetWorkspace.dir !== workspacePackage.dir) {
            const allowed = ALLOWED_DEPENDENCY_CATEGORIES[workspacePackage.category] ?? new Set();
            if (!allowed.has(targetWorkspace.category)) {
              violations.push({
                source: relativeFile,
                specifier,
                reason: `Relative import crosses into disallowed workspace category ${targetWorkspace.category}.`,
                targetWorkspace: targetWorkspace.packageJson.name,
              });
            }
          }
          continue;
        }

        if (specifier.startsWith('node:') || (!specifier.startsWith('@markdown-workspace/') && !specifier.startsWith('@swarmauri/markspace') && !specifier.startsWith('markspace---'))) {
          continue;
        }

        if (specifier.includes('/src/')) {
          violations.push({
            source: relativeFile,
            specifier,
            reason: 'Deep imports into another package source tree are forbidden.',
            targetWorkspace: null,
          });
          continue;
        }

        const targetWorkspace = categorizeImport(specifier, workspaceByName);
        if (!targetWorkspace) {
          continue;
        }

        const allowed = ALLOWED_DEPENDENCY_CATEGORIES[workspacePackage.category] ?? new Set();
        if (!allowed.has(targetWorkspace.category)) {
          violations.push({
            source: relativeFile,
            specifier,
            reason: `Workspace category ${workspacePackage.category} may not depend on ${targetWorkspace.category}.`,
            targetWorkspace: targetWorkspace.packageJson.name,
          });
        }

        if (workspacePackage.category !== 'app' && targetWorkspace.category === 'app') {
          violations.push({
            source: relativeFile,
            specifier,
            reason: 'Packages and examples may not import application packages.',
            targetWorkspace: targetWorkspace.packageJson.name,
          });
        }
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    checker: 'tools/conformance/check-package-boundaries.mjs',
    ok: violations.length === 0,
    scannedFileCount: scannedFiles.length,
    violations,
  };

  await ensureDir(path.join(repoRoot, 'artifacts', 'conformance', 'latest'));
  await writeJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'package-boundary-report.json'), report);

  return report;
}

async function main() {
  const report = await runBoundaryCheck();
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
