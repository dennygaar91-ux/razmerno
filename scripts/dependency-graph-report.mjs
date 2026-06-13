import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const outputDir = join(root, 'docs', 'audits', 'generated');
const outputFile = join(outputDir, 'dependency-graph-report.md');
const sourceDirs = ['src', 'api', 'scripts', 'tests'];
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function extname(file) {
  const index = file.lastIndexOf('.');
  return index >= 0 ? file.slice(index) : '';
}

function extractImports(content) {
  const imports = [];
  const patterns = [
    /import\s+(?:[^'\"]+\s+from\s+)?['\"]([^'\"]+)['\"]/g,
    /export\s+[^'\"]+\s+from\s+['\"]([^'\"]+)['\"]/g,
    /await\s+import\(['\"]([^'\"]+)['\"]\)/g,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content))) imports.push(match[1]);
  }
  return imports;
}

const rows = [];
for (const dir of sourceDirs) {
  const absolute = join(root, dir);
  try {
    for (const file of walk(absolute)) {
      if (!extensions.has(extname(file))) continue;
      const content = readFileSync(file, 'utf8');
      const imports = extractImports(content);
      rows.push({ file: relative(root, file), imports });
    }
  } catch {
    // Directory is optional for this read-only report.
  }
}

const lines = [
  '# Dependency Graph Report',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '| File | Import count | Local imports | External imports |',
  '|---|---:|---:|---:|',
];

for (const row of rows.sort((a, b) => a.file.localeCompare(b.file))) {
  const local = row.imports.filter((item) => item.startsWith('.') || item.startsWith('@/')).length;
  const external = row.imports.length - local;
  lines.push(`| \`${row.file}\` | ${row.imports.length} | ${local} | ${external} |`);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, `${lines.join('\n')}\n`);
console.log(`Dependency graph report written to ${relative(root, outputFile)}`);
