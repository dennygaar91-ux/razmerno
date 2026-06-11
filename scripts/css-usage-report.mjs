import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const srcDir = path.join(ROOT, "src");
const testDir = path.join(ROOT, "tests");
const scriptsDir = path.join(ROOT, "scripts");
const outDir = path.join(ROOT, "docs", "audit");
const outFile = path.join(outDir, "css-usage-report-v68.md");

const stageTags = [
  "v53", "v54", "v55", "v56", "v57", "v58", "v59", "v60", "v66", "v67",
  "Home redesign", "Measurements redesign", "Materials redesign", "Assembly redesign",
  "Constructor visual fixes", "Constructor checkout", "Constructor scene labels",
  "Constructor realistic", "Three.js viewer", "Three.js safety"
];

function statSafe(file) {
  try { return statSync(file); } catch { return null; }
}

function walk(dir, extensions) {
  const results = [];
  if (!statSafe(dir)) return results;
  for (const item of readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (["node_modules", "dist", ".vite", ".cache", "playwright-report", "test-results"].includes(item)) continue;
      results.push(...walk(full, extensions));
      continue;
    }
    if (extensions.some((ext) => full.endsWith(ext))) results.push(full);
  }
  return results;
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}

function unique(list) {
  return [...new Set(list)].sort();
}

const cssFiles = walk(srcDir, [".css"]);
const sourceFiles = [
  ...walk(srcDir, [".tsx", ".ts", ".jsx", ".js"]),
  ...walk(testDir, [".ts", ".tsx"]),
  ...walk(scriptsDir, [".mjs", ".js"]),
].filter((file) => !file.endsWith("css-usage-report.mjs"));

const cssTextByFile = new Map(cssFiles.map((file) => [file, readFileSync(file, "utf8")]));
const sourceText = sourceFiles.map((file) => readFileSync(file, "utf8")).join("\n");

const classToFiles = new Map();
const selectorFindings = [];

for (const [file, text] of cssTextByFile) {
  const regex = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g;
  let match;
  while ((match = regex.exec(text))) {
    const className = match[1];
    if (!className || className.startsWith("-")) continue;
    if (!classToFiles.has(className)) classToFiles.set(className, new Set());
    classToFiles.get(className).add(rel(file));
  }

  text.split("\n").forEach((line, index) => {
    if (stageTags.some((tag) => line.includes(tag))) {
      selectorFindings.push({ file: rel(file), line: index + 1, text: line.trim() });
    }
  });
}

const allClasses = unique([...classToFiles.keys()]);
const used = [];
const likelyDynamic = [];
const potentialUnused = [];

function classUsageEvidence(className) {
  const exactClass = sourceText.includes(className);
  const basePart = className
    .replace(/--[a-z0-9-]+$/i, "")
    .replace(/__[a-z0-9-]+$/i, "");
  const dynamicEvidence = basePart !== className && sourceText.includes(basePart);
  const suffixEvidence = className.includes("--") && sourceText.includes(className.split("--")[0]);
  return { exactClass, dynamicEvidence: dynamicEvidence || suffixEvidence };
}

for (const className of allClasses) {
  const evidence = classUsageEvidence(className);
  if (evidence.exactClass) used.push(className);
  else if (evidence.dynamicEvidence) likelyDynamic.push(className);
  else potentialUnused.push(className);
}

const prefixCounts = {};
for (const className of allClasses) {
  const prefix = className.startsWith("rzm-")
    ? className.split("-").slice(0, 3).join("-")
    : className.split("-")[0];
  prefixCounts[prefix] = (prefixCounts[prefix] ?? 0) + 1;
}

const versionClasses = {};
for (const tag of ["v53", "v54", "v55", "v56", "v57", "v58", "v59", "v60", "v66", "v67"]) {
  versionClasses[tag] = allClasses.filter((className) => className.includes(tag));
}

const largeCssFiles = cssFiles.map((file) => {
  const text = cssTextByFile.get(file);
  return {
    file: rel(file),
    kb: Number((Buffer.byteLength(text, "utf8") / 1024).toFixed(2)),
    classes: unique([...text.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)].map((m) => m[1])).length,
  };
}).sort((a, b) => b.kb - a.kb);

const duplicates = allClasses
  .map((className) => ({ className, files: [...classToFiles.get(className)] }))
  .filter((item) => item.files.length > 1);

mkdirSync(outDir, { recursive: true });

const potentialUnusedPreview = potentialUnused.slice(0, 180);
const likelyDynamicPreview = likelyDynamic.slice(0, 140);
const duplicatePreview = duplicates.slice(0, 80);

