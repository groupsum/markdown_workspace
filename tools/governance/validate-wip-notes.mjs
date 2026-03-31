import { listFiles, readText, failWithSpec } from './_utils.mjs';

const specPath = 'specs/wip-notes-spec.md';
const scanRoots = ['README.md', ...(await listFiles('docs', (rel) => rel.endsWith('.md'))), ...(await listFiles('specs', (rel) => rel.endsWith('.md') && rel !== 'specs/wip-notes-spec.md'))].filter(Boolean);
const patterns = [/\bTODO\b/i, /\bFIXME\b/i, /\bTBD\b/i, /^\s*WIP\s*[:\-]/i];

const violations = [];
for (const file of scanRoots) {
  const text = await readText(file);
  text.split('\n').forEach((line, idx) => {
    if (patterns.some((pattern) => pattern.test(line))) {
      violations.push(`${file}:${idx + 1} contains disallowed unresolved marker.`);
    }
  });
}

if (violations.length) {
  failWithSpec(specPath, 'WIP-notes validation failed.', violations);
}

console.log('WIP-notes validation passed.');
console.log(`Requirements reference: ${specPath}`);
