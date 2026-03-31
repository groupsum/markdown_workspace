import { ensureExists, fail } from './common.mjs';

const requiredDirs = ['apps', 'packages', 'docs', 'tools', 'specs', '.github'];
const requiredFiles = ['README.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'LICENSE', 'agents.md', 'specs/README.md'];

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
