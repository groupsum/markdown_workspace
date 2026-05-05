import fs from 'node:fs';
import path from 'node:path';

export const SPEC_POINTER = '.ssot/specs/SPEC-2002-repository-governance.yaml';

export function fail(message) {
  console.error(`${message}\nSee ${SPEC_POINTER} for requirements.`);
  process.exit(1);
}

export function ensureExists(targetPath, label = targetPath) {
  if (!fs.existsSync(targetPath)) {
    fail(`Missing required ${label}: ${targetPath}`);
  }
}

export function readUtf8(targetPath) {
  return fs.readFileSync(targetPath, 'utf8');
}

export function repoRoot(...segments) {
  return path.resolve(process.cwd(), ...segments);
}
