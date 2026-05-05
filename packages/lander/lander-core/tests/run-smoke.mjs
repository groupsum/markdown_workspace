import assert from 'node:assert/strict';
import { compileLanderSite, buildLlmsTxt, buildRobotsTxt, buildSitemap } from '../dist/index.js';

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
