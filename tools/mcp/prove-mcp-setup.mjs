import { mkdir } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const outputDir = process.argv[2] ?? '/tmp/mcp-proof';
await mkdir(outputDir, { recursive: true });

execSync('npx -y @playwright/mcp@latest --help', { stdio: 'ignore' });
execSync('npx -y chrome-devtools-mcp@latest --help', { stdio: 'ignore' });

const playwrightPath = path.join(outputDir, 'playwright-mcp-proof.png');
const cdpPath = path.join(outputDir, 'chrome-devtools-cdp-proof.png');

const browser = await chromium.launch({
  headless: true,
  args: ['--remote-debugging-port=9222'],
});

const page = await browser.newPage({ ignoreHTTPSErrors: true });
await page.goto('http://neverssl.com', { waitUntil: 'domcontentloaded' });
await page.screenshot({ path: playwrightPath, fullPage: true });

const cdpBrowser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const cdpContext = cdpBrowser.contexts()[0] ?? (await cdpBrowser.newContext());
const cdpPage = await cdpContext.newPage();
await cdpPage.goto('http://example.org', { waitUntil: 'domcontentloaded' });
await cdpPage.screenshot({ path: cdpPath, fullPage: true });

await cdpBrowser.close();
await browser.close();

console.log(`Playwright MCP proof screenshot: ${playwrightPath}`);
console.log(`Chrome DevTools (CDP) proof screenshot: ${cdpPath}`);
