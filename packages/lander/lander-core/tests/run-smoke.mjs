import assert from 'node:assert/strict';
import {
  buildCacheHeaderManifest,
  buildLlmsTxt,
  buildRobotsTxt,
  buildSitemap,
  compileLanderSite,
  defineCriticalCssProfile,
  renderCriticalCssStyle,
  renderDeferredStylesheetLink,
} from '../dist/index.js';

const site = compileLanderSite({
  product: {
    name: 'Example',
    slug: 'example',
    tagline: 'Example tagline',
    description: 'Example portable product.',
    category: 'Software',
    canonicalUrl: 'https://example.test',
  },
  pages: [
    {
      kind: 'home',
      slug: '/',
      title: 'Example Home',
      description: 'Example description for a portable landing site.',
      h1: 'Example',
      intro: 'Example intro text that gives crawlers a useful first paragraph.',
      sections: [{ id: 'hero', kind: 'hero', title: 'Example', subtitle: 'Portable lander.' }],
    },
  ],
});

assert.equal(site.diagnostics.filter((item) => item.level === 'error').length, 0);
assert.equal(site.pageByPath.get('/')?.canonicalUrl, 'https://example.test/');
assert.equal(buildSitemap(site)[0].loc, 'https://example.test/');
assert.match(buildLlmsTxt(site), /# Example/);
assert.match(buildRobotsTxt(site), /OAI-SearchBot/);

const manifest = buildCacheHeaderManifest([
  { path: '/assets/static.abcdef123456.css', content: 'body{}', contentType: 'text/css' },
  { path: '/sitemap.xml', content: '<urlset />', contentType: 'application/xml' },
]);

assert.equal(manifest.entries[0].resourceClass, 'immutable');
assert.match(manifest.entries[0].headers['Cache-Control'], /immutable/);
assert.equal(manifest.entries[1].resourceClass, 'mutable-revalidate');
assert.equal(manifest.entries[1].headers['Cache-Control'], 'no-cache');
assert.ok(manifest.entries.every(entry => entry.headers.ETag && entry.headers['Last-Modified']));

const criticalCss = defineCriticalCssProfile({ id: 'example', css: 'body { color: #111; }' });
assert.match(renderCriticalCssStyle(criticalCss), /data-lander-critical-css="example"/);
assert.match(renderDeferredStylesheetLink('/assets/static.abcdef123456.css'), /rel="preload"/);
