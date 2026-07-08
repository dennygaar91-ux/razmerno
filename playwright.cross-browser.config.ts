import { defineConfig, devices } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

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

function browserAvailable(name: "firefox" | "webkit") {
  const cacheRoot = process.env.PLAYWRIGHT_BROWSERS_PATH || join(process.env.LOCALAPPDATA || "", "ms-playwright");
  if (!existsSync(cacheRoot)) return false;
  const prefix = name === "firefox" ? "firefox-" : "webkit-";
  try {
    return readdirSync(cacheRoot).some((entry) => entry.startsWith(prefix));
  } catch {
    return false;
  }
}

const viewports = [
  { label: "desktop-1440", width: 1440, height: 900 },
  { label: "tablet-768", width: 768, height: 1024 },
  { label: "mobile-390", width: 390, height: 844 },
] as const;

const projects = viewports.flatMap((viewport) => {
  const baseUse = {
    viewport: { width: viewport.width, height: viewport.height },
    launchOptions: chromiumLaunchOptions,
  };

  const entries = [
    {
      name: `chromium-${viewport.label}`,
      use: { ...devices["Desktop Chrome"], ...baseUse },
    },
  ];

  if (browserAvailable("firefox")) {
    entries.push({
      name: `firefox-${viewport.label}`,
      use: { ...devices["Desktop Firefox"], viewport: baseUse.viewport },
    });
  }

  if (browserAvailable("webkit")) {
    entries.push({
      name: `webkit-${viewport.label}`,
      use: { ...devices["Desktop Safari"], viewport: baseUse.viewport },
    });
  }

  return entries;
});

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "cross-browser-visual-smoke.spec.ts",
  timeout: 45_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.CROSS_BROWSER_BASE_URL || "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.CROSS_BROWSER_BASE_URL
    ? undefined
    : {
        command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects,
});
