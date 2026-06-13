import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  '.vite',
  '.vercel',
  'coverage',
  'playwright-report',
  'test-results',
]);

const SOURCE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.json',
  '.md',
  '.yml',
  '.yaml',
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(root, absolute).replaceAll(path.sep, '/');
    if (entry.isDirectory()) {
      walk(absolute, out);
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      out.push({ absolute, relative });
    }
  }
  return out;
}

function readText(file) {
  return fs.readFileSync(file.absolute, 'utf8');
}

function countLines(text) {
  return text.length === 0 ? 0 : text.split('\n').length;
}

function classify(file) {
  if (file.relative.startsWith('api/')) return 'api';
  if (file.relative.startsWith('src/static-pages/constructor/')) return 'constructor-ui';
  if (file.relative.startsWith('src/static-pages/')) return 'static-pages';
  if (file.relative.startsWith('src/constructor/')) return 'production';
  if (file.relative.startsWith('src/pricing/')) return 'pricing';
  if (file.relative.startsWith('src/configurator/')) return 'legacy-configurator';
  if (file.relative.startsWith('src/styles/')) return 'styles';
  if (file.relative.startsWith('src/shared/')) return 'shared';
  if (file.relative.startsWith('src/admin/')) return 'admin';
  if (file.relative.startsWith('docs/')) return 'docs';
  if (file.relative.startsWith('scripts/')) return 'scripts';
  if (file.relative.startsWith('tests/')) return 'tests';
  if (file.relative.startsWith('.github/')) return 'github';
  return 'other';
}

