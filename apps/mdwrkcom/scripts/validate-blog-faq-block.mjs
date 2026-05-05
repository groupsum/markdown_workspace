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
  'Product update article pages must emit FAQPage JSON-LD through page metadata.',
);

assert.match(
  blogView,
  /const\s+faqItems\s*=\s*buildBlogFaqItems\(excerpt\)/,
  'Product update article pages must derive visible FAQ items from the article excerpt.',
);

assert.match(
  blogView,
  /buildFaqSchema\(faqItems\)/,
  'Product update article pages must use the same FAQ items for JSON-LD as the visible FAQ block.',
);

assert.match(
  blogView,
  /<Route index element=\{<BlogList posts=\{posts\} title="Product Updates" \/>\} \/>/,
  'Product updates index must use Product Updates as its page H1.',
);

assert.match(
  blogView,
  /path:\s*`\/updates\/\$\{post\.slug\}`/,
  'Product update article metadata must use /updates article routes.',
);

assert.match(
  blogView,
  /\{ name: 'Updates', path: '\/updates' \}/,
  'Product update article JSON-LD breadcrumbs must place articles under Updates.',
);

assert.match(
  blogView,
  /\{ label: 'MdWrk', href: '\/' \},\s*\{ label: 'Updates', href: '\/updates' \}/s,
  'Product update article visible breadcrumbs must render MdWrk / Updates / Article title.',
);

assert.match(
  blogView,
  /eyebrow="Product Updates by Author"/,
  'Product update author archives must use Product Updates by Author.',
);

assert.match(
  blogView,
  /eyebrow="Product Updates by Month"/,
  'Product update month archives must use Product Updates by Month.',
);

assert.match(
  staticCompiler,
  /contentType:\s*'update'/,
  'Static compiler must classify product update entries as contentType update.',
);

assert.match(
  staticCompiler,
  /slug:\s*`\/updates\/\$\{post\.slug\}\/`/,
  'Static compiler must publish product update articles under /updates.',
);

assert.match(
  blogView,
  /import \{ FaqBlock \} from '\.\/FaqBlock';/,
  'Product update article pages must import the structural FAQ component.',
);

assert.match(
  blogView,
  /<MarkdownViewer\s+content=\{articleContent\}\s*\/>\s*<\/div>\s*<FaqBlock\s+items=\{faqItems\}\s*\/>/s,
  'Product update article pages must render the FAQ block immediately below the article card.',
);

assert.match(
  read('components', 'FaqBlock.tsx'),
  /<h2\s+id=\{headingId\}\s+className="faq-section-heading">\{heading\}<\/h2>/,
  'Product update article FAQ block must expose the expected visible heading.',
);

assert.match(
  read('components', 'FaqBlock.tsx'),
  /items\.map\(faq\s*=>\s*\(\s*<details\s+key=\{faq\.question\}\s+className="faq-accordion">/s,
  'Product update article FAQ block must render each FAQ as an accordion detail.',
);

assert.match(
  read('components', 'FaqBlock.tsx'),
  /<summary\s+className="faq-summary">\{faq\.question\}<\/summary>/,
  'Product update article FAQ accordions must render the question in the summary.',
);

assert.match(
  read('components', 'FaqBlock.tsx'),
  /<div\s+className="faq-content">\s*<p>\{faq\.answer\}<\/p>\s*<\/div>/s,
  'Product update article FAQ accordions must render the answer in the content block.',
);

assert.match(
  blogView,
  /<FaqBlock\s+items=\{faqItems\}\s*\/>\s*\{relatedApis\.length > 0 \? \(\s*<section\s+className="related-apis-section"\s+aria-labelledby="related-apis-heading">/s,
  'Product update article pages must render Related APIs below the FAQ block.',
);

assert.match(
  blogView,
  /<h2\s+id="related-apis-heading"\s+className="faq-section-heading">Related APIs<\/h2>/,
  'Product update article related APIs block must expose the expected visible heading.',
);

assert.match(
  blogView,
  /const\s+relatedApis\s*=\s*toRelatedApiList\(post\.metadata,\s*articleContent\)/,
  'Product update article pages must derive related APIs from frontmatter or article content.',
);

assert.match(
  css,
  /\.blog-post-layout\s*>\s*\.faq-section\s*,\s*\n\.blog-post-layout\s*>\s*\.related-apis-section\s*\{\s*@apply\s+mt-6;/,
  'Product update article supplemental blocks must have spacing below the article card and each other.',
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

console.log('Product updates FAQ block validation passed.');
