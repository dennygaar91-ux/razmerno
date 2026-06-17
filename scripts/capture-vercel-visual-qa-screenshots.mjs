import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_ROUTES = ["/", "/measurements", "/materials", "/assembly", "/configurator", "/configurator-3d", "/admin"];
const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "laptop-1280", width: 1280, height: 800 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-375", width: 375, height: 812 },
];
const FALLBACK_VIEWPORT_NAMES = new Set(["desktop-1440", "mobile-390"]);

function getArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function normalizeBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function normalizeTargetUrl(rawTargetUrl) {
  const value = String(rawTargetUrl || "").trim();
  if (!value) {
    throw new Error("target_url is required");
  }

  const parsed = new URL(value);
  if (parsed.protocol !== "https:") {
    throw new Error("target_url must start with https://");
  }

  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")) {
    throw new Error("target_url must not point to localhost");
  }

  parsed.hash = "";
  return parsed;
}

function parseRoutes(rawRoutes) {
  const value = String(rawRoutes || "").trim();
  if (!value) return DEFAULT_ROUTES;

  const routes = value
    .split(/[\n,]+/)
    .map((route) => route.trim())
    .filter(Boolean)
    .map((route) => (route.startsWith("/") ? route : `/${route}`));

  return routes.length > 0 ? [...new Set(routes)] : DEFAULT_ROUTES;
}

function routeToSlug(route) {
  if (route === "/") return "home";
  return route
    .replace(/^\/+/, "")
    .replace(/\?.*$/, "")
    .replace(/\/+$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "route";
}

function buildUrl(targetUrl, route) {
  const url = new URL(route, targetUrl);
  url.hash = "";
  return url.href;
}

function shortConsoleMessage(message) {
  return String(message || "").replace(/\s+/g, " ").trim().slice(0, 500);
}

function statusFromHttp(httpStatus) {
  if (httpStatus === null || httpStatus === undefined) return "warning";
  if (httpStatus >= 500) return "warning";
  if (httpStatus >= 400) return "warning";
  return "ok";
}

async function prepareDirs(outputDir) {
  const screenshotsDir = path.join(outputDir, "screenshots");
  await mkdir(screenshotsDir, { recursive: true });
  return { screenshotsDir };
}

async function applyWebGLMock(context) {
  await context.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function patchedGetContext(contextId, ...args) {
      const normalized = String(contextId || "").toLowerCase();
      if (["webgl", "webgl2", "experimental-webgl"].includes(normalized)) {
        return null;
      }

      return originalGetContext.apply(this, [contextId, ...args]);
    };
  });
}

async function captureOne({ browser, targetUrl, route, viewport, screenshotsDir, fallbackMocked = false, slugOverride }) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: false,
    locale: "ru-RU",
  });

  if (fallbackMocked) {
    await applyWebGLMock(context);
  }

  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(shortConsoleMessage(message.text()));
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(shortConsoleMessage(error?.message || error));
  });

  const url = buildUrl(targetUrl, route);
  const routeSlug = slugOverride || routeToSlug(route);
  const filename = `${routeSlug}__${viewport.name}.png`;
  const filePath = path.join(screenshotsDir, filename);
  const relativePath = `screenshots/${filename}`;

  let httpStatus = null;
  let status = "ok";
  let warning = null;
  let error = null;
  let screenshotWritten = false;

  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    httpStatus = response ? response.status() : null;
    status = statusFromHttp(httpStatus);
    if (status === "warning") {
      warning = `HTTP status ${httpStatus ?? "unknown"}`;
    }

    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
    await page.waitForTimeout(1_000);
    await page.screenshot({ path: filePath, fullPage: true, animations: "disabled" });
    screenshotWritten = true;
  } catch (captureError) {
    status = "error";
    error = captureError instanceof Error ? captureError.message : String(captureError);

    try {
      await page.screenshot({ path: filePath, fullPage: true, animations: "disabled" });
      screenshotWritten = true;
      warning = "Navigation failed but page screenshot was written for diagnosis.";
    } catch (screenshotError) {
      const screenshotMessage = screenshotError instanceof Error ? screenshotError.message : String(screenshotError);
      error = `${error}; screenshot failed: ${screenshotMessage}`;
    }
  } finally {
    await context.close();
  }

  const result = {
    route,
    routeSlug,
    url,
    viewport: viewport.name,
    width: viewport.width,
    height: viewport.height,
    filename,
    file: screenshotWritten ? relativePath : null,
    httpStatus,
    status,
    warning,
    error,
    fallbackMocked,
    consoleErrors: consoleErrors.slice(0, 20),
    consoleErrorCount: consoleErrors.length,
  };

  const label = fallbackMocked ? `${route} [webgl-fallback]` : route;
  console.log(`[${result.status}] ${label} ${viewport.name} -> ${result.file || "no screenshot"}`);

  return result;
}

