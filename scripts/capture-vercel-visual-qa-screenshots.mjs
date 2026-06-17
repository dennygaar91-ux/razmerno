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

const GOTO_TIMEOUT_MS = numberFromEnv("VISUAL_QA_GOTO_TIMEOUT_MS", 30_000);
const SETTLE_TIMEOUT_MS = numberFromEnv("VISUAL_QA_SETTLE_TIMEOUT_MS", 12_000);
const SCREENSHOT_TIMEOUT_MS = numberFromEnv("VISUAL_QA_SCREENSHOT_TIMEOUT_MS", 15_000);
const CAPTURE_TIMEOUT_MS = numberFromEnv("VISUAL_QA_CAPTURE_TIMEOUT_MS", 75_000);
const CONTEXT_CLOSE_TIMEOUT_MS = 5_000;

function numberFromEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function nowIso() {
  return new Date().toISOString();
}

function getArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function normalizeBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function normalizeTargetUrl(rawTargetUrl) {
  const value = String(rawTargetUrl || "").trim();
  if (!value) throw new Error("target_url is required");
  const parsed = new URL(value);
  if (parsed.protocol !== "https:") throw new Error("target_url must start with https://");
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

function buildSpaEntryUrl(targetUrl) {
  const url = new URL("/configurator", targetUrl);
  url.hash = "";
  return url.href;
}

function shouldUseSpaEntry(route) {
  return route !== "/" && route !== "/configurator" && !route.startsWith("/configurator/");
}

function shortConsoleMessage(message) {
  return String(message || "").replace(/\s+/g, " ").trim().slice(0, 500);
}

function statusFromHttp(httpStatus) {
  if (httpStatus === null || httpStatus === undefined) return "warning";
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
      if (["webgl", "webgl2", "experimental-webgl"].includes(normalized)) return null;
      return originalGetContext.apply(this, [contextId, ...args]);
    };
  });
}

async function switchClientRoute(page, route) {
  await page.evaluate((nextPath) => {
    globalThis.history.replaceState({}, "", nextPath);
    globalThis.dispatchEvent(new Event("popstate"));
  }, route);
  await page.waitForFunction((nextPath) => globalThis.location.pathname === nextPath, route, { timeout: 10_000 }).catch(() => undefined);
}

async function navigateToRoute(page, targetUrl, route) {
  const finalUrl = buildUrl(targetUrl, route);
  if (!shouldUseSpaEntry(route)) {
    const response = await page.goto(finalUrl, { waitUntil: "domcontentloaded", timeout: GOTO_TIMEOUT_MS });
    return {
      finalUrl,
      entryUrl: finalUrl,
      httpStatus: response ? response.status() : null,
      navigationMode: "direct",
      warning: null,
    };
  }

  const entryUrl = buildSpaEntryUrl(targetUrl);
  const response = await page.goto(entryUrl, { waitUntil: "domcontentloaded", timeout: GOTO_TIMEOUT_MS });
  const entryStatus = response ? response.status() : null;
  await switchClientRoute(page, route);

  return {
    finalUrl,
    entryUrl,
    httpStatus: entryStatus,
    navigationMode: "spa-history",
    warning: entryStatus && entryStatus >= 400 ? `SPA entry HTTP status ${entryStatus}` : null,
  };
}

function timeoutResult(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ timeout: true }), ms);
  });
}

async function withShortTimeout(promise, ms, fallback) {
  return Promise.race([
    promise.then((value) => ({ value })).catch((error) => ({ error })),
    timeoutResult(ms),
  ]).then((result) => {
    if (result && result.timeout) return fallback;
    if (result && result.error) return fallback;
    return result.value;
  });
}

async function safeCloseContext(context) {
  if (!context) return;
  await withShortTimeout(context.close(), CONTEXT_CLOSE_TIMEOUT_MS, undefined);
}

async function safeDiagnosticScreenshot(page, filePath) {
  if (!page) return false;
  try {
    await page.screenshot({ path: filePath, fullPage: true, animations: "disabled", timeout: SCREENSHOT_TIMEOUT_MS });
    return true;
  } catch {
    return false;
  }
}

