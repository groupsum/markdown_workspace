import assert from 'node:assert/strict';
import { markdownToPageSpec } from '../dist/index.js';

const parsed = markdownToPageSpec('---\ntitle: Example Page\nslug: /example/\nkind: answer\ndescription: A direct answer for an example page.\n---\n\n# Example Page\n\nBody text.');
assert.equal(parsed.page.slug, '/example/');
assert.equal(parsed.page.kind, 'answer');
