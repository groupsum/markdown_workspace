import { defineConfig, devices } from '@playwright/test';

const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const firefoxExecutable = process.env.PLAYWRIGHT_FIREFOX_EXECUTABLE;
const webkitExecutable = process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE;
const isRoot = typeof process.getuid === 'function' ? process.getuid() === 0 : false;

const chromiumLaunchArgs = [
  '--disable-background-networking',
  '--disable-breakpad',
  '--disable-crash-reporter',
];

if (isRoot) {
  chromiumLaunchArgs.push('--no-sandbox');
}

export default defineConfig({
  testDir: './apps/client/tests',
  testMatch: ['playwright-file/*.spec.ts', 'playwright-inline/*.spec.ts'],
  fullyParallel: true,
  timeout: 30_000,
  retries: process.env.PLAYWRIGHT_CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'artifacts/playwright-report-file-inline', open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: chromiumLaunchArgs,
          ...(chromiumExecutable ? { executablePath: chromiumExecutable } : {}),
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: firefoxExecutable ? { executablePath: firefoxExecutable } : undefined,
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        launchOptions: webkitExecutable ? { executablePath: webkitExecutable } : undefined,
      },
    },
  ],
});
