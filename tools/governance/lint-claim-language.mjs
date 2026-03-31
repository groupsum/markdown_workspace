import { listFiles, readText, failWithSpec } from './_utils.mjs';

const specPath = 'specs/claim-language-spec.md';
const files = ['README.md', ...(await listFiles('docs', (rel) => rel.endsWith('.md'))), ...(await listFiles('artifacts/conformance/latest', (rel) => rel.endsWith('.md')))].filter(Boolean);
const requiredQualifiedClaim = /certifiably fully featured and certifiably fully markdown spec compliant/i;

const hits = [];
for (const file of files) {
  const text = await readText(file);
  const lines = text.split('\n');
  lines.forEach((line, idx) => {
    if (requiredQualifiedClaim.test(line) && !/not yet/i.test(line)) {
      hits.push(`${file}:${idx + 1} must qualify the combined certification claim with "not yet".`);
    }
  });
}

if (hits.length) {
  failWithSpec(specPath, 'Claim-language lint failed.', hits);
}

console.log('Claim-language lint passed.');
console.log(`Requirements reference: ${specPath}`);
