import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : "");

if (!executablePath) {
  console.error(
    "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is not set and /usr/bin/chromium was not found. " +
    "Run `npx playwright install chromium` or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to a local Chrome/Chromium executable.",
  );
  process.exit(1);
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(
  command,
  ["playwright", "test", "tests/browser/configurator.spec.ts", "--project=chromium-desktop"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: executablePath,
    },
  },
);

process.exit(result.status ?? 1);
