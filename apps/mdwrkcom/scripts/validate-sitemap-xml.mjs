#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outIndex = process.argv.indexOf('--out');
const outDir = outIndex === -1 ? 'dist-static' : process.argv[outIndex + 1];
const distRoot = path.resolve(landerRoot, outDir || 'dist-static');

const read = (relativePath) => fs.readFileSync(path.join(distRoot, relativePath), 'utf8');
const sitemap = read('sitemap.xml');
const sitemapStylesheet = read('sitemap.xsl');
const contentRegistry = JSON.parse(read('content-registry.json'));

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const parseAttributes = (raw) => {
  const attributes = {};
  for (const match of raw.matchAll(/([A-Za-z_:][A-Za-z0-9_.:-]*)="([^"]*)"/g)) {
    attributes[match[1]] = match[2];
  }
  return attributes;
};

const canonicalRegistryEntries = contentRegistry.filter((entry) => entry?.discovery?.sitemap);
const expectedCanonicals = canonicalRegistryEntries.map((entry) => entry.discovery.canonical);
const expectedCanonicalSet = new Set(expectedCanonicals);

const xmlDeclaration = /^\s*<\?xml\s+version="1\.0"\s+encoding="UTF-8"\s*\?>/;
const sitemapIndexMatch = sitemap.match(/<sitemapindex\b([^>]*)>([\s\S]*)<\/sitemapindex>\s*$/);

try {
  assert.match(sitemap, xmlDeclaration, 'sitemap.xml must begin with an XML declaration');
  assert.match(sitemap, /<\?xml-stylesheet\s+type="text\/xsl"\s+href="\/sitemap\.xsl"\s*\?>/, 'sitemap.xml must link the browser-readable table stylesheet');
  assert.ok(sitemapIndexMatch, 'sitemap.xml must contain one <sitemapindex> root element');
  assert.doesNotMatch(sitemap, /<url>/, 'sitemap.xml must not contain page <url> records');
  assert.match(sitemapStylesheet, /<table>/, 'sitemap.xsl must render sitemap XML as a human-readable table');
  assert.match(sitemapStylesheet, /<th scope="col">Sitemap<\/th>/, 'sitemap.xsl must include the Sitemap <th> label');
  assert.match(sitemapStylesheet, /<th scope="col">URL<\/th>/, 'sitemap.xsl must include the URL <th> label for child sitemaps');
} catch (error) {
  fail(error.message);
}

const [, sitemapIndexAttributesRaw = '', sitemapIndexBody = ''] = sitemapIndexMatch ?? [];
const sitemapIndexAttributes = parseAttributes(sitemapIndexAttributesRaw);
const sitemapBlocks = [...sitemapIndexBody.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g)].map((match) => match[1]);
const renderedSitemapSection = sitemapBlocks.map((block) => `<sitemap>${block}</sitemap>`).join('');

try {
  assert.equal(
    renderedSitemapSection.replace(/\s+/g, ''),
    sitemapIndexBody.replace(/\s+/g, ''),
    'sitemap.xml must parse cleanly into <sitemap> nodes without stray content',
  );
  assert.equal(
    sitemapIndexAttributes.xmlns,
    'http://www.sitemaps.org/schemas/sitemap/0.9',
    'sitemap.xml must declare the sitemap protocol namespace',
  );
  assert.ok(sitemapBlocks.length > 0, 'sitemap.xml must reference at least one child sitemap');
} catch (error) {
  fail(error.message);
}

const childSitemapPaths = [];
for (const block of sitemapBlocks) {
  const locMatches = [...block.matchAll(/<loc>([\s\S]*?)<\/loc>/g)];
  const lastmodMatches = [...block.matchAll(/<lastmod>([\s\S]*?)<\/lastmod>/g)];
  try {
    assert.equal(locMatches.length, 1, 'every <sitemap> must contain exactly one <loc>');
    assert.ok(lastmodMatches.length <= 1, 'every <sitemap> must contain at most one <lastmod>');
  } catch (error) {
    fail(`${error.message}\nOffending block: <sitemap>${block}</sitemap>`);
  }

  const childLoc = locMatches[0][1].trim();
  try {
    assert.equal(/localhost|127\.0\.0\.1|:\d{2,5}\b/i.test(childLoc), false, `${childLoc} must not use localhost or explicit ports`);
    assert.match(childLoc, /\/sitemaps\/[^/]+\.xml$/, `${childLoc} must point to a child sitemap under /sitemaps/`);
  } catch (error) {
    fail(error.message);
  }
  childSitemapPaths.push(new URL(childLoc).pathname.replace(/^\/+/, ''));
}

