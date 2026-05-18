#!/usr/bin/env node
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node apps/mdwrkcom/scripts/post-deploy-smoke.mjs [https://mdwrk.com]');
  process.exit(0);
}

const baseUrl = (process.argv[2] || process.env.MDWRK_SITE_URL || 'https://mdwrk.com').replace(/\/+$/, '');

const checks = [
  { path: '/', includes: ['MdWrk', '<h1'] },
  { path: '/blog', includes: ['Product Updates', '<h1'], finalPath: '/updates/' },
  { path: '/sitemap.xml', includes: ['<sitemapindex', '/sitemaps/'] },
  { path: '/robots.txt', includes: ['Sitemap:'] },
  { path: '/llms.txt', includes: ['# MdWrk'] },
  { path: '/docs/quickstart/', includes: ['Markdown'] },
];

const failures = [];
let homeHtml = '';

for (const check of checks) {
  const url = `${baseUrl}${check.path}`;
  try {
    const response = await fetch(url, { redirect: 'follow' });
    const body = await response.text();
    if (check.path === '/') homeHtml = body;
    if (response.status !== 200) failures.push(`${url}: expected HTTP 200, received ${response.status}`);
    if (check.finalPath && new URL(response.url).pathname !== check.finalPath) {
      failures.push(`${url}: expected final path ${check.finalPath}, received ${new URL(response.url).pathname}`);
    }
    for (const expected of check.includes) {
      if (!body.toLowerCase().includes(expected.toLowerCase())) {
        failures.push(`${url}: missing ${expected}`);
      }
    }
  } catch (error) {
    failures.push(`${url}: ${error.message}`);
  }
}

const stylesheetHref = /href="([^"]*\/assets\/static\.[a-f0-9]+\.css)"/i.exec(homeHtml)?.[1];
if (!stylesheetHref) {
  failures.push(`${baseUrl}/: missing fingerprinted static stylesheet`);
} else {
  const stylesheetUrl = new URL(stylesheetHref, baseUrl);
  try {
    const response = await fetch(stylesheetUrl, {
      headers: { 'Accept-Encoding': 'br, gzip' },
    });
    const encoding = response.headers.get('content-encoding') || '';
    const cacheControl = response.headers.get('cache-control') || '';
    if (response.status !== 200) failures.push(`${stylesheetUrl}: expected HTTP 200, received ${response.status}`);
    if (!/(br|gzip)/i.test(encoding)) failures.push(`${stylesheetUrl}: expected compressed CSS response, received content-encoding ${encoding || '<none>'}`);
    if (!/immutable/i.test(cacheControl) || !/max-age=(?:[3-9]\d{6,}|[1-9]\d{7,})/i.test(cacheControl)) {
      failures.push(`${stylesheetUrl}: expected immutable cache-control with at least 30 days of max-age, received ${cacheControl || '<none>'}`);
    }
  } catch (error) {
    failures.push(`${stylesheetUrl}: ${error.message}`);
  }
}

if (failures.length) {
  console.error('MdWrk deployed lander smoke checks failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`MdWrk deployed lander smoke checks passed for ${baseUrl}.`);
