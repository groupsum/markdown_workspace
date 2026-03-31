import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const port = process.env.MDWRK_PORT || '4317';
const baseURL = process.env.MDWRK_BASE_URL || `http://127.0.0.1:${port}`;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined;

function waitForUrl(url, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve(Boolean(response.statusCode && response.statusCode < 500));
      });
      request.on('error', () => {
        if (Date.now() - start >= timeoutMs) {
          resolve(false);
        } else {
          setTimeout(attempt, 250);
        }
      });
    };
    attempt();
  });
}

let serverProcess = null;
let serverStartedByScript = false;
let browser = null;

try {
  const reachable = await waitForUrl(baseURL, 1000);
  if (!reachable) {
    serverProcess = spawn(
      'python3',
      ['-m', 'http.server', port, '--bind', '127.0.0.1', '--directory', 'apps/client/dist'],
      {
        cwd: repoRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    serverStartedByScript = true;
    const ready = await waitForUrl(baseURL, 15000);
    if (!ready) {
      throw new Error(`static server did not become ready at ${baseURL}`);
    }
  }

  browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage();
  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const bodyVisible = await page.locator('body').isVisible();
  const rootCount = await page.locator('#root').count();
  const chromeCount = await page.locator('.app-header, .boot-screen, .project-selector-shell').count();
  const title = await page.title();

  process.stdout.write(JSON.stringify({
    status: bodyVisible ? 'green' : 'red',
    baseURL,
    executablePath: executablePath || null,
    rootCount,
    chromeCount,
    bodyVisible,
    title,
    serverStartedByScript,
  }, null, 2));
} catch (error) {
  process.stderr.write(String(error?.stack || error));
  process.exitCode = 1;
} finally {
  if (browser) {
    await browser.close().catch(() => {});
  }
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
}
