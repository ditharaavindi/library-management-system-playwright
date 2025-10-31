import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry flaky tests automatically */
  retries: process.env.CI ? 3 : 1,
  /* Parallel workers for faster execution */
  workers: process.env.CI ? 2 : 4,
  /* Multiple reporters for comprehensive test reporting */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['line'],
    ['list', { printSteps: true }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace for debugging */
    trace: 'on-first-retry',

    /* Screenshots for visual testing */
    screenshot: 'only-on-failure',

    /* Video recording for test documentation */
    video: 'retain-on-failure',

    /* Auto-wait timeouts */
    actionTimeout: 15000,
    navigationTimeout: 30000,

    /* Headless mode by default (can be overridden with --headed) */
    headless: true,

    /* Ignore HTTPS errors for local development */
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for comprehensive testing */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Mobile device testing - one representative mobile test */
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
      testMatch: ['**/navigation.spec.ts', '**/homepage.spec.ts'], // Only run specific tests on mobile
    },

    /* Debugging projects */
    {
      name: 'debug',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        video: 'on',
        launchOptions: {
          slowMo: 500,
        },
      },
      testMatch: [], // No tests run by default in debug mode
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'cd backend && PORT=5001 npm run dev',
      port: 5001,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        PORT: '5001'
      }
    },
    {
      command: 'cd frontend && PORT=3000 npm run dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        PORT: '3000'
      }
    },
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/global-setup.ts'),

  /* Test timeout */
  timeout: 30000,

  /* Output directories */
  outputDir: 'test-results/',
});