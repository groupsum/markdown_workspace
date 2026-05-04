import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const read = (...parts) => readFileSync(path.join(landerRoot, ...parts), 'utf8');

const answerBlocks = read('components', 'AnswerBlocks.tsx');
const docsView = read('components', 'DocsView.tsx');
const blogView = read('components', 'BlogView.tsx');
const css = read('styles', 'components.css');

assert.match(answerBlocks, /<section className="answer-blocks"/, 'Answer blocks must render as a separate grouped section.');
assert.match(answerBlocks, /<details[\s\S]*className="answer-block-accordion"/, 'Each answer block must render as a details accordion.');
assert.match(answerBlocks, /open=\{block\.defaultOpen\}/, 'Accordion open state must be controlled per block.');
assert.match(answerBlocks, /terminalAnswerHeadingPattern/, 'Terminal article guide blocks must be extracted from article markdown.');

assert.doesNotMatch(docsView, /answerWrappedContent/, 'Docs must not append answer markdown into article content.');
assert.match(docsView, /extractTerminalAnswerBlocks\(renderedContent\)/, 'Docs must separate terminal guide content from the article.');
assert.match(docsView, /<AnswerBlocks blocks=\{answerBlocks\}/, 'Docs must render answer blocks outside the article card.');
assert.match(docsView, /title: 'Related APIs'[\s\S]*defaultOpen: true/, 'Related APIs must be expanded by default.');

for (const blockTitle of ['What This Does', 'When To Use It', 'How It Works', 'Example', 'Common Errors']) {
  const pattern = new RegExp(`title: '${blockTitle}'[\\s\\S]*?(?=\\n\\s*\\{\\n\\s*title:|\\n\\s*\\])`);
  const block = pattern.exec(docsView)?.[0] ?? '';
  assert.ok(block, `Missing ${blockTitle} answer block.`);
  assert.doesNotMatch(block, /defaultOpen: true/, `${blockTitle} must be collapsed by default.`);
}

assert.match(blogView, /extractTerminalAnswerBlocks\(renderedContent\)/, 'Blog posts must separate terminal article guide content from the article.');
assert.match(blogView, /<AnswerBlocks blocks=\{extractedAnswerContent\.answerBlocks\}/, 'Blog posts must render guide blocks outside the article card.');

assert.match(css, /\.answer-blocks\s*\{/, 'Answer block group styles must exist.');
assert.match(css, /\.answer-block-accordion\s*\{/, 'Answer block accordion styles must exist.');

console.log('Answer block layout validation passed.');
