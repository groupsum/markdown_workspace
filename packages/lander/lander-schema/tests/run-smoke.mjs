import assert from 'node:assert/strict';
import { compileLanderSite } from '@mdwrk/lander-core';
import { buildJsonLdGraph, faqSchema } from '../dist/index.js';

const site = compileLanderSite({
  product: { name: 'Example', slug: 'example', tagline: 'Tagline', description: 'Description', category: 'Software', canonicalUrl: 'https://example.test' },
  pages: [{ kind: 'home', slug: '/', title: 'Example Home', description: 'Long enough description.', h1: 'Example', intro: 'A useful intro for this page.', sections: [{ id: 'hero', kind: 'hero', title: 'Example', subtitle: 'Portable.' }] }],
});

assert.equal(faqSchema([{ question: 'What is this?', answer: 'A portable lander schema test.' }])['@type'], 'FAQPage');
assert.equal(buildJsonLdGraph(site, site.pages[0]).length >= 3, true);
