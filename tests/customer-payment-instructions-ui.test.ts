import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getCustomerPaymentInstructionsAwaitingLine,
  getCustomerPaymentInstructionsManagerLine,
  getCustomerPaymentInstructionsVerifiedLine,
  isCustomerPaymentInstructionsVisible,
} from "../src/shared/workspace/paymentInstructionsTypes";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

test("payment instructions render for awaiting_manual_confirmation", () => {
  const section = readFileSync("src/static-pages/account/CustomerPaymentInstructionsSection.tsx", "utf8");
  const orderCard = readFileSync("src/static-pages/account/CustomerOrderDetailCard.tsx", "utf8");

  assert.equal(isCustomerPaymentInstructionsVisible("awaiting_manual_confirmation"), true);
  assert.match(section, /data-testid="customer-payment-instructions"/);
  assert.match(section, /getCustomerPaymentInstructionsVerifiedLine/);
  assert.match(section, /getCustomerPaymentInstructionsAwaitingLine/);
  assert.match(section, /getCustomerPaymentInstructionsManagerLine/);
  assert.equal(getCustomerPaymentInstructionsVerifiedLine(), "Заявка проверена");
  assert.equal(getCustomerPaymentInstructionsAwaitingLine(), "Ожидает оплаты");
  assert.match(orderCard, /CustomerPaymentInstructionsSection/);
  assert.match(orderCard, /paymentState=\{order\.paymentState\}/);
});

test("block does not render for not_applicable (На проверке)", () => {
  const section = readFileSync("src/static-pages/account/CustomerPaymentInstructionsSection.tsx", "utf8");
  assert.equal(isCustomerPaymentInstructionsVisible("not_applicable"), false);
  assert.match(section, /return null/);
});

test("block does not render for confirmed/cancelled-equivalent states", () => {
  assert.equal(isCustomerPaymentInstructionsVisible("confirmed"), false);
});

test("no real payment form or card fields", () => {
  const section = readFileSync("src/static-pages/account/CustomerPaymentInstructionsSection.tsx", "utf8");
  const orderCard = readFileSync("src/static-pages/account/CustomerOrderDetailCard.tsx", "utf8");

  assert.doesNotMatch(section, /card|stripe|paypal|acquiring|type="number"/i);
  assert.doesNotMatch(orderCard, /createClient|supabase/i);
});

test("frontend uses API read model only", () => {
  const api = readFileSync("src/shared/workspace/orderDetailApi.ts", "utf8");
  const hook = readFileSync("src/shared/workspace/useCustomerOrderDetail.ts", "utf8");
  assert.match(api, /\/api\/customer\/order/);
  assert.match(hook, /fetchCustomerOrderDetail/);
  assert.doesNotMatch(hook, /createClient|supabase/i);
});

async function runAll() {
  for (const { name, run } of tests) {
    await run();
    console.log(`✓ ${name}`);
  }
  console.log(`${tests.length} customer payment instructions UI tests passed.`);
}

runAll().catch((error) => {
  console.error(error);
  process.exit(1);
});
