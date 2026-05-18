import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outIndex = process.argv.indexOf('--out');
const outDir = outIndex === -1 ? 'dist-static' : process.argv[outIndex + 1];
const distRoot = path.resolve(landerRoot, outDir || 'dist-static');
const siteUrl = (process.env.MDWRK_SITE_URL || process.env.VITE_SITE_URL || 'https://mdwrk.com').replace(/\/+$/, '');

const read = (relativePath) => fs.readFileSync(path.join(distRoot, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(distRoot, relativePath));

const englishQuickstart = read('docs/quickstart/index.html');
const spanishQuickstart = read('es/docs/quickstart/index.html');
const sitemap = read('sitemap.xml');
const childSitemapCorpus = [...sitemap.matchAll(/<loc>https?:\/\/[^<]+(\/sitemaps\/[^<]+\.xml)<\/loc>/g)]
  .map(match => match[1].replace(/^\/+/, ''))
  .filter((relativePath) => exists(relativePath))
  .map(read)
  .join('\n');
const contentIndex = JSON.parse(read('content-index.json'));

const englishUrl = `${siteUrl}/docs/quickstart/`;
const spanishUrl = `${siteUrl}/es/docs/quickstart/`;
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isCanonicalBcp47 = (value) => {
  try {
    return Intl.getCanonicalLocales(value)[0] === value;
  } catch {
    return false;
  }
};

assert.match(englishQuickstart, /<html lang="en"/, 'English quickstart must declare lang=en');
assert.match(spanishQuickstart, /<html lang="es"/, 'Spanish quickstart must declare lang=es');
assert.ok(isCanonicalBcp47('en'), 'English hreflang must be a canonical BCP 47 tag');
assert.ok(isCanonicalBcp47('es'), 'Spanish hreflang must be a canonical BCP 47 tag');
assert.match(spanishQuickstart, new RegExp(`<link rel="canonical" href="${escapeRegex(spanishUrl)}">`), 'Spanish page canonical must point at the localized URL');
assert.match(spanishQuickstart, new RegExp(`rel="alternate" hreflang="en" href="${escapeRegex(englishUrl)}"`), 'Spanish page must link the English alternate');
assert.match(spanishQuickstart, new RegExp(`rel="alternate" hreflang="es" href="${escapeRegex(spanishUrl)}"`), 'Spanish page must link its self alternate');
assert.match(spanishQuickstart, new RegExp(`rel="alternate" hreflang="x-default" href="${escapeRegex(englishUrl)}"`), 'Spanish page must expose x-default');
assert.match(spanishQuickstart, /class="locale-switcher/, 'Spanish page must expose a visible locale switcher');
assert.match(englishQuickstart, /href="\/es\/docs\/quickstart\/" hreflang="es"/, 'English page must link the Spanish route visibly');
assert.match(sitemap, /<sitemapindex/, 'Root sitemap must be a sitemap index');
assert.match(childSitemapCorpus, /xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/, 'Child sitemaps must declare xhtml alternate namespace');
assert.match(childSitemapCorpus, new RegExp(`<loc>${escapeRegex(englishUrl)}</loc>[\\s\\S]*hreflang="es" href="${escapeRegex(spanishUrl)}"`), 'English child sitemap URL must include Spanish alternate');
assert.match(childSitemapCorpus, new RegExp(`<loc>${escapeRegex(spanishUrl)}</loc>[\\s\\S]*hreflang="x-default" href="${escapeRegex(englishUrl)}"`), 'Spanish child sitemap URL must include x-default alternate');
assert.equal(contentIndex.find(page => page.slug === '/es/docs/quickstart/')?.locale, 'es', 'content index must expose localized page locale');
assert.equal(contentIndex.find(page => page.slug === '/es/docs/quickstart/')?.translationOf, '/docs/quickstart/', 'content index must expose translation source');
assert.ok(exists('es/docs/quickstart/index.md'), 'localized page must have a Markdown mirror');
assert.equal(/[?&](locale|lang|hl)=/i.test(`${englishQuickstart}\n${spanishQuickstart}\n${sitemap}\n${childSitemapCorpus}`), false, 'localized routes must not use query parameters');

console.log('MdWrk international SEO validation passed.');
