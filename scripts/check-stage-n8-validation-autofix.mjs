import { readFileSync } from "node:fs";

const page = readFileSync("src/static-pages/Constructor3DPage.tsx", "utf8");
const store = readFileSync("src/static-pages/constructor/store/constructorStore.ts", "utf8");
const css = readFileSync("src/styles/constructor3d.css", "utf8");
const pkg = readFileSync("package.json", "utf8");

const required = [
  [page.includes('data-stage="N8"'), "Constructor3DPage must expose N8 stage marker"],
  [page.includes("ValidationAssist"), "Constructor3DPage must render validation assist"],
  [page.includes("InlineIssue"), "Constructor3DPage must render inline selected-zone issue"],
  [page.includes("disabled={checkoutBlocked}"), "checkout CTA must respect validation status"],
  [store.includes("applyAutoFixForIssue"), "store must expose auto-fix action"],
  [css.includes("Stage N8"), "constructor3d.css must include N8 scoped styles"],
  [pkg.includes("test:validation-autofix"), "package.json must expose N8 auto-fix test"],
];

const failed = required.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, message] of failed) console.error(`✗ ${message}`);
  process.exit(1);
}
console.log("Stage N8 validation/auto-fix checks passed");
