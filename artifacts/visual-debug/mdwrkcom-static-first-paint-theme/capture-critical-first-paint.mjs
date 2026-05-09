import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '..', '..', '..');
const staticRoot = path.join(repoRoot, 'apps', 'mdwrkcom', 'dist-static');
const outputRoot = import.meta.dirname;
const port = 4177;

const contentTypeFor = (filePath) => {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'application/octet-stream';
};

const resolveRequest = (url) => {
  const pathname = decodeURIComponent(new URL(url, `http://127.0.0.1:${port}`).pathname);
  const candidate = path.normalize(path.join(staticRoot, pathname));
  if (!candidate.startsWith(staticRoot)) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  const indexPath = path.join(candidate, 'index.html');
  if (existsSync(indexPath)) return indexPath;
  return null;
};

const server = createServer((request, response) => {
  const filePath = resolveRequest(request.url ?? '/');
  if (!filePath) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  response.writeHead(200, { 'content-type': contentTypeFor(filePath) });
  response.end(readFileSync(filePath));
});

await mkdir(outputRoot, { recursive: true });
await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

const browser = await chromium.launch();
const captures = [
  { name: 'desktop-dark-critical-only.png', width: 1366, height: 900, theme: 'lander-dark', blockCss: true },
  { name: 'desktop-light-critical-only.png', width: 1366, height: 900, theme: 'lander-light', blockCss: true },
  { name: 'mobile-dark-critical-only.png', width: 390, height: 844, theme: 'lander-dark', blockCss: true },
  { name: 'desktop-dark-full-css.png', width: 1366, height: 900, theme: 'lander-dark', blockCss: false },
];

const metrics = [];

try {
  for (const capture of captures) {
    const context = await browser.newContext({
      viewport: { width: capture.width, height: capture.height },
      deviceScaleFactor: 1,
    });
    if (capture.blockCss) {
      await context.route('**/*.css', (route) => route.abort());
    }
    const page = await context.newPage();
    await page.addInitScript((theme) => {
      localStorage.setItem('mdwrk:lander-theme', theme);
    }, capture.theme);
    await page.goto(`http://127.0.0.1:${port}/docs/quickstart/`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: path.join(outputRoot, capture.name), fullPage: false });
    metrics.push({
      name: capture.name,
      title: await page.locator('.docs-title').first().textContent(),
      articleVisible: await page.locator('.docs-content-card').first().isVisible(),
      markdownVisible: await page.locator('.lander-markdown .markdown-body').first().isVisible(),
      brandIconBox: await page.locator('.navbar-brand-icon').first().boundingBox(),
      themeIconBox: await page.locator('.navbar-theme-icon').first().boundingBox(),
      menuPanelVisible: await page.locator('.navbar-menu-panel').first().isVisible(),
      bg: await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor),
    });
    await context.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

console.log(JSON.stringify(metrics, null, 2));
