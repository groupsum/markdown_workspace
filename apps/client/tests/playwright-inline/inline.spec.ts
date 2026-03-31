import { expect, test } from '@playwright/test';
import fs from 'node:fs';

test('inline html render', async ({ page }) => {
  const html = fs.readFileSync('artifacts/conformance/latest/phase-9-theme-baselines/default.html', 'utf8');
  await page.setContent(html, { waitUntil: 'load' });
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('.app-header')).toBeVisible();
});
