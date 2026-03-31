import { defineConfig, devices } from '@playwright/test';

const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const firefoxExecutable = process.env.PLAYWRIGHT_FIREFOX_EXECUTABLE;
const webkitExecutable = process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE;
const port = process.env.MDWRK_PORT || '4173';
const baseURL = process.env.MDWRK_BASE_URL || `http://127.0.0.1:${port}`;
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
  testDir: './apps/client/tests/playwright',
  fullyParallel: true,
  timeout: 30_000,
  retries: process.env.PLAYWRIGHT_CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'artifacts/playwright-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `python3 -m http.server ${port} --bind 127.0.0.1 --directory apps/client/dist`,
    url: baseURL,
    reuseExistingServer: true,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 15_000,
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
