import assert from "node:assert/strict";
import { buildProductionExportFromOrder } from "../src/constructor/production/orderExportPackage";
import { buildBasisJsonScript, serializeBasisJson } from "../src/constructor/production/basisJson";
import { buildProductionDocumentBundle } from "../src/constructor/production/productionDocuments";
import { buildProductionEmailAttachments } from "../src/constructor/production/emailAttachments";
import { buildBasisScriptPlan } from "../src/constructor/basisAdapter";
import { createDefaultProject } from "../src/constructor/schema";

const FORBIDDEN_BASIS_AUTO_B3D_CLAIMS = [
  "document:create-b3d",
  '"documentType":"b3d"',
  "'documentType': 'b3d'",
  "автоматической генерации .b3d",
  "автоматической генерации",
] as const;

function assertNoAutoB3dClaims(serialized: string, label: string) {
  for (const forbidden of FORBIDDEN_BASIS_AUTO_B3D_CLAIMS) {
    assert.ok(!serialized.includes(forbidden), `${label}: forbidden auto-b3d claim "${forbidden}"`);
  }
  assert.ok(!serialized.includes("create-b3d"), `${label}: must not reference create-b3d command id`);
}

function assertBasisManualJsonBoundary(
  serialized: string,
  basisStatus: string,
  label: string,
) {
  assert.equal(basisStatus, "manual-json-ready", `${label}: basis.status`);
  assertNoAutoB3dClaims(serialized, label);
}

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
assertBasisManualJsonBoundary(JSON.stringify(pack), pack.basis.status, "production export");
assertBasisManualJsonBoundary(serialized, pack.basis.status, "basis-json");

const legacyScriptPlan = buildBasisScriptPlan(createDefaultProject());
const firstCommand = legacyScriptPlan.commands[0];
assert.equal(firstCommand?.id, "document:plan-basis-3d-doc");
assert.equal(
  (firstCommand?.payload as { documentType?: string }).documentType,
  "basis-manual-plan",
);
assertNoAutoB3dClaims(JSON.stringify(legacyScriptPlan), "legacy basis script plan");

const bundle = buildProductionDocumentBundle(pack, "RZ-20260527-1001");
assert.equal(bundle.schema, "razmerno.production-documents.v1");
assert.ok(bundle.customerHtml.includes("Размерно"));
assert.ok(bundle.assemblyHtml.includes("Красивая схема сборки"));

const attachments = buildProductionEmailAttachments(pack, "RZ-20260527-1001");
assert.ok(attachments.some((item) => item.filename.endsWith("-basis.json")));
assert.ok(attachments.some((item) => item.filename.endsWith("-assembly-summary.html")));

console.log("BASIS JSON and production documents test passed.");