function buildCaptureDescriptor({ route, viewport, fallbackMocked, filename, slugOverride }) {
  return {
    route,
    routeSlug: slugOverride || routeToSlug(route),
    viewport: viewport.name,
    width: viewport.width,
    height: viewport.height,
    mode: fallbackMocked ? "webgl-fallback" : "normal",
    fallbackMocked,
    filename,
  };
}

async function captureOne({ browser, targetUrl, route, viewport, screenshotsDir, fallbackMocked = false, slugOverride }) {
  const routeSlug = slugOverride || routeToSlug(route);
  const filename = `${routeSlug}__${viewport.name}.png`;
  const filePath = path.join(screenshotsDir, filename);
  const relativePath = `screenshots/${filename}`;
  const startedAt = nowIso();
  const startedTime = Date.now();
  const descriptor = buildCaptureDescriptor({ route, viewport, fallbackMocked, filename, slugOverride });

  console.log(
    `[visual-qa] Capturing route=${route} viewport=${viewport.name} size=${viewport.width}x${viewport.height} mode=${descriptor.mode} output=${filename} startedAt=${startedAt}`,
  );

  let context = null;
  let page = null;
  let navigation = {
    finalUrl: buildUrl(targetUrl, route),
    entryUrl: buildUrl(targetUrl, route),
    httpStatus: null,
    navigationMode: "direct",
    warning: null,
  };
  const consoleErrors = [];

  const runCapture = async () => {
    context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      ignoreHTTPSErrors: false,
      locale: "ru-RU",
    });

    if (fallbackMocked) await applyWebGLMock(context);

    page = await context.newPage();
    page.setDefaultTimeout(SETTLE_TIMEOUT_MS);
    page.setDefaultNavigationTimeout(GOTO_TIMEOUT_MS);
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(shortConsoleMessage(message.text()));
    });
    page.on("pageerror", (error) => consoleErrors.push(shortConsoleMessage(error?.message || error)));

    navigation = await navigateToRoute(page, targetUrl, route);
    await page.waitForLoadState("networkidle", { timeout: SETTLE_TIMEOUT_MS }).catch(() => undefined);
    await page.waitForTimeout(800);
    await page.screenshot({ path: filePath, fullPage: true, animations: "disabled", timeout: SCREENSHOT_TIMEOUT_MS });
    return { screenshotWritten: true };
  };

  const capturePromise = runCapture();
  const raceResult = await Promise.race([
    capturePromise.then((value) => ({ kind: "result", value })).catch((error) => ({ kind: "error", error })),
    timeoutResult(CAPTURE_TIMEOUT_MS).then(() => ({ kind: "timeout" })),
  ]);

  let status = "ok";
  let warning = null;
  let error = null;
  let screenshotWritten = false;

  if (raceResult.kind === "timeout") {
    status = "timeout";
    error = "Capture timeout";
    warning = `Capture timed out after ${CAPTURE_TIMEOUT_MS}ms.`;
    console.error(`[visual-qa] TIMEOUT route=${route} viewport=${viewport.name} mode=${descriptor.mode} after ${CAPTURE_TIMEOUT_MS}ms`);
    screenshotWritten = await safeDiagnosticScreenshot(page, filePath);
    await safeCloseContext(context);
    capturePromise.catch(() => undefined);
  } else if (raceResult.kind === "error") {
    status = "error";
    error = raceResult.error instanceof Error ? raceResult.error.message : String(raceResult.error);
    warning = "Navigation or screenshot failed; diagnostic screenshot attempted.";
    screenshotWritten = await safeDiagnosticScreenshot(page, filePath);
    await safeCloseContext(context);
  } else {
    screenshotWritten = Boolean(raceResult.value?.screenshotWritten);
    status = statusFromHttp(navigation.httpStatus);
    warning = navigation.warning;
    if (status === "warning") warning = warning || `HTTP status ${navigation.httpStatus ?? "unknown"}`;
    await safeCloseContext(context);
  }

  const completedAt = nowIso();
  const durationMs = Date.now() - startedTime;
  const result = {
    ...descriptor,
    url: navigation.finalUrl,
    entryUrl: navigation.entryUrl,
    navigationMode: navigation.navigationMode,
    file: screenshotWritten ? relativePath : null,
    httpStatus: navigation.httpStatus,
    status,
    warning,
    error,
    startedAt,
    completedAt,
    durationMs,
    timeoutMs: CAPTURE_TIMEOUT_MS,
    consoleErrors: consoleErrors.slice(0, 20),
    consoleErrorCount: consoleErrors.length,
  };

  console.log(
    `[visual-qa] Completed route=${route} viewport=${viewport.name} mode=${descriptor.mode} status=${status} durationMs=${durationMs} file=${result.file || "none"}`,
  );
  return result;
}

