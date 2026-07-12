import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const ROOT_FILES = [
  "src/styles/constructor.css",
  "src/styles/constructor3d.css",
  "src/index.css",
];

const CONSTRUCTOR3D_DIR = "src/styles/constructor3d";

const thresholds = {
  totalRawBytesWarn: 420 * 1024,
  fileRawBytesWarn: 150 * 1024,
  selectorCountWarn: 1200,
  hasWarn: 1,
  backdropFilterWarn: 1,
  boxShadowWarn: 40,
  deepSelectorWarn: 25,
  highSpecificityWarn: 20,
};

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function collectCssFiles() {
  const files = [];

  for (const file of ROOT_FILES) {
    const absolutePath = path.join(repoRoot, file);
    if (fs.existsSync(absolutePath)) {
      files.push(file);
    }
  }

  const constructor3dAbsolute = path.join(repoRoot, CONSTRUCTOR3D_DIR);
  if (fs.existsSync(constructor3dAbsolute)) {
    for (const entry of fs.readdirSync(constructor3dAbsolute, { withFileTypes: true })) {
      if (!entry.isFile() || path.extname(entry.name) !== ".css") continue;
      files.push(toPosixPath(path.join(CONSTRUCTOR3D_DIR, entry.name)));
    }
  }

  return [...new Set(files)].sort((left, right) => left.localeCompare(right));
}

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "");
}

function formatKilobytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} kB`;
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function estimateSpecificity(selector) {
  const idCount = countMatches(selector, /#[\w-]+/g);
  const classLikeCount = countMatches(
    selector,
    /(\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+(?:\([^)]*\))?)/g,
  );
  const elementCount = countMatches(selector, /(^|[\s>+~])([a-zA-Z][\w-]*)/g);

  return idCount * 100 + classLikeCount * 10 + elementCount;
}

function estimateDepth(selector) {
  return selector
    .replace(/\s*([>+~])\s*/g, " $1 ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((part) => ![">", "+", "~"].includes(part)).length;
}

function analyseCssFile(file) {
  const absolutePath = path.join(repoRoot, file);
  const rawText = fs.readFileSync(absolutePath, "utf8");
  const text = stripComments(rawText);
  const bytes = Buffer.byteLength(rawText);
  const selectorBlocks = [...text.matchAll(/([^{}]+)\{/g)];
  const selectors = selectorBlocks.flatMap((match) =>
    match[1]
      .split(",")
      .map((selector) => selector.trim())
      .filter(Boolean),
  );

  const deepSelectors = selectors.filter((selector) => estimateDepth(selector) >= 5);
  const highSpecificitySelectors = selectors.filter(
    (selector) => estimateSpecificity(selector) >= 50,
  );

  return {
    file,
    bytes,
    selectorCount: selectors.length,
    hasCount: countMatches(text, /:has\(/g),
    backdropFilterCount:
      countMatches(text, /\bbackdrop-filter\b/g) +
      countMatches(text, /-webkit-backdrop-filter/g),
    boxShadowCount: countMatches(text, /\bbox-shadow\b/g),
    deepSelectorCount: deepSelectors.length,
    highSpecificityCount: highSpecificitySelectors.length,
    sampleDeepSelectors: deepSelectors.slice(0, 3),
    sampleHighSpecificitySelectors: highSpecificitySelectors.slice(0, 3),
  };
}

function buildWarnings(item) {
  const warnings = [];

  if (item.bytes >= thresholds.fileRawBytesWarn) {
    warnings.push(`large file ${formatKilobytes(item.bytes)}`);
  }
  if (item.selectorCount >= thresholds.selectorCountWarn) {
    warnings.push(`high selector count ${item.selectorCount}`);
  }
  if (item.hasCount >= thresholds.hasWarn) {
    warnings.push(`:has ${item.hasCount}`);
  }
  if (item.backdropFilterCount >= thresholds.backdropFilterWarn) {
    warnings.push(`backdrop-filter ${item.backdropFilterCount}`);
  }
  if (item.boxShadowCount >= thresholds.boxShadowWarn) {
    warnings.push(`box-shadow ${item.boxShadowCount}`);
  }
  if (item.deepSelectorCount >= thresholds.deepSelectorWarn) {
    warnings.push(`deep selectors ${item.deepSelectorCount}`);
  }
  if (item.highSpecificityCount >= thresholds.highSpecificityWarn) {
    warnings.push(`high specificity ${item.highSpecificityCount}`);
  }

  return warnings;
}

const files = collectCssFiles();
if (files.length === 0) {
  console.error("No customer-facing CSS files found for qa:css-performance.");
  process.exit(1);
}

const inventory = files.map(analyseCssFile);
const totalRawBytes = inventory.reduce((sum, item) => sum + item.bytes, 0);
const largestFiles = [...inventory]
  .sort((left, right) => right.bytes - left.bytes)
  .slice(0, 5);

const perFileWarnings = inventory
  .map((item) => ({ file: item.file, warnings: buildWarnings(item), item }))
  .filter((entry) => entry.warnings.length > 0);

const totalWarnings = [];
if (totalRawBytes >= thresholds.totalRawBytesWarn) {
  totalWarnings.push(
    `Total customer CSS is ${formatKilobytes(totalRawBytes)} (warn threshold ${formatKilobytes(
      thresholds.totalRawBytesWarn,
    )})`,
  );
}

const status = totalWarnings.length > 0 || perFileWarnings.length > 0 ? "WARN" : "OK";

console.log("=== CSS Performance Inventory: MVP customer path ===");
console.log(`Status: ${status} (warning-only)`);
console.log("");
console.log("Thresholds:");
console.log(`- total raw bytes warn: ${formatKilobytes(thresholds.totalRawBytesWarn)}`);
console.log(`- file raw bytes warn: ${formatKilobytes(thresholds.fileRawBytesWarn)}`);
console.log(`- selector count warn: ${thresholds.selectorCountWarn}`);
console.log(`- :has warn: ${thresholds.hasWarn}`);
console.log(`- backdrop-filter warn: ${thresholds.backdropFilterWarn}`);
console.log(`- box-shadow warn: ${thresholds.boxShadowWarn}`);
console.log(`- depth>=5 selectors warn: ${thresholds.deepSelectorWarn}`);
console.log(`- high-specificity selectors warn: ${thresholds.highSpecificityWarn}`);
console.log("");
console.log("Summary:");
console.log(`- files scanned: ${inventory.length}`);
console.log(`- total raw CSS: ${formatKilobytes(totalRawBytes)} (${totalRawBytes} bytes)`);
console.log("");
console.log("Per-file inventory:");
for (const item of inventory) {
  console.log(
    `- ${item.file}: ${formatKilobytes(item.bytes)}, selectors ${item.selectorCount}, :has ${item.hasCount}, backdrop-filter ${item.backdropFilterCount}, box-shadow ${item.boxShadowCount}, depth>=5 ${item.deepSelectorCount}, high-specificity ${item.highSpecificityCount}`,
  );
}

console.log("");
console.log("Largest files:");
for (const item of largestFiles) {
  console.log(`- ${item.file}: ${formatKilobytes(item.bytes)}`);
}

console.log("");
if (totalWarnings.length === 0 && perFileWarnings.length === 0) {
  console.log("OK: no configured warning thresholds exceeded.");
} else {
  console.log("WARN:");
  for (const warning of totalWarnings) {
    console.log(`- ${warning}`);
  }
  for (const entry of perFileWarnings) {
    console.log(`- ${entry.file}: ${entry.warnings.join(", ")}`);
  }
}

console.log("");
console.log("High-risk files:");
if (perFileWarnings.length === 0) {
  console.log("- none");
} else {
  for (const entry of perFileWarnings) {
    console.log(`- ${entry.file}`);
    if (entry.item.sampleDeepSelectors.length > 0) {
      console.log(`  sample deep selectors: ${entry.item.sampleDeepSelectors.join(" | ")}`);
    }
    if (entry.item.sampleHighSpecificitySelectors.length > 0) {
      console.log(
        `  sample high-specificity selectors: ${entry.item.sampleHighSpecificitySelectors.join(
          " | ",
        )}`,
      );
    }
  }
}

console.log("");
console.log("Suggested manual review areas:");
console.log("- Largest CSS files first, especially constructor shell layers and entry bundles.");
console.log("- Any file with :has(...) or backdrop-filter usage.");
console.log("- Files with repeated box-shadow usage or many deep descendant selectors.");
console.log("- Selectors with high specificity that may be hard to override safely.");
