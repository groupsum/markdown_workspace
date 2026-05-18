import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testRoot, '..', '..', '..', '..');
const distRoot = path.resolve(testRoot, '..', 'dist');
const distIndex = path.join(distRoot, 'index.js');
const smokeIndex = path.join(distRoot, 'index.smoke.mjs');
const contentContractDist = path.join(repoRoot, 'packages', 'lander', 'lander-content-contract', 'dist', 'index.js').replace(/\\/g, '/');

fs.writeFileSync(
  smokeIndex,
  fs.readFileSync(distIndex, 'utf8').replaceAll('"@mdwrk/lander-content-contract"', `"file:///${contentContractDist}"`),
);

const {
  buildCacheHeaderManifest,
  buildCriticalPathManifest,
  defineSyntaxHighlightingRouteGate,
  headersForCacheResource,
  validateLanderPerformanceBudget,
  buildLlmsTxt,
  buildRobotsTxt,
  buildSitemap,
  compileLanderSite,
  defineCriticalCssProfile,
  renderCriticalCssStyle,
  renderDeferredStylesheetLink,
} = await import(`file:///${smokeIndex.replace(/\\/g, '/')}`);

fs.rmSync(smokeIndex, { force: true });

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
      schema: [{ kind: 'WebPage' }, { kind: 'SoftwareApplication' }],
      componentIntents: [{ id: 'example:declared-faq', kind: 'faq', sourceId: 'declared' }],
    },
  ],
});

assert.equal(site.diagnostics.filter((item) => item.level === 'error').length, 0);
assert.equal(site.pageByPath.get('/')?.canonicalUrl, 'https://example.test/');
assert.ok(site.pageByPath.get('/')?.componentIntents.some((intent) => intent.kind === 'page_shell' && intent.source === 'page'));
assert.ok(site.pageByPath.get('/')?.componentIntents.some((intent) => intent.kind === 'hero' && intent.source === 'section'));
assert.ok(site.pageByPath.get('/')?.componentIntents.some((intent) => intent.kind === 'structured_data_graph' && intent.source === 'schema'));
assert.deepEqual(site.pageByPath.get('/')?.schemaIntents.map((intent) => intent.kind), ['WebPage', 'SoftwareApplication']);
assert.equal(site.pageByPath.get('/')?.schemaIntents[0].id, '/#schema-1-webpage');
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
assert.equal(manifest.entries[0].compressionEligible, true);
assert.ok(manifest.entries.every(entry => entry.headers.ETag && entry.headers['Last-Modified']));
assert.equal(headersForCacheResource(manifest, '/sitemap.xml')?.['Cache-Control'], 'no-cache');
assert.equal(headersForCacheResource(manifest, '/missing'), undefined);

const criticalCss = defineCriticalCssProfile({ id: 'example', css: 'body { color: #111; }' });
assert.match(renderCriticalCssStyle(criticalCss), /data-lander-critical-css="example"/);
assert.match(renderDeferredStylesheetLink('/assets/static.abcdef123456.css'), /rel="preload"/);

const criticalPathManifest = buildCriticalPathManifest([
  {
    path: '/',
    criticalCssProfileId: criticalCss.id,
    criticalCssBytes: criticalCss.css.length,
    deferredStylesheetHref: '/assets/static.abcdef123456.css',
    scripts: [
      { kind: 'theme-bootstrap', required: true, reason: 'first-paint theme selection', inlineBytes: 200 },
      defineSyntaxHighlightingRouteGate({
        routePath: '/',
        markdownSources: ['Portable lander smoke page without code fences.'],
        inlineBytes: 100,
      }).fact,
    ],
    motion: [
      { selector: '.hero-blob', firstViewport: true, animatedProperties: ['transform', 'opacity'], reducedMotion: true },
    ],
  },
]);
assert.equal(criticalPathManifest.routes[0].path, '/');
assert.equal(criticalPathManifest.routes[0].scripts.find((script) => script.kind === 'syntax-highlighting')?.required, false);
assert.equal(criticalPathManifest.routes[0].scripts.find((script) => script.kind === 'syntax-highlighting')?.inlineBytes, 0);
assert.deepEqual(validateLanderPerformanceBudget({ manifest: criticalPathManifest, cacheManifest: manifest }), []);
