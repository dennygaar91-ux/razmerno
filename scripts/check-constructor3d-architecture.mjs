import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const activeEntrypoint = "src/static-pages/Constructor3DPage.tsx";
const activeDir = "src/static-pages/constructor";
const threeDir = "src/static-pages/constructor/three";
const storeDir = "src/static-pages/constructor/store";
const componentsDir = "src/static-pages/constructor/components";

const runtimeExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const testFilePattern = /\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs)$/;

const requiredFiles = [
  activeEntrypoint,
  "src/static-pages/constructor/hooks/useConstructorPageState.ts",
  "src/static-pages/constructor/hooks/useConstructorQuote.ts",
  "src/static-pages/constructor/hooks/useConstructorSubmit.ts",
  "src/static-pages/constructor/store/constructorStore.ts",
  "src/static-pages/constructor/store/constructorSelectors.ts",
  "src/static-pages/constructor/adapters/constructorPayload.ts",
  "src/static-pages/constructor/components/ConstructorDrawerContent.tsx",
  "src/static-pages/constructor/components/ConstructorDrawerFooter.tsx",
  "src/static-pages/constructor/components/ConstructorStagebar.tsx",
  "src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx",
  "src/static-pages/constructor/components/SceneRuntimePanels.tsx",
  "src/static-pages/constructor/three/useWebGLAvailable.ts",
  "src/static-pages/constructor/three/useThreeSceneQuality.ts",
];

const deprecatedConstructorModules = [
  "src/constructor/api.ts",
  "src/constructor/legacyGeometry.ts",
  "src/constructor/payload.ts",
  "src/constructor/basisAdapter.ts",
  "src/constructor/pricing.ts",
  "src/constructor/productionModel.ts",
  "src/constructor/quickEstimate.ts",
  "src/constructor/rules.ts",
  "src/constructor/basis/manualExport.ts",
  "src/constructor/drillingTemplates.ts",
];

const errors = {
  required: [],
  legacy: [],
  layers: [],
  pageBypass: [],
  size: [],
};

const warnings = {
  size: [],
  scripts: [],
};

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function absolute(relPath) {
  return path.join(root, relPath);
}

function exists(relPath) {
  return fs.existsSync(absolute(relPath));
}

function read(relPath) {
  return fs.readFileSync(absolute(relPath), "utf8");
}

function countLines(text) {
  if (!text) return 0;
  return text.split(/\r?\n/).length;
}

function walk(dirRelPath) {
  const dir = absolute(dirRelPath);
  if (!fs.existsSync(dir)) return [];

  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const rel = toPosix(path.relative(root, abs));

    if (entry.isDirectory()) {
      if (["node_modules", "dist", ".git"].includes(entry.name)) continue;
      files.push(...walk(rel));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!runtimeExtensions.has(path.extname(entry.name))) continue;
    if (testFilePattern.test(entry.name)) continue;
    files.push(rel);
  }

  return files;
}

function normalizeImportSpecifier(importerRelPath, specifier) {
  if (!specifier) return specifier;

  if (specifier.startsWith("@/")) {
    return `src/${specifier.slice(2)}`;
  }

  if (specifier.startsWith("src/")) {
    return specifier;
  }

  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const importerDir = path.dirname(importerRelPath);
    return toPosix(path.normalize(path.join(importerDir, specifier)));
  }

  return specifier;
}

function getImportSpecifiers(source) {
  const specs = [];
  const patterns = [
    /import\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
    /require\s*\(\s*["']([^"']+)["']\s*\)/g,
    /export\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)["']([^"']+)["']/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      specs.push(match[1]);
    }
  }

  return specs;
}

function isWithin(relPath, dirRelPath) {
  return relPath === dirRelPath || relPath.startsWith(`${dirRelPath}/`);
}

function matchesPathOrIndex(normalized, target) {
  const withoutExt = target.replace(/\.(ts|tsx|js|jsx|mjs|cjs)$/, "");
  return (
    normalized === target ||
    normalized === withoutExt ||
    normalized.startsWith(`${withoutExt}/`) ||
    normalized.startsWith(`${target}/`)
  );
}

