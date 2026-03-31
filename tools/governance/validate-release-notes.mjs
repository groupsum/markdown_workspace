import fs from 'node:fs';
import path from 'node:path';
import { fail } from './common.mjs';

const dir = '.changeset';
const files = fs.readdirSync(dir).filter((file) => file.endsWith('.md') && file !== 'README.md');

for (const file of files) {
  const full = path.join(dir, file);
  const content = fs.readFileSync(full, 'utf8');
  const hasFrontmatter = content.startsWith('---\n');
  const hasBump = /["'][^"']+["']:\s*(patch|minor|major)/.test(content);

  if (!hasFrontmatter || !hasBump) {
    fail(`Invalid changeset format in ${full}. Each release note must include frontmatter and at least one package bump.`);
  }
}

console.log('Release-note validation passed.');
