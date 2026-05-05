import assert from 'node:assert/strict';
import { compileLanderSite } from '@mdwrk/lander-core';
import { buildPageMetadata, scoreSeoPage, buildAiSummary } from '../dist/index.js';

const site = compileLanderSite({
  product: { name: 'Example', slug: 'example', tagline: 'Tagline', description: 'Description', category: 'Software', canonicalUrl: 'https://example.test' },
  pages: [{ kind: 'home', slug: '/', title: 'Example Home', description: 'Example description for a portable landing site.', h1: 'Example', intro: 'A useful intro for this page with enough words for the smoke test.', sections: [{ id: 'hero', kind: 'hero', title: 'Example', subtitle: 'Portable.' }] }],
});

assert.equal(buildPageMetadata(site, site.pages[0]).alternates.canonical, 'https://example.test/');
assert.equal(scoreSeoPage(site.pages[0]).canonical, 1);
assert.match(buildAiSummary(site), /Example Facts/);
