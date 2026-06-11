import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const hook = readFileSync("src/configurator/checkout/useCheckoutSubmit.ts", "utf8");
const drawer = readFileSync("src/configurator/CheckoutDrawer.tsx", "utf8");

assert.ok(hook.includes("export function useCheckoutSubmit"));
assert.ok(hook.includes("submitOrder(buildCheckoutOrderPayload"));
assert.ok(hook.includes("validateCustomer"));
assert.ok(hook.includes("validateDelivery"));
assert.ok(hook.includes("validateAssembly"));
assert.ok(drawer.includes("useCheckoutSubmit"));
assert.ok(!drawer.includes("submitOrder("));
assert.ok(!drawer.includes("buildCheckoutOrderPayload("));

console.log("Checkout submit hook test passed.");
