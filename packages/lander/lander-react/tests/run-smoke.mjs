import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testRoot, '..', '..', '..', '..');
const distRoot = path.resolve(testRoot, '..', 'dist');
const distIndex = path.join(distRoot, 'index.js');
const smokeIndex = path.join(distRoot, 'index.smoke.mjs');
const structuredDataDist = path.join(repoRoot, 'packages', 'shared', 'structured-data', 'dist', 'index.js').replace(/\\/g, '/');

fs.writeFileSync(
  smokeIndex,
  fs.readFileSync(distIndex, 'utf8').replace('"@mdwrk/structured-data"', `"file:///${structuredDataDist}"`),
);

const { buildLanderJsonLdGraph } = await import(`file:///${smokeIndex.replace(/\\/g, '/')}`);
fs.rmSync(smokeIndex, { force: true });

const site = {
  product: {
    name: 'MdWrk',
    slug: 'mdwrk',
    tagline: 'Local-first Markdown workspace',
    description: 'MdWrk is a local-first Markdown workspace with reusable lander packages.',
    category: 'ProductivityApplication',
    canonicalUrl: 'https://mdwrk.test',
    logo: { src: 'https://mdwrk.test/favicon.svg', alt: 'MdWrk logo' },
    sameAs: ['https://github.com/groupsum/markdown_workspace'],
  },
  pages: [],
  pageByPath: new Map(),
  diagnostics: [],
  seo: {
    defaultImage: { src: 'https://mdwrk.test/og.png', alt: 'MdWrk preview image', width: 1200, height: 630 },
  },
};

const page = {
  kind: 'package',
  slug: '/packages/structured-data/',
  path: '/packages/structured-data/',
  title: 'Structured Data Package | MdWrk',
  description: 'The structured data package emits JSON-LD nodes for lander pages.',
  h1: 'Structured Data Package',
  intro: 'Use this page to validate every lander structured data rich-result family.',
  canonicalUrl: 'https://mdwrk.test/packages/structured-data/',
  breadcrumbs: [
    { label: 'MdWrk', href: '/' },
    { label: 'Packages', href: '/packages/' },
    { label: 'Structured Data Package', href: '/packages/structured-data/' },
  ],
  internalLinks: [],
  wordCount: 120,
  sections: [
    {
      id: 'install',
      kind: 'markdown',
      title: 'Install',
      body: 'Install and use the structured data package.',
    },
  ],
  faq: [{ question: 'Does the lander emit JSON-LD?', answer: 'Yes, visible FAQ content is mirrored into FAQPage JSON-LD.' }],
  seo: {
    keywords: ['structured-data', 'json-ld'],
    image: { src: 'https://mdwrk.test/package.png', alt: 'Structured data package screenshot' },
  },
  schema: [
    { kind: 'WebPage' },
    { kind: 'Organization' },
    { kind: 'WebSite' },
    { kind: 'SoftwareApplication' },
    { kind: 'WebApplication' },
    { kind: 'SoftwareSourceCode', data: { codeRepository: 'https://github.com/groupsum/markdown_workspace' } },
    { kind: 'TechArticle' },
    { kind: 'Article' },
    { kind: 'BlogPosting', data: { datePublished: '2026-05-06' } },
    { kind: 'FAQPage' },
    { kind: 'BreadcrumbList' },
    { kind: 'Dataset', data: { keywords: ['structured-data', 'json-ld'] } },
    { kind: 'ImageObject' },
    { kind: 'ItemList' },
    { kind: 'HowTo' },
    { kind: 'Product' },
    { kind: 'ProfilePage' },
    {
      kind: 'VideoObject',
      data: {
        thumbnailUrl: 'https://mdwrk.test/video.png',
        uploadDate: '2026-05-06',
        embedUrl: 'https://mdwrk.test/video',
      },
    },
  ],
};

const graph = buildLanderJsonLdGraph(site, page);
const types = graph['@graph'].map((node) => node['@type']);

for (const type of [
  'WebPage',
  'Organization',
  'WebSite',
  'SoftwareApplication',
  'WebApplication',
  'SoftwareSourceCode',
  'TechArticle',
  'Article',
  'BlogPosting',
  'FAQPage',
  'BreadcrumbList',
  'Dataset',
  'ImageObject',
  'ItemList',
  'HowTo',
  'Product',
  'ProfilePage',
  'VideoObject',
]) {
  assert.ok(types.includes(type), `missing ${type}`);
}

assert.equal(graph['@context'], 'https://schema.org');
assert.ok(graph['@id'].endsWith('#jsonld'));
assert.equal(graph['@graph'].find((node) => node['@type'] === 'FAQPage').mainEntity.length, 1);
assert.equal(graph['@graph'].find((node) => node['@type'] === 'BreadcrumbList').itemListElement.length, 3);
