import assert from 'node:assert/strict';
import {
  createHtmlDocument,
  extractMarkdownHeadings,
  parseMarkdownDocument,
  renderMarkdownToHtml,
  renderMarkdownToHtmlDocument,
} from '../dist/index.js';

const parsed = parseMarkdownDocument('---\ntitle: Test\n---\n\n# Alpha\n\n## Beta');
assert.equal(parsed.metadata.title, 'Test');
assert.deepEqual(parsed.headings.map((heading) => heading.text), ['Alpha', 'Beta']);

const headings = extractMarkdownHeadings('# Root\n\n## Child', { minimumDepth: 2 });
assert.deepEqual(headings.map((heading) => heading.text), ['Child']);

const html = await renderMarkdownToHtml('# Title\n\n- [x] done\n\n```ts\nconst value = 1;\n```');
assert.match(html, /markdown-body/);
assert.match(html, /md-task-list-item/);
assert.match(html, /md-code-block/);

const fragment = createHtmlDocument({ title: 'Fragment', bodyHtml: '<main>Fragment</main>' });
assert.match(fragment, /<!DOCTYPE html>/);
assert.match(fragment, /<main>Fragment<\/main>/);

const documentHtml = await renderMarkdownToHtmlDocument('# Export', { title: 'Export' });
assert.match(documentHtml, /<!DOCTYPE html>/);
assert.match(documentHtml, /Export/);

console.log('renderer-core smoke tests passed');
