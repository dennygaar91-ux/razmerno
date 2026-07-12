import assert from "node:assert/strict";

import { mapOrderRow } from "../api/_shared/admin-orders";
import {
  buildCustomerOrderPricingSummary,
  CUSTOMER_ORDER_DETAIL_FORBIDDEN_RESPONSE_KEYS,
  mapCustomerOrderDetail,
} from "../api/_shared/customer-order-detail-types";
import { mapWorkspaceOrder } from "../api/_shared/customer-workspace-types";
import { mapOperationsManualPricingDraft } from "../api/_shared/operations-manual-pricing-draft-types";
import { buildOperationsOrderReview } from "../api/_shared/operations-order-review-types";
import {
  buildOperationsWorkspace,
  mapOperationsWorkspaceOrder,
} from "../api/_shared/operations-workspace-types";
import {
  assertStoredOrderPricingSnapshotConsistent,
  readStoredOrderPricingSnapshot,
} from "../api/_shared/stored-order-pricing-snapshot";
import {
  calculateServerOrderPriceResolved,
  withServerPrice,
} from "../api/_shared/server-price";
import { toOrderDbInsert } from "../api/_shared/order-db";
import { buildProductionExportFromOrder } from "../src/constructor/production/orderExportPackage";
import { calculateCatalogPrice, type CatalogPriceInput } from "../src/pricing/engine";
import { calculateAssemblyQuote } from "../src/pricing/assembly";
import { calculateDeliveryQuote } from "../src/pricing/delivery";
import { makeDeliveryOrder, makeValidOrder } from "./fixtures/order-contract-fixture";
import { ORDER_SUBMIT_TEST_USER_ID } from "../api/_shared/order-submit-auth";

type AsyncTest = () => void | Promise<void>;

const tests: Array<{ name: string; run: AsyncTest }> = [];

function test(name: string, run: AsyncTest) {
  tests.push({ name, run });
}

const pricingParityBaseInput: CatalogPriceInput = {
  type: "wardrobe",
  dimensions: { width: 1800, height: 2200, depth: 600 },
  sections: 2,
  filling: { shelves: 4, drawers: 0, hangingRod: true },
  facadeStyleMultiplier: 1,
  hardwareLevel: "base",
};

function makeStoredOrderDbRow(overrides: Record<string, unknown> = {}) {
  return {
    order_id: "RZ-20260708-7001",
    status: "new",
    domain_status: "Проверка",
    created_at: "2026-07-08T10:00:00.000Z",
    updated_at: "2026-07-08T11:00:00.000Z",
    product_type: "wardrobe",
    dimensions: { width: 1800, height: 2200, depth: 600 },
    total_price: 86_400,
    price_breakdown: {
      body: 50_000,
      facades: 20_000,
      delivery: 1_500,
      assembly: 7_980,
    },
    delivery_enabled: true,
    delivery_price: 1_500,
    delivery_address: "Москва, ул. Пример, 1",
    assembly_enabled: true,
    assembly_price: 7_980,
    assembly_base_price: 77_920,
    customer_name: "Иван Петров",
    customer_phone: "+7 999 111-22-33",
    customer_email: "client@example.com",
    manager_email_status: "sent",
    customer_email_status: "pending",
    production_export: {
      review: { status: "requires-review" },
      validation: { errors: [], warnings: [] },
      rules: { autoRejects: [], autoWarnings: [] },
    },
    catalog_source_used: "supabase",
    pricing_source_diagnostic: "supabase_success",
    pricing_fallback_reason: null,
    ...overrides,
  };
}

function mapCrossSurfacePricing(row: ReturnType<typeof makeStoredOrderDbRow>) {
  const adminSummary = mapOrderRow(row);
  const operationsReview = buildOperationsOrderReview(adminSummary, row.production_export);
  const operationsWorkspaceOrder = mapOperationsWorkspaceOrder(adminSummary);
  const customerDetailRow = {
    id: "660e8400-e29b-41d4-a716-446655440030",
    user_id: ORDER_SUBMIT_TEST_USER_ID,
    public_order_number: "RZM_0007",
    domain_status: row.domain_status,
    created_at: row.created_at,
    total_price: row.total_price,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    delivery_address: row.delivery_address,
    delivery_enabled: row.delivery_enabled,
    delivery_price: row.delivery_price,
    assembly_enabled: row.assembly_enabled,
    assembly_price: row.assembly_price,
    product_type: row.product_type,
    dimensions: row.dimensions,
    materials: { bodyId: "white-matt", facadeId: "white-matt" },
    style: { facadeStyleId: "regular", hardwareId: "base" },
    sections: 2,
    filling: { shelves: 4, drawers: 0, hangingRod: true },
    price_breakdown: row.price_breakdown,
  };
  const customerDetail = mapCustomerOrderDetail(customerDetailRow);
  const customerPricing = buildCustomerOrderPricingSummary(customerDetailRow);
  const workspaceOrder = mapWorkspaceOrder({
    id: customerDetailRow.id,
    order_id: row.order_id,
    public_order_number: customerDetailRow.public_order_number,
    domain_status: row.domain_status,
    created_at: row.created_at,
    total_price: row.total_price,
    customer_name: row.customer_name,
    delivery_address: row.delivery_address,
    delivery_enabled: row.delivery_enabled,
  });

  return {
    adminSummary,
    operationsReview,
    operationsWorkspaceOrder,
    customerDetail,
    customerPricing,
    workspaceOrder,
  };
}

