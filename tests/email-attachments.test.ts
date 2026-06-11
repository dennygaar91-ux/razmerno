import assert from "node:assert/strict";
import { buildProductionExportFromOrder } from "../src/constructor/production/orderExportPackage";
import { buildProductionEmailAttachments } from "../src/constructor/production/emailAttachments";

const pack = buildProductionExportFromOrder({
  productType: "wardrobe",
  dimensions: { width: 1800, height: 2400, depth: 600 },
  sections: 2,
  filling: { shelves: 4, drawers: 0, hangingRod: true },
  materials: { bodyId: "white-matt", facadeId: "oak-natural", facadeKind: "mdf" },
  style: { facadeStyleId: "regular", hardwareId: "comfort" },
  priceBreakdown: {},
  totalPrice: 120000,
  customer: { name: "Test", phone: "+79999999999", email: "test@example.com" },
  consent: { personalData: true, privacyVersion: "test", acceptedAt: new Date().toISOString() },
  source: "test",
});

const attachments = buildProductionEmailAttachments(pack, "RZ-20260527-1002");

assert.ok(attachments.length >= 4);
assert.ok(attachments.some((item) => item.filename === "RZ-20260527-1002-basis.json"));
assert.ok(attachments.every((item) => item.content.length > 20));

console.log("Email attachments foundation test passed.");
