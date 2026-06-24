import assert from "node:assert/strict";
import test from "node:test";
import { buildProductionExportFromPayload } from "../../../constructor/production/orderExportPackage";
import type { OrderRequest } from "../../../../api/_shared/order-types";
import {
  buildOrderPayloadFromConstructor,
  type ConstructorSnapshot,
} from "../adapters/constructorPayload";
import type { QuoteState } from "../types";
import {
  createCanonicalConstructorSnapshot,
  extractProductionConfigFingerprint,
} from "./canonicalContract";
import { validateConstructorSystemConsistency } from "./systemConsistency";

const snapshot: ConstructorSnapshot = {
  furniture: "wardrobe",
  width: 1800,
  height: 2400,
  depth: 600,
  fill: "shelves",
  sections: 2,
  compartments: 2,
  handleless: false,
  material: "white",
  deliveryEnabled: false,
  assemblyEnabled: false,
  deliveryAddress: "",
  contact: {
    name: "Иван",
    phone: "+7 (999) 111-22-33",
    email: "ivan@example.ru",
    company: "",
  },
  consent: true,
};

const quote: QuoteState = {
  total: 50000,
  materials: 30000,
  hardwareAndFilling: 8000,
  services: 7000,
  extra: 5000,
  message: "Ориентировочная стоимость",
  price: {
    body: 10000,
    facades: 9000,
    filling: 3000,
    hardware: 4000,
    production: 2500,
    delivery: 0,
    total: 45000,
    isPreliminary: true,
    materials: 30000,
    edgeBanding: 1500,
    services: 5500,
    source: "catalog",
    debug: {
      bodyAreaM2: 1,
      facadeAreaM2: 1,
      backAreaM2: 1,
      edgeLengthM: 1,
      boardPriceM2: 1,
      facadePriceM2: 1,
      edgePriceM: 1,
    },
  },
  deliveryQuote: {
    enabled: false,
    address: "",
    zone: "unknown",
    distanceKm: 0,
    price: 0,
    message: "Доставка не выбрана",
  },
  assemblyQuote: {
    enabled: false,
    rate: 0.1,
    basePrice: 45000,
    price: 0,
    message: "Сборка не выбрана",
  },
  formatPrice: (value) => `${value} ₽`,
};

function buildAlignedPayload() {
  return buildOrderPayloadFromConstructor(snapshot, quote, {
    source: "constructor-store-adapter",
    acceptedAt: "2026-06-23T18:00:00.000Z",
  });
}

test("createCanonicalConstructorSnapshot keeps quote layer pricing-only", () => {
  const payload = buildAlignedPayload();
  const canonical = createCanonicalConstructorSnapshot(snapshot, quote, payload);

  assert.equal("previewProductionFingerprint" in canonical.quote, false);
  assert.equal("previewDimensions" in canonical.quote, false);
  assert.ok(canonical.production.payloadDerivedFingerprint);
});

test("createCanonicalConstructorSnapshot normalizes aligned layers", () => {
  const payload = buildAlignedPayload();
  const productionExport = buildProductionExportFromPayload(payload as OrderRequest);
  const canonical = createCanonicalConstructorSnapshot(
    snapshot,
    quote,
    payload,
    productionExport,
  );

  assert.equal(canonical.snapshot.dimensions.width, canonical.payload.dimensions.width);
  assert.equal(canonical.quote.total, canonical.payload.total);
  assert.deepEqual(
    canonical.production.providedFingerprint,
    canonical.production.payloadDerivedFingerprint,
  );
});

test("validateConstructorSystemConsistency passes for aligned canonical contract", () => {
  const payload = buildAlignedPayload();
  const productionExport = buildProductionExportFromPayload(payload as OrderRequest);
  const canonical = createCanonicalConstructorSnapshot(
    snapshot,
    quote,
    payload,
    productionExport,
  );

  const issues = validateConstructorSystemConsistency(canonical);
  assert.equal(issues.length, 0);
});

test("validateConstructorSystemConsistency detects quote total drift", () => {
  const payload = buildAlignedPayload();
  const driftedPayload = {
    ...payload,
    totalPrice: payload.totalPrice + 1,
  };
  const canonical = createCanonicalConstructorSnapshot(snapshot, quote, driftedPayload, null);

  const issues = validateConstructorSystemConsistency(canonical);
  assert.ok(issues.some((issue) => issue.code === "total_price"));
});

test("validateConstructorSystemConsistency detects snapshot dimension drift", () => {
  const payload = buildAlignedPayload();
  const driftedPayload = {
    ...payload,
    dimensions: {
      ...payload.dimensions,
      width: payload.dimensions.width + 10,
    },
  };
  const canonical = createCanonicalConstructorSnapshot(snapshot, quote, driftedPayload, null);

  const issues = validateConstructorSystemConsistency(canonical);
  assert.ok(issues.some((issue) => issue.code === "dimensions"));
});

test("validateConstructorSystemConsistency detects production export drift from payload", () => {
  const payload = buildAlignedPayload();
  const productionExport = buildProductionExportFromPayload(payload as OrderRequest);
  const driftedExport = buildProductionExportFromPayload({
    ...(payload as OrderRequest),
    dimensions: {
      ...payload.dimensions,
      depth: payload.dimensions.depth + 50,
    },
  });

  const payloadFingerprint = extractProductionConfigFingerprint(productionExport);
  const driftedFingerprint = extractProductionConfigFingerprint(driftedExport);
  assert.notDeepEqual(payloadFingerprint, driftedFingerprint);

  const canonical = createCanonicalConstructorSnapshot(
    snapshot,
    quote,
    payload,
    driftedExport,
  );
  const issues = validateConstructorSystemConsistency(canonical);
  assert.ok(issues.some((issue) => issue.code === "production_export_drift"));
});

test("canonical contract: production export replay fingerprint is stable", () => {
  const payload = buildAlignedPayload();
  const firstExport = buildProductionExportFromPayload(payload as OrderRequest);
  const secondExport = buildProductionExportFromPayload(payload as OrderRequest);
  assert.deepEqual(
    extractProductionConfigFingerprint(firstExport),
    extractProductionConfigFingerprint(secondExport),
  );
});

test("canonical contract: aligned export keeps basis manual-json-ready boundary", () => {
  const payload = buildAlignedPayload();
  const productionExport = buildProductionExportFromPayload(payload as OrderRequest);
  assert.equal(productionExport.basis.status, "manual-json-ready");
  assert.equal(productionExport.review.visibleToClient, false);
});