const seenCanonicals = new Map();
const alternateHrefs = [];

for (const childPath of childSitemapPaths) {
  const childSitemap = read(childPath);
  const urlsetMatch = childSitemap.match(/<urlset\b([^>]*)>([\s\S]*)<\/urlset>\s*$/);
  if (!urlsetMatch) fail(`${childPath} must contain one <urlset> root element`);
  const [, urlsetAttributesRaw = '', urlsetBody = ''] = urlsetMatch;
  const urlsetAttributes = parseAttributes(urlsetAttributesRaw);
  const urlBlocks = [...urlsetBody.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
  const renderedUrlSection = urlBlocks.map((block) => `<url>${block}</url>`).join('');

  try {
    assert.equal(
      renderedUrlSection.replace(/\s+/g, ''),
      urlsetBody.replace(/\s+/g, ''),
      `${childPath} must parse cleanly into <url> nodes without stray content`,
    );
    assert.equal(urlsetAttributes.xmlns, 'http://www.sitemaps.org/schemas/sitemap/0.9', `${childPath} must declare the sitemap protocol namespace`);
    assert.equal(urlsetAttributes['xmlns:xhtml'], 'http://www.w3.org/1999/xhtml', `${childPath} must declare xhtml alternate namespace`);
  } catch (error) {
    fail(error.message);
  }

  for (const block of urlBlocks) {
    const locMatches = [...block.matchAll(/<loc>([\s\S]*?)<\/loc>/g)];
    const lastmodMatches = [...block.matchAll(/<lastmod>([\s\S]*?)<\/lastmod>/g)];
    try {
      assert.equal(locMatches.length, 1, 'every <url> must contain exactly one <loc>');
      assert.equal(lastmodMatches.length, 1, 'every <url> must contain exactly one <lastmod>');
      assert.match(block, /^\n    <loc>[\s\S]*?<\/loc>\n    <lastmod>[\s\S]*?<\/lastmod>/, 'every <url> record must render loc and lastmod as separate indented columns');
    } catch (error) {
      fail(`${childPath}: ${error.message}\nOffending block: <url>${block}</url>`);
    }

    const canonical = locMatches[0][1].trim();
    seenCanonicals.set(canonical, (seenCanonicals.get(canonical) ?? 0) + 1);
    try {
      assert.equal(/localhost|127\.0\.0\.1|:\d{2,5}\b/i.test(canonical), false, `${canonical} must not use localhost or explicit ports`);
      assert.equal(/[?&](locale|lang|hl)=/i.test(canonical), false, `${canonical} must not use query-locale routing`);
    } catch (error) {
      fail(error.message);
    }

    for (const linkMatch of block.matchAll(/<xhtml:link\b([^>]*)\/>/g)) {
      const attributes = parseAttributes(linkMatch[1]);
      const href = attributes.href?.trim();
      if (!href) fail(`sitemap alternate in ${canonical} is missing href`);
      alternateHrefs.push({ canonical, href });
    }
  }
}

const duplicateCanonicals = [...seenCanonicals.entries()].filter(([, count]) => count !== 1);
if (duplicateCanonicals.length) {
  fail(`child sitemaps contain duplicate canonical URLs: ${duplicateCanonicals.map(([canonical, count]) => `${canonical} (${count})`).join(', ')}`);
}

const missingCanonicals = expectedCanonicals.filter((canonical) => !seenCanonicals.has(canonical));
if (missingCanonicals.length) {
  fail(`child sitemaps are missing indexed canonical URLs: ${missingCanonicals.join(', ')}`);
}

const unexpectedCanonicals = [...seenCanonicals.keys()].filter((canonical) => !expectedCanonicalSet.has(canonical));
if (unexpectedCanonicals.length) {
  fail(`child sitemaps contain unexpected canonical URLs: ${unexpectedCanonicals.join(', ')}`);
}

const invalidAlternates = alternateHrefs.filter(({ href }) => !expectedCanonicalSet.has(href));
if (invalidAlternates.length) {
  fail(`child sitemap alternates must target real canonical URLs: ${invalidAlternates.map(({ canonical, href }) => `${canonical} -> ${href}`).join(', ')}`);
}

console.log('MdWrk sitemap XML validation passed.');
