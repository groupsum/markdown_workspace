import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const targets = [
  'apps/client/components',
  'apps/client/src/features/settings',
];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
const violations = [];

const shouldScanFile = (relativePath) => {
  if (relativePath.includes(`${path.sep}dist${path.sep}`)) return false;
  if (relativePath.includes(`${path.sep}html_theme_examples${path.sep}`)) return false;
  const ext = path.extname(relativePath);
  return sourceExtensions.has(ext);
};

const inspectFile = (relativePath) => {
  const absolutePath = path.join(repoRoot, relativePath);
  const text = readFileSync(absolutePath, 'utf8');
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (/\bstyle\s*=\s*\{/.test(line)) {
      violations.push(`${relativePath}:${index + 1} uses a JSX style prop`);
    }
    if (/\.style\./.test(line) || /\.style\s*=/.test(line)) {
      violations.push(`${relativePath}:${index + 1} mutates element styles directly`);
    }
  });
};

const walk = (relativeDir) => {
  const absoluteDir = path.join(repoRoot, relativeDir);
  const entries = readdirSync(absoluteDir, { withFileTypes: true });

  for (const entry of entries) {
    const childRelativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      walk(childRelativePath);
      continue;
    }
    if (shouldScanFile(childRelativePath)) {
      inspectFile(childRelativePath);
    }
  }
};

for (const target of targets) {
  const absoluteTarget = path.join(repoRoot, target);
  if (!statSync(absoluteTarget).isDirectory()) {
    continue;
  }
  walk(target);
}

if (violations.length > 0) {
  console.error('Component styling contract violated. Components/views must use className-only styling.');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log('Component styling contract passed.');