test("P0-13 stored snapshot contract: customer, workspace, operations review and workspace share total price", () => {
  const row = makeStoredOrderDbRow();
  const surfaces = mapCrossSurfacePricing(row);
  const snapshot = readStoredOrderPricingSnapshot(row);

  assertStoredOrderPricingSnapshotConsistent(snapshot);
  assert.equal(surfaces.adminSummary.totalPrice, row.total_price);
  assert.equal(surfaces.operationsReview.totalPrice, row.total_price);
  assert.equal(surfaces.operationsWorkspaceOrder.totalPrice, row.total_price);
  assert.equal(surfaces.customerDetail.totalPrice, row.total_price);
  assert.equal(surfaces.workspaceOrder.totalPrice, row.total_price);
});

test("P0-13 stored snapshot contract: delivery and assembly parts align across customer and operations read models", () => {
  const row = makeStoredOrderDbRow();
  const surfaces = mapCrossSurfacePricing(row);

  assert.equal(surfaces.customerPricing.deliveryTotal, row.delivery_price);
  assert.equal(surfaces.customerPricing.assemblyTotal, row.assembly_price);
  assert.equal(surfaces.adminSummary.delivery.price, row.delivery_price);
  assert.equal(surfaces.adminSummary.assembly.price, row.assembly_price);
  assert.equal(surfaces.operationsReview.deliverySummary.includes("₽"), true);
  assert.equal(surfaces.operationsReview.assemblySummary.includes("₽"), true);
  assert.equal(
    surfaces.customerPricing.furnitureTotal + (surfaces.customerPricing.deliveryTotal ?? 0) + (surfaces.customerPricing.assemblyTotal ?? 0),
    row.total_price,
  );
});

test("P0-03 pricing source lock: operations review exposes persisted catalog source without recalculation", () => {
  const row = makeStoredOrderDbRow({
    catalog_source_used: "seed_fallback",
    pricing_source_diagnostic: "supabase_failed",
    pricing_fallback_reason: "supabase_fetch_failed",
  });
  const adminSummary = mapOrderRow(row);
  const review = buildOperationsOrderReview(adminSummary, row.production_export);

  assert.equal(review.pricingLabel, "final server snapshot");
  assert.equal(review.pricingSource, "seed_fallback");
  assert.equal(review.totalPrice, row.total_price);
  assert.match(review.pricingSnapshotSummary, /persisted total\/delivery\/assembly from stored order snapshot/);
  assert.match(review.pricingSnapshotSummary, /diagnostic: supabase_failed/);
  assert.match(review.pricingSnapshotSummary, /fallback: supabase_fetch_failed/);
});

test("P0-13 manual pricing boundary: operations draft does not replace stored order total", () => {
  const row = makeStoredOrderDbRow();
  const adminSummary = mapOrderRow(row);
  const review = buildOperationsOrderReview(adminSummary, row.production_export);
  const manualDraft = mapOperationsManualPricingDraft({
    id: "draft-1",
    order_id: row.order_id,
    manual_total_price: 123_000,
    reason: "internal adjustment",
    status: "draft",
    created_by: "operations",
    updated_by: "operations",
    created_at: "2026-07-08T12:00:00.000Z",
    updated_at: "2026-07-08T12:00:00.000Z",
  });

  const reviewWithDraft = { ...review, manualPricingDraft: manualDraft };

  assert.equal(reviewWithDraft.totalPrice, row.total_price);
  assert.notEqual(reviewWithDraft.manualPricingDraft?.manualTotalPrice, row.total_price);
  assert.equal(reviewWithDraft.manualPricingDraft?.status, "draft");
});

