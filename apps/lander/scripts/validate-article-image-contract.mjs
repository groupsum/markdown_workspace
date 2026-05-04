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
const settingsArticleHtml = read('dist-static', 'blog', 'settings-simplification-for-daily-flow', 'index.html');

const propertyValidator = (propertySchema, key) => {
  if (propertySchema?.$ref?.endsWith('/nonEmptyString')) {
    return (value) => typeof value === 'string' && value.trim().length > 0;
  }
  if (propertySchema?.$ref?.endsWith('/excerpt')) {
    return (value) => typeof value === 'string' && value.trim().length >= 40 && value.trim().length <= 280;
  }
  if (propertySchema?.$ref?.endsWith('/subtitle')) {
    return (value) => typeof value === 'string' && value.trim().length >= 20 && value.trim().length <= 280;
  }
  if (propertySchema?.$ref?.endsWith('/isoDate')) {
    return (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
  }
  if (propertySchema?.$ref?.endsWith('/integerString')) {
    return (value) => typeof value === 'string' && /^\d+$/.test(value.trim());
  }
  if (propertySchema?.$ref?.endsWith('/numericString')) {
    return (value) => typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value.trim());
  }
  if (propertySchema?.$ref?.endsWith('/articleStatus')) {
    return (value) => typeof value === 'string' && ['draft', 'published'].includes(value.trim());
  }
  if (propertySchema?.$ref?.endsWith('/commaList')) {
    return (value) => typeof value === 'string' && value.trim().length > 0;
  }
  if (propertySchema?.$ref?.endsWith('/imagePath')) {
    return (value) => typeof value === 'string' && /^(https?:\/\/|\/)[^\s]+$/.test(value.trim());
  }
  if (key === 'slug') return (value) => typeof value === 'string' && /^[a-z0-9][a-z0-9/-]*$/.test(value.trim());
  if (key === 'toc') return (value) => typeof value === 'string' && ['true', 'false'].includes(value.trim());
  return (value) => typeof value === 'string' && value.trim().length > 0;
};

const validateFixture = (schemaBranch, metadata) => {
  const failures = [];
  for (const key of schemaBranch.required) {
    if (!Object.prototype.hasOwnProperty.call(metadata, key) || String(metadata[key]).trim() === '') {
      failures.push(`missing ${key}`);
    }
  }
  for (const [key, value] of Object.entries(metadata)) {
    const propertySchema = schemaBranch.properties[key];
    if (!propertySchema) {
      failures.push(`unsupported ${key}`);
      continue;
    }
    if (!propertyValidator(propertySchema, key)(value)) failures.push(`invalid ${key}`);
  }
  return failures;
};

const validDocMetadata = {
  title: 'Article Image Contract Doc',
  slug: 'testing/article-image-contract',
  section: 'Testing',
  sectionOrder: '1',
  order: '1',
  toc: 'true',
  date: '2026-05-04',
  status: 'published',
  excerpt: 'This documentation article exists to validate explicit featured image frontmatter for rendering.',
  featuredImage: '/docs/media/featured-image.png',
  featuredImageAlt: 'Feature image alt text',
};

const validUpdateMetadata = {
  title: 'Article Image Contract Update',
  date: '2026-05-04',
  status: 'published',
  author: 'CobyCloud',
  excerpt: 'This news article exists to validate explicit featured image frontmatter for rendering.',
  featuredImage: 'https://example.com/featured-image.png',
  featuredImageAlt: 'Feature image alt text',
};

for (const schemaBranch of articleSchema.oneOf) {
  assert.ok(schemaBranch.properties.featuredImage, `${schemaBranch.title} must allow featuredImage frontmatter.`);
  assert.ok(schemaBranch.properties.featuredImageAlt, `${schemaBranch.title} must allow featuredImageAlt frontmatter.`);
}

assert.deepEqual(validateFixture(articleSchema.oneOf[0], validDocMetadata), [], 'Doc metadata schema must accept root-relative featuredImage frontmatter.');
assert.deepEqual(validateFixture(articleSchema.oneOf[1], validUpdateMetadata), [], 'Product update metadata schema must accept absolute featuredImage frontmatter.');
assert.deepEqual(
  validateFixture(articleSchema.oneOf[1], { ...validUpdateMetadata, featuredImage: 'media/featured-image.png' }),
  ['invalid featuredImage'],
  'Product update metadata schema must reject non-root-relative featuredImage paths.',
);
assert.deepEqual(
  validateFixture(articleSchema.oneOf[1], { ...validUpdateMetadata, image: '/media/legacy-image.png' }),
  ['unsupported image'],
  'Product update metadata schema must reject legacy image frontmatter outside the explicit featuredImage contract.',
);

assert.ok(pageSchema.properties.featuredImage, 'Static page schema must allow featuredImage frontmatter.');
assert.ok(pageSchema.properties.featuredImageAlt, 'Static page schema must allow featuredImageAlt frontmatter.');

assert.match(pageMetadata, /getExplicitFeaturedImage/, 'Shared metadata helpers must expose explicit featured image selection.');
assert.match(pageMetadata, /getArticleMetadataImage/, 'Shared metadata helpers must expose article metadata image fallback selection.');
assert.doesNotMatch(pageMetadata, /removeFirstImage/, 'Shared metadata helpers must not remove inline article images.');

for (const [label, source] of [['Product updates', blogView], ['Docs', docsView]]) {
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

assert.match(
  settingsArticleHtml,
  /<meta property="og:image" content="https:\/\/mdwrk\.com\/blog\/media\/mdwrk-settings-visual\.png">/,
  'Generated news article must use the first inline image for Open Graph metadata when no featuredImage is set.',
);
assert.match(
  settingsArticleHtml,
  /<meta name="twitter:image" content="https:\/\/mdwrk\.com\/blog\/media\/mdwrk-settings-visual\.png">/,
  'Generated news article must use the first inline image for Twitter metadata when no featuredImage is set.',
);
assert.doesNotMatch(
  settingsArticleHtml,
  /class="lander-featured-image"/,
  'Generated news article must not render a featured-image block when no featuredImage is set.',
);
assert.match(
  settingsArticleHtml,
  /<h2 class="md-h2" id="screenshot">Screenshot<\/h2><p class="md-p"><img src="\/blog\/media\/mdwrk-settings-visual\.png"/,
  'Generated news article must keep inline body images in their markdown position.',
);

console.log('Article image contract validation passed.');
