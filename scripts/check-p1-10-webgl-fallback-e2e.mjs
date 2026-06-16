import { existsSync, readFileSync } from "node:fs";

const testPath = "tests/browser/webgl-fallback.spec.ts";
const fallbackComponentPath = "src/static-pages/constructor/components/SceneRuntimePanels.tsx";
const diagnosticsPath = "src/static-pages/constructor/three/useWebGLAvailable.ts";
const packagePath = "package.json";
const workflowPath = ".github/workflows/qa.yml";

const files = [
  testPath,
  fallbackComponentPath,
  diagnosticsPath,
  packagePath,
  workflowPath,
];

let failed = false;

for (const filePath of files) {
  if (!existsSync(filePath)) {
    failed = true;
    console.error(`P1-10 guard failed: missing required file: ${filePath}`);
  }
}

const read = (filePath) => (existsSync(filePath) ? readFileSync(filePath, "utf8") : "");
const testSource = read(testPath);
const fallbackSource = read(fallbackComponentPath);
const diagnosticsSource = read(diagnosticsPath);
const packageSource = read(packagePath);
const workflowSource = read(workflowPath);

const requiredTestFragments = [
  'page.goto(options.forceFallback ? "/configurator-3d?rzm_webgl=off" : "/configurator-3d")',
  "HTMLCanvasElement.prototype.getContext",
  "webgl2",
  "experimental-webgl",
  "webgl-fallback-preview",
  'data-webgl-fallback", "active"',
  'data-webgl-diagnostics-status", "unavailable"',
  "proceedToCheckout(page)",
  '"**/api/orders"',
  "P1-10-WEBGL-FALLBACK",
  'source).toBe("constructor-store-adapter")',
];

const requiredFallbackFragments = [
  'data-testid="webgl-fallback-preview"',
  'data-webgl-fallback="active"',
  "data-webgl-diagnostics-status",
  "ConstructorRealisticSvgModel",
];

const requiredDiagnosticsFragments = [
  "isLocalhostFallbackProbeEnabled",
  'get("rzm_webgl") === "off"',
  'reason: "e2e-forced-webgl-off"',
  'host === "localhost"',
  'host === "127.0.0.1"',
];

const requiredPackageFragments = [
  '"check:webgl-fallback-e2e": "node scripts/check-p1-10-webgl-fallback-e2e.mjs"',
  '"test:webgl-fallback-e2e": "playwright test tests/browser/webgl-fallback.spec.ts --project=chromium-desktop"',
];

const requiredWorkflowFragments = [
  "P1-10 WebGL fallback E2E guard",
  "npm run check:webgl-fallback-e2e",
  "P1-10 WebGL fallback E2E",
  "npm run test:webgl-fallback-e2e",
  "p1-10-webgl-fallback-ci-evidence",
];

const forbiddenTestFragments = [
  'page.goto("/configurator")',
  'page.goto("/configurator?",
',
  ".rzm-r19-workspace",
  ".rzm-constructor-stepper",
];

function requireFragments(source, fragments, label) {
  for (const fragment of fragments) {
    if (!source.includes(fragment)) {
      failed = true;
      console.error(`P1-10 guard failed: ${label} missing required fragment: ${fragment}`);
    }
  }
}

function forbidFragments(source, fragments, label) {
  for (const fragment of fragments) {
    if (source.includes(fragment)) {
      failed = true;
      console.error(`P1-10 guard failed: ${label} contains forbidden fragment: ${fragment}`);
    }
  }
}

requireFragments(testSource, requiredTestFragments, testPath);
requireFragments(fallbackSource, requiredFallbackFragments, fallbackComponentPath);
requireFragments(diagnosticsSource, requiredDiagnosticsFragments, diagnosticsPath);
requireFragments(packageSource, requiredPackageFragments, packagePath);
requireFragments(workflowSource, requiredWorkflowFragments, workflowPath);
forbidFragments(testSource, forbiddenTestFragments, testPath);

if (failed) {
  process.exit(1);
}

console.log("P1-10 WebGL fallback E2E guard passed.");
