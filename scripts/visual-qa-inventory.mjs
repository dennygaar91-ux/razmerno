import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const scanDirs = [
  "src/static-pages",
  "src/styles",
  "src",
].filter((dir) => fs.existsSync(path.join(root, dir)));

const fileExtensions = new Set([".tsx", ".ts", ".css"]);

function walk(dir) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) return [];

  return fs.readdirSync(fullDir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(fullDir, entry.name);
    const rel = path.relative(root, full);

    if (entry.isDirectory()) {
      if (["node_modules", "dist", ".vite", ".cache"].includes(entry.name)) return [];
      return walk(rel);
    }

    if (!fileExtensions.has(path.extname(entry.name))) return [];
    return [rel];
  });
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function countMatches(text, regex) {
  return [...text.matchAll(regex)].length;
}

function findLines(text, predicate) {
  return text
    .split(/\r?\n/)
    .map((line, index) => ({ line: index + 1, text: line }))
    .filter(({ text }) => predicate(text));
}

const files = [...new Set(scanDirs.flatMap(walk))].sort();

const tsxFiles = files.filter((file) => file.endsWith(".tsx"));
const cssFiles = files.filter((file) => file.endsWith(".css"));

const designSystemClasses = [
  "rzm-logo",
  "rzm-logo-image-wrap",
  "rzm-logo-image",
  "rzm-logo-word",
  "rzm-cta",
  "rzm-secondary-cta",
  "rzm-how-chip-title",
  "rzm-hero-lead",
  "rzm-step-text",
  "rzm-how-step-number",
  "rzm-info-card",
  "rzm-info-grid",
  "rzm-info-final",
];

const expectedClassUsage = designSystemClasses.map((className) => {
  const usage = tsxFiles.reduce((sum, file) => sum + countMatches(read(file), new RegExp(className, "g")), 0);
  const cssDefinition = cssFiles.reduce((sum, file) => sum + countMatches(read(file), new RegExp(`\\.${className}(?![a-zA-Z0-9_-])`, "g")), 0);
  return { className, usage, cssDefinition };
});

