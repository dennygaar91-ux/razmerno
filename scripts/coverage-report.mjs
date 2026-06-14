#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const coverageRoot = join(root, 'coverage');
const rawDir = join(coverageRoot, 'v8-raw');
const summaryPath = join(coverageRoot, 'coverage-summary.json');
const markdownPath = join(coverageRoot, 'coverage-summary.md');

const defaultCommands = [
  ['npm', ['run', 'test:constructor-store']],
  ['npm', ['run', 'test:constructor-payload']],
  ['npm', ['run', 'test:production-preview']],
  ['npm', ['run', 'test:constructor-flow']],
  ['npm', ['run', 'test:constructor-pii-order']],
  ['npm', ['run', 'test:constructor-three']],
  ['npm', ['run', 'test:constructor-three-safety']],
  ['npm', ['run', 'test:pricing-catalog']],
  ['npm', ['run', 'test:pricing-engine']],
  ['npm', ['run', 'test:delivery']],
  ['npm', ['run', 'test:pricing-final']],
  ['npm', ['run', 'test:geometry']],
  ['npm', ['run', 'test:production-export']],
];

const minimumBytes = Number(process.env.COVERAGE_MIN_BYTES ?? '15');
const shouldFailOnThreshold = process.env.COVERAGE_FAIL_ON_THRESHOLD !== '0';

rmSync(rawDir, { recursive: true, force: true });
mkdirSync(rawDir, { recursive: true });
mkdirSync(coverageRoot, { recursive: true });

const startedAt = new Date().toISOString();
const commandResults = [];

for (const [command, args] of defaultCommands) {
  const label = `${command} ${args.join(' ')}`;
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      NODE_V8_COVERAGE: rawDir,
    },
  });

  commandResults.push({ command: label, status: result.status ?? 1 });

  if (result.status !== 0) {
    writeFileSync(summaryPath, JSON.stringify({
      status: 'failed',
      failedCommand: label,
      commandResults,
      startedAt,
      finishedAt: new Date().toISOString(),
    }, null, 2));
    process.exit(result.status ?? 1);
  }
}

const fileStats = new Map();

function normalizeUrl(url) {
  if (!url || !url.startsWith('file://')) return null;
  const filePath = fileURLToPath(url);
  if (!filePath.startsWith(root)) return null;
  const rel = relative(root, filePath).replaceAll('\\', '/');
  if (!rel) return null;
  if (rel.includes('node_modules/')) return null;
  if (!(rel.startsWith('src/') || rel.startsWith('api/') || rel.startsWith('tests/'))) return null;
  if (!(rel.endsWith('.ts') || rel.endsWith('.tsx') || rel.endsWith('.js') || rel.endsWith('.jsx'))) return null;
  return rel;
}

for (const fileName of readdirSync(rawDir)) {
  if (!fileName.endsWith('.json')) continue;
  const payload = JSON.parse(readFileSync(join(rawDir, fileName), 'utf8'));
  for (const script of payload.result ?? []) {
    const rel = normalizeUrl(script.url);
    if (!rel) continue;
    const stat = fileStats.get(rel) ?? { coveredBytes: 0, totalBytes: 0, functions: 0, coveredFunctions: 0 };

    for (const fn of script.functions ?? []) {
      stat.functions += 1;
      const fnCovered = (fn.ranges ?? []).some((range) => range.count > 0);
      if (fnCovered) stat.coveredFunctions += 1;

      for (const range of fn.ranges ?? []) {
        const size = Math.max(0, range.endOffset - range.startOffset);
        stat.totalBytes += size;
        if (range.count > 0) stat.coveredBytes += size;
      }
    }

    fileStats.set(rel, stat);
  }
}

const files = [...fileStats.entries()]
  .map(([file, stat]) => ({
    file,
    coveredBytes: stat.coveredBytes,
    totalBytes: stat.totalBytes,
    byteCoverage: stat.totalBytes > 0 ? Number(((stat.coveredBytes / stat.totalBytes) * 100).toFixed(2)) : 0,
    functions: stat.functions,
    coveredFunctions: stat.coveredFunctions,
    functionCoverage: stat.functions > 0 ? Number(((stat.coveredFunctions / stat.functions) * 100).toFixed(2)) : 0,
  }))
  .sort((a, b) => a.file.localeCompare(b.file));

const totals = files.reduce((acc, file) => {
  acc.coveredBytes += file.coveredBytes;
  acc.totalBytes += file.totalBytes;
  acc.functions += file.functions;
  acc.coveredFunctions += file.coveredFunctions;
  return acc;
}, { coveredBytes: 0, totalBytes: 0, functions: 0, coveredFunctions: 0 });

totals.byteCoverage = totals.totalBytes > 0 ? Number(((totals.coveredBytes / totals.totalBytes) * 100).toFixed(2)) : 0;
totals.functionCoverage = totals.functions > 0 ? Number(((totals.coveredFunctions / totals.functions) * 100).toFixed(2)) : 0;

const summary = {
  status: shouldFailOnThreshold && totals.byteCoverage < minimumBytes ? 'threshold_failed' : 'passed',
  metric: 'V8 byte coverage snapshot',
  note: 'This is a dependency-free baseline coverage report for CI gating. It is not a replacement for future Istanbul/LCOV line coverage.',
  threshold: {
    byteCoverageMinimumPercent: minimumBytes,
    failOnThreshold: shouldFailOnThreshold,
  },
  commandResults,
  totals,
  files,
  startedAt,
  finishedAt: new Date().toISOString(),
};

writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

const markdown = [
  '# Coverage Summary',
  '',
  `Status: ${summary.status}`,
  '',
  `Metric: ${summary.metric}`,
  '',
  `Total byte coverage: ${totals.byteCoverage}%`,
  `Total function coverage: ${totals.functionCoverage}%`,
  `Threshold: ${minimumBytes}% byte coverage`,
  '',
  '## Commands',
  '',
  ...commandResults.map((item) => `- ${item.command}: ${item.status === 0 ? 'passed' : `failed (${item.status})`}`),
  '',
  '## Lowest covered files',
  '',
  '| File | Byte coverage | Function coverage |',
  '|---|---:|---:|',
  ...files
    .filter((file) => file.totalBytes > 0)
    .sort((a, b) => a.byteCoverage - b.byteCoverage)
    .slice(0, 20)
    .map((file) => `| ${file.file} | ${file.byteCoverage}% | ${file.functionCoverage}% |`),
  '',
  summary.note,
  '',
].join('\n');

writeFileSync(markdownPath, markdown);

console.log(`Coverage summary written to ${summaryPath}`);
console.log(`Coverage markdown written to ${markdownPath}`);
console.log(`Total byte coverage: ${totals.byteCoverage}%`);

if (summary.status === 'threshold_failed') {
  console.error(`Coverage threshold failed: ${totals.byteCoverage}% < ${minimumBytes}%`);
  process.exit(1);
}
