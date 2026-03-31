import assert from "node:assert/strict";
import { renderMarkdownToHtmlSync } from "../dist/index.js";

const cases = [
  { markdown: '**broken*', mustContain: 'broken' },
  { markdown: '[broken', mustContain: '[broken' },
  { markdown: '![broken', mustContain: '![broken' },
  { markdown: '```js\nunterminated', mustContain: 'unterminated' },
  { markdown: '> quote\nplain', mustContain: '<blockquote' },
];

for (const testCase of cases) {
  const html = renderMarkdownToHtmlSync(testCase.markdown, { htmlHandling: 'allow-trusted' });
  assert.equal(typeof html, 'string');
  assert.ok(html.includes(testCase.mustContain), `expected output to contain ${testCase.mustContain}`);
}

console.log('renderer-core negative tests passed');
