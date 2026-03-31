import { pathExists, readText, failWithSpec } from './_utils.mjs';

const specPath = 'specs/doc-pointer-spec.md';
const requiredDocs = ['docs/README.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'LICENSE', 'agents.md', 'specs/README.md'];
const readme = await readText('README.md');

const missing = [];
for (const doc of requiredDocs) {
  if (!(await pathExists(doc))) missing.push(`Required document missing: ${doc}`);
  if (!readme.includes(doc)) missing.push(`README.md missing pointer to: ${doc}`);
}

if (missing.length) {
  failWithSpec(specPath, 'Doc-pointer validation failed.', missing);
}

console.log('Doc-pointer validation passed.');
console.log(`Requirements reference: ${specPath}`);
