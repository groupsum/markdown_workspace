import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(path.join(landerRoot, ...parts), 'utf8');
const readJson = (...parts) => JSON.parse(read(...parts));

const articleSchema = readJson('data', 'article-metadata.schema.json');
const pageSchema = readJson('schemas', 'mdwrk.page.v1.schema.json');
const pageMetadata = read('utils', 'pageMetadata.ts');
const blogView = read('components', 'BlogView.tsx');
const docsView = read('components', 'DocsView.tsx');
const staticCompiler = read('src', 'cli.mjs');
const sitemapGenerator = read('scripts', 'generate-sitemap.mjs');

for (const schemaBranch of articleSchema.oneOf) {
  assert.ok(schemaBranch.properties.featuredImage, `${schemaBranch.title} must allow featuredImage frontmatter.`);
  assert.ok(schemaBranch.properties.featuredImageAlt, `${schemaBranch.title} must allow featuredImageAlt frontmatter.`);
}

assert.ok(pageSchema.properties.featuredImage, 'Static page schema must allow featuredImage frontmatter.');
assert.ok(pageSchema.properties.featuredImageAlt, 'Static page schema must allow featuredImageAlt frontmatter.');

assert.match(pageMetadata, /getExplicitFeaturedImage/, 'Shared metadata helpers must expose explicit featured image selection.');
assert.match(pageMetadata, /getArticleMetadataImage/, 'Shared metadata helpers must expose article metadata image fallback selection.');
assert.doesNotMatch(pageMetadata, /removeFirstImage/, 'Shared metadata helpers must not remove inline article images.');

for (const [label, source] of [['News', blogView], ['Docs', docsView]]) {
  assert.match(source, /getExplicitFeaturedImage/, `${label} article pages must render featured images only from explicit frontmatter.`);
  assert.match(source, /getArticleMetadataImage/, `${label} article pages must select embed metadata images separately from rendering.`);
  assert.match(source, /image:\s*metadataImage\?\.src/, `${label} article pages must use the selected metadata image for embed metadata.`);
  assert.match(source, /<MarkdownViewer\s+content=\{articleContent\}\s*\/>/, `${label} article pages must keep body images in their original markdown position.`);
  assert.doesNotMatch(source, /removeFirstImage|contentWithoutFeaturedImage/, `${label} article pages must not remove or relocate inline images.`);
}

assert.match(staticCompiler, /const defaultImage = `\$\{siteUrl\}\/favicon\.svg`/, 'Static compiler must define favicon metadata fallback.');
assert.match(staticCompiler, /getExplicitFeaturedImage\(entry\.frontmatter\) \|\| extractFirstImage\(entry\.body\) \|\| null/, 'Static compiler must prefer explicit featured image, then first inline image.');
assert.match(staticCompiler, /toAbsoluteUrl\(metadataImage\?\.src\)/, 'Static compiler must normalize selected metadata image URLs.');
assert.match(staticCompiler, /<meta property="og:image" content="\$\{escapeAttribute\(image\)\}">/, 'Static pages must emit selected Open Graph image metadata.');
assert.match(staticCompiler, /<meta name="twitter:image" content="\$\{escapeAttribute\(image\)\}">/, 'Static pages must emit selected Twitter image metadata.');

assert.match(sitemapGenerator, /featuredImage/, 'Sitemap semantic index must understand explicit featuredImage frontmatter.');
assert.match(sitemapGenerator, /src: '\/favicon\.svg'/, 'Sitemap semantic index must fall back to favicon when no article image exists.');

console.log('Article image contract validation passed.');
