import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const distDir = path.join(repoRoot, 'apps', 'client', 'dist');
const outputRoot = path.join(repoRoot, 'artifacts', 'screenshots', 'theme-matrix');
const manifestPath = path.join(outputRoot, 'manifest.json');
const viewportContractPath = path.join(repoRoot, 'apps', 'client', 'styles', 'base', 'viewports.css');
const languagePackSamplePath = path.join(
  repoRoot,
  'packages',
  'extensions',
  'extension-language-pack-studio',
  'sample-packs',
  'de.language-pack.json',
);
const PORT = 4181;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const THEMES = [
  'tensioned-technical-skeleton',
  'optical-vellum-drafting-grid',
  'heavy-gauge-tectonic',
  'ferrous-monolith',
  'galvanized-cellular',
  'pressed-chromium',
  'acid-etched',
  'zinc',
  'anodized-billet',
  'micropress',
  'research-science',
  'default',
];

const VIEWPORTS = [
  { id: 'portrait', width: 900, height: 1400 },
  { id: 'square', width: 1200, height: 1100 },
  { id: 'landscape', width: 1440, height: 960 },
  { id: 'wide', width: 1800, height: 960 },
  { id: 'ultrawide', width: 2520, height: 960 },
];
const ASPECT_IDS = VIEWPORTS.map((viewport) => viewport.id);
const VIEWPORT_ALIASES = new Map([
  ['portrait', 'portrait'],
  ['square', 'square'],
  ['square-hybrid', 'square'],
  ['square/hybrid', 'square'],
  ['hybrid', 'square'],
  ['landscape', 'landscape'],
  ['wide', 'wide'],
  ['ultrawide', 'ultrawide'],
  ['ultra-wide', 'ultrawide'],
  ['ultra_wide', 'ultrawide'],
]);
const THEME_FILTER = (process.env.THEME_FILTER ?? '').split(',').map((value) => value.trim()).filter(Boolean);
const VIEWPORT_FILTER = (process.env.VIEWPORT_FILTER ?? '').split(',').map((value) => value.trim()).filter(Boolean);

function sanitize(value) {
  return value.replace(/[^a-z0-9-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function resetDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await ensureDir(dir);
}

async function withFileRetry(action, attempts = 5) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      const code = typeof error === 'object' && error ? error.code : undefined;
      if ((code !== 'EBUSY' && code !== 'UNKNOWN') || attempt === attempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 250));
    }
  }
  throw lastError;
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.webmanifest')) return 'application/manifest+json';
  return 'application/octet-stream';
}

async function startStaticServer(rootDir) {
  const server = http.createServer(async (req, res) => {
    const requestPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const filePath = path.join(rootDir, requestPath);
    try {
      let resolvedPath = filePath;
      const stat = await fs.stat(filePath).catch(() => null);
      if (stat?.isDirectory()) {
        resolvedPath = path.join(filePath, 'index.html');
      } else if (!stat) {
        const versionMatch = requestPath.match(/^\/client\/versions\/([^/]+)\//);
        resolvedPath = versionMatch
          ? path.join(rootDir, 'client', 'versions', versionMatch[1], 'index.html')
          : path.join(rootDir, 'index.html');
      }
      const body = await fs.readFile(resolvedPath);
      res.statusCode = 200;
      res.setHeader('content-type', contentType(resolvedPath));
      res.end(body);
    } catch {
      res.statusCode = 404;
      res.end('Not found');
    }
  });

  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  return server;
}

async function screenshot(page, themeId, viewportId, name) {
  const targetDir = path.join(outputRoot, viewportId, themeId);
  await ensureDir(targetDir);
  const targetPath = path.join(targetDir, `${sanitize(name)}.jpg`);
  await withFileRetry(() => page.screenshot({
    path: targetPath,
    type: 'jpeg',
    quality: 70,
    fullPage: true,
  }));
}

async function findVisibleLocator(page, selector, timeoutMs = 30_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const locator = page.locator(selector);
    const count = await locator.count();
    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index);
      if (await candidate.isVisible().catch(() => false)) {
        return candidate;
      }
    }
    await page.waitForTimeout(100);
  }
  throw new Error(`Timed out waiting for a visible locator: ${selector}`);
}

