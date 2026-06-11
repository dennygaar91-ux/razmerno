import { defineConfig, devices } from "@playwright/test";

const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const chromiumLaunchOptions = chromiumExecutablePath
  ? {
      executablePath: chromiumExecutablePath,
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights",
      ],
    }
  : undefined;

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1366, height: 900 },
        launchOptions: chromiumLaunchOptions,
      },
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 5"], launchOptions: chromiumLaunchOptions },
    },
  ],
});
