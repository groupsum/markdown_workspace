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
const urlsetMatch = sitemap.match(/<urlset\b([^>]*)>([\s\S]*)<\/urlset>\s*$/);

try {
  assert.match(sitemap, xmlDeclaration, 'sitemap.xml must begin with an XML declaration');
  assert.ok(urlsetMatch, 'sitemap.xml must contain one <urlset> root element');
} catch (error) {
  fail(error.message);
}

const [, urlsetAttributesRaw = '', urlsetBody = ''] = urlsetMatch ?? [];
const urlsetAttributes = parseAttributes(urlsetAttributesRaw);
const urlBlocks = [...urlsetBody.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
const renderedUrlSection = urlBlocks.map((block) => `<url>${block}</url>`).join('');

try {
  assert.equal(
    renderedUrlSection.replace(/\s+/g, ''),
    urlsetBody.replace(/\s+/g, ''),
    'sitemap.xml must parse cleanly into <url> nodes without stray content',
  );
  assert.equal(/<url><loc>/g.test(sitemap), false, 'sitemap.xml must line-break each <url> record before <loc>');
  assert.equal(/<\/loc><lastmod>/g.test(sitemap), false, 'sitemap.xml must keep loc and lastmod in separate readable columns');
  assert.equal(/<\/url>\n  <url>/g.test(sitemap), false, 'sitemap.xml must include a blank line between <url> records');
  assert.equal(
    urlsetAttributes.xmlns,
    'http://www.sitemaps.org/schemas/sitemap/0.9',
    'sitemap.xml must declare the sitemap protocol namespace',
  );
} catch (error) {
  fail(error.message);
}

const seenCanonicals = new Map();
const alternateHrefs = [];

for (const block of urlBlocks) {
  const locMatches = [...block.matchAll(/<loc>([\s\S]*?)<\/loc>/g)];
  const lastmodMatches = [...block.matchAll(/<lastmod>([\s\S]*?)<\/lastmod>/g)];
  try {
    assert.equal(locMatches.length, 1, 'every <url> must contain exactly one <loc>');
    assert.equal(lastmodMatches.length, 1, 'every <url> must contain exactly one <lastmod>');
    assert.match(block, /^\n    <loc>[\s\S]*?<\/loc>\n    <lastmod>[\s\S]*?<\/lastmod>/, 'every <url> record must render loc and lastmod as separate indented columns');
  } catch (error) {
    fail(`${error.message}\nOffending block: <url>${block}</url>`);
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
    try {
      assert.equal(/localhost|127\.0\.0\.1|:\d{2,5}\b/i.test(href), false, `${href} must not use localhost or explicit ports`);
      assert.equal(/[?&](locale|lang|hl)=/i.test(href), false, `${href} must not use query-locale routing`);
    } catch (error) {
      fail(error.message);
    }
  }
}

const duplicateCanonicals = [...seenCanonicals.entries()].filter(([, count]) => count !== 1);
if (duplicateCanonicals.length) {
  fail(`sitemap.xml contains duplicate canonical URLs: ${duplicateCanonicals.map(([canonical, count]) => `${canonical} (${count})`).join(', ')}`);
}

const missingCanonicals = expectedCanonicals.filter((canonical) => !seenCanonicals.has(canonical));
if (missingCanonicals.length) {
  fail(`sitemap.xml is missing indexed canonical URLs: ${missingCanonicals.join(', ')}`);
}

const unexpectedCanonicals = [...seenCanonicals.keys()].filter((canonical) => !expectedCanonicalSet.has(canonical));
if (unexpectedCanonicals.length) {
  fail(`sitemap.xml contains unexpected canonical URLs: ${unexpectedCanonicals.join(', ')}`);
}

const invalidAlternates = alternateHrefs.filter(({ href }) => !expectedCanonicalSet.has(href));
if (invalidAlternates.length) {
  fail(`sitemap.xml alternates must target real canonical URLs: ${invalidAlternates.map(({ canonical, href }) => `${canonical} -> ${href}`).join(', ')}`);
}

console.log('MdWrk sitemap XML validation passed.');
