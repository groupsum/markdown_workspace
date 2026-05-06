import assert from 'node:assert/strict';
import { buildJsonLdGraph, faqSchema } from '../dist/index.js';

const site = {
  product: { name: 'Example', slug: 'example', tagline: 'Tagline', description: 'Description', category: 'Software', canonicalUrl: 'https://example.test' },
};
const page = {
  kind: 'home',
  slug: '/',
  title: 'Example Home',
  description: 'Long enough description.',
  h1: 'Example',
  canonicalUrl: 'https://example.test/',
  breadcrumbs: [{ label: 'Home', href: '/' }],
};

assert.equal(faqSchema([{ question: 'What is this?', answer: 'A portable lander schema test.' }])['@type'], 'FAQPage');
assert.equal(buildJsonLdGraph(site, page).length >= 3, true);
