import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();

const allowed = new Set([
  'src/constructor/productionModel.ts',
  'src/constructor/productionModel.types.ts',
  'src/constructor/legacyGeometry.ts',
  'src/constructor/payload.ts',
  'src/constructor/pricing.ts',
  'src/constructor/basisAdapter.ts',
  'src/constructor/basis/manualExport.ts',
  'src/constructor/rules.ts',
  'src/constructor/drillingTemplates.ts',
]);

const ignoredDirs = new Set(['node_modules', 'dist', '.git']);
const importPatterns = [
  /from\s+['"]\.\/productionModel['"]/,
  /from\s+['"]\.\/productionModel\.types['"]/,
  /from\s+['"]\.\/legacyGeometry['"]/,
  /from\s+['"]\.\.\/productionModel['"]/,
  /from\s+['"]\.\.\/productionModel\.types['"]/,
  /from\s+['"]\.\.\/legacyGeometry['"]/,
  /from\s+['"].*\/constructor\/productionModel['"]/,
  /from\s+['"].*\/constructor\/productionModel\.types['"]/,
  /from\s+['"].*\/constructor\/legacyGeometry['"]/,
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (ignoredDirs.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|mjs)$/.test(name)) out.push(full);
  }
  return out;
}

const violations = [];
for (const file of walk(join(root, 'src'))) {
  const rel = relative(root, file).replaceAll('\\', '/');
  if (allowed.has(rel)) continue;
  const text = readFileSync(file, 'utf8');
  if (importPatterns.some((pattern) => pattern.test(text))) {
    violations.push(rel);
  }
}

if (violations.length > 0) {
  console.error('Deprecated production model imports are not allowed in new files:');
  for (const v of violations) console.error(`- ${v}`);
  process.exit(1);
}

console.log('✓ no new deprecated production model imports');
