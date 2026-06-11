import assert from "node:assert/strict";
import { buildProductionExportFromOrder } from "../src/constructor/production/orderExportPackage";
import { buildBasisJsonScript, serializeBasisJson } from "../src/constructor/production/basisJson";
import { buildProductionDocumentBundle } from "../src/constructor/production/productionDocuments";
import { buildProductionEmailAttachments } from "../src/constructor/production/emailAttachments";

const pack = buildProductionExportFromOrder({
  productType: "wardrobe",
  dimensions: { width: 1600, height: 2300, depth: 600 },
  sections: 2,
  filling: { shelves: 4, drawers: 0, hangingRod: true },
  materials: { bodyId: "white-matt", facadeId: "oak-natural", facadeKind: "ldsp" },
  style: { facadeStyleId: "regular", hardwareId: "comfort" },
  priceBreakdown: {},
  totalPrice: 100000,
  customer: { name: "Test", phone: "+79999999999", email: "test@example.com" },
  consent: { personalData: true, privacyVersion: "test", acceptedAt: new Date().toISOString() },
  source: "test",
});

const basis = buildBasisJsonScript(pack);
assert.equal(basis.schema, "razmerno.basis-json.v1");
assert.ok(basis.panels.length > 0);
assert.ok(basis.operations.length > 0);

const serialized = serializeBasisJson(pack);
assert.ok(serialized.includes("razmerno.basis-json.v1"));

const bundle = buildProductionDocumentBundle(pack, "RZ-20260527-1001");
assert.equal(bundle.schema, "razmerno.production-documents.v1");
assert.ok(bundle.customerHtml.includes("Размерно"));
assert.ok(bundle.assemblyHtml.includes("Красивая схема сборки"));

const attachments = buildProductionEmailAttachments(pack, "RZ-20260527-1001");
assert.ok(attachments.some((item) => item.filename.endsWith("-basis.json")));
assert.ok(attachments.some((item) => item.filename.endsWith("-assembly-summary.html")));

console.log("BASIS JSON and production documents test passed.");
