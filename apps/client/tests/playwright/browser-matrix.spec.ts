import { expect, test } from '@playwright/test';

import { bootLocalStaticApp } from './helpers/local-app';

test.describe('browser matrix surfaces', () => {
  test('shell chrome boots', async ({ page }) => {
    await bootLocalStaticApp(page);
    await expect(page.locator('.project-selector-chassis')).toBeVisible();
    await expect(page.locator('.project-card')).toHaveCount(1);
  });

  test('preview surface remains reachable', async ({ page }) => {
    await bootLocalStaticApp(page);
    await expect(page.locator('.project-grid')).toBeVisible();
  });

  test('settings probe remains reachable', async ({ page }) => {
    await bootLocalStaticApp(page);
    await expect(page.locator('button[title="Project Theme"]')).toBeVisible();
    await expect(page.locator('.theme-selector-container')).toBeVisible();
  });
});