async function maybeVisibleLocator(page, selector, timeoutMs = 2_000) {
  try {
    return await findVisibleLocator(page, selector, timeoutMs);
  } catch {
    return null;
  }
}

function normalizeViewportFilter(viewportFilter) {
  const invalidViewportIds = [];
  const normalizedViewportIds = [];

  for (const requestedViewportId of viewportFilter) {
    const normalizedViewportId = VIEWPORT_ALIASES.get(requestedViewportId.toLowerCase());
    if (!normalizedViewportId) {
      invalidViewportIds.push(requestedViewportId);
      continue;
    }
    if (!normalizedViewportIds.includes(normalizedViewportId)) {
      normalizedViewportIds.push(normalizedViewportId);
    }
  }

  if (invalidViewportIds.length > 0) {
    throw new Error(
      `Unknown VIEWPORT_FILTER value(s): ${invalidViewportIds.join(', ')}. Expected one of ${[...VIEWPORT_ALIASES.keys()].join(', ')}`,
    );
  }

  return normalizedViewportIds;
}

async function readViewportContractAspectIds() {
  const viewportContractCss = await fs.readFile(viewportContractPath, 'utf8');
  const declaredAspectIds = new Set(
    [...viewportContractCss.matchAll(/--viewbox-aspect:\s*([a-z-]+)\s*;/g)].map((match) => match[1]),
  );

  const missingAspectIds = ASPECT_IDS.filter((aspectId) => !declaredAspectIds.has(aspectId));
  if (missingAspectIds.length > 0) {
    throw new Error(
      `Viewport contract ${path.relative(repoRoot, viewportContractPath)} is missing aspect bands required by the screenshot matrix: ${missingAspectIds.join(', ')}`,
    );
  }

  return [...declaredAspectIds];
}

async function assertViewportAspectBand(page, viewport) {
  const actualAspectId = await page.evaluate(
    () => getComputedStyle(document.documentElement).getPropertyValue('--viewbox-aspect').trim(),
  );
  if (actualAspectId !== viewport.id) {
    throw new Error(
      `Viewport ${viewport.id} (${viewport.width}x${viewport.height}) resolved to CSS aspect band "${actualAspectId}" instead of "${viewport.id}"`,
    );
  }
}

