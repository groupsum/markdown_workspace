import assert from 'node:assert/strict';
import {
  createMarkdownRendererThemeStyle,
  renderMarkdownToStaticHtml,
  renderMarkdownToStaticHtmlDocument,
} from '../dist/index.js';

const themeStyle = createMarkdownRendererThemeStyle({ foreground: '#fff', accent: '#09f' });
assert.equal(themeStyle['--mw-fg-primary'], '#fff');
assert.equal(themeStyle['--mw-accent'], '#09f');

const html = renderMarkdownToStaticHtml({ markdown: '# Hello\n\n[Doc](README.md)' });
assert.match(html, /markdown-body/);
assert.match(html, /Hello/);
assert.match(html, /README.md/);

const documentHtml = renderMarkdownToStaticHtmlDocument({
  markdown: '# Export',
  title: 'Export',
  bodyClassName: 'markdown-export',
});
assert.match(documentHtml, /<!DOCTYPE html>/);
assert.match(documentHtml, /markdown-export/);

console.log('renderer-react smoke tests passed');
