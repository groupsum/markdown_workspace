import fs from 'node:fs/promises';
import { failWithSpec } from './_utils.mjs';

const specPath = 'specs/root-clutter-spec.md';
const allowedRootEntries = new Set([
  '.changeset','.codex','.editorconfig','.git','.github','.gitignore','.npmrc','.prettierignore','.prettierrc.json',
  'apps','artifacts','commonmark-spec.txt','CODE_OF_CONDUCT.md','CONTRIBUTING.md','docker-compose.yml','docs','env','eslint.config.mjs','examples','gfm-spec.txt','LICENSE','package-lock.json','package.json','packages','playwright.config.ts','playwright.file.config.ts','playwright.inline.config.ts','playwright.phase17.config.ts','README.md','specs','STYLE_GUIDE.md','test-results','tools','tsconfig.base.json',
  'PHASE_0_CHECKPOINT_SUMMARY.md','PHASE_1_CHECKPOINT_SUMMARY.md','PHASE_2_CHECKPOINT_SUMMARY.md','PHASE_3_CHECKPOINT_SUMMARY.md','PHASE_4_CHECKPOINT_SUMMARY.md','PHASE_5_CHECKPOINT_SUMMARY.md','PHASE_6_CHECKPOINT_SUMMARY.md','PHASE_7_CHECKPOINT_SUMMARY.md','PHASE_8_CHECKPOINT_SUMMARY.md','PHASE_9_CHECKPOINT_SUMMARY.md','PHASE_10_CHECKPOINT_SUMMARY.md','PHASE_11_CHECKPOINT_SUMMARY.md','PHASE_12_CHECKPOINT_SUMMARY.md','PHASE_13_CHECKPOINT_SUMMARY.md','PHASE_14_CHECKPOINT_SUMMARY.md','PHASE_15_CHECKPOINT_SUMMARY.md','PHASE_16_CHECKPOINT_SUMMARY.md','PHASE_17_CHECKPOINT_SUMMARY.md','PHASE_18_CHECKPOINT_SUMMARY.md','PHASE_19_CHECKPOINT_SUMMARY.md','PHASE_20_CHECKPOINT_SUMMARY.md','PHASE_21_CHECKPOINT_SUMMARY.md','PHASE_22_CHECKPOINT_SUMMARY.md','agents.md'
]);

const entries = await fs.readdir('.', { withFileTypes: true });
const clutter = entries.map((e) => e.name).filter((name) => !allowedRootEntries.has(name)).sort();

if (clutter.length) {
  failWithSpec(specPath, 'Root clutter validation failed.', clutter.map((entry) => `Unexpected root entry: ${entry}`));
}

console.log('Root clutter validation passed.');
console.log(`Requirements reference: ${specPath}`);
