import { ensureExists } from './common.mjs';

const protectedPaths = [
  'artifacts/README.md',
  'artifacts/extensions/README.md',
  'artifacts/verification/build-verification.md'
];

for (const target of protectedPaths) {
  ensureExists(target, 'generated artifact guardrail file');
}

console.log('Generated artifact protection validation passed.');