function summarizeCaptures(captures, plannedTotal) {
  return captures.reduce(
    (accumulator, capture) => {
      accumulator.completed += 1;
      accumulator[capture.status] = (accumulator[capture.status] || 0) + 1;
      if (capture.status === "error") accumulator.failed += 1;
      if (capture.status === "timeout") accumulator.failed += 1;
      if (capture.file) accumulator.screenshotsWritten += 1;
      if (capture.fallbackMocked) accumulator.webglFallbackCaptures += 1;
      accumulator.consoleErrorCount += Number(capture.consoleErrorCount || 0);
      return accumulator;
    },
    {
      total: plannedTotal,
      completed: 0,
      ok: 0,
      warning: 0,
      error: 0,
      timeout: 0,
      failed: 0,
      skipped: Math.max(plannedTotal - captures.length, 0),
      screenshotsWritten: 0,
      webglFallbackCaptures: 0,
      consoleErrorCount: 0,
    },
  );
}

function buildMarkdownManifest(manifest) {
  const lines = [];
  lines.push("# Vercel Visual QA Screenshots Manifest");
  lines.push("");
  lines.push(`Started at: ${manifest.startedAt}`);
  lines.push(`Completed at: ${manifest.completedAt || "incomplete"}`);
  lines.push(`Artifact generated: ${manifest.artifactGenerated ? "yes" : "no"}`);
  lines.push(`Target URL: ${manifest.targetUrl}`);
  lines.push(`Commit SHA: ${manifest.commitSha}`);
  lines.push(`Workflow run id: ${manifest.workflowRunId}`);
  lines.push(`Workflow: ${manifest.workflowName}`);
  lines.push(`Branch/ref: ${manifest.refName}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Total planned: ${manifest.summary.total}`);
  lines.push(`- Completed: ${manifest.summary.completed}`);
  lines.push(`- Screenshots written: ${manifest.summary.screenshotsWritten}`);
  lines.push(`- OK: ${manifest.summary.ok}`);
  lines.push(`- Warnings: ${manifest.summary.warning}`);
  lines.push(`- Errors: ${manifest.summary.error}`);
  lines.push(`- Timeouts: ${manifest.summary.timeout}`);
  lines.push(`- Failed captures: ${manifest.summary.failed}`);
  lines.push(`- Skipped captures: ${manifest.summary.skipped}`);
  lines.push(`- Console errors: ${manifest.summary.consoleErrorCount}`);
  lines.push(`- WebGL fallback captures: ${manifest.summary.webglFallbackCaptures}`);
  lines.push(`- Last attempted capture: ${manifest.lastAttemptedCapture ? JSON.stringify(manifest.lastAttemptedCapture) : "none"}`);
  lines.push("");
  lines.push("## Capture timeouts");
  lines.push("");
  lines.push(`- goto timeout: ${manifest.timeouts.gotoTimeoutMs}ms`);
  lines.push(`- settle timeout: ${manifest.timeouts.settleTimeoutMs}ms`);
  lines.push(`- screenshot timeout: ${manifest.timeouts.screenshotTimeoutMs}ms`);
  lines.push(`- per-capture timeout: ${manifest.timeouts.captureTimeoutMs}ms`);
  lines.push("");
  lines.push("## Routes");
  lines.push("");
  for (const route of manifest.routes) lines.push(`- ${route}`);
  lines.push("");
  lines.push("## Viewports");
  lines.push("");
  for (const viewport of manifest.viewports) lines.push(`- ${viewport.name}: ${viewport.width}x${viewport.height}`);
  lines.push("");
  lines.push("## Captures");
  lines.push("");
  lines.push("| Status | Route | Viewport | Mode | Duration | HTTP | Navigation | File | Error |");
  lines.push("|---|---|---|---|---:|---:|---|---|---|");
  for (const capture of manifest.captures) {
    lines.push(
      `| ${capture.status} | ${capture.route} | ${capture.viewport} | ${capture.mode} | ${capture.durationMs}ms | ${capture.httpStatus ?? ""} | ${capture.navigationMode} | ${capture.file || ""} | ${capture.error || capture.warning || ""} |`,
    );
  }
  lines.push("");
  lines.push("## Interpretation");
  lines.push("");
  lines.push("This artifact is screenshot evidence only. It does not complete UX/UI visual review by itself.");
  lines.push("A failed or timed-out capture is recorded in this manifest and does not prevent partial artifact upload.");
  lines.push("SPA-only routes are captured through the deployable app entry route and browser history navigation, so Vercel platform 404 pages are not mistaken for app screens.");
  lines.push("WebGL fallback screenshots use Playwright-side canvas WebGL mocking and do not rely on the localhost-only `?rzm_webgl=off` hook.");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function createManifest({ targetUrl, routes, plannedCaptures, startedAt, captures = [], completedAt = null, artifactGenerated = false, lastAttemptedCapture = null }) {
  return {
    startedAt,
    completedAt,
    generatedAt: completedAt || nowIso(),
    artifactGenerated,
    targetUrl: targetUrl.href,
    commitSha: process.env.GITHUB_SHA || "unknown",
    workflowRunId: process.env.GITHUB_RUN_ID || "local",
    workflowName: process.env.GITHUB_WORKFLOW || "local",
    refName: process.env.GITHUB_REF_NAME || "local",
    routes,
    viewports: VIEWPORTS,
    timeouts: {
      gotoTimeoutMs: GOTO_TIMEOUT_MS,
      settleTimeoutMs: SETTLE_TIMEOUT_MS,
      screenshotTimeoutMs: SCREENSHOT_TIMEOUT_MS,
      captureTimeoutMs: CAPTURE_TIMEOUT_MS,
    },
    totalPlannedCaptures: plannedCaptures.length,
    plannedCaptures,
    lastAttemptedCapture,
    summary: summarizeCaptures(captures, plannedCaptures.length),
    captures,
  };
}

async function writeManifest(outputDir, manifest) {
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputDir, "manifest.md"), buildMarkdownManifest(manifest), "utf8");
}

