import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './apps/client/tests/playwright-inline',
  reporter: [['list']],
  use: {
    trace: 'off', screenshot: 'off', video: 'off',
    launchOptions: { executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], browserName: 'chromium' } }],
});
