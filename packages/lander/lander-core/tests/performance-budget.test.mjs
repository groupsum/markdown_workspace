import assert from 'node:assert/strict';

import {
  buildCacheHeaderManifest,
} from '../dist/cache/resource-policy.js';
import {
  buildCriticalPathManifest,
  defineRouteScriptFact,
  routeRequiresScript,
  validateLanderPerformanceBudget,
} from '../dist/performance/budget.js';

const cacheManifest = buildCacheHeaderManifest([
  { path: '/assets/static.abcdef123456.css', content: 'body{}', contentType: 'text/css; charset=utf-8' },
  { path: '/assets/static.abcdef123456.js', content: 'console.log(1)', contentType: 'text/javascript; charset=utf-8' },
  { path: '/content-index.json', content: '{}', contentType: 'application/json; charset=utf-8' },
  { path: '/favicon.svg', content: '<svg />', contentType: 'image/svg+xml' },
  { path: '/favicon.ico', content: 'ico', contentType: 'image/x-icon' },
]);

assert.equal(cacheManifest.entries.find((entry) => entry.path.endsWith('.css'))?.compressionEligible, true);
assert.equal(cacheManifest.entries.find((entry) => entry.path.endsWith('.js'))?.compressionEligible, true);
assert.equal(cacheManifest.entries.find((entry) => entry.path.endsWith('.json'))?.compressionEligible, true);
assert.equal(cacheManifest.entries.find((entry) => entry.path.endsWith('.svg'))?.compressionEligible, true);
assert.equal(cacheManifest.entries.find((entry) => entry.path.endsWith('.ico'))?.compressionEligible, false);

const manifest = buildCriticalPathManifest([
  {
    path: '/docs',
    criticalCssProfileId: 'portable-shell',
    criticalCssBytes: 6400,
    deferredStylesheetHref: '/assets/static.abcdef123456.css',
    scripts: [
      defineRouteScriptFact({
        kind: 'theme-bootstrap',
        required: true,
        reason: 'first-paint theme selection',
        inlineBytes: 700,
      }),
      defineRouteScriptFact({
        kind: 'demo-controls',
        required: false,
        reason: 'docs route has no demo',
        inlineBytes: 0,
      }),
    ],
    motion: [
      {
        selector: '.hero-blob',
        firstViewport: true,
        animatedProperties: ['transform', 'opacity'],
        reducedMotion: true,
      },
    ],
  },
], '2026-05-18T16:00:00Z');

const docsRoute = manifest.routes[0];
assert.equal(docsRoute.path, '/docs');
assert.equal(docsRoute.deferredStylesheetHref, '/assets/static.abcdef123456.css');
assert.equal(routeRequiresScript(docsRoute, 'theme-bootstrap'), true);
assert.equal(routeRequiresScript(docsRoute, 'demo-controls'), false);
assert.deepEqual(validateLanderPerformanceBudget({ manifest, cacheManifest }), []);

const failingManifest = buildCriticalPathManifest([
  {
    path: '/bad',
    criticalCssProfileId: '',
    criticalCssBytes: 20_000,
    deferredStylesheetHref: '',
    renderBlockingStylesheets: ['/assets/static.css'],
    scripts: [
      { kind: 'demo-controls', required: false, reason: 'not used here', inlineBytes: 1 },
      { kind: 'analytics', required: true, reason: 'third-party analytics', externalBytes: 1 },
    ],
    motion: [
      {
        selector: '.hero-blob',
        firstViewport: true,
        animatedProperties: ['left', 'filter'],
        reducedMotion: false,
      },
    ],
  },
]);

const brokenCacheManifest = {
  version: 1,
  generatedAt: 'Mon, 18 May 2026 16:00:00 GMT',
  entries: [
    {
      path: '/assets/static.abcdef123456.css',
      resourceClass: 'immutable',
      contentType: 'text/css; charset=utf-8',
      compressionEligible: false,
      etag: '"sha256-test"',
      lastModified: 'Mon, 18 May 2026 16:00:00 GMT',
      cacheControl: 'public, max-age=31536000, immutable',
      headers: {},
    },
  ],
};

assert.deepEqual(
  validateLanderPerformanceBudget({ manifest: failingManifest, cacheManifest: brokenCacheManifest }).map((diagnostic) => diagnostic.code).sort(),
  [
    'criticalCss.bytes.exceeded',
    'criticalCss.profile.missing',
    'motion.nonComposited',
    'motion.reducedMotion.missing',
    'resource.compressionMetadata.missing',
    'script.externalBytes.exceeded',
    'script.unusedGoverned',
    'stylesheet.deferred.missing',
    'stylesheet.renderBlocking',
  ].sort(),
);
