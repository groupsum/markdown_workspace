import fs from 'node:fs';
import { fail } from './common.mjs';

const allowlist = new Set([
  '.changeset',
  '.codex',
  '.editorconfig',
  '.git',
  '.github',
  '.gitignore',
  '.npmrc',
  '.prettierignore',
  '.prettierrc.json',
  '.tmp',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'LICENSE',
  'PHASE_0_CHECKPOINT_SUMMARY.md',
  'PHASE_1_CHECKPOINT_SUMMARY.md',
  'PHASE_2_CHECKPOINT_SUMMARY.md',
  'PHASE_3_CHECKPOINT_SUMMARY.md',
  'PHASE_4_CHECKPOINT_SUMMARY.md',
  'PHASE_5_CHECKPOINT_SUMMARY.md',
  'PHASE_6_CHECKPOINT_SUMMARY.md',
  'PHASE_7_CHECKPOINT_SUMMARY.md',
  'PHASE_8_CHECKPOINT_SUMMARY.md',
  'PHASE_9_CHECKPOINT_SUMMARY.md',
  'PHASE_10_CHECKPOINT_SUMMARY.md',
  'PHASE_11_CHECKPOINT_SUMMARY.md',
  'PHASE_12_CHECKPOINT_SUMMARY.md',
  'PHASE_13_CHECKPOINT_SUMMARY.md',
  'PHASE_14_CHECKPOINT_SUMMARY.md',
  'PHASE_15_CHECKPOINT_SUMMARY.md',
  'PHASE_16_CHECKPOINT_SUMMARY.md',
  'PHASE_17_CHECKPOINT_SUMMARY.md',
  'PHASE_18_CHECKPOINT_SUMMARY.md',
  'PHASE_19_CHECKPOINT_SUMMARY.md',
  'PHASE_20_CHECKPOINT_SUMMARY.md',
  'PHASE_21_CHECKPOINT_SUMMARY.md',
  'PHASE_22_CHECKPOINT_SUMMARY.md',
  'README.md',
  'STYLE_GUIDE.md',
  'agents.md',
  'apps',
  'artifacts',
  'commonmark-spec.txt',
  'docker-compose.yml',
  'docs',
  'env',
  'eslint.config.mjs',
  'examples',
  'gfm-spec.txt',
  'package-lock.json',
  'package.json',
  'packages',
  'playwright.config.ts',
  'playwright.file.config.ts',
  'playwright.inline.config.ts',
  'playwright.phase17.config.ts',
  'specs',
  'test-results',
  'tools',
  'tsconfig.base.json'
]);

const entries = fs.readdirSync('.', { withFileTypes: true }).map((entry) => entry.name);
const disallowed = entries.filter((name) => !allowlist.has(name));

if (disallowed.length > 0) {
  fail(`Root clutter validation failed. Unapproved top-level entries: ${disallowed.sort().join(', ')}`);
}

console.log('Root clutter validation passed.');
