import { listFiles, readText, failWithSpec } from './_utils.mjs';

const specPath = 'specs/release-note-spec.md';
const files = await listFiles('artifacts/conformance/latest', (rel) => rel.endsWith('release-notes.md') || rel.endsWith('release-notes-draft.md'));

if (!files.length) {
  failWithSpec(specPath, 'Release-note validation failed.', ['No release-note artifacts found in artifacts/conformance/latest.']);
}

const withPhase = files
  .map((file) => ({ file, phase: Number((file.match(/phase-(\d+)/i) ?? [,'0'])[1]) }))
  .sort((a, b) => b.phase - a.phase);

const target = withPhase[0].file;
const text = await readText(target);
const requiredHeadings = ['## Summary', '## What is still blocked', '## Honest certification statement'];
const missing = requiredHeadings.filter((heading) => !text.includes(heading));

if (missing.length) {
  failWithSpec(specPath, 'Release-note validation failed.', missing.map((heading) => `${target} missing heading: ${heading}`));
}

console.log(`Release-note validation passed for ${target}.`);
console.log(`Requirements reference: ${specPath}`);
