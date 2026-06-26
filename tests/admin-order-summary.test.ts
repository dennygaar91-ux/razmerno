import assert from "node:assert/strict";
import { test } from "node:test";
import {
  maskEmail,
  maskPhone,
  maskCustomerName,
  summarizeOrderForAdmin,
  summarizeProductionInspection,
  summaryContainsRawPii,
} from "../src/admin/orderSummary.js";
import type { AdminOrderRow } from "../src/admin/types.js";

function makeOrder(overrides: Partial<AdminOrderRow> = {}): AdminOrderRow {
  return {
    id: "RZ-20260526-1042",
    status: "new",
    customer: "Иван Петров",
    phone: "+7 999 123-45-67",
    email: "ivan.petrov@example.com",
    product: "Шкаф 1800×2400×600",
    productType: "Шкаф",
    pricingLabel: "final server snapshot",
    pricingSource: "server-stored order total",
    total: "86 400 ₽",
    createdAt: "2026-05-26T10:42:00.000Z",
    delivery: "1 500 ₽ · адрес скрыт",
    assembly: "да",
    managerEmail: "sent",
    customerEmail: "pending",
    production: "requires-review · W1/R0/A0 · rev.1",
    productionStatus: "requires-review",
    ...overrides,
  };
}

test("maskEmail hides local part", () => {
  assert.equal(maskEmail("ivan.petrov@example.com"), "i***@example.com");
  assert.equal(maskEmail(""), "email скрыт");
});

test("maskPhone hides middle digits", () => {
  assert.equal(maskPhone("+7 999 123-45-67"), "+7 *** ***-67");
  assert.equal(maskPhone("12"), "+7 *** ***-**-**");
});

test("maskCustomerName minimizes visible characters", () => {
  assert.equal(maskCustomerName("Иван"), "И•••");
  assert.equal(maskCustomerName(""), "Клиент");
});

test("summarizeOrderForAdmin does not expose raw email/phone", () => {
  const summary = summarizeOrderForAdmin(makeOrder());
  assert.equal(summaryContainsRawPii(summary, { email: "ivan.petrov@example.com", phone: "+7 999 123-45-67" }), false);
  assert.ok(summary.emailMasked.includes("***"));
  assert.ok(summary.phoneMasked.includes("***"));
  assert.notEqual(summary.customerNameMasked, "Иван Петров");
});

test("missing optional fields fall back to explicit not verified states", () => {
  const summary = summarizeOrderForAdmin(
    makeOrder({
      product: "Шкаф",
      dimensions: undefined,
      materialsSummary: undefined,
      pricingLabel: undefined,
      pricingSource: undefined,
      managerEmail: "",
      customerEmail: "",
    }),
  );

  assert.equal(summary.dimensionsSummary, "не указано");
  assert.equal(summary.materialsSummary, "not available in current admin payload");
  assert.equal(summary.pricingLabel, "demo / not verified");
  assert.equal(summary.pricingSource, "pricing source not verified");
  assert.equal(summary.managerEmailStatus, "");
});

test("production/Basis status requires manual review and is not inferred from plan length", () => {
  const summary = summarizeProductionInspection({
    orderId: "RZ-20260526-1042",
    productionExport: {
      review: { status: "requires-review" },
      validation: { errors: ["e1"], warnings: ["w1", "w2"] },
      rules: { autoRejects: ["r1"], autoWarnings: ["aw1"] },
      basis: { plan: [{ title: "create-panels" }, { title: "apply-edge" }] },
    },
  });

  assert.equal(summary.productionReviewStatus, "requires-review");
  assert.equal(summary.basisStatus, "manual review required");
  assert.equal(summary.validationErrorsCount, 2);
  assert.equal(summary.validationWarningsCount, 3);
});

test("missing production detail keeps Basis as not verified", () => {
  const summary = summarizeProductionInspection(null);
  assert.equal(summary.basisStatus, "not verified");
  assert.equal(summary.validationErrorsCount, 0);
  assert.equal(summary.validationWarningsCount, 0);
});

test("demo or fallback pricing is not marked final", () => {
  const summary = summarizeOrderForAdmin(
    makeOrder({
      pricingLabel: "demo / not verified",
      pricingSource: "pricing source not verified",
    }),
  );

  assert.equal(summary.pricingLabel, "demo / not verified");
  assert.notEqual(summary.pricingLabel, "final server snapshot");
  assert.equal(summary.pricingSource, "pricing source not verified");
});

test("server-stored total may be marked final", () => {
  const summary = summarizeOrderForAdmin(makeOrder());

  assert.equal(summary.pricingLabel, "final server snapshot");
  assert.equal(summary.pricingSource, "server-stored order total");
});

test("summarizeOrderForAdmin parses dimensions from product label", () => {
  const summary = summarizeOrderForAdmin(makeOrder({ dimensions: undefined, productType: undefined }));
  assert.equal(summary.dimensionsSummary, "1800×2400×600 мм");
  assert.equal(summary.productType, "Шкаф");
});
