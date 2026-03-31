import { expect, test } from '@playwright/test';

import { bootLocalStaticApp } from './helpers/local-app';

test('preview/export surfaces remain reachable', async ({ page }) => {
  await bootLocalStaticApp(page);
  await expect(page.locator('.project-grid')).toBeVisible();
  await expect(page.locator('#root')).toContainText('Core System');
});
