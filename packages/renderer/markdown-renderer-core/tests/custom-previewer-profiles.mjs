import assert from 'node:assert/strict';
import {
  MARKDOWN_CUSTOM_PREVIEWER_PROFILE_DEFINITIONS,
  parseMarkdownToAst,
  renderMarkdownToHtmlSync,
} from '../dist/index.js';

const safePreviewer = MARKDOWN_CUSTOM_PREVIEWER_PROFILE_DEFINITIONS.find((entry) => entry.id === 'mdwrk-cfm-previewer');
const trustedPreviewer = MARKDOWN_CUSTOM_PREVIEWER_PROFILE_DEFINITIONS.find((entry) => entry.id === 'mdwrk-cfm-trusted-previewer');

assert.ok(safePreviewer, 'mdwrk-cfm-previewer profile is exported');
assert.ok(trustedPreviewer, 'mdwrk-cfm-trusted-previewer profile is exported');
assert.equal(safePreviewer.htmlHandling, 'sanitize');
assert.equal(trustedPreviewer.htmlHandling, 'allow-trusted');

const markedHtml = '<div data-markdown="1">**bold**</div>';

const safeHtml = renderMarkdownToHtmlSync(markedHtml, {
  previewerProfile: 'mdwrk-cfm-previewer',
});
const trustedHtml = renderMarkdownToHtmlSync(markedHtml, {
  previewerProfile: 'mdwrk-cfm-trusted-previewer',
});
const trustedAst = parseMarkdownToAst('See [@smith2024].', {
  previewerProfile: 'mdwrk-cfm-trusted-previewer',
});

assert.doesNotMatch(safeHtml, /<strong/);
assert.match(trustedHtml, /<strong[^>]*>bold<\/strong>/);
assert.ok(trustedAst.activeExtensions.includes('citations'));
assert.ok(trustedAst.activeExtensions.includes('markdown-in-html'));
assert.match(trustedHtml, /data-markdown/);

console.log('renderer-core custom previewer profile tests passed');

