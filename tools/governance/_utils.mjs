import fs from 'node:fs/promises';
import path from 'node:path';

export const repoRoot = process.cwd();

export async function pathExists(relPath) {
  try {
    await fs.access(path.join(repoRoot, relPath));
    return true;
  } catch {
    return false;
  }
}

export async function readText(relPath) {
  return fs.readFile(path.join(repoRoot, relPath), 'utf8');
}

export async function listFiles(dir, predicate = () => true) {
  const base = path.join(repoRoot, dir);
  const output = [];
  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const next = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(next);
        continue;
      }
      const rel = path.relative(repoRoot, next).replaceAll('\\', '/');
      if (predicate(rel)) output.push(rel);
    }
  }
  await walk(base);
  return output.sort();
}

export function failWithSpec(specPath, title, details) {
  console.error(`\n${title}`);
  for (const line of details) {
    console.error(`- ${line}`);
  }
  console.error(`\nSee requirements: ${specPath}`);
  process.exit(1);
}
