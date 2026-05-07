import assert from 'node:assert/strict';
import {
  MARKDOWN_CUSTOM_PARSER_PROFILE_DEFINITIONS,
  parseMarkdownToAst,
  renderMarkdownToHtmlSync,
} from '../dist/index.js';

const parserProfile = MARKDOWN_CUSTOM_PARSER_PROFILE_DEFINITIONS.find((entry) => entry.id === 'mdwrk-cfm-parser');

assert.ok(parserProfile, 'mdwrk-cfm-parser profile is exported');
assert.equal(parserProfile.baseProfile, 'gfm-default');
assert.ok(parserProfile.extensions.includes('front-matter'));
assert.ok(parserProfile.extensions.includes('footnotes'));
assert.ok(parserProfile.extensions.includes('definition-lists'));
assert.ok(parserProfile.extensions.includes('math'));
assert.ok(parserProfile.extensions.includes('citations'));
assert.ok(parserProfile.extensions.includes('markdown-in-html'));

const markdown = [
  '---',
  'title: Parser Profile',
  '---',
  '',
  '# Parser Profile',
  '',
  '| Key | Value |',
  '| --- | --- |',
  '| status | active |',
  '',
  'Term',
  ': Meaning',
  '',
  'Cite [@smith2024] and footnote[^1].',
  '',
  '[^1]: Footnote body',
].join('\n');

const ast = parseMarkdownToAst(markdown, { parserProfile: 'mdwrk-cfm-parser' });
const html = renderMarkdownToHtmlSync(markdown, { parserProfile: 'mdwrk-cfm-parser' });

assert.equal(ast.metadata.title, 'Parser Profile');
assert.ok(ast.activeExtensions.includes('front-matter'));
assert.ok(ast.activeExtensions.includes('definition-lists'));
assert.ok(ast.activeExtensions.includes('citations'));
assert.ok(ast.children.some((node) => node.type === 'table'));
assert.ok(ast.children.some((node) => node.type === 'definitionList'));
assert.match(html, /<table/);
assert.match(html, /<dl/);
assert.match(html, /<cite/);
assert.match(html, /md-footnotes/);

console.log('renderer-core custom parser profile tests passed');