function buildPlannedCaptures(routes, captureWebglFallback) {
  const planned = [];
  for (const route of routes) {
    for (const viewport of VIEWPORTS) {
      const routeSlug = routeToSlug(route);
      planned.push({
        route,
        viewport: viewport.name,
        width: viewport.width,
        height: viewport.height,
        mode: "normal",
        filename: `${routeSlug}__${viewport.name}.png`,
      });
    }
  }

  if (captureWebglFallback) {
    for (const viewport of VIEWPORTS.filter((candidate) => FALLBACK_VIEWPORT_NAMES.has(candidate.name))) {
      planned.push({
        route: "/configurator-3d",
        viewport: viewport.name,
        width: viewport.width,
        height: viewport.height,
        mode: "webgl-fallback",
        filename: `configurator-3d-webgl-fallback__${viewport.name}.png`,
      });
    }
  }

  return planned;
}

async function main() {
  const targetUrl = normalizeTargetUrl(getArg("target-url") || process.env.TARGET_URL);
  const outputDir = getArg("output-dir") || process.env.VISUAL_QA_OUTPUT_DIR || "visual-qa-screenshots";
  const routes = parseRoutes(getArg("routes") || process.env.VISUAL_QA_ROUTES);
  const captureWebglFallback = normalizeBoolean(getArg("capture-webgl-fallback") || process.env.CAPTURE_WEBGL_FALLBACK, true);
  const { screenshotsDir } = await prepareDirs(outputDir);
  const startedAt = nowIso();
  const plannedCaptures = buildPlannedCaptures(routes, captureWebglFallback);
  const captures = [];
  let lastAttemptedCapture = null;

  console.log("[visual-qa] Starting Vercel visual QA screenshot capture.");
  console.log(`[visual-qa] Target origin: ${targetUrl.origin}`);
  console.log(`[visual-qa] Routes: ${routes.join(", ")}`);
  console.log(`[visual-qa] Viewports: ${VIEWPORTS.map((viewport) => `${viewport.name}=${viewport.width}x${viewport.height}`).join(", ")}`);
  console.log(`[visual-qa] Playwright WebGL fallback capture: ${captureWebglFallback ? "enabled" : "disabled"}`);
  console.log(`[visual-qa] Per-capture timeout: ${CAPTURE_TIMEOUT_MS}ms`);
  console.log("[visual-qa] SPA-only routes use the deployable /configurator entry plus browser history navigation.");

  await writeManifest(outputDir, createManifest({ targetUrl, routes, plannedCaptures, startedAt, captures, lastAttemptedCapture }));

  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    for (const route of routes) {
      for (const viewport of VIEWPORTS) {
        lastAttemptedCapture = { route, viewport: viewport.name, mode: "normal", startedAt: nowIso() };
        const capture = await captureOne({ browser, targetUrl, route, viewport, screenshotsDir });
        captures.push(capture);
        await writeManifest(outputDir, createManifest({ targetUrl, routes, plannedCaptures, startedAt, captures, lastAttemptedCapture }));
      }
    }

    if (captureWebglFallback) {
      for (const viewport of VIEWPORTS.filter((candidate) => FALLBACK_VIEWPORT_NAMES.has(candidate.name))) {
        lastAttemptedCapture = { route: "/configurator-3d", viewport: viewport.name, mode: "webgl-fallback", startedAt: nowIso() };
        const capture = await captureOne({
          browser,
          targetUrl,
          route: "/configurator-3d",
          viewport,
          screenshotsDir,
          fallbackMocked: true,
          slugOverride: "configurator-3d-webgl-fallback",
        });
        captures.push(capture);
        await writeManifest(outputDir, createManifest({ targetUrl, routes, plannedCaptures, startedAt, captures, lastAttemptedCapture }));
      }
    }
  } finally {
    await safeCloseContext(browser);
  }

  const completedAt = nowIso();
  const manifest = createManifest({
    targetUrl,
    routes,
    plannedCaptures,
    startedAt,
    captures,
    completedAt,
    artifactGenerated: true,
    lastAttemptedCapture,
  });
  await writeManifest(outputDir, manifest);

  const summary = manifest.summary;
  console.log(
    `[visual-qa] Summary total=${summary.total} completed=${summary.completed} screenshotsWritten=${summary.screenshotsWritten} ok=${summary.ok} warning=${summary.warning} error=${summary.error} timeout=${summary.timeout} consoleErrors=${summary.consoleErrorCount}`,
  );
  console.log(`[visual-qa] Manifest written to ${path.join(outputDir, "manifest.json")}`);

  if (summary.screenshotsWritten === 0) {
    throw new Error("No screenshots were written. Treating this as a systemic pipeline failure.");
  }

  console.log("[visual-qa] Vercel visual QA screenshot capture completed. Manifest validation step decides final workflow status.");
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[visual-qa] Vercel visual QA screenshot pipeline failed: ${message}`);
  process.exit(1);
});
