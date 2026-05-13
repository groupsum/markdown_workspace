import assert from 'node:assert/strict';
import { compileLanderSite } from '../../lander-core/dist/index.js';
import {
  buildAiSummary,
  buildContentIndex,
  buildContentRegistry,
  buildDiscoveryArtifacts,
  buildJsonLdGraphArtifact,
  buildLlmsFullTxt,
  buildPageMetadata,
  buildSemanticIndex,
  buildSitemapStylesheet,
  buildSitemapXml,
  scoreSeoPage,
  validateDiscoveryArtifacts,
} from '../dist/index.js';

const site = compileLanderSite({
  product: { name: 'Example', slug: 'example', tagline: 'Tagline', description: 'Description', category: 'Software', canonicalUrl: 'https://example.test' },
  pages: [
    { kind: 'home', slug: '/', title: 'Example Home', description: 'Example description for a portable landing site.', h1: 'Example', intro: 'A useful intro for this page with enough words for the smoke test.', sections: [{ id: 'hero', kind: 'hero', title: 'Example', subtitle: 'Portable.' }] },
    { kind: 'answer', slug: '/docs/', title: 'Example Docs', description: 'Detailed documentation page for portable discovery artifact generation.', h1: 'Example Docs', intro: 'This page gives crawlers enough rendered text to validate the llms full text surface.', sections: [{ id: 'body', kind: 'markdown', title: 'Docs', body: 'Portable rendered documentation text for semantic discovery surfaces and content registries.' }] },
    { kind: 'answer', slug: '/draft/', title: 'Draft Page', description: 'Draft page excluded from public discovery surfaces.', h1: 'Draft', intro: 'Excluded draft content should never appear in the public sitemap.', seo: { noindex: true }, sections: [{ id: 'draft', kind: 'markdown', title: 'Draft', body: 'Private draft text.' }] },
  ],
});

assert.equal(buildPageMetadata(site, site.pages[0]).alternates.canonical, 'https://example.test/');
assert.equal(scoreSeoPage(site.pages[0]).canonical, 1);
assert.match(buildAiSummary(site), /Example Facts/);

const options = {
  generatedAt: '2026-05-13T12:00:00.000Z',
  crawlerPolicies: [
    { userAgent: '*', category: 'search-inclusion', allow: ['/'] },
    { userAgent: 'GPTBot', category: 'training-ingestion', disallow: ['/'] },
  ],
  pageSources: {
    '/': {
      lastmod: '2026-05-13',
      text: 'Rendered home page text for portable artifact validation.',
      headings: ['Example'],
      links: ['/docs/'],
      tags: ['home'],
      llmsInclude: true,
      alternates: [{ hreflang: 'x-default', href: 'https://example.test/' }],
      jsonLdGraph: [{ '@type': 'WebPage', '@id': 'https://example.test/#webpage', name: 'Example Home' }],
    },
    '/docs/': {
      lastmod: '2026-05-13',
      text: 'Rendered docs page text for semantic index and llms full validation.',
      headings: ['Example Docs'],
      links: ['/'],
      tags: ['docs'],
      llmsInclude: true,
    },
  },
};

const sitemap = buildSitemapXml(site, options);
assert.match(sitemap, /<\?xml-stylesheet type="text\/xsl" href="\/sitemap\.xsl"\?>/);
assert.match(sitemap, /xmlns:xhtml=/);
assert.match(sitemap, /<loc>https:\/\/example.test\/docs\/<\/loc>/);
assert.doesNotMatch(sitemap, /https:\/\/example.test\/draft\//);

const sitemapXsl = buildSitemapStylesheet(site);
assert.match(sitemapXsl, /<table>/);
assert.match(sitemapXsl, /<th scope="col">URL<\/th>/);
assert.match(sitemapXsl, /<th scope="col">Last modified<\/th>/);
assert.match(sitemapXsl, /<br \/>/);

const llmsFull = buildLlmsFullTxt(site, options);
assert.match(llmsFull, /Rendered docs page text/);
assert.match(llmsFull, /https:\/\/example.test\/docs\//);

const contentIndex = buildContentIndex(site, options);
assert.equal(contentIndex.length, 2);
assert.equal(contentIndex[0].jsonLdId, 'https://example.test/#webpage');

const semanticIndex = buildSemanticIndex(site, options);
assert.equal(semanticIndex.find((entry) => entry.slug === '/docs/')?.headings[0], 'Example Docs');

const jsonLdGraph = buildJsonLdGraphArtifact(site, options);
assert.ok(jsonLdGraph['@graph'].some((node) => node['@id'] === 'https://example.test/#webpage'));
assert.ok(jsonLdGraph['@graph'].some((node) => node['@id'] === 'https://example.test/docs/#webpage'));

const contentRegistry = buildContentRegistry(site, options);
assert.equal(contentRegistry.find((entry) => entry.discovery.canonical === 'https://example.test/draft/')?.discovery.sitemap, false);

const artifacts = buildDiscoveryArtifacts(site, options);
assert.equal(artifacts.cacheHeaderManifest.entries.find((entry) => entry.path === '/sitemap.xml')?.resourceClass, 'mutable-revalidate');
assert.equal(artifacts.cacheHeaderManifest.entries.find((entry) => entry.path === '/sitemap.xsl')?.resourceClass, 'mutable-revalidate');
assert.equal(validateDiscoveryArtifacts(site, artifacts).ok, true);

const invalidArtifacts = buildDiscoveryArtifacts(compileLanderSite({
  product: { name: 'Local', slug: 'local', tagline: 'Tagline', description: 'Description', category: 'Software', canonicalUrl: 'http://localhost:3000' },
  pages: [{ kind: 'home', slug: '/', title: 'Local Home', description: 'Local description for validation.', h1: 'Local', intro: 'Local intro with enough words for validation checks.', sections: [{ id: 'hero', kind: 'hero', title: 'Local', subtitle: 'Local.' }] }],
}), { generatedAt: '2026-05-13T12:00:00.000Z' });
assert.equal(validateDiscoveryArtifacts(site, invalidArtifacts).ok, false);
