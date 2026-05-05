import { ensureExists, fail } from './common.mjs';

const requiredDirs = ['apps', 'packages', 'docs', 'tools', '.github', '.ssot', '.ssot/specs'];
const requiredFiles = [
  'README.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'LICENSE',
  'AGENTS.md',
  '.ssot/registry.json',
  '.ssot/specs/SPEC-2001-specs-index.yaml',
  '.ssot/specs/SPEC-2002-repository-governance.yaml'
];

for (const dir of requiredDirs) {
  ensureExists(dir, 'directory');
}

for (const file of requiredFiles) {
  ensureExists(file, 'file');
}

if (!process.cwd().endsWith('markdown_workspace')) {
  fail('Governance checks must run from repository root.');
}

console.log('Tree validation passed.');