function hasAnyPathPrefix(normalized, prefixes) {
  return prefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

function scanImports(file) {
  const source = read(file);
  for (const specifier of getImportSpecifiers(source)) {
    const normalized = normalizeImportSpecifier(file, specifier);

    if (hasAnyPathPrefix(normalized, ["src/configurator"])) {
      errors.legacy.push(`${file} imports legacy configurator module: ${specifier}`);
    }

    if (
      matchesPathOrIndex(normalized, "src/static-pages/ConstructorPage.tsx") ||
      normalized.endsWith("/ConstructorPage") ||
      normalized === "ConstructorPage"
    ) {
      errors.legacy.push(`${file} imports legacy ConstructorPage: ${specifier}`);
    }

    for (const deprecated of deprecatedConstructorModules) {
      if (matchesPathOrIndex(normalized, deprecated)) {
        errors.legacy.push(`${file} imports deprecated constructor module: ${specifier}`);
      }
    }

    if (isWithin(file, threeDir)) {
      if (
        hasAnyPathPrefix(normalized, ["src/pricing", "api"]) ||
        normalized === "@supabase/supabase-js" ||
        normalized.includes("useConstructorSubmit")
      ) {
        errors.layers.push(`${file} has forbidden Three.js layer import: ${specifier}`);
      }
    }

    if (isWithin(file, storeDir)) {
      if (
        hasAnyPathPrefix(normalized, ["api", "src/admin"]) ||
        normalized === "@supabase/supabase-js" ||
        normalized.includes("server-only")
      ) {
        errors.layers.push(`${file} has forbidden store side-effect import: ${specifier}`);
      }
    }

    const isPageOrComponent = file === activeEntrypoint || isWithin(file, componentsDir);
    if (isPageOrComponent) {
      if (
        hasAnyPathPrefix(normalized, ["api", "src/admin", "src/constructor/production"]) ||
        normalized === "@supabase/supabase-js"
      ) {
        errors.layers.push(`${file} has forbidden page/component layer import: ${specifier}`);
      }
    }

    if (file === activeEntrypoint) {
      if (hasAnyPathPrefix(normalized, ["src/pricing"]) || normalized.includes("pricing-core")) {
        errors.pageBypass.push(`${file} imports pricing directly instead of useConstructorQuote: ${specifier}`);
      }
    }
  }
}

function scanPageBypass() {
  if (!exists(activeEntrypoint)) return;
  const source = read(activeEntrypoint);

  if (/\bfetch\s*\(/.test(source)) {
    errors.pageBypass.push(`${activeEntrypoint} calls fetch directly; submit must stay behind approved hooks/adapters.`);
  }

  const suspiciousPayloadTokens = ["createOrderPayload", "buildOrderPayload", "toOrderPayload"];
  for (const token of suspiciousPayloadTokens) {
    if (source.includes(token) && !source.includes("useConstructorSubmit")) {
      errors.pageBypass.push(`${activeEntrypoint} references ${token}; order payload assembly should stay behind adapter/hook boundary.`);
    }
  }
}

function scanSizes(files) {
  for (const file of files) {
    const text = read(file);
    const lines = countLines(text);

    if (file === activeEntrypoint) {
      if (lines > 420) warnings.size.push(`${file} has ${lines} lines; decomposition warning threshold is 420. P0-18 enforces import boundaries only.`);
      continue;
    }

    if (file === "src/static-pages/constructor/hooks/useConstructorPageState.ts" && lines > 380) {
      warnings.size.push(`${file} has ${lines} lines; focused hook split should be planned.`);
    }

    if (file === "src/static-pages/constructor/store/constructorSelectors.ts" && lines > 500) {
      warnings.size.push(`${file} has ${lines} lines; selector breadth warning.`);
    }

    if (file === "src/static-pages/constructor/store/constructorStore.ts" && lines > 260) {
      warnings.size.push(`${file} has ${lines} lines; store entrypoint should remain composition-only.`);
    }

    if (isWithin(file, storeDir) && /Slice\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file) && lines > 350) {
      warnings.size.push(`${file} has ${lines} lines; slice breadth warning.`);
    }

    if (isWithin(file, componentsDir)) {
      if (lines > 450) warnings.size.push(`${file} has ${lines} lines; serious component breadth warning.`);
      else if (lines > 300) warnings.size.push(`${file} has ${lines} lines; component breadth warning.`);
    }
  }
}

function scanPackageWarnings() {
  const packagePath = "package.json";
  if (!exists(packagePath)) return;
  const source = read(packagePath);
  const historicalStagePattern = /"(?:qa|check):stage(?:\d+|-[a-z]\d+|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27)/;
  if (historicalStagePattern.test(source)) {
    warnings.scripts.push("package.json still contains historical stage script families; QA command map should classify current vs historical scripts.");
  }
}

function printGroup(title, items) {
  if (!items.length) return;
  console.log(`\n${title}`);
  for (const item of items) console.log(`  - ${item}`);
}

for (const file of requiredFiles) {
  if (!exists(file)) errors.required.push(`Missing required active Constructor3D file: ${file}`);
}

const activeFiles = [activeEntrypoint, ...walk(activeDir)].filter((file, index, list) => file && list.indexOf(file) === index);

for (const file of activeFiles) {
  if (exists(file)) scanImports(file);
}
scanPageBypass();
scanSizes(activeFiles.filter(exists));
scanPackageWarnings();

const hardErrors = [
  ...errors.required,
  ...errors.legacy,
  ...errors.layers,
  ...errors.pageBypass,
];

if (hardErrors.length) {
  console.error("Constructor3D architecture guard failed.");
  printGroup("Required file errors:", errors.required);
  printGroup("Legacy import errors:", errors.legacy);
  printGroup("Layer violation errors:", errors.layers);
  printGroup("Page bypass errors:", errors.pageBypass);
  printGroup("File-size errors:", errors.size);
  printGroup("Warnings:", [...warnings.size, ...warnings.scripts]);
  process.exit(1);
}

console.log("✓ Constructor3D architecture guard passed.");
printGroup("Warnings:", [...warnings.size, ...warnings.scripts]);