function classifyInlineStyle(file, text) {
  if (/width:\s*`\$\{/.test(text)) return "dynamic-progress-or-size";
  if (/gridTemplateColumns/.test(text)) return "dynamic-grid-template";
  if (/background:\s*material\.swatch/.test(text)) return "dynamic-material-swatch";
  if (/background:\s*dotColor/.test(text)) return "dynamic-status-dot";
  if (/pointerEvents:\s*"none"/.test(text)) return "svg-overlay-pointer-events";
  if (/width:\s*"100%".*height:\s*"100%"/.test(text)) return "canvas-fill-size";
  if (/paddingBottom:.*safe-area-inset-bottom/.test(text)) return "mobile-safe-area";
  if (/animation:/.test(text) || /animationDelay/.test(text) || /transitionStyle/.test(text)) return "animation-runtime";
  if (file.includes("Visualization.tsx")) return "legacy-visualization-dynamic-svg";
  if (file.includes("DimensionLabels.tsx")) return "three-label-positioning";
  return "review";
}

const inlineStyleFindings = tsxFiles.flatMap((file) =>
  findLines(read(file), (line) => /\bstyle=\{\{/.test(line) || /\bstyle=\{/.test(line))
    .map((item) => ({ file, category: classifyInlineStyle(file, item.text), ...item })),
);

const inlineStyleReviewFindings = inlineStyleFindings.filter((item) => item.category === "review");

const inlineStyleByCategory = inlineStyleFindings.reduce((acc, item) => {
  acc[item.category] = (acc[item.category] ?? 0) + 1;
  return acc;
}, {});

function classifyRawColor(file, text) {
  if (file.endsWith("src/styles/base.css")) return "design-token-definition";
  if (file.endsWith("src/styles/constructor.css") && /--rzm-/.test(text)) return "constructor-token-definition";
  if (file.includes("/three/materials.ts")) return "material-texture-data";
  if (file.includes("src/constructor/catalog.ts")) return "catalog-swatch-data";
  if (file.includes("/three/")) return "three-runtime-visual";
  if (file.includes("QuickStart.tsx") || file.includes("Visualization.tsx")) return "svg-illustration-color";
  if (/\bbg-\[#|\btext-\[#|\bborder-\[#|\bbg-\[/.test(text)) return "tailwind-arbitrary-runtime-class";
  if (/stopColor=|floodColor=|fill=|stroke=|color=/.test(text)) return "svg-or-three-color-prop";
  if (/var\(--rzm-/.test(text)) return "token-composed-css";
  if (/color:\s*#fff|color:#fff/.test(text)) return "white-text-css";
  if (/linear-gradient|radial-gradient/.test(text)) return "gradient-css";
  return "review";
}

const rawColorFindings = files.flatMap((file) =>
  findLines(read(file), (line) => /#[0-9a-fA-F]{3,8}/.test(line))
    .map((item) => ({ file, category: classifyRawColor(file, item.text), ...item })),
);

const rawColorReviewFindings = rawColorFindings.filter((item) => item.category === "review");

const rawColorByCategory = rawColorFindings.reduce((acc, item) => {
  acc[item.category] = (acc[item.category] ?? 0) + 1;
  return acc;
}, {});

const suspiciousTextPatterns = [
  /\bUnsplash\b/i,
  /\bLorem\b/i,
  /\bTODO\b/,
  /\bFIXME\b/,
  /\bfake\b/i,
  /\bplaceholder\s+image\b/i,
  /\bplaceholder\s+text\b/i,
  /Отзывы/i,
  /Кейсы/i,
  /фейк/i,
];

const suspiciousTextFindings = tsxFiles.flatMap((file) =>
  findLines(read(file), (line) => suspiciousTextPatterns.some((pattern) => pattern.test(line)))
    .map((item) => ({ file, ...item })),
);

const formPlaceholderFindings = tsxFiles.flatMap((file) =>
  findLines(read(file), (line) => /\bplaceholder=|\bplaceholder[?:]?:/.test(line))
    .map((item) => ({ file, ...item })),
);

const duplicateHeaderMarkup = tsxFiles
  .map((file) => ({ file, count: countMatches(read(file), /rzm-header-shell/g) }))
  .filter((item) => item.count > 0);

const duplicateFooterMarkup = tsxFiles
  .map((file) => ({ file, count: countMatches(read(file), /rzm-info-footer|rzm-footer/g) }))
  .filter((item) => item.count > 0);

const ctaUsage = tsxFiles.map((file) => {
  const text = read(file);
  return {
    file,
    primary: countMatches(text, /rzm-cta/g),
    secondary: countMatches(text, /rzm-secondary-cta/g),
  };
}).filter((item) => item.primary || item.secondary);

const reportLines = [
  "# Visual QA inventory report",
  "",
  "Generated by `npm run report:visual-qa`.",
  "",
  "## Summary",
  "",
  `- TSX files scanned: ${tsxFiles.length}`,
  `- CSS files scanned: ${cssFiles.length}`,
  `- Inline style findings: ${inlineStyleFindings.length}`,
  `- Inline style review findings: ${inlineStyleReviewFindings.length}`,
  `- Raw color findings: ${rawColorFindings.length}`,
  `- Raw color review findings: ${rawColorReviewFindings.length}`,
  `- Suspicious text findings: ${suspiciousTextFindings.length}`,
  `- Form placeholder findings: ${formPlaceholderFindings.length}`,
  "",
  "## Design-system class usage",
  "",
  "| Class | TSX usage | CSS definitions |",
  "|---|---:|---:|",
  ...expectedClassUsage.map((item) => `| .${item.className} | ${item.usage} | ${item.cssDefinition} |`),
  "",
  "## CTA usage",
  "",
  "| File | .rzm-cta | .rzm-secondary-cta |",
  "|---|---:|---:|",
  ...ctaUsage.map((item) => `| ${item.file} | ${item.primary} | ${item.secondary} |`),
  "",
  "## Header markup ownership",
  "",
  duplicateHeaderMarkup.length
    ? duplicateHeaderMarkup.map((item) => `- \`${item.file}\` — ${item.count}`).join("\n")
    : "No header markup usage found.",
  "",
  "## Footer markup ownership",
  "",
  duplicateFooterMarkup.length
    ? duplicateFooterMarkup.map((item) => `- \`${item.file}\` — ${item.count}`).join("\n")
    : "No footer markup usage found.",
  "",
  "## Inline style findings",
  "",
  inlineStyleFindings.length
    ? inlineStyleFindings.map((item) => `- \`${item.file}:${item.line}\` — [${item.category}] ${item.text.trim()}`).join("\n")
    : "No inline style findings.",
  "",
  "## Inline style categories",
  "",
  Object.keys(inlineStyleByCategory).length
    ? Object.entries(inlineStyleByCategory)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, count]) => `- ${category}: ${count}`)
        .join("\n")
    : "No inline style categories.",
  "",
  "## Inline style review findings",
  "",
  inlineStyleReviewFindings.length
    ? inlineStyleReviewFindings.map((item) => `- \`${item.file}:${item.line}\` — ${item.text.trim()}`).join("\n")
    : "No inline style review findings.",
  "",
  "## Raw color findings",
  "",
  "Raw colors can be valid when they are token definitions, material data, SVG/Three runtime values or catalog swatches. This list is classified for manual review only.",
  "",
  rawColorFindings.length
    ? rawColorFindings.slice(0, 160).map((item) => `- \`${item.file}:${item.line}\` — [${item.category}] ${item.text.trim()}`).join("\n")
    : "No raw color findings.",
  rawColorFindings.length > 160 ? `\n- ...and ${rawColorFindings.length - 160} more` : "",
  "",
  "## Raw color categories",
  "",
  Object.keys(rawColorByCategory).length
    ? Object.entries(rawColorByCategory)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, count]) => `- ${category}: ${count}`)
        .join("\n")
    : "No raw color categories.",
  "",
  "## Raw color review findings",
  "",
  rawColorReviewFindings.length
    ? rawColorReviewFindings.map((item) => `- \`${item.file}:${item.line}\` — ${item.text.trim()}`).join("\n")
    : "No raw color review findings.",
  "",
  "## Suspicious text findings",
  "",
  suspiciousTextFindings.length
    ? suspiciousTextFindings.map((item) => `- \`${item.file}:${item.line}\` — ${item.text.trim()}`).join("\n")
    : "No suspicious text findings.",
  "",
  "## Form placeholder findings",
  "",
  "Placeholders are not suspicious by themselves. This section is separated from suspicious text to avoid false positives. Review only if a placeholder looks like unfinished copy.",
  "",
  formPlaceholderFindings.length
    ? formPlaceholderFindings.map((item) => `- \`${item.file}:${item.line}\` — ${item.text.trim()}`).join("\n")
    : "No form placeholder findings.",
  "",
  "## Manual visual QA focus",
  "",
  "1. Header consistency on all routes.",
  "2. CTA/secondary CTA class consistency.",
  "3. Info pages section spacing after component extraction.",
  "4. Constructor sidebar density and step controls.",
  "5. Mobile header and constructor bottom area.",
  "6. Raw colors that should become tokens only after visual confirmation.",
  "",
  "## Important",
  "",
  "This report does not change files. It is a visual QA inventory, not a cleanup script.",
];

const outputDir = path.join(root, "docs/audit");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "visual-qa-inventory-report.md"), reportLines.join("\n"), "utf8");

console.log("Visual QA inventory complete");
console.log(`TSX files scanned: ${tsxFiles.length}`);
console.log(`CSS files scanned: ${cssFiles.length}`);
console.log(`Inline style findings: ${inlineStyleFindings.length}`);
console.log(`Raw color findings: ${rawColorFindings.length}`);
console.log(`Suspicious text findings: ${suspiciousTextFindings.length}`);
