import { fail, readUtf8 } from './common.mjs';

const readme = readUtf8('README.md');

if (!readme.includes('## Documentation Pointers')) {
  fail('README.md is missing the "## Documentation Pointers" section.');
}

const requiredPointers = [
  'docs/README.md',
  'specs/README.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'LICENSE',
  'AGENTS.md'
];

for (const pointer of requiredPointers) {
  if (!readme.includes(pointer)) {
    fail(`README.md is missing required documentation pointer: ${pointer}`);
  }
}

console.log('Documentation pointer validation passed.');
