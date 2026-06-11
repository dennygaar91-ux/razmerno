import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanDirs = ["src/static-pages"];
const forbiddenPatterns = [
  {
    name: "StaticHtmlPage",
    regex: /\bStaticHtmlPage\b/,
  },
  {
    name: "dangerouslySetInnerHTML",
    regex: /\bdangerouslySetInnerHTML\b/,
  },
  {
    name: "static html const",
    regex: /\bconst\s+html\s*=\s*["'`]/,
  },
];

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

    if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) return [];
    return [rel];
  });
}

const violations = [];

for (const file of scanDirs.flatMap(walk)) {
  const text = fs.readFileSync(path.join(root, file), "utf8");

  for (const pattern of forbiddenPatterns) {
    if (pattern.regex.test(text)) {
      violations.push(`${file}: ${pattern.name}`);
    }
  }
}

if (violations.length) {
  console.error("Static HTML page guard failed:");
  for (const violation of violations) {
    console.error(`  - ${violation}`);
  }
  process.exit(1);
}

console.log("✓ no StaticHtmlPage/dangerouslySetInnerHTML/static html page strings in src/static-pages");
