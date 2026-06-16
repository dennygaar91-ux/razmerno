import { readFileSync } from "node:fs";

const testPath = "tests/browser/constructor-submit.spec.ts";
const source = readFileSync(testPath, "utf8");

const requiredFragments = [
  'page.goto("/configurator-3d")',
  'data-checkout-stage',
  '"STAGE15"',
  '"**/api/orders"',
  'headers()["idempotency-key"]',
  'payload.customer',
  'payload.delivery',
  'payload.assembly',
  'source).toBe("constructor-store-adapter")',
  'Заполните заявку',
  'Укажите российский номер',
  'P1-09 forced API failure',
];

const forbiddenFragments = [
  'page.goto("/configurator")',
  '.rzm-r19-workspace',
  '.rzm-constructor-stepper',
  'payload.contact',
  'payload.deliveryEnabled',
  'payload.deliveryAddress',
  'payload.assemblyEnabled',
];

let failed = false;

for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) {
    failed = true;
    console.error(`P1-09 guard failed: missing required fragment: ${fragment}`);
  }
}

for (const fragment of forbiddenFragments) {
  if (source.includes(fragment)) {
    failed = true;
    console.error(`P1-09 guard failed: stale fragment is still present: ${fragment}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("P1-09 Constructor3D submit E2E guard passed.");
