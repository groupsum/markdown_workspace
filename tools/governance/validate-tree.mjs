import { pathExists, failWithSpec } from './_utils.mjs';

const specPath = 'specs/repository-tree-spec.md';
const requiredPaths = [
  'apps',
  'packages',
  'docs',
  'tools',
  'artifacts',
  'specs',
  'README.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'LICENSE',
  'agents.md'
];

const missing = [];
for (const rel of requiredPaths) {
  if (!(await pathExists(rel))) missing.push(rel);
}

if (missing.length) {
  failWithSpec(specPath, 'Repository tree validation failed.', missing.map((entry) => `Missing required path: ${entry}`));
}

console.log('Repository tree validation passed.');
console.log(`Requirements reference: ${specPath}`);
