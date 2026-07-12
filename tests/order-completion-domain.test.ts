import assert from "node:assert/strict";

import {
  canTransitionOrderCompletionDomainStatus,
  isOrderCompletionAllowedForDomainStatus,
} from "../api/_shared/order-completion-domain";
import {
  MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS,
  ORDER_COMPLETED_DOMAIN_STATUS,
} from "../api/_shared/order-domain";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

test("В работе allows order completion", () => {
  assert.equal(isOrderCompletionAllowedForDomainStatus(MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS), true);
});

test("other statuses reject order completion", () => {
  assert.equal(isOrderCompletionAllowedForDomainStatus("Оплата"), false);
  assert.equal(isOrderCompletionAllowedForDomainStatus("Проверка"), false);
  assert.equal(isOrderCompletionAllowedForDomainStatus(ORDER_COMPLETED_DOMAIN_STATUS), false);
  assert.equal(isOrderCompletionAllowedForDomainStatus("Отмена"), false);
});

test("transition helper accepts В работе to Завершено only", () => {
  assert.equal(
    canTransitionOrderCompletionDomainStatus(
      MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS,
      ORDER_COMPLETED_DOMAIN_STATUS,
    ),
    true,
  );
  assert.equal(canTransitionOrderCompletionDomainStatus("Оплата", ORDER_COMPLETED_DOMAIN_STATUS), false);
  assert.equal(
    canTransitionOrderCompletionDomainStatus(MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS, "Отмена"),
    false,
  );
});

async function runAll() {
  for (const { name, run } of tests) {
    await run();
    console.log(`ok - ${name}`);
  }
  console.log(`${tests.length} order completion domain tests passed.`);
}

runAll().catch((error) => {
  console.error(error);
  process.exit(1);
});
