import { existsSync, readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { gzipSync } from "node:zlib";

const root = process.cwd();
const distDir = join(root, "dist");
const reportPath = join(root, "BUNDLE_SIZE_REPORT.md");

if (!existsSync(distDir)) {
  console.error("dist/ not found. Run `npm run build` before `npm run report:bundle`.");
  process.exit(1);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

const files = walk(distDir)
  .filter((file) => [".js", ".css", ".html"].includes(extname(file)))
  .map((file) => {
    const content = readFileSync(file);
    return {
      file: relative(root, file).replaceAll("\\", "/"),
      ext: extname(file),
      raw: content.length,
      gzip: gzipSync(content).length,
    };
  })
  .sort((a, b) => b.raw - a.raw);

const totals = files.reduce(
  (acc, item) => {
    acc.raw += item.raw;
    acc.gzip += item.gzip;
    return acc;
  },
  { raw: 0, gzip: 0 },
);

const threeVendor = files.find((item) => item.file.includes("three-vendor"));
const large = files.filter((item) => item.raw > 500 * 1024);

const lines = [
  "# Bundle size report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Summary",
  "",
  `- Total raw: ${formatKb(totals.raw)}`,
  `- Total gzip: ${formatKb(totals.gzip)}`,
  `- Files checked: ${files.length}`,
  threeVendor
    ? `- Three vendor chunk: ${formatKb(threeVendor.raw)} raw / ${formatKb(threeVendor.gzip)} gzip`
    : "- Three vendor chunk: not found",
  `- Chunks > 500 kB raw: ${large.length}`,
  "",
  "## Files",
  "",
  "| File | Raw | Gzip |",
  "|---|---:|---:|",
  ...files.map((item) => `| \`${item.file}\` | ${formatKb(item.raw)} | ${formatKb(item.gzip)} |`),
  "",
  "## Notes",
  "",
  "- `three-vendor` is expected to be the largest chunk while Three.js/R3F/Drei are used.",
  "- The current optimization goal is predictable chunk separation, not eliminating Three.js cost.",
  "- Next optimization options: lazy-load configurator route, reduce Drei usage, add visual regression tests before deeper code splitting.",
  "",
];

writeFileSync(reportPath, lines.join("\\n"), "utf8");
console.log(lines.slice(0, 12).join("\\n"));
console.log(`\\nReport written to ${relative(root, reportPath)}`);
