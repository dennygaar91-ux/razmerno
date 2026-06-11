import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "docs/handoff/technical-handoff-v69.md",
  "docs/handoff/commands-checklist-v69.md",
  "docs/handoff/visual-review-checklist-v69.md",
  "docs/handoff/handoff-index-v69.md",
  "docs/audit/css-usage-report-v68.md",
  "docs/audit/css-usage-report-v68.json",
  "docs/qa/browser-smoke-v67.md",
  "tests/browser/configurator.spec.ts",
];

for (const file of requiredFiles) {
  assert.ok(existsSync(file), `Missing handoff file: ${file}`);
}

const technical = readFileSync("docs/handoff/technical-handoff-v69.md", "utf8");
assert.ok(technical.includes("SVG fallback"));
assert.ok(technical.includes("Three.js"));
assert.ok(technical.includes("шкаф"));
assert.ok(technical.includes("тумба"));
assert.ok(technical.includes("комод"));
assert.ok(technical.includes("pricing engine"));
assert.ok(technical.includes("order flow"));

const checklist = readFileSync("docs/handoff/visual-review-checklist-v69.md", "utf8");
assert.ok(checklist.includes("/configurator"));
assert.ok(checklist.includes("3D / 2D"));
assert.ok(checklist.includes("390×844"));

const commands = readFileSync("docs/handoff/commands-checklist-v69.md", "utf8");
assert.ok(commands.includes("npm run typecheck"));
assert.ok(commands.includes("npm run build"));
assert.ok(commands.includes("npm run test:browser-smoke-static"));

console.log("Handoff pack checks passed.");
