import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const read = (...parts) => readFileSync(path.join(landerRoot, ...parts), 'utf8');

const cli = read('src', 'cli.mjs');
const docsView = read('components', 'DocsView.tsx');
const blogView = read('components', 'BlogView.tsx');
const css = read('styles', 'components.css');

assert.doesNotMatch(cli, /Answer Blocks|answer-blocks|renderAnswerBlocksSection|extractTerminalAnswerBlocks/, 'Static compiler must not render answer block sections.');
assert.doesNotMatch(docsView, /AnswerBlocks|extractTerminalAnswerBlocks|generatedAnswerBlocks|quickReferenceBlocks/, 'Docs SPA fallback must not render answer blocks.');
assert.doesNotMatch(blogView, /AnswerBlocks|extractTerminalAnswerBlocks|article-guide/, 'News SPA fallback must not render answer blocks.');
assert.match(cli, /stripLegacyAeoSections/, 'Static compiler must strip legacy Quick Reference and Article Guide sections.');
assert.match(docsView, /stripLegacyAeoSections/, 'Docs SPA fallback must strip legacy Quick Reference and Article Guide sections.');
assert.match(blogView, /stripLegacyAeoSections/, 'News SPA fallback must strip legacy Quick Reference and Article Guide sections.');

assert.match(cli, /Frequently Asked Questions/, 'Static compiler must render visible FAQ content.');
assert.match(cli, /"@type": "FAQPage"|'@type': 'FAQPage'|"@type":"FAQPage"/, 'Static compiler must emit FAQPage JSON-LD when FAQs exist.');
assert.match(cli, /entry\.frontmatter\.slug !== '\/' && entry\.frontmatter\.faqs\.length/, 'Homepage must not render FAQ UI or FAQPage JSON-LD.');
assert.doesNotMatch(cli, /static-home-faq-shell|renderSupplementarySections\(entry, registry\)\s*\}\s*<\/div>\s*<\/main>/, 'Homepage must not append FAQ or related-page sections.');
assert.match(cli, /subtitle:/, 'Static compiler must normalize subtitle metadata.');
assert.match(docsView, /metadata\.subtitle/, 'Docs SPA fallback must render subtitles when present.');
assert.match(blogView, /blog-post-subtitle/, 'News SPA fallback must render subtitles when present.');

assert.match(css, /\.faq-section\s*,\s*\n\.related-section\s*,\s*\n\.related-apis-section\s*\{/, 'FAQ group styles must exist.');
assert.match(css, /\.faq-accordion\s*\{/, 'FAQ accordion styles must exist.');
assert.match(css, /\.docs-subtitle\s*,\s*\n\.blog-post-subtitle\s*\{/, 'Subtitle styles must exist.');

console.log('FAQ-only layout validation passed.');