const lines = [];
lines.push("# Размерно — CSS usage report v68");
lines.push("");
lines.push("## Summary");
lines.push("");
lines.push(`- CSS files scanned: ${cssFiles.length}`);
lines.push(`- Source/test/script files scanned: ${sourceFiles.length}`);
lines.push(`- Unique CSS classes: ${allClasses.length}`);
lines.push(`- Exact-used classes: ${used.length}`);
lines.push(`- Likely dynamic/modifier classes: ${likelyDynamic.length}`);
lines.push(`- Potential unused classes: ${potentialUnused.length}`);
lines.push(`- Duplicate class names across CSS files: ${duplicates.length}`);
lines.push("");
lines.push("## CSS file sizes");
lines.push("");
lines.push("| File | Size KB | Unique classes |");
lines.push("|---|---:|---:|");
for (const item of largeCssFiles) lines.push(`| ${item.file} | ${item.kb} | ${item.classes} |`);
lines.push("");
lines.push("## Classes by prefix");
lines.push("");
lines.push("| Prefix | Count |");
lines.push("|---|---:|");
for (const [prefix, count] of Object.entries(prefixCounts).sort((a, b) => b[1] - a[1]).slice(0, 40)) {
  lines.push(`| ${prefix} | ${count} |`);
}
lines.push("");
lines.push("## Version-tag classes");
lines.push("");
for (const [tag, classes] of Object.entries(versionClasses)) {
  lines.push(`### ${tag}`);
  lines.push("");
  lines.push(classes.length ? classes.map((item) => `- \`${item}\``).join("\n") : "- none");
  lines.push("");
}
lines.push("## Stage marker comments found");
lines.push("");
if (selectorFindings.length) {
  for (const item of selectorFindings) lines.push(`- ${item.file}:${item.line} — \`${item.text}\``);
} else {
  lines.push("- none");
}
lines.push("");
lines.push("## Likely dynamic / modifier classes");
lines.push("");
lines.push("These classes were not found as exact strings but share a base selector used in TSX/CSS. Do not delete without browser review.");
lines.push("");
for (const item of likelyDynamicPreview) lines.push(`- \`${item}\` — ${[...classToFiles.get(item)].join(", ")}`);
if (likelyDynamic.length > likelyDynamicPreview.length) lines.push(`- ...and ${likelyDynamic.length - likelyDynamicPreview.length} more.`);
lines.push("");
lines.push("## Potential unused classes");
lines.push("");
lines.push("This is an audit list only. Do not delete blindly: scripts, runtime composition, generated classNames, or future routes may still use these.");
lines.push("");
for (const item of potentialUnusedPreview) lines.push(`- \`${item}\` — ${[...classToFiles.get(item)].join(", ")}`);
if (potentialUnused.length > potentialUnusedPreview.length) lines.push(`- ...and ${potentialUnused.length - potentialUnusedPreview.length} more.`);
lines.push("");
lines.push("## Duplicate class names across CSS files");
lines.push("");
if (duplicatePreview.length) {
  for (const item of duplicatePreview) lines.push(`- \`${item.className}\` — ${item.files.join(", ")}`);
  if (duplicates.length > duplicatePreview.length) lines.push(`- ...and ${duplicates.length - duplicatePreview.length} more.`);
} else {
  lines.push("- none");
}
lines.push("");
lines.push("## Safe cleanup plan");
lines.push("");
lines.push("### Step 1 — no deletion");
lines.push("");
lines.push("Keep current CSS. Use this report only to guide browser review.");
lines.push("");
lines.push("### Step 2 — browser-confirmed cleanup");
lines.push("");
lines.push("After screenshots/browser smoke, mark each potential-unused class as one of: keep / delete / merge / unknown.");
lines.push("");
lines.push("### Step 3 — section-by-section cleanup");
lines.push("");
lines.push("Clean one section at a time: home → measurements → materials → assembly → constructor scene → constructor sidebar → checkout.");
lines.push("");
lines.push("### Step 4 — guard after each cleanup");
lines.push("");
lines.push("Run typecheck, build, visual-qa inventory, css inventory, constructor flow and browser smoke static after every deletion batch.");
lines.push("");
lines.push("## Recommendations");
lines.push("");
lines.push("- Не удалять CSS до browser/pixel review.");
lines.push("- Сначала стабилизировать Three.js browser smoke и mobile smoke.");
lines.push("- После визуальной проверки удалять только классы из potential-unused, которые не являются dynamic modifiers.");
lines.push("- Отдельно проверить legacy-looking классы в src/index.css: там больше всего потенциального старого слоя.");
lines.push("- constructor.css уже большой; следующий безопасный cleanup должен быть секционным, а не глобальным.");
lines.push("");
lines.push("## Machine-readable data");
lines.push("");
lines.push("A JSON snapshot is available at `docs/audit/css-usage-report-v68.json`.");

writeFileSync(outFile, lines.join("\n"), "utf8");
writeFileSync(path.join(outDir, "css-usage-report-v68.json"), JSON.stringify({
  summary: {
    cssFiles: cssFiles.length,
    sourceFiles: sourceFiles.length,
    uniqueClasses: allClasses.length,
    used: used.length,
    likelyDynamic: likelyDynamic.length,
    potentialUnused: potentialUnused.length,
    duplicates: duplicates.length,
  },
  cssFileSizes: largeCssFiles,
  versionClasses,
  likelyDynamic,
  potentialUnused,
  duplicates,
  stageMarkers: selectorFindings,
}, null, 2), "utf8");

console.log(`CSS usage report written: ${rel(outFile)}`);
console.log(`Unique classes: ${allClasses.length}`);
console.log(`Exact-used: ${used.length}`);
console.log(`Likely dynamic: ${likelyDynamic.length}`);
console.log(`Potential unused: ${potentialUnused.length}`);
