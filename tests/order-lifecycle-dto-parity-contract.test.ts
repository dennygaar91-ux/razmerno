import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  INITIAL_ORDER_DOMAIN_STATUS,
  MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS,
  OPERATIONS_APPROVED_DOMAIN_STATUS,
  OPERATIONS_REJECTED_DOMAIN_STATUS,
  ORDER_COMPLETED_DOMAIN_STATUS,
} from "../api/_shared/order-domain";
import { mapCustomerOrderStatus } from "../api/_shared/customer-order-status";
import { mapOperationsWorkspaceOrder } from "../api/_shared/operations-workspace-types";
import type { AdminOrderSummary } from "../api/_shared/admin-orders";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const MVP_DOMAIN_STATUSES = [
  INITIAL_ORDER_DOMAIN_STATUS,
  OPERATIONS_APPROVED_DOMAIN_STATUS,
  MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS,
  ORDER_COMPLETED_DOMAIN_STATUS,
  OPERATIONS_REJECTED_DOMAIN_STATUS,
] as const;

function makeAdminSummary(domainStatus: string): AdminOrderSummary {
  return {
    id: "RZ-20260705-1001",
    status: "new",
    domainStatus,
    createdAt: "2026-07-05T10:00:00.000Z",
    updatedAt: "2026-07-05T11:30:00.000Z",
    product: "Шкаф 1800×2400×600",
    totalPrice: 86_400,
    priceBreakdown: { body: 50_000 },
    delivery: { enabled: true, price: 1_500, addressMasked: "Адрес скрыт" },
    assembly: { enabled: true, price: 7_980, basePrice: 79_800 },
    pricing: {
      status: "final server snapshot",
      source: "supabase",
      diagnostic: null,
      fallbackReason: null,
    },
    customer: {
      nameMasked: "И•••",
      phoneMasked: "+7 *** ***-67",
      emailMasked: "i***@example.com",
    },
    email: { manager: "sent", customer: "pending" },
    production: {
      status: "requires-review",
      warnings: 0,
      rejects: 0,
      repairs: 0,
      revision: 0,
      manualAllowed: false,
    },
  };
}

for (const domainStatus of MVP_DOMAIN_STATUSES) {
  test(`lifecycle DTO parity: ${domainStatus} maps consistently across customer and operations`, () => {
    const customerStatus = mapCustomerOrderStatus(domainStatus);
    const opsOrder = mapOperationsWorkspaceOrder(makeAdminSummary(domainStatus));

    assert.equal(opsOrder.domainStatus, domainStatus);
    assert.ok(customerStatus.label.length > 0, "customer label required");
    assert.ok(customerStatus.stage.length > 0, "customer stage required");
    assert.ok(customerStatus.description.length > 0, "customer description required");
  });
}

test("lifecycle DTO parity: operations workspace order exposes domainStatus not customer label", () => {
  const opsOrder = mapOperationsWorkspaceOrder(makeAdminSummary(INITIAL_ORDER_DOMAIN_STATUS));
  const customerStatus = mapCustomerOrderStatus(INITIAL_ORDER_DOMAIN_STATUS);
  assert.equal(opsOrder.domainStatus, INITIAL_ORDER_DOMAIN_STATUS);
  assert.equal(customerStatus.label, "На проверке");
  assert.notEqual(opsOrder.domainStatus, customerStatus.label);
});

test("lifecycle DTO parity: customer detail and operations review tests reference same domain constants", () => {
  const customerDetail = readFileSync("tests/customer-order-detail.test.ts", "utf8");
  const opsReview = readFileSync("tests/operations-order-review.test.ts", "utf8");
  const orderDomain = readFileSync("api/_shared/order-domain.ts", "utf8");

  for (const status of MVP_DOMAIN_STATUSES) {
    assert.match(orderDomain, new RegExp(status.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(customerDetail, /mapCustomerOrderStatus/);
  assert.match(opsReview, /domainStatus/);
});

test("lifecycle DTO parity: operations-only fields stay out of customer status mapping", () => {
  const customerStatus = mapCustomerOrderStatus(OPERATIONS_APPROVED_DOMAIN_STATUS);
  const serialized = JSON.stringify(customerStatus);
  assert.doesNotMatch(serialized, /manualPricingDraft|production_export|price_breakdown/i);
  assert.doesNotMatch(serialized, /reviewDecisionAllowed|paymentConfirmationAllowed/i);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