test("P0-13 customer boundary: order detail DTO does not expose manual pricing or pricing diagnostics", () => {
  const row = makeStoredOrderDbRow();
  const surfaces = mapCrossSurfacePricing(row);
  const serialized = JSON.stringify(surfaces.customerDetail);

  for (const key of CUSTOMER_ORDER_DETAIL_FORBIDDEN_RESPONSE_KEYS) {
    assert.doesNotMatch(serialized, new RegExp(`"${key}"`));
  }
  assert.doesNotMatch(serialized, /manualPricing|manual_total_price|catalog_source_used|pricing_source/i);
});

test("P0-13 quote/order/stored parity: server recompute aligns client quote, persisted insert and read models", async () => {
  const order = makeDeliveryOrder("Москва, ул. Тверская, 1");
  const clientBase = calculateCatalogPrice(pricingParityBaseInput);
  const clientDelivery = calculateDeliveryQuote(true, order.delivery?.address ?? "");
  const clientAssembly = calculateAssemblyQuote(false, clientBase.total);
  const clientTotal = clientBase.total + clientDelivery.price + clientAssembly.price;

  const productionExport = buildProductionExportFromOrder(order);
  const resolved = await calculateServerOrderPriceResolved({ body: order, productionExport });
  const persistedBody = withServerPrice({ ...order, productionExport }, resolved.price);
  const dbInsert = toOrderDbInsert({
    orderId: order.orderId ?? "RZ-20260708-7002",
    body: persistedBody,
    userAgent: "contract-test",
    clientIp: "203.0.113.1",
    pricingAttribution: {
      catalog_source_used: resolved.catalogSourceUsed,
      pricing_source_diagnostic: resolved.source,
      pricing_fallback_reason: resolved.fallbackReason,
    },
    userId: ORDER_SUBMIT_TEST_USER_ID,
    publicOrderNumber: "RZM_0008",
  });

  assert.equal(resolved.price.total, clientTotal);
  assert.equal(dbInsert.total_price, resolved.price.total);
  assert.equal(dbInsert.delivery_price, resolved.price.delivery);
  assert.equal(dbInsert.assembly_price, resolved.price.assembly ?? 0);

  const surfaces = mapCrossSurfacePricing({
    ...makeStoredOrderDbRow(),
    order_id: dbInsert.order_id,
    total_price: dbInsert.total_price,
    delivery_enabled: dbInsert.delivery_enabled,
    delivery_price: dbInsert.delivery_price,
    assembly_enabled: dbInsert.assembly_enabled,
    assembly_price: dbInsert.assembly_price,
    assembly_base_price: dbInsert.assembly_base_price,
    price_breakdown: dbInsert.price_breakdown as Record<string, number>,
    catalog_source_used: dbInsert.catalog_source_used,
    pricing_source_diagnostic: dbInsert.pricing_source_diagnostic,
    pricing_fallback_reason: dbInsert.pricing_fallback_reason,
  });

  assert.equal(surfaces.customerDetail.totalPrice, resolved.price.total);
  assert.equal(surfaces.operationsReview.totalPrice, resolved.price.total);
  assert.equal(surfaces.workspaceOrder.totalPrice, resolved.price.total);
});

test("P0-13 production/export boundary: production export payload does not embed client-submitted totals", async () => {
  const order = makeValidOrder({
    totalPrice: 101,
    priceBreakdown: {
      body: 1,
      facades: 1,
      filling: 1,
      hardware: 1,
      production: 1,
      materials: 1,
      edgeBanding: 1,
      services: 1,
      delivery: 1,
      assembly: 1,
    },
  });
  const productionExport = buildProductionExportFromOrder(order);
  const resolved = await calculateServerOrderPriceResolved({ body: order, productionExport });

  assert.notEqual(resolved.price.total, order.totalPrice);
  assert.doesNotMatch(JSON.stringify(productionExport), /"totalPrice"|"priceBreakdown"/);
});

test("P0-13 operations workspace aggregate uses stored totals only", () => {
  const rows = [
    makeStoredOrderDbRow({ order_id: "RZ-20260708-7003", total_price: 50_000 }),
    makeStoredOrderDbRow({ order_id: "RZ-20260708-7004", total_price: 60_000 }),
  ].map(mapOrderRow);

  const workspace = buildOperationsWorkspace(rows);

  assert.equal(workspace.stats.total, 2);
  assert.equal(workspace.orders[0]?.totalPrice, 50_000);
  assert.equal(workspace.orders[1]?.totalPrice, 60_000);
});

async function runTests() {
  for (const item of tests) {
    await item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

void runTests();
