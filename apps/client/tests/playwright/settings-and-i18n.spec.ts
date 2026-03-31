import { expect, test } from '@playwright/test';

import { bootLocalStaticApp } from './helpers/local-app';

test('settings and theme/language selectors are reachable', async ({ page }) => {
  await bootLocalStaticApp(page);
  await expect(page.locator('button[title="Project Theme"]')).toBeVisible();
  await page.locator('button[title="Project Theme"]').click({ trial: true });
  await expect(page.locator('.project-selector-top')).toBeVisible();
});
