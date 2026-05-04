import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(path.join(landerRoot, ...parts), 'utf8');

const blogView = read('components', 'BlogView.tsx');
const css = read('styles', 'components.css');
const staticCompiler = read('src', 'cli.mjs');

assert.match(
  blogView,
  /buildFaqSchema/,
  'News article pages must emit FAQPage JSON-LD through page metadata.',
);

assert.match(
  blogView,
  /const\s+faqItems\s*=\s*buildBlogFaqItems\(excerpt\)/,
  'News article pages must derive visible FAQ items from the article excerpt.',
);

assert.match(
  blogView,
  /buildFaqSchema\(faqItems\)/,
  'News article pages must use the same FAQ items for JSON-LD as the visible FAQ block.',
);

assert.match(
  blogView,
  /<MarkdownViewer\s+content=\{articleContent\}\s*\/>\s*<\/div>\s*<section\s+className="faq-section"\s+aria-labelledby="faq-heading">/s,
  'News article pages must render the FAQ block immediately below the article card.',
);

assert.match(
  blogView,
  /<h2\s+id="faq-heading"\s+className="faq-section-heading">Frequently Asked Questions<\/h2>/,
  'News article FAQ block must expose the expected visible heading.',
);

assert.match(
  blogView,
  /faqItems\.map\(faq\s*=>\s*\(\s*<details\s+key=\{faq\.question\}\s+className="faq-accordion">/s,
  'News article FAQ block must render each FAQ as an accordion detail.',
);

assert.match(
  blogView,
  /<summary\s+className="faq-summary">\{faq\.question\}<\/summary>/,
  'News article FAQ accordions must render the question in the summary.',
);

assert.match(
  blogView,
  /<div\s+className="faq-content">\s*<p>\{faq\.answer\}<\/p>\s*<\/div>/s,
  'News article FAQ accordions must render the answer in the content block.',
);

assert.match(
  blogView,
  /<\/section>\s*\{relatedApis\.length > 0 \? \(\s*<section\s+className="related-apis-section"\s+aria-labelledby="related-apis-heading">/s,
  'News article pages must render Related APIs below the FAQ block.',
);

assert.match(
  blogView,
  /<h2\s+id="related-apis-heading"\s+className="faq-section-heading">Related APIs<\/h2>/,
  'News article related APIs block must expose the expected visible heading.',
);

assert.match(
  blogView,
  /const\s+relatedApis\s*=\s*toRelatedApiList\(post\.metadata,\s*articleContent\)/,
  'News article pages must derive related APIs from frontmatter or article content.',
);

assert.match(
  css,
  /\.blog-post-layout\s*>\s*\.faq-section\s*,\s*\n\.blog-post-layout\s*>\s*\.related-apis-section\s*\{\s*@apply\s+mt-6;/,
  'News article supplemental blocks must have spacing below the article card and each other.',
);

assert.match(
  staticCompiler,
  /Frequently Asked Questions/,
  'Static article output must continue to include visible FAQ blocks.',
);

assert.match(
  staticCompiler,
  /FAQPage/,
  'Static article output must continue to include FAQPage JSON-LD.',
);

console.log('News FAQ block validation passed.');
