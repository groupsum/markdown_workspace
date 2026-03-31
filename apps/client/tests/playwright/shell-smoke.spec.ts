import { expect, test } from '@playwright/test';

import { bootLocalStaticApp } from './helpers/local-app';

test('shell boots and exposes key chrome surfaces', async ({ page }) => {
  await bootLocalStaticApp(page);
  await expect(page.locator('.project-selector-chassis')).toBeVisible();
  await expect(page.locator('.project-card')).toHaveCount(1);
  await expect(page.locator('.project-btn-new')).toBeVisible();
});
