import fs from 'node:fs';
import { fail } from './common.mjs';

const rootMediaArtifactPattern = /\.(avif|gif|jpe?g|png|svg|webp)$/i;

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
  '.playwright-mcp',
  '.ssot',
  '.tmp',
  '.uv-cache',
  '.venv',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'LICENSE',
  'README.md',
  'STYLE_GUIDE.md',
  'AGENTS.md',
  'apps',
  'artifacts',
  'docker-compose.dev.yml',
  'docker-compose.yml',
  'docs',
  'env',
  'eslint.config.mjs',
  'examples',
  'node_modules',
  'package-lock.json',
  'package.json',
  'packages',
  'playwright.config.ts',
  'playwright.file.config.ts',
  'playwright.inline.config.ts',
  'playwright.phase17.config.ts',
  'pyproject.toml',
  'test-results',
  'tools',
  'tsconfig.base.json',
  'uv.lock'
]);

const entries = fs.readdirSync('.', { withFileTypes: true }).map((entry) => entry.name);
const rootMediaArtifacts = entries.filter((name) => rootMediaArtifactPattern.test(name));

if (rootMediaArtifacts.length > 0) {
  fail(`Root media artifacts are disallowed. Move generated images under artifacts/: ${rootMediaArtifacts.sort().join(', ')}`);
}

const disallowed = entries.filter((name) => !allowlist.has(name));

if (disallowed.length > 0) {
  fail(`Root clutter validation failed. Unapproved top-level entries: ${disallowed.sort().join(', ')}`);
}

console.log('Root clutter validation passed.');
