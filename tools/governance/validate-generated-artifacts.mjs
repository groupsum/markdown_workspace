import { execFileSync } from 'node:child_process';
import { readText, failWithSpec } from './_utils.mjs';

const specPath = 'specs/generated-artifact-protection-spec.md';
const forbiddenPatterns = [/\/__pycache__\//, /\.pyc$/i, /\.DS_Store$/i];
const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
const offenders = tracked.filter((file) => forbiddenPatterns.some((pattern) => pattern.test(file)));

const gitignore = await readText('.gitignore');
const requiredIgnores = ['__pycache__/', '*.pyc', '.DS_Store'];
const missingIgnores = requiredIgnores.filter((entry) => !gitignore.includes(entry));

const issues = [
  ...offenders.map((file) => `Tracked generated artifact should not be committed: ${file}`),
  ...missingIgnores.map((entry) => `.gitignore missing generated-artifact pattern: ${entry}`)
];

if (issues.length) {
  failWithSpec(specPath, 'Generated-artifact protection validation failed.', issues);
}

console.log('Generated-artifact protection validation passed.');
console.log(`Requirements reference: ${specPath}`);
