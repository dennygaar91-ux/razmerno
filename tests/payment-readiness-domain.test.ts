import assert from "node:assert/strict";

import { mapCustomerOrderDetail } from "../api/_shared/customer-order-detail-types";
import type { CustomerOrderDetailRow } from "../api/_shared/customer-order-detail-types";
import { CUSTOMER_ORDER_STATUS_FORBIDDEN_RESPONSE_KEYS } from "../api/_shared/customer-order-status";
import {
  MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS,
  OPERATIONS_APPROVED_DOMAIN_STATUS,
} from "../api/_shared/order-domain";
import { buildOperationsOrderReview } from "../api/_shared/operations-order-review-types";
import type { AdminOrderSummary } from "../api/_shared/admin-orders";
import {
  canTransitionPaymentDomainStatus,
  derivePaymentReadinessState,
  isManualPaymentConfirmationAllowedForDomainStatus,
  isPaymentInstructionsVisibleForState,
  PAYMENT_READINESS_FORBIDDEN_RESPONSE_KEYS,
} from "../api/_shared/payment-readiness-domain";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const sampleOrderRow: CustomerOrderDetailRow = {
  id: "660e8400-e29b-41d4-a716-446655440030",
  user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  public_order_number: "RZM_0001",
  domain_status: OPERATIONS_APPROVED_DOMAIN_STATUS,
  created_at: "2026-07-07T10:00:00.000Z",
  total_price: 79_800,
  customer_name: "Иван Петров",
  customer_phone: "+7 999 111-22-33",
  delivery_address: "Москва",
  delivery_enabled: true,
  delivery_price: 6_000,
  assembly_enabled: false,
  assembly_price: null,
  product_type: "wardrobe",
  dimensions: { width: 1800, height: 2200, depth: 600 },
  materials: null,
  style: null,
  sections: null,
  filling: null,
  price_breakdown: null,
};

const sampleAdminOrder: AdminOrderSummary = {
  id: "RZ-20260707-1001",
  status: "in_progress",
  domainStatus: OPERATIONS_APPROVED_DOMAIN_STATUS,
  createdAt: "2026-07-07T10:00:00.000Z",
  updatedAt: "2026-07-07T11:00:00.000Z",
  product: "Шкаф 1800×2200×600 мм",
  totalPrice: 79_800,
  priceBreakdown: {},
  customer: {
    nameMasked: "И*** П***",
    phoneMasked: "+7 *** ***-**-33",
    emailMasked: "i***@example.com",
  },
  delivery: { enabled: true, price: 6_000, addressMasked: "Москва" },
  assembly: { enabled: false, price: 0, basePrice: null },
  pricing: { status: "final server snapshot", source: "seed", diagnostic: null, fallbackReason: null },
  email: { manager: "pending", customer: "pending" },
};

test("Оплата maps to awaiting_manual_confirmation", () => {
  assert.equal(derivePaymentReadinessState(OPERATIONS_APPROVED_DOMAIN_STATUS), "awaiting_manual_confirmation");
  assert.equal(isPaymentInstructionsVisibleForState("awaiting_manual_confirmation"), true);
});

test("В работе maps to confirmed payment state", () => {
  assert.equal(derivePaymentReadinessState(MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS), "confirmed");
  assert.equal(isPaymentInstructionsVisibleForState("confirmed"), false);
});

test("non-payment statuses return not_applicable", () => {
  assert.equal(derivePaymentReadinessState("Проверка"), "not_applicable");
  assert.equal(derivePaymentReadinessState("Отмена"), "not_applicable");
  assert.equal(isManualPaymentConfirmationAllowedForDomainStatus("Проверка"), false);
});

test("transition helper rejects invalid statuses", () => {
  assert.equal(
    canTransitionPaymentDomainStatus(OPERATIONS_APPROVED_DOMAIN_STATUS, MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS),
    true,
  );
  assert.equal(canTransitionPaymentDomainStatus("Проверка", MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS), false);
  assert.equal(canTransitionPaymentDomainStatus(OPERATIONS_APPROVED_DOMAIN_STATUS, "Отмена"), false);
});

test("customer order detail DTO exposes safe paymentState only", () => {
  const mapped = mapCustomerOrderDetail(sampleOrderRow);
  assert.equal(mapped.paymentState, "awaiting_manual_confirmation");
  assert.equal(mapped.status.label, "Ожидает оплаты");
  assert.equal(mapped.status.stage, "payment");

  const serialized = JSON.stringify(mapped);
  for (const key of PAYMENT_READINESS_FORBIDDEN_RESPONSE_KEYS) {
    assert.doesNotMatch(serialized, new RegExp(`"${key}"`));
  }
  for (const key of CUSTOMER_ORDER_STATUS_FORBIDDEN_RESPONSE_KEYS) {
    assert.doesNotMatch(serialized, new RegExp(`"${key}"`));
  }
});

test("operations review DTO exposes paymentState and confirmation eligibility", () => {
  const review = buildOperationsOrderReview(sampleAdminOrder, null);
  assert.equal(review.paymentState, "awaiting_manual_confirmation");
  assert.equal(review.paymentConfirmationAllowed, true);

  const reviewAfterConfirm = buildOperationsOrderReview(
    { ...sampleAdminOrder, domainStatus: MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS },
    null,
  );
  assert.equal(reviewAfterConfirm.paymentState, "confirmed");
  assert.equal(reviewAfterConfirm.paymentConfirmationAllowed, false);
});

async function runAll() {
  for (const { name, run } of tests) {
    await run();
    console.log(`✓ ${name}`);
  }
  console.log(`${tests.length} payment readiness domain tests passed.`);
}

runAll().catch((error) => {
  console.error(error);
  process.exit(1);
});
