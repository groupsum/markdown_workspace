import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landerRoot = path.resolve(__dirname, '..');
const publicDir = path.join(landerRoot, 'public');
const docsDir = path.join(landerRoot, 'data', 'markdown', 'docs');
const contentSitemapPath = path.join(landerRoot, 'data', 'content-sitemap.yaml');

const siteUrl = (process.env.VITE_SITE_URL || 'https://mdwrk.com').replace(/\/+$/, '');

const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const parseFrontmatter = (raw) => {
  const normalizedRaw = raw.replace(/^\uFEFF/, '');
  const match = normalizedRaw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  return match[1]
    .split(/\r?\n/)
    .reduce((metadata, line) => {
      const separator = line.indexOf(':');
      if (separator === -1) return metadata;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      if (key) metadata[key] = value;
      return metadata;
    }, {});
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-/]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const toIsoDate = (filePath) => fs.statSync(filePath).mtime.toISOString().slice(0, 10);

const normalizeStatus = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const normalizeIsoDate = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return trimmed;
};

const toLocalIsoDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isPublishedMetadata = (metadata, now = new Date()) => {
  if (normalizeStatus(metadata.status) !== 'published') return false;
  const publishDate = normalizeIsoDate(metadata.date);
  if (!publishDate) return false;
  return publishDate <= toLocalIsoDate(now);
};

const collectFiles = (dir, extensions) => {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectFiles(filePath, extensions);
    return extensions.includes(path.extname(entry.name)) ? [filePath] : [];
  });
};

const parseContentIds = () => {
  if (!fs.existsSync(contentSitemapPath)) return [];

  const entries = [];
  let current = {};

  for (const rawLine of fs.readFileSync(contentSitemapPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith('- id:')) {
      if (current.id && current.file) entries.push(current);
      current = { id: line.replace('- id:', '').trim() };
      continue;
    }
    if (line.startsWith('file:')) {
      current.file = line.replace('file:', '').trim();
    }
  }

  if (current.id && current.file) entries.push(current);
  return entries;
};

const routes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/docs/', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog', priority: '0.7', changefreq: 'monthly' },
];

for (const filePath of collectFiles(docsDir, ['.md'])) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const metadata = parseFrontmatter(raw);
  if (!isPublishedMetadata(metadata)) continue;
  const title = metadata.title || path.basename(filePath, '.md');
  routes.push({
    path: `/docs/${metadata.slug || slugify(title)}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: toIsoDate(filePath),
  });
}

for (const entry of parseContentIds()) {
  if (!entry.id.startsWith('legal/')) continue;
  const filePath = path.resolve(landerRoot, 'data', entry.file.replace(/^\.\//, ''));
  if (!fs.existsSync(filePath)) continue;
  const raw = fs.readFileSync(filePath, 'utf8');
  const metadata = parseFrontmatter(raw);
  if (!isPublishedMetadata(metadata)) continue;
  routes.push({
    path: `/${entry.id}`,
    priority: '0.5',
    changefreq: 'yearly',
    lastmod: toIsoDate(filePath),
  });
}

const uniqueRoutes = new Map();
for (const route of routes) {
  uniqueRoutes.set(route.path, route);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  Array.from(uniqueRoutes.values())
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((route) => {
      const loc = `${siteUrl}${route.path === '/' ? '/' : route.path}`;
      return [
        '  <url>',
        `    <loc>${escapeXml(loc)}</loc>`,
        route.lastmod ? `    <lastmod>${route.lastmod}</lastmod>` : null,
        `    <changefreq>${route.changefreq}</changefreq>`,
        `    <priority>${route.priority}</priority>`,
        '  </url>',
      ].filter(Boolean).join('\n');
    })
    .join('\n') +
  `\n</urlset>\n`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(
  path.join(publicDir, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);
console.log(`Generated sitemap.xml with ${uniqueRoutes.size} routes for ${siteUrl}`);
