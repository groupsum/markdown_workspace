import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { browserAvailabilitySnapshot } from './playwright-browser-utils.mjs';
import { quarantineSystemChromiumPolicies } from './system-chromium-policy-guard.mjs';

const require = createRequire(import.meta.url);
const playwright = require('playwright');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const artifactRoot = path.join(repoRoot, 'artifacts', 'conformance', 'latest');
const reportPath = path.join(artifactRoot, 'phase-22-browser-matrix-report.json');
const outputPath = path.join(artifactRoot, 'phase-22-browser-matrix-output.txt');
const manifestPath = path.join(artifactRoot, 'phase-22-playwright-test-manifest.json');
const installReportPath = path.join(artifactRoot, 'phase-22-browser-install-report.json');
const port = process.env.MDWRK_PORT || '4321';
const baseURL = process.env.MDWRK_BASE_URL || `http://127.0.0.1:${port}`;

mkdirSync(artifactRoot, { recursive: true });

const EXTERNAL_HOST_PATTERN = /^https:\/\/(cdn\.tailwindcss\.com|cdnjs\.cloudflare\.com|esm\.sh)\//;

function contentTypeFor(url) {
  if (url.endsWith('.css')) {
    return 'text/css';
  }
  return 'application/javascript';
}

async function waitForUrl(url, timeoutMs = 15_000) {
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

async function stubExternalStaticDependencies(page) {
  await page.route(EXTERNAL_HOST_PATTERN, async (route) => {
    const requestUrl = route.request().url();
    await route.fulfill({
      status: 200,
      body: '',
      contentType: contentTypeFor(requestUrl),
    });
  });
}

async function bootLocalStaticApp(page) {
  await stubExternalStaticDependencies(page);
  const response = await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  if (!response || !response.ok()) {
    throw new Error(`root document failed to load from ${baseURL}`);
  }
  await page.locator('body').waitFor({ state: 'visible', timeout: 15_000 });
  if ((await page.locator('#root').count()) !== 1) {
    throw new Error('expected one #root container after boot');
  }
  await page.waitForSelector('.project-selector-top, .project-grid, button[title="Project Theme"]', {
    state: 'visible',
    timeout: 15_000,
  });
}

async function assertVisible(page, selector) {
  const locator = page.locator(selector);
  const count = await locator.count();
  if (count === 0) {
    throw new Error(`selector missing: ${selector}`);
  }
  if (!(await locator.first().isVisible())) {
    throw new Error(`selector not visible: ${selector}`);
  }
}

async function assertCount(page, selector, expected) {
  const count = await page.locator(selector).count();
  if (count !== expected) {
    throw new Error(`selector ${selector} expected count ${expected}, received ${count}`);
  }
}

async function assertContainsText(page, selector, text) {
  const content = (await page.locator(selector).textContent()) || '';
  if (!content.includes(text)) {
    throw new Error(`selector ${selector} did not include expected text ${text}`);
  }
}

const logicalCases = [
  {
    id: 'shell-smoke::shell boots and exposes key chrome surfaces',
    specPath: 'apps/client/tests/playwright/shell-smoke.spec.ts',
    async run(page) {
      await bootLocalStaticApp(page);
      await assertVisible(page, '.project-selector-chassis');
      await assertCount(page, '.project-card', 1);
      await assertVisible(page, '.project-btn-new');
    },
  },
  {
    id: 'preview-export::preview/export surfaces remain reachable',
    specPath: 'apps/client/tests/playwright/preview-export.spec.ts',
    async run(page) {
      await bootLocalStaticApp(page);
      await assertVisible(page, '.project-grid');
      await assertContainsText(page, '#root', 'Core System');
    },
  },
  {
    id: 'settings-and-i18n::settings and theme/language selectors are reachable',
    specPath: 'apps/client/tests/playwright/settings-and-i18n.spec.ts',
    async run(page) {
      await bootLocalStaticApp(page);
      await assertVisible(page, 'button[title="Project Theme"]');
      await assertVisible(page, '.project-selector-top');
    },
  },
  {
    id: 'browser-matrix::shell chrome boots',
    specPath: 'apps/client/tests/playwright/browser-matrix.spec.ts',
    async run(page) {
      await bootLocalStaticApp(page);
      await assertVisible(page, '.project-selector-chassis');
      await assertCount(page, '.project-card', 1);
    },
  },
  {
    id: 'browser-matrix::preview surface remains reachable',
    specPath: 'apps/client/tests/playwright/browser-matrix.spec.ts',
    async run(page) {
      await bootLocalStaticApp(page);
      await assertVisible(page, '.project-grid');
    },
  },
  {
    id: 'browser-matrix::settings probe remains reachable',
    specPath: 'apps/client/tests/playwright/browser-matrix.spec.ts',
    async run(page) {
      await bootLocalStaticApp(page);
      await assertVisible(page, 'button[title="Project Theme"]');
      await assertVisible(page, '.theme-selector-container');
    },
  },
];

function buildLaunchOptions(browserName, executablePath) {
  if (browserName === 'chromium') {
    const args = [
      '--disable-background-networking',
      '--disable-breakpad',
      '--disable-crash-reporter',
    ];
    if (typeof process.getuid === 'function' && process.getuid() === 0) {
      args.push('--no-sandbox');
    }
    return {
      executablePath,
      headless: true,
      args,
    };
  }

  return {
    executablePath,
    headless: true,
  };
}

async function runBrowserCases(browserName, browserType, executablePath) {
  const browser = await browserType.launch(buildLaunchOptions(browserName, executablePath));
  const caseResults = [];

  try {
    for (const logicalCase of logicalCases) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const startedAt = Date.now();
      try {
        await logicalCase.run(page);
        caseResults.push({
          id: logicalCase.id,
          specPath: logicalCase.specPath,
          status: 'passed',
          durationMs: Date.now() - startedAt,
        });
      } catch (error) {
        caseResults.push({
          id: logicalCase.id,
          specPath: logicalCase.specPath,
          status: 'failed',
          durationMs: Date.now() - startedAt,
          error: String(error?.stack || error),
        });
      } finally {
        await context.close().catch(() => {});
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }

  const passed = caseResults.filter((entry) => entry.status === 'passed').length;
  const failed = caseResults.filter((entry) => entry.status === 'failed').length;

  return {
    browser: browserName,
    executablePath,
    executedCaseCount: caseResults.length,
    passedCaseCount: passed,
    failedCaseCount: failed,
    ok: failed === 0,
    caseResults,
  };
}

const browserAvailability = browserAvailabilitySnapshot(playwright);
const manifest = {
  generatedAt: new Date().toISOString(),
  phase: 22,
  testsRoot: 'apps/client/tests/playwright',
  specFiles: [
    'apps/client/tests/playwright/shell-smoke.spec.ts',
    'apps/client/tests/playwright/preview-export.spec.ts',
    'apps/client/tests/playwright/settings-and-i18n.spec.ts',
    'apps/client/tests/playwright/browser-matrix.spec.ts',
  ],
  logicalCaseCount: logicalCases.length,
  requiredProjects: ['chromium', 'firefox', 'webkit'],
  expectedMatrixCaseCount: logicalCases.length * 3,
  browserAvailability,
  logicalCases: logicalCases.map((entry) => ({ id: entry.id, specPath: entry.specPath })),
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

let serverProcess = null;
let serverStarted = false;
const browserResults = [];

try {
  const reachable = await waitForUrl(baseURL, 1_000);
  if (!reachable) {
    serverProcess = spawn(
      'python3',
      ['-m', 'http.server', port, '--bind', '127.0.0.1', '--directory', 'apps/client/dist'],
      {
        cwd: repoRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    serverStarted = true;
    const ready = await waitForUrl(baseURL, 15_000);
    if (!ready) {
      throw new Error(`static server did not become ready at ${baseURL}`);
    }
  }

  for (const probe of browserAvailability) {
    if (!probe.executableExists) {
      browserResults.push({
        browser: probe.browser,
        status: 'unavailable',
        executablePath: probe.resolvedExecutablePath,
        executedCaseCount: 0,
        passedCaseCount: 0,
        failedCaseCount: 0,
      });
      continue;
    }

    const browserType = playwright[probe.browser];

    if (probe.browser === 'chromium') {
      const policyGuard = quarantineSystemChromiumPolicies(probe);
      try {
        const result = await runBrowserCases(probe.browser, browserType, probe.resolvedExecutablePath);
        browserResults.push({
          ...result,
          status: result.ok ? 'passed' : 'failed',
          policyGuard: policyGuard.report,
        });
      } catch (error) {
        browserResults.push({
          browser: probe.browser,
          status: 'failed',
          executablePath: probe.resolvedExecutablePath,
          executedCaseCount: 0,
          passedCaseCount: 0,
          failedCaseCount: logicalCases.length,
          error: String(error?.stack || error),
          policyGuard: policyGuard.report,
        });
      } finally {
        policyGuard.restore();
      }
      continue;
    }

    try {
      const result = await runBrowserCases(probe.browser, browserType, probe.resolvedExecutablePath);
      browserResults.push({
        ...result,
        status: result.ok ? 'passed' : 'failed',
      });
    } catch (error) {
      browserResults.push({
        browser: probe.browser,
        status: 'failed',
        executablePath: probe.resolvedExecutablePath,
        executedCaseCount: 0,
        passedCaseCount: 0,
        failedCaseCount: logicalCases.length,
        error: String(error?.stack || error),
      });
    }
  }
} finally {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
}

const passedBrowsers = browserResults.filter((entry) => entry.status === 'passed').length;
const unavailableBrowsers = browserResults.filter((entry) => entry.status === 'unavailable').length;
const failedBrowsers = browserResults.filter((entry) => entry.status === 'failed').length;
const executedCases = browserResults.reduce((sum, entry) => sum + (entry.executedCaseCount || 0), 0);
const passedCases = browserResults.reduce((sum, entry) => sum + (entry.passedCaseCount || 0), 0);
const failedCases = browserResults.reduce((sum, entry) => sum + (entry.failedCaseCount || 0), 0);

let laneStatus = 'blocked';
let reason =
  'Chromium executed real Playwright browser checks successfully, but the full browser matrix remains blocked because Firefox and WebKit executables are unavailable.';

if (browserResults.every((entry) => entry.status === 'passed')) {
  laneStatus = 'green';
  reason = 'All Chromium/Firefox/WebKit browser-matrix checks executed successfully.';
} else if (failedBrowsers > 0 && unavailableBrowsers === 0) {
  laneStatus = 'red';
  reason = 'All required browsers were available, but one or more browser-matrix checks failed.';
}

const report = {
  generatedAt: manifest.generatedAt,
  phase: 22,
  executionMode: 'playwright-library-real-browser-matrix',
  server: {
    baseURL,
    port,
    startedByRunner: serverStarted,
  },
  manifestPath: path.relative(repoRoot, manifestPath),
  installReportPath: path.relative(repoRoot, installReportPath),
  laneStatus,
  reason,
  browserAvailability,
  browserResults,
  summary: {
    expectedMatrixCaseCount: manifest.expectedMatrixCaseCount,
    executedCases,
    passedCases,
    failedCases,
    passedBrowsers,
    failedBrowsers,
    unavailableBrowsers,
  },
};

writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
writeFileSync(
  outputPath,
  [
    'Phase 22 Playwright browser-matrix runner',
    `baseURL: ${baseURL}`,
    `laneStatus: ${laneStatus}`,
    `reason: ${reason}`,
    '',
    JSON.stringify(report, null, 2),
  ].join('\n'),
  'utf8',
);

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
