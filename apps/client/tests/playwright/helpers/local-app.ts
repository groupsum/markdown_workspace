import { expect, type Page } from '@playwright/test';

const EXTERNAL_HOST_PATTERN =
  /^https:\/\/(cdn\.tailwindcss\.com|cdnjs\.cloudflare\.com|esm\.sh)\//;

function contentTypeFor(url: string): string {
  if (url.endsWith('.css')) {
    return 'text/css';
  }
  return 'application/javascript';
}

export async function stubExternalStaticDependencies(page: Page): Promise<void> {
  await page.route(EXTERNAL_HOST_PATTERN, async (route) => {
    const requestUrl = route.request().url();
    await route.fulfill({
      status: 200,
      body: '',
      contentType: contentTypeFor(requestUrl),
    });
  });
}

export async function bootLocalStaticApp(page: Page): Promise<void> {
  await stubExternalStaticDependencies(page);

  const response = await page.goto('/', {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });

  expect(response?.ok(), 'root document should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('#root')).toHaveCount(1);
  await page.waitForSelector('.project-selector-top, .project-grid, button[title="Project Theme"]', {
    state: 'visible',
    timeout: 15_000,
  });
}
