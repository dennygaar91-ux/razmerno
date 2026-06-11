import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
function listCssFiles() {
  const files = [
    'src/styles/constructor.css',
    'src/styles/constructor3d.css',
    'src/index.css',
  ];
  const constructor3dDir = path.join(root, 'src/styles/constructor3d');
  if (fs.existsSync(constructor3dDir)) {
    for (const entry of fs.readdirSync(constructor3dDir).sort()) {
      if (entry.endsWith('.css')) files.push(`src/styles/constructor3d/${entry}`);
    }
  }
  return files.filter((file) => fs.existsSync(path.join(root, file)));
}

const cssFiles = listCssFiles();

const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.html', '.md']);
const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (sourceExtensions.has(path.extname(entry.name))) sourceFiles.push(full);
  }
}
walk(root);

const sourceText = sourceFiles
  .filter((file) => !file.includes(`${path.sep}docs${path.sep}css-class-inventory.json`))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');

const classPattern = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g;
const inventory = {};
for (const cssFile of cssFiles) {
  const abs = path.join(root, cssFile);
  const text = fs.readFileSync(abs, 'utf8');
  const classes = new Set();
  for (const match of text.matchAll(classPattern)) {
    const cls = match[1];
    if (!cls || cls.startsWith('-')) continue;
    if (/^(\d|is|has|not|where|root|hover|focus|active|disabled|before|after)$/.test(cls)) continue;
    classes.add(cls);
  }
  const sorted = [...classes].sort();
  inventory[cssFile] = {
    lines: text.split('\n').length,
    classCount: sorted.length,
    classes: sorted.map((cls) => ({
      name: cls,
      referencedOutsideCss: sourceText.includes(cls),
    })),
  };
}

const summary = Object.fromEntries(Object.entries(inventory).map(([file, data]) => [file, {
  lines: data.lines,
  classCount: data.classCount,
  maybeUnusedCount: data.classes.filter((item) => !item.referencedOutsideCss).length,
}]))

const output = {
  generatedAt: new Date().toISOString(),
  note: 'Static class inventory. maybeUnused is a candidate list only; dynamic class composition can create false positives.',
  summary,
  inventory,
};

fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/css-class-inventory.json'), `${JSON.stringify(output, null, 2)}\n`);

const requiredDocs = [
  'docs/css-architecture-audit.md',
  'docs/css-migration-plan.md',
  'docs/css-class-inventory.json',
];
const missing = requiredDocs.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(`Missing CSS architecture docs: ${missing.join(', ')}`);
  process.exit(1);
}

const cssLineLimit = {
  'src/styles/constructor.css': 12000,
  'src/styles/constructor3d.css': 120,
  'src/index.css': 1200,
};
for (const cssFile of cssFiles) {
  if (cssFile.startsWith('src/styles/constructor3d/') && inventory[cssFile]?.lines > 700) {
    console.error(`${cssFile} exceeds split-module line limit 700: ${inventory[cssFile].lines}`);
    process.exit(1);
  }
}
for (const [file, limit] of Object.entries(cssLineLimit)) {
  const data = inventory[file];
  if (data && data.lines > limit) {
    console.error(`${file} exceeds guard line limit ${limit}: ${data.lines}`);
    process.exit(1);
  }
}

console.log('CSS architecture inventory generated. Summary:');
for (const [file, data] of Object.entries(summary)) {
  console.log(`- ${file}: ${data.lines} lines, ${data.classCount} classes, ${data.maybeUnusedCount} maybe-unused candidates`);
}