function buildMarkdownManifest(manifest) {
  const lines = [];
  lines.push("# Vercel Visual QA Screenshots Manifest");
  lines.push("");
  lines.push(`Generated at: ${manifest.generatedAt}`);
  lines.push(`Target URL: ${manifest.targetUrl}`);
  lines.push(`Commit SHA: ${manifest.commitSha}`);
  lines.push(`Workflow run id: ${manifest.workflowRunId}`);
  lines.push(`Workflow: ${manifest.workflowName}`);
  lines.push(`Branch/ref: ${manifest.refName}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Total planned captures: ${manifest.summary.total}`);
  lines.push(`- Screenshots written: ${manifest.summary.screenshotsWritten}`);
  lines.push(`- OK: ${manifest.summary.ok}`);
  lines.push(`- Warning: ${manifest.summary.warning}`);
  lines.push(`- Error: ${manifest.summary.error}`);
  lines.push(`- WebGL fallback captures: ${manifest.summary.webglFallbackCaptures}`);
  lines.push("");
  lines.push("## Routes");
  lines.push("");
  for (const route of manifest.routes) lines.push(`- ${route}`);
  lines.push("");
  lines.push("## Viewports");
  lines.push("");
  for (const viewport of manifest.viewports) {
    lines.push(`- ${viewport.name}: ${viewport.width}x${viewport.height}`);
  }
  lines.push("");
  lines.push("## Captures");
  lines.push("");
  lines.push("| Status | Route | Viewport | HTTP | Fallback | File | Warning |");
  lines.push("|---|---|---|---:|---|---|---|");
  for (const capture of manifest.captures) {
    lines.push(
      `| ${capture.status} | ${capture.route} | ${capture.viewport} | ${capture.httpStatus ?? ""} | ${capture.fallbackMocked ? "yes" : "no"} | ${capture.file || ""} | ${capture.warning || capture.error || ""} |`,
    );
  }
  lines.push("");
  lines.push("## Interpretation");
  lines.push("");
  lines.push("This artifact is screenshot evidence only. It does not complete UX/UI visual review by itself.");
  lines.push("Routes with 404/auth/blocked states are captured and marked as warning instead of failing the pipeline immediately.");
  lines.push("WebGL fallback screenshots use Playwright-side canvas WebGL mocking and do not rely on the localhost-only `?rzm_webgl=off` hook.");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function main() {
  const targetUrl = normalizeTargetUrl(getArg("target-url") || process.env.TARGET_URL);
  const outputDir = getArg("output-dir") || process.env.VISUAL_QA_OUTPUT_DIR || "visual-qa-screenshots";
  const routes = parseRoutes(getArg("routes") || process.env.VISUAL_QA_ROUTES);
  const captureWebglFallback = normalizeBoolean(getArg("capture-webgl-fallback") || process.env.CAPTURE_WEBGL_FALLBACK, true);
  const { screenshotsDir } = await prepareDirs(outputDir);

  console.log("Starting Vercel visual QA screenshot capture.");
  console.log(`Target origin: ${targetUrl.origin}`);
  console.log(`Routes: ${routes.join(", ")}`);
  console.log(`Viewports: ${VIEWPORTS.map((viewport) => `${viewport.name}=${viewport.width}x${viewport.height}`).join(", ")}`);
  console.log(`Playwright WebGL fallback capture: ${captureWebglFallback ? "enabled" : "disabled"}`);

  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const captures = [];

  try {
    for (const route of routes) {
      for (const viewport of VIEWPORTS) {
        captures.push(await captureOne({ browser, targetUrl, route, viewport, screenshotsDir }));
      }
    }

    if (captureWebglFallback) {
      for (const viewport of VIEWPORTS.filter((candidate) => FALLBACK_VIEWPORT_NAMES.has(candidate.name))) {
        captures.push(
          await captureOne({
            browser,
            targetUrl,
            route: "/configurator-3d",
            viewport,
            screenshotsDir,
            fallbackMocked: true,
            slugOverride: "configurator-3d-webgl-fallback",
          }),
        );
      }
    }
  } finally {
    await browser.close();
  }

  const summary = captures.reduce(
    (accumulator, capture) => {
      accumulator.total += 1;
      accumulator[capture.status] = (accumulator[capture.status] || 0) + 1;
      if (capture.file) accumulator.screenshotsWritten += 1;
      if (capture.fallbackMocked) accumulator.webglFallbackCaptures += 1;
      return accumulator;
    },
    { total: 0, ok: 0, warning: 0, error: 0, screenshotsWritten: 0, webglFallbackCaptures: 0 },
  );

  const manifest = {
    generatedAt: new Date().toISOString(),
    targetUrl: targetUrl.href,
    commitSha: process.env.GITHUB_SHA || "unknown",
    workflowRunId: process.env.GITHUB_RUN_ID || "local",
    workflowName: process.env.GITHUB_WORKFLOW || "local",
    refName: process.env.GITHUB_REF_NAME || "local",
    routes,
    viewports: VIEWPORTS,
    summary,
    captures,
  };

  await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputDir, "manifest.md"), buildMarkdownManifest(manifest), "utf8");

  if (summary.screenshotsWritten === 0) {
    throw new Error("No screenshots were written. Treating this as a systemic pipeline failure.");
  }

  console.log(`Screenshots written: ${summary.screenshotsWritten}/${summary.total}`);
  console.log(`Manifest written to ${path.join(outputDir, "manifest.json")}`);
  console.log("Vercel visual QA screenshot capture completed.");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Vercel visual QA screenshot pipeline failed: ${message}`);
  process.exit(1);
});
