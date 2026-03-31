import { expect, test } from '@playwright/test';
import path from 'node:path';

test('open file baseline', async ({ page }) => {
  const p = 'file://' + path.resolve('artifacts/conformance/latest/phase-9-theme-baselines/default.html');
  await page.goto(p);
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('.app-header')).toBeVisible();
});
