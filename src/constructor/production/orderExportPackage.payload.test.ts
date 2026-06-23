import assert from "node:assert/strict";
import test from "node:test";
import type { OrderRequest } from "../../../api/_shared/order-types.js";
import { buildProductionExportFromPayload } from "./orderExportPackage.js";

function makePayload(overrides: Partial<OrderRequest> = {}): OrderRequest {
  return {
    orderId: "RZ-20260623-9001",
    productType: "wardrobe",
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sections: 2,
    filling: { shelves: 3, drawers: 1, hangingRod: true },
    layout: { sections: [] },
    materials: {
      bodyId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
      facadeId: "mdf-egger-r010-seryy-grafitovyy-ms",
      facadeKind: "mdf",
      backPanelId: "white-matt",
      backPanelKind: "hdf",
    },
    style: {
      facadeStyleId: "regular",
      hardwareId: "base",
    },
    priceBreakdown: {
      body: 10000,
      facades: 10000,
      filling: 10000,
      hardware: 10000,
      production: 10000,
      materials: 10000,
      edgeBanding: 10000,
      services: 10000,
      delivery: 0,
      assembly: 0,
    },
    totalPrice: 90000,
    customer: {
      name: "Иван",
      phone: "+7 999 111-22-33",
      email: "client@example.com",
    },
    delivery: { enabled: false, address: "", price: 0 },
    assembly: { enabled: false, price: 0, rate: 0, basePrice: 0 },
    consent: {
      personalData: true,
      privacyVersion: "2026-05-24",
      acceptedAt: "2026-06-23T18:00:00.000Z",
    },
    source: "constructor-store-adapter",
    honeypot: "",
    ...overrides,
  };
}

test("production export from payload is deterministic for same payload", () => {
  const payload = makePayload();
  const first = buildProductionExportFromPayload(payload);
  const second = buildProductionExportFromPayload(payload);

  assert.deepEqual(first, second);
});

test("production export from payload does not depend on pricing fields", () => {
  const basePayload = makePayload();
  const changedPricingPayload = makePayload({
    totalPrice: 1,
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

  const baseExport = buildProductionExportFromPayload(basePayload);
  const changedPricingExport = buildProductionExportFromPayload(changedPricingPayload);

  assert.deepEqual(baseExport, changedPricingExport);
});