async function collectCaptureManifest(targetViewports, targetThemes) {
  const viewportEntries = [];
  let totalCaptureCount = 0;

  for (const viewport of targetViewports) {
    const themeEntries = [];
    for (const themeId of targetThemes) {
      const targetDir = path.join(outputRoot, viewport.id, themeId);
      const captureFiles = (await fs.readdir(targetDir, { withFileTypes: true }).catch(() => []))
        .filter((entry) => entry.isFile() && entry.name.endsWith('.jpg'))
        .map((entry) => entry.name)
        .sort();

      if (captureFiles.length === 0) {
        throw new Error(`No screenshots were generated for ${viewport.id} :: ${themeId}`);
      }

      totalCaptureCount += captureFiles.length;
      themeEntries.push({
        themeId,
        captureCount: captureFiles.length,
        captures: captureFiles,
      });
    }

    viewportEntries.push({
      viewportId: viewport.id,
      width: viewport.width,
      height: viewport.height,
      themeCount: themeEntries.length,
      themes: themeEntries,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    outputRoot: path.relative(repoRoot, outputRoot),
    viewportContractPath: path.relative(repoRoot, viewportContractPath),
    viewportCount: targetViewports.length,
    themeCount: targetThemes.length,
    totalCaptureCount,
    viewports: viewportEntries,
  };
}

async function capturePaneModes(page, themeId, viewportId, rootLocator, prefix) {
  await screenshot(page, themeId, viewportId, `${prefix}-split`);

  const singleButton = rootLocator.locator('button[title="Single pane"]').first();
  if (await singleButton.isVisible().catch(() => false)) {
    await singleButton.click({ force: true });
    await page.waitForTimeout(150);
    await screenshot(page, themeId, viewportId, `${prefix}-single`);
  }

  const splitButton = rootLocator.locator('button[title="Split screen"]').first();
  if (await splitButton.isVisible().catch(() => false)) {
    await splitButton.click({ force: true });
    await page.waitForTimeout(150);
    await screenshot(page, themeId, viewportId, `${prefix}-split-restored`);
  }

  const sidebarButton = rootLocator.locator('button[title="Toggle sidebar"]').first();
  if (await sidebarButton.isVisible().catch(() => false)) {
    await sidebarButton.click({ force: true });
    await page.waitForTimeout(150);
    await screenshot(page, themeId, viewportId, `${prefix}-sidebar-collapsed`);
    await sidebarButton.click({ force: true });
    await page.waitForTimeout(150);
    await screenshot(page, themeId, viewportId, `${prefix}-sidebar-restored`);
  }
}

async function closeModal(page) {
  await page.keyboard.press('Escape').catch(() => {});
  const closeButtons = [
    page.locator('button:has-text("Close")').first(),
    page.locator('button:has-text("CLOSE")').first(),
    page.locator('button:has-text("EXIT")').first(),
    page.locator('button:has-text("EXIT_CONFIG")').first(),
    page.locator('button[aria-label*="Close"]').first(),
  ];
  for (const button of closeButtons) {
    if (await button.isVisible().catch(() => false)) {
      await button.click({ force: true }).catch(() => {});
      break;
    }
  }
}

async function openWorkspace(page) {
  await page.locator('.project-card').first().click({ force: true });
  await page.locator('.workspace-manifold').waitFor({ state: 'visible', timeout: 15000 });
}

async function captureThemeViewport(browser, themeId, viewport) {
  await resetDir(path.join(outputRoot, viewport.id, themeId));
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  await context.addInitScript((theme) => {
    localStorage.setItem('lattice-theme', theme);
    localStorage.removeItem('lastProjectId');
  }, themeId);
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('.project-grid').waitFor({ state: 'visible', timeout: 30000 });
  await assertViewportAspectBand(page, viewport);

  await screenshot(page, themeId, viewport.id, 'selector');

  const newVaultButton = await findVisibleLocator(page, 'button:has-text("NEW_VAULT")');
  await newVaultButton.click({ force: true });
  await page.locator('.project-create-modal').waitFor({ state: 'visible' });
  await screenshot(page, themeId, viewport.id, 'selector-create-modal');
  await closeModal(page);

  const projectThemeButton = await findVisibleLocator(page, 'button[title="Project Theme"]');
  await projectThemeButton.click({ force: true });
  await page.locator('.theme-selector-modal').waitFor({ state: 'visible' });
  await screenshot(page, themeId, viewport.id, 'selector-theme-modal');
  await closeModal(page);

  const ejectProjectButton = await findVisibleLocator(page, 'button[title="Eject Project"]');
  await ejectProjectButton.click({ force: true });
  await page.locator('.project-delete-modal').waitFor({ state: 'visible' });
  await screenshot(page, themeId, viewport.id, 'selector-delete-modal');
  await closeModal(page);

  await openWorkspace(page);
  await screenshot(page, themeId, viewport.id, 'workspace-editor');

  const splitButton = await maybeVisibleLocator(page, 'button[title="Split View"]');
  if (splitButton && await splitButton.isEnabled().catch(() => false)) {
    await splitButton.click({ force: true });
    await page.waitForTimeout(200);
    await screenshot(page, themeId, viewport.id, 'workspace-split');
  }

  const previewButton = await maybeVisibleLocator(page, 'button[title="Preview Only"]');
  if (previewButton && await previewButton.isEnabled().catch(() => false)) {
    await previewButton.click({ force: true });
    await page.waitForTimeout(200);
    await screenshot(page, themeId, viewport.id, 'workspace-preview');
  }

  const editorButton = await maybeVisibleLocator(page, 'button[title="Editor Only"]');
  if (editorButton) {
    await editorButton.click({ force: true });
  }

  const tableButton = await maybeVisibleLocator(page, 'button[title="Insert n:m Table"]');
  if (tableButton) {
    await tableButton.click({ force: true });
    const tableModal = page.locator('.modal-overlay').last();
    if (await tableModal.isVisible().catch(() => false)) {
      await screenshot(page, themeId, viewport.id, 'table-builder-modal');
      const tableCancel = page.locator('button:has-text("CANCEL")').last();
      if (await tableCancel.isVisible().catch(() => false)) {
        await tableCancel.click({ force: true });
      } else {
        await closeModal(page);
      }
    }
  }

  const systemConfigButton = await maybeVisibleLocator(page, 'button[title="System Config"]');
  if (systemConfigButton) {
    await systemConfigButton.click({ force: true });
    const settingsModal = page.locator('.settings-modal').first();
    if (await settingsModal.isVisible().catch(() => false)) {
      await screenshot(page, themeId, viewport.id, 'settings-visual');
      await screenshot(page, themeId, viewport.id, 'settings-data-pwa');
      const languagePacksButton = page.locator('.settings-sidebar-btn:has-text("LANGUAGE_PACKS")').first();
      if (await languagePacksButton.isVisible().catch(() => false)) {
        await languagePacksButton.click({ force: true });
        await page.waitForTimeout(150);
        await screenshot(page, themeId, viewport.id, 'settings-language-packs');
      }
      await closeModal(page);
    }
  }

  const githubConfigurations = await maybeVisibleLocator(page, 'button[title="GitHub Configurations"]');
  if (githubConfigurations) {
    await githubConfigurations.click({ force: true });
    const githubSettingsModal = page.locator('.settings-modal').first();
    if (await githubSettingsModal.isVisible().catch(() => false)) {
      await screenshot(page, themeId, viewport.id, 'settings-github-configurations');
      await closeModal(page);
    }
  }

  const extensionsButton = await maybeVisibleLocator(page, 'button[title="Extensions"]');
  if (extensionsButton) {
    await extensionsButton.click({ force: true });
    await page.waitForTimeout(250);
    const extensionManagerPane = await maybeVisibleLocator(page, '[data-testid="extension-manager-pane"]', 5_000);
    if (extensionManagerPane) {
      await capturePaneModes(page, themeId, viewport.id, extensionManagerPane, 'extension-manager-pane');
      const extensionClose = extensionManagerPane.locator('button[title="Close manager"]').first();
      if (await extensionClose.isVisible().catch(() => false)) {
        await extensionClose.click({ force: true });
        await page.waitForTimeout(150);
      }
    } else {
      await screenshot(page, themeId, viewport.id, 'extension-manager-modal');
      await closeModal(page);
    }
  }

  const languagePackButton = await maybeVisibleLocator(page, 'button[title="Language Packs"]');
  if (languagePackButton) {
    await languagePackButton.click({ force: true });
    await page.waitForTimeout(250);
    const languagePackStudioPane = await maybeVisibleLocator(page, '[data-testid="language-pack-studio-pane"]', 5_000);
    if (languagePackStudioPane) {
      await capturePaneModes(page, themeId, viewport.id, languagePackStudioPane, 'language-pack-studio-pane');
      const languagePackInput = languagePackStudioPane.locator('input[type="file"]').first();
      await languagePackInput.setInputFiles(languagePackSamplePath);
      await page.waitForTimeout(250);
      await screenshot(page, themeId, viewport.id, 'language-pack-studio-pane-imported');
      const usePackButton = languagePackStudioPane.locator('button:has-text("USE")').first();
      if (await usePackButton.isVisible().catch(() => false)) {
        await usePackButton.click({ force: true });
        await page.waitForTimeout(250);
        await screenshot(page, themeId, viewport.id, 'language-pack-studio-pane-active');
      }
      await languagePackStudioPane.locator('input').nth(1).fill('it-demo');
      await languagePackStudioPane.locator('input').nth(2).fill('Italiano Demo');
      await languagePackStudioPane.locator('textarea').first().fill('{\n  "core.views.settings.title": "Configurazione di sistema"\n}');
      await languagePackStudioPane.locator('button:has-text("CREATE_AND_EXPORT")').click({ force: true });
      await page.waitForTimeout(250);
      await screenshot(page, themeId, viewport.id, 'language-pack-studio-pane-created');
      const removePackButton = languagePackStudioPane.locator('button:has-text("REMOVE")').first();
      if (await removePackButton.isVisible().catch(() => false)) {
        await removePackButton.click({ force: true });
        await page.waitForTimeout(250);
        await screenshot(page, themeId, viewport.id, 'language-pack-studio-pane-removed');
      }
      const languagePackClose = languagePackStudioPane.locator('button[title="Close studio"]').first();
      if (await languagePackClose.isVisible().catch(() => false)) {
        await languagePackClose.click({ force: true });
        await page.waitForTimeout(150);
      }
    } else {
      await screenshot(page, themeId, viewport.id, 'language-pack-manager-modal');
      await closeModal(page);
    }
  }

  const themeStudioButton = await maybeVisibleLocator(page, 'button[title="Theme Studio"]');
  if (themeStudioButton) {
    await themeStudioButton.click({ force: true });
    await page.waitForTimeout(250);
    const themeStudioPane = await maybeVisibleLocator(page, '[data-testid="theme-studio-pane"]', 5_000);
    if (themeStudioPane) {
      await capturePaneModes(page, themeId, viewport.id, themeStudioPane, 'theme-studio-pane');
      const themeStudioClose = themeStudioPane.locator('button[title="Close studio"]').first();
      if (await themeStudioClose.isVisible().catch(() => false)) {
        await themeStudioClose.click({ force: true });
        await page.waitForTimeout(150);
      }
    } else {
      await screenshot(page, themeId, viewport.id, 'theme-studio-modal');
      await closeModal(page);
    }
  }

  await page.keyboard.press('Control+K');
  const commandPalette = page.locator('.command-palette-shell, .command-palette').first();
  if (await commandPalette.isVisible().catch(() => false)) {
    await screenshot(page, themeId, viewport.id, 'command-palette');
    await closeModal(page);
  }

  const gitButton = await maybeVisibleLocator(page, 'button[title="Git Operations"]');
  if (gitButton) {
    await gitButton.click({ force: true });
    const gitWorkspace = page.locator('.git-workspace').first();
    if (await gitWorkspace.isVisible().catch(() => false)) {
      await screenshot(page, themeId, viewport.id, 'git-pane');
      const gitClose = page.locator('button[title="Close"]').first();
      if (await gitClose.isVisible().catch(() => false)) {
        await gitClose.click({ force: true });
      }
    }
  }

  await context.close();
}

async function main() {
  await ensureDir(outputRoot);
  await readViewportContractAspectIds();
  const server = await startStaticServer(distDir);
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  try {
    const normalizedViewportFilter = normalizeViewportFilter(VIEWPORT_FILTER);
    const targetViewports = normalizedViewportFilter.length > 0
      ? VIEWPORTS.filter((viewport) => normalizedViewportFilter.includes(viewport.id))
      : VIEWPORTS;
    const targetThemes = THEME_FILTER.length > 0 ? THEMES.filter((themeId) => THEME_FILTER.includes(themeId)) : THEMES;

    if (targetThemes.length === 0) {
      throw new Error('THEME_FILTER resolved to zero themes.');
    }
    if (targetViewports.length === 0) {
      throw new Error('VIEWPORT_FILTER resolved to zero viewports.');
    }

    for (const viewport of targetViewports) {
      for (const themeId of targetThemes) {
        console.log(`capturing ${viewport.id} :: ${themeId}`);
        await captureThemeViewport(browser, themeId, viewport);
      }
    }

    const manifest = await collectCaptureManifest(targetViewports, targetThemes);
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