function extractImports(text) {
  const imports = [];
  const patterns = [
    /import\s+(?:[^'\"]+from\s+)?['\"]([^'\"]+)['\"]/g,
    /import\(['\"]([^'\"]+)['\"]\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) imports.push(match[1]);
  }
  return imports;
}

function extractRoutes(text) {
  const routes = new Set();
  const routePattern = /pathname\s*===\s*['\"]([^'\"]+)['\"]|startsWith\(['\"]([^'\"]+)['\"]\)|href=\{?['\"]([^'\"]+)['\"]\}?/g;
  for (const match of text.matchAll(routePattern)) {
    const route = match[1] ?? match[2] ?? match[3];
    if (route?.startsWith('/')) routes.add(route);
  }
  return [...routes].sort();
}

function toMarkdown(report) {
  const lines = [];
  lines.push('# Repository Infrastructure Inventory');
  lines.push('');
  lines.push(`Generated at: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Files scanned: ${report.summary.filesScanned}`);
  lines.push(`- Source lines scanned: ${report.summary.totalLines}`);
  lines.push(`- Files over 500 lines: ${report.summary.filesOver500}`);
  lines.push(`- Files over 1000 lines: ${report.summary.filesOver1000}`);
  lines.push(`- Relative imports found: ${report.summary.relativeImports}`);
  lines.push(`- Potential protected-zone imports: ${report.summary.protectedZoneImportSignals}`);
  lines.push('');
  lines.push('## Largest files');
  lines.push('');
  lines.push('| Lines | Area | File |');
  lines.push('|---:|---|---|');
  for (const item of report.largestFiles) {
    lines.push(`| ${item.lines} | ${item.area} | \`${item.path}\` |`);
  }
  lines.push('');
  lines.push('## Files over 500 lines');
  lines.push('');
  if (report.filesOver500.length === 0) {
    lines.push('- None.');
  } else {
    for (const item of report.filesOver500) lines.push(`- ${item.lines} lines — \`${item.path}\` (${item.area})`);
  }
  lines.push('');
  lines.push('## Route signals');
  lines.push('');
  if (report.routeSignals.length === 0) {
    lines.push('- No route signals found.');
  } else {
    for (const route of report.routeSignals) lines.push(`- \`${route}\``);
  }
  lines.push('');
  lines.push('## Documentation coverage');
  lines.push('');
  for (const item of report.docsCoverage) {
    lines.push(`- ${item.exists ? '✅' : '❌'} \`${item.path}\``);
  }
  lines.push('');
  lines.push('## Protected-zone import signals');
  lines.push('');
  if (report.protectedZoneImportSignals.length === 0) {
    lines.push('- No protected-zone import signals found.');
  } else {
    for (const item of report.protectedZoneImportSignals) {
      lines.push(`- \`${item.file}\` imports \`${item.importPath}\``);
    }
  }
  lines.push('');
  lines.push('## Notes');
  lines.push('');
  lines.push('- This report is static analysis only. It does not prove runtime correctness.');
  lines.push('- Import signals are candidates for review, not automatic errors.');
  lines.push('- Generated report should be reviewed together with architecture docs.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

const files = walk(root);
const scanned = files.map((file) => {
  const text = readText(file);
  const imports = extractImports(text);
  return {
    path: file.relative,
    area: classify(file),
    lines: countLines(text),
    imports,
  };
});

const largestFiles = [...scanned]
  .sort((a, b) => b.lines - a.lines)
  .slice(0, 30)
  .map(({ path: filePath, area, lines }) => ({ path: filePath, area, lines }));

const filesOver500 = scanned
  .filter((item) => item.lines > 500)
  .sort((a, b) => b.lines - a.lines)
  .map(({ path: filePath, area, lines }) => ({ path: filePath, area, lines }));

const relativeImports = scanned.reduce(
  (sum, item) => sum + item.imports.filter((importPath) => importPath.startsWith('.')).length,
  0,
);

const protectedZoneImportSignals = [];
for (const item of scanned) {
  for (const importPath of item.imports) {
    const importsProtected =
      importPath.includes('/pricing') ||
      importPath.includes('/constructor/production') ||
      importPath.includes('/constructor/geometry') ||
      importPath.includes('/shared/lib/order') ||
      importPath.includes('/server-price');
    const fromUnprotectedUi =
      item.area === 'static-pages' || item.area === 'constructor-ui' || item.area === 'admin';
    if (importsProtected && fromUnprotectedUi) {
      protectedZoneImportSignals.push({ file: item.path, importPath });
    }
  }
}

const appFile = files.find((file) => file.relative === 'src/App.tsx');
const routeSignals = appFile ? extractRoutes(readText(appFile)) : [];

const docsCoveragePaths = [
  'docs/audits/infrastructure-audit-001.md',
  'docs/audits/README.md',
  'docs/architecture/README.md',
  'docs/architecture/project-map.md',
  'docs/architecture/runtime-boundaries.md',
  'docs/architecture/constructor-state-and-layout.md',
  'docs/architecture/pricing-and-order-boundaries.md',
  'docs/architecture/css-ownership-map.md',
  'docs/BACKLOG.md',
  'docs/css-architecture-audit.md',
  'docs/css-migration-plan.md',
];

const docsCoverage = docsCoveragePaths.map((docPath) => ({
  path: docPath,
  exists: fs.existsSync(path.join(root, docPath)),
}));

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    filesScanned: scanned.length,
    totalLines: scanned.reduce((sum, item) => sum + item.lines, 0),
    filesOver500: filesOver500.length,
    filesOver1000: filesOver500.filter((item) => item.lines > 1000).length,
    relativeImports,
    protectedZoneImportSignals: protectedZoneImportSignals.length,
  },
  largestFiles,
  filesOver500,
  routeSignals,
  docsCoverage,
  protectedZoneImportSignals: protectedZoneImportSignals.slice(0, 100),
};

const missingDocs = docsCoverage.filter((item) => !item.exists);
if (missingDocs.length > 0) {
  console.error('Missing required architecture/audit docs:');
  for (const item of missingDocs) console.error(`- ${item.path}`);
  process.exit(1);
}

if (!checkOnly) {
  const outputDir = path.join(root, 'docs', 'audits', 'generated');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'repository-inventory-latest.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'repository-inventory-latest.md'), toMarkdown(report));
}

console.log('Infrastructure inventory completed.');
console.log(`Files scanned: ${report.summary.filesScanned}`);
console.log(`Files over 500 lines: ${report.summary.filesOver500}`);
console.log(`Protected-zone import signals: ${report.summary.protectedZoneImportSignals}`);
if (checkOnly) console.log('Check-only mode: no report files written.');
