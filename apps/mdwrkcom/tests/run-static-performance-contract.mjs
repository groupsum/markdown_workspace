import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(appRoot, 'dist-static');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(distRoot, name), 'utf8'));
const readHtml = (route) => fs.readFileSync(path.join(distRoot, route, 'index.html'), 'utf8');

const criticalPathManifest = readJson('critical-path-manifest.json');
const cacheManifest = readJson('cache-header-manifest.json');
const routeByPath = new Map(criticalPathManifest.routes.map((route) => [route.path, route]));
const staticCssEntry = cacheManifest.entries.find((entry) => /^\/assets\/static\.[a-f0-9]{16}\.css$/.test(entry.path));

assert.equal(criticalPathManifest.version, 1);
assert.ok(criticalPathManifest.routes.length >= 200, 'critical path manifest must cover the generated page corpus.');
assert.ok(staticCssEntry, 'cache manifest must include the fingerprinted static CSS asset.');
assert.equal(staticCssEntry.resourceClass, 'immutable');
assert.match(staticCssEntry.cacheControl, /max-age=31536000/);
assert.match(staticCssEntry.cacheControl, /immutable/);
assert.equal(staticCssEntry.compressionEligible, true);

for (const route of criticalPathManifest.routes) {
  assert.equal(route.criticalCssProfileId, 'mdwrkcom-static-shell', `${route.path} must use the mdwrkcom shell profile.`);
  assert.ok(route.criticalCssBytes > 0 && route.criticalCssBytes <= route.budget.maxCriticalCssBytes, `${route.path} critical CSS must fit its route budget.`);
  assert.equal(route.deferredStylesheetHref, staticCssEntry.path, `${route.path} must defer the generated fingerprinted CSS.`);
  assert.deepEqual(route.renderBlockingStylesheets, [], `${route.path} must not emit render-blocking stylesheets.`);
  assert.equal(route.scripts.some((script) => script.kind === 'theme-bootstrap' && script.required), true, `${route.path} must declare theme bootstrap script need.`);
  assert.equal(route.scripts.some((script) => script.kind === 'theme-toggle' && script.required), true, `${route.path} must declare theme toggle script need.`);
  assert.equal(route.scripts.some((script) => script.kind === 'navigation' && script.required), true, `${route.path} must declare navigation script need.`);
}

const homeRoute = routeByPath.get('/');
const quickstartRoute = routeByPath.get('/docs/quickstart/');
assert.ok(homeRoute, 'home route must be present in critical path manifest.');
assert.ok(quickstartRoute, 'quickstart route must be present in critical path manifest.');
assert.equal(homeRoute.scripts.find((script) => script.kind === 'demo-controls')?.required, true);
assert.ok(homeRoute.scripts.find((script) => script.kind === 'demo-controls')?.inlineBytes > 0);
assert.equal(homeRoute.scripts.find((script) => script.kind === 'syntax-highlighting')?.required, true);
assert.equal(quickstartRoute.scripts.find((script) => script.kind === 'demo-controls')?.required, false);
assert.equal(quickstartRoute.scripts.find((script) => script.kind === 'demo-controls')?.inlineBytes, 0);
assert.equal(quickstartRoute.scripts.find((script) => script.kind === 'syntax-highlighting')?.required, false);
assert.deepEqual(homeRoute.motion, [
  {
    selector: '.hero-blob',
    firstViewport: true,
    animatedProperties: ['transform'],
    reducedMotion: true,
  },
]);

const quickstartHtml = readHtml(path.join('docs', 'quickstart'));
assert.match(quickstartHtml, new RegExp(`<link rel="preload" href="${staticCssEntry.path.replaceAll('/', '\\/')}" as="style"`));
assert.doesNotMatch(quickstartHtml, /function setDemoMode/);

const homeHtml = readHtml('');
assert.match(homeHtml, /function setDemoMode/);

for (const entry of cacheManifest.entries) {
  const type = String(entry.contentType ?? '').toLowerCase();
  if (type.startsWith('text/') || ['application/json', 'application/xml', 'image/svg+xml'].some((prefix) => type.startsWith(prefix))) {
    assert.equal(entry.compressionEligible, true, `${entry.path} must carry compression eligibility metadata.`);
  }
}
