import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const distDir = path.resolve('E:/swarmauri_github/markdown_workspace/apps/client/dist');
const outputRoot = path.resolve('E:/swarmauri_github/markdown_workspace/artifacts/screenshots/theme-matrix');
const languagePackSamplePath = path.resolve('E:/swarmauri_github/markdown_workspace/packages/extensions/extension-language-pack-studio/sample-packs/de.language-pack.json');
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
const THEME_FILTER = (process.env.THEME_FILTER ?? '').split(',').map((value) => value.trim()).filter(Boolean);
const VIEWPORT_FILTER = (process.env.VIEWPORT_FILTER ?? '').split(',').map((value) => value.trim()).filter(Boolean);

function sanitize(value) {
  return value.replace(/[^a-z0-9-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
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

async function capturePaneModes(page, themeId, viewportId, rootSelector, prefix) {
  await screenshot(page, themeId, viewportId, `${prefix}-split`);

  const singleButton = page.locator(`${rootSelector} button[title="Single pane"]`).first();
  if (await singleButton.isVisible().catch(() => false)) {
    await singleButton.click({ force: true });
    await page.waitForTimeout(150);
    await screenshot(page, themeId, viewportId, `${prefix}-single`);
  }

  const splitButton = page.locator(`${rootSelector} button[title="Split screen"]`).first();
  if (await splitButton.isVisible().catch(() => false)) {
    await splitButton.click({ force: true });
    await page.waitForTimeout(150);
    await screenshot(page, themeId, viewportId, `${prefix}-split-restored`);
  }

  const sidebarButton = page.locator(`${rootSelector} button[title="Toggle sidebar"]`).first();
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
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  await context.addInitScript((theme) => {
    localStorage.setItem('lattice-theme', theme);
    localStorage.removeItem('lastProjectId');
  }, themeId);
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('.project-grid').waitFor({ state: 'visible', timeout: 30000 });

  await screenshot(page, themeId, viewport.id, 'selector');

  await page.locator('button:has-text("NEW_VAULT")').click({ force: true });
  await page.locator('.project-create-modal').waitFor({ state: 'visible' });
  await screenshot(page, themeId, viewport.id, 'selector-create-modal');
  await closeModal(page);

  await page.locator('button[title="Project Theme"]').click({ force: true });
  await page.locator('.theme-selector-modal').waitFor({ state: 'visible' });
  await screenshot(page, themeId, viewport.id, 'selector-theme-modal');
  await closeModal(page);

  await page.locator('button[title="Eject Project"]').first().click({ force: true });
  await page.locator('.project-delete-modal').waitFor({ state: 'visible' });
  await screenshot(page, themeId, viewport.id, 'selector-delete-modal');
  await closeModal(page);

  await openWorkspace(page);
  await screenshot(page, themeId, viewport.id, 'workspace-editor');

  const splitButton = page.locator('button[title="Split View"]').first();
  if (await splitButton.isVisible().catch(() => false) && await splitButton.isEnabled().catch(() => false)) {
    await splitButton.click({ force: true });
    await page.waitForTimeout(200);
    await screenshot(page, themeId, viewport.id, 'workspace-split');
  }

  const previewButton = page.locator('button[title="Preview Only"]').first();
  if (await previewButton.isVisible().catch(() => false) && await previewButton.isEnabled().catch(() => false)) {
    await previewButton.click({ force: true });
    await page.waitForTimeout(200);
    await screenshot(page, themeId, viewport.id, 'workspace-preview');
  }

  const editorButton = page.locator('button[title="Editor Only"]').first();
  if (await editorButton.isVisible().catch(() => false)) {
    await editorButton.click({ force: true });
  }

  const tableButton = page.locator('button[title="Insert n:m Table"]').first();
  if (await tableButton.isVisible().catch(() => false)) {
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

  const systemConfigButton = page.locator('button[title="System Config"]').first();
  if (await systemConfigButton.isVisible().catch(() => false)) {
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

  const githubConfigurations = page.locator('button[title="GitHub Configurations"]').first();
  if (await githubConfigurations.isVisible().catch(() => false)) {
    await githubConfigurations.click({ force: true });
    const githubSettingsModal = page.locator('.settings-modal').first();
    if (await githubSettingsModal.isVisible().catch(() => false)) {
      await screenshot(page, themeId, viewport.id, 'settings-github-configurations');
      await closeModal(page);
    }
  }

  const extensionsButton = page.locator('button[title="Extensions"]').first();
  if (await extensionsButton.isVisible().catch(() => false)) {
    await extensionsButton.click({ force: true });
    await page.locator('[data-testid="extension-manager-pane"]').waitFor({ state: 'visible' });
    await capturePaneModes(page, themeId, viewport.id, '[data-testid="extension-manager-pane"]', 'extension-manager-pane');
    const extensionClose = page.locator('[data-testid="extension-manager-pane"] button[title="Close manager"]').first();
    if (await extensionClose.isVisible().catch(() => false)) {
      await extensionClose.click({ force: true });
      await page.waitForTimeout(150);
    }
  }

  const languagePackButton = page.locator('button[title="Language Packs"]').first();
  if (await languagePackButton.isVisible().catch(() => false)) {
    await languagePackButton.click({ force: true });
    await page.locator('[data-testid="language-pack-studio-pane"]').waitFor({ state: 'visible' });
    await capturePaneModes(page, themeId, viewport.id, '[data-testid="language-pack-studio-pane"]', 'language-pack-studio-pane');
    const languagePackInput = page.locator('[data-testid="language-pack-studio-pane"] input[type="file"]').first();
    await languagePackInput.setInputFiles(languagePackSamplePath);
    await page.waitForTimeout(250);
    await screenshot(page, themeId, viewport.id, 'language-pack-studio-pane-imported');
    const usePackButton = page.locator('[data-testid="language-pack-studio-pane"] button:has-text("USE")').first();
    if (await usePackButton.isVisible().catch(() => false)) {
      await usePackButton.click({ force: true });
      await page.waitForTimeout(250);
      await screenshot(page, themeId, viewport.id, 'language-pack-studio-pane-active');
    }
    await page.locator('[data-testid="language-pack-studio-pane"] input').nth(1).fill('it-demo');
    await page.locator('[data-testid="language-pack-studio-pane"] input').nth(2).fill('Italiano Demo');
    await page.locator('[data-testid="language-pack-studio-pane"] textarea').first().fill('{\n  "core.views.settings.title": "Configurazione di sistema"\n}');
    await page.locator('[data-testid="language-pack-studio-pane"] button:has-text("CREATE_AND_EXPORT")').click({ force: true });
    await page.waitForTimeout(250);
    await screenshot(page, themeId, viewport.id, 'language-pack-studio-pane-created');
    const removePackButton = page.locator('[data-testid="language-pack-studio-pane"] button:has-text("REMOVE")').first();
    if (await removePackButton.isVisible().catch(() => false)) {
      await removePackButton.click({ force: true });
      await page.waitForTimeout(250);
      await screenshot(page, themeId, viewport.id, 'language-pack-studio-pane-removed');
    }
    const languagePackClose = page.locator('[data-testid="language-pack-studio-pane"] button[title="Close studio"]').first();
    if (await languagePackClose.isVisible().catch(() => false)) {
      await languagePackClose.click({ force: true });
      await page.waitForTimeout(150);
    }
  }

  const themeStudioButton = page.locator('button[title="Theme Studio"]').first();
  if (await themeStudioButton.isVisible().catch(() => false)) {
    await themeStudioButton.click({ force: true });
    await page.locator('[data-testid="theme-studio-pane"]').waitFor({ state: 'visible' });
    await capturePaneModes(page, themeId, viewport.id, '[data-testid="theme-studio-pane"]', 'theme-studio-pane');
    const themeStudioClose = page.locator('[data-testid="theme-studio-pane"] button[title="Close studio"]').first();
    if (await themeStudioClose.isVisible().catch(() => false)) {
      await themeStudioClose.click({ force: true });
      await page.waitForTimeout(150);
    }
  }

  await page.keyboard.press('Control+K');
  const commandPalette = page.locator('.command-palette-shell, .command-palette').first();
  if (await commandPalette.isVisible().catch(() => false)) {
    await screenshot(page, themeId, viewport.id, 'command-palette');
    await closeModal(page);
  }

  const gitButton = page.locator('button[title="Git Operations"]').first();
  if (await gitButton.isVisible().catch(() => false)) {
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
  const server = await startStaticServer(distDir);
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  try {
    const targetViewports = VIEWPORT_FILTER.length > 0 ? VIEWPORTS.filter((viewport) => VIEWPORT_FILTER.includes(viewport.id)) : VIEWPORTS;
    const targetThemes = THEME_FILTER.length > 0 ? THEMES.filter((themeId) => THEME_FILTER.includes(themeId)) : THEMES;
    for (const viewport of targetViewports) {
      for (const themeId of targetThemes) {
        console.log(`capturing ${viewport.id} :: ${themeId}`);
        await captureThemeViewport(browser, themeId, viewport);
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
