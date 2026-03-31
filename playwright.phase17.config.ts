import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './apps/client/tests/playwright',
  reporter: [['list']],
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    launchOptions: { executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], browserName: 'chromium' } },
  ],
});
