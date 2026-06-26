import assert from "node:assert/strict";
import { test } from "node:test";
import { mapApiOrder } from "../src/admin/format.js";
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
    pricingSource: "source attribution not persisted",
    pricingSnapshotSummary: "persisted total/delivery/assembly from stored order snapshot",
    priceBreakdownSummary: "stored breakdown keys: body, facades, delivery, assembly",
    total: "86 400 ₽",
    createdAt: "2026-05-26T10:42:00.000Z",
    delivery: "1 500 ₽ · адрес скрыт",
    assembly: "7 980 ₽",
    assemblyBasePrice: "79 800 ₽",
    managerEmail: "sent",
    customerEmail: "pending",
    production: "requires-review · W1/R0/A0 · rev.1",
    productionStatus: "requires-review",
    ...overrides,
  };
}

function normalizeSpaces(value: string): string {
  return value.replace(/\s/gu, " ");
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
      pricingSnapshotSummary: undefined,
      priceBreakdownSummary: undefined,
      assemblyBasePrice: undefined,
      managerEmail: "",
      customerEmail: "",
    }),
  );

  assert.equal(summary.dimensionsSummary, "не указано");
  assert.equal(summary.materialsSummary, "not available in current admin payload");
  assert.equal(summary.pricingLabel, "demo / not verified");
  assert.equal(summary.pricingSource, "pricing source not verified");
  assert.equal(summary.pricingSnapshotSummary, "pricing snapshot details not available");
  assert.equal(summary.priceBreakdownSummary, "stored breakdown not available in current admin payload");
  assert.equal(summary.assemblyBasePriceSummary, "not available in current admin payload");
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

test("demo order is not marked final", () => {
  const summary = summarizeOrderForAdmin(
    makeOrder({
      pricingLabel: "demo / not verified",
      pricingSource: "pricing source not verified",
      pricingSnapshotSummary: "pricing snapshot details not available",
    }),
  );

  assert.equal(summary.pricingLabel, "demo / not verified");
  assert.notEqual(summary.pricingLabel, "final server snapshot");
  assert.equal(summary.pricingSource, "pricing source not verified");
});

test("API mapped admin order uses persisted server snapshot as final", () => {
  const row = mapApiOrder({
    id: "RZ-20260626-5001",
    status: "new",
    createdAt: "2026-06-26T10:00:00.000Z",
    product: "Шкаф 1800×2400×600",
    totalPrice: 123456,
    priceBreakdown: {
      body: 10000,
      facades: 20000,
      filling: 3000,
      hardware: 4000,
      production: 5000,
      delivery: 6000,
      assembly: 7000,
      materials: 80000,
      edgeBanding: 900,
      services: 1556,
    },
    delivery: { enabled: true, price: 6000, addressMasked: "Адрес скрыт" },
    assembly: { enabled: true, price: 7000, basePrice: 110456 },
    pricing: { status: "final server snapshot", source: "source attribution not persisted" },
    customer: { nameMasked: "И•••", phoneMasked: "+7 *** ***-33", emailMasked: "c***@example.com" },
    email: { manager: "sent", customer: "pending" },
    production: { status: "requires-review", warnings: 0, rejects: 0, repairs: 0, revision: 1, manualAllowed: false },
  });

  assert.equal(normalizeSpaces(row.total), "123 456 ₽");
  assert.equal(normalizeSpaces(row.delivery), "6 000 ₽ · Адрес скрыт");
  assert.equal(normalizeSpaces(row.assembly), "7 000 ₽");
  assert.equal(normalizeSpaces(row.assemblyBasePrice ?? ""), "110 456 ₽");
  assert.equal(row.pricingLabel, "final server snapshot");
  assert.equal(row.pricingSource, "source attribution not persisted");
});

test("missing source attribution is displayed safely", () => {
  const row = mapApiOrder({
    id: "RZ-20260626-5002",
    status: "new",
    createdAt: "2026-06-26T10:00:00.000Z",
    product: "Шкаф 1800×2400×600",
    totalPrice: 86400,
    priceBreakdown: null,
    delivery: { enabled: false, price: 0, addressMasked: null },
    assembly: { enabled: false, price: 0, basePrice: null },
    pricing: { status: "final server snapshot", source: "source attribution not persisted" },
    customer: { nameMasked: "И•••", phoneMasked: "+7 *** ***-33", emailMasked: "c***@example.com" },
    email: { manager: "sent", customer: "pending" },
    production: { status: "requires-review", warnings: 0, rejects: 0, repairs: 0, revision: 1, manualAllowed: false },
  });

  assert.equal(row.pricingSource, "source attribution not persisted");
  assert.equal(row.priceBreakdownSummary, "stored breakdown not available in current admin payload");
});

test("admin summary does not recalculate pricing", () => {
  const summary = summarizeOrderForAdmin(
    makeOrder({
      total: "123 456 ₽",
      delivery: "6 000 ₽ · адрес скрыт",
      assembly: "7 000 ₽",
      assemblyBasePrice: "110 456 ₽",
      pricingLabel: "final server snapshot",
      pricingSource: "source attribution not persisted",
      pricingSnapshotSummary: "persisted total/delivery/assembly from stored order snapshot",
      priceBreakdownSummary: "stored breakdown keys: body, facades, delivery, assembly",
    }),
  );

  assert.equal(summary.totalPrice, "123 456 ₽");
  assert.equal(summary.deliverySummary, "6 000 ₽ · адрес скрыт");
  assert.equal(summary.assemblySummary, "7 000 ₽");
  assert.equal(summary.assemblyBasePriceSummary, "110 456 ₽");
  assert.equal(summary.pricingSource, "source attribution not persisted");
  assert.equal(summary.priceBreakdownSummary, "stored breakdown keys: body, facades, delivery, assembly");
});

test("summarizeOrderForAdmin parses dimensions from product label", () => {
  const summary = summarizeOrderForAdmin(makeOrder({ dimensions: undefined, productType: undefined }));
  assert.equal(summary.dimensionsSummary, "1800×2400×600 мм");
  assert.equal(summary.productType, "Шкаф");
});
