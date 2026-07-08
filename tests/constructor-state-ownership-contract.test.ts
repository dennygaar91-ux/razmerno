import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildOrderPayloadFromConstructor,
  type ConstructorSnapshot,
} from "../src/static-pages/constructor/adapters/constructorPayload";
import { buildProductionOrderRequestFromConstructor } from "../src/static-pages/constructor/adapters/productionPreviewAdapter";
import { buildProductionExportFromPayload } from "../src/constructor/production/orderExportPackage";
import { useConstructorStore } from "../src/static-pages/constructor/store/constructorStore";
import { selectCanonicalConstructorState } from "../src/static-pages/constructor/store/constructorSelectors";
import type { QuoteState } from "../src/static-pages/constructor/types";

type TestFn = () => void;

const tests: Array<{ name: string; run: TestFn }> = [];

function test(name: string, run: TestFn) {
  tests.push({ name, run });
}

const quote: QuoteState = {
  total: 52000,
  materials: 31000,
  hardwareAndFilling: 7000,
  services: 8000,
  extra: 6000,
  message: "",
  price: {
    body: 12000,
    facades: 9000,
    filling: 3000,
    hardware: 4000,
    production: 2500,
    delivery: 0,
    total: 46000,
    isPreliminary: true,
    materials: 31000,
    edgeBanding: 1800,
    services: 6200,
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
  deliveryQuote: { enabled: false, address: "", zone: "mkad", distanceKm: 0, price: 0, message: "" },
  assemblyQuote: { enabled: false, rate: 0, basePrice: 46000, price: 0, message: "" },
};

const baseSnapshot: ConstructorSnapshot = {
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
  contact: { name: "Иван", phone: "+7 999 111-22-33", email: "ivan@example.ru", company: "" },
  consent: true,
};

test("M8-P0-02 dimensions ownership stays on canonical selector after store updates", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setWidth(1950);
  useConstructorStore.getState().setHeight(2300);
  useConstructorStore.getState().setDepth(550);
  const canonical = selectCanonicalConstructorState(useConstructorStore.getState());

  assert.equal(canonical.dimensions.widthMm, 1950);
  assert.equal(canonical.dimensions.heightMm, 2300);
  assert.equal(canonical.dimensions.depthMm, 550);
});

test("M8-P0-02 selectedZoneId and selectedCompartmentId bridge stays aligned", () => {
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setSections(2);
  useConstructorStore.getState().setCompartments(2);
  const sectionId = useConstructorStore.getState().sectionLayout[1]?.id;
  const zoneId = sectionId
    ? useConstructorStore.getState().compartmentLayout[sectionId]?.[1]?.id
    : undefined;
  assert.ok(sectionId && zoneId);

  useConstructorStore.getState().selectZone(sectionId, zoneId);
  const state = useConstructorStore.getState();
  assert.equal(state.selectedSectionId, sectionId);
  assert.equal(state.selectedCompartmentId, zoneId);
  assert.equal(state.selectedZoneId, zoneId);
});

test("M8-P0-02 materials and filling survive checkout step transition", () => {
  useConstructorStore.getState().reset();
  const sectionId = useConstructorStore.getState().sectionLayout[0]?.id;
  const zoneId = sectionId
    ? useConstructorStore.getState().compartmentLayout[sectionId]?.[0]?.id
    : undefined;
  assert.ok(sectionId && zoneId);

  useConstructorStore.getState().setMaterial("ldsp-egger-u961-chernyy-grafit-st7");
  useConstructorStore.getState().setFacadeMaterial("mdf-egger-r010-seryy-grafitovyy-ms");
  useConstructorStore.getState().setCompartmentFilling(sectionId, zoneId, {
    shelvesCount: 3,
    drawersCount: 1,
  });
  useConstructorStore.getState().setZoneFacadeMode(sectionId, zoneId, "open");
  useConstructorStore.getState().setStep("checkout");

  const canonical = selectCanonicalConstructorState(useConstructorStore.getState());
  const zone = canonical.sections[0]?.zones[0];
  assert.equal(zone?.filling.shelvesCount, 3);
  assert.equal(zone?.filling.drawersCount, 1);
  assert.equal(zone?.facadeMode, "open");
  assert.ok(canonical.materials.bodyMaterialId.includes("u961"));
});

test("M8-P0-02 checkout contact fields do not leak into production export geometry", () => {
  const snapshot: ConstructorSnapshot = {
    ...baseSnapshot,
    contact: {
      name: "Checkout PII Name",
      phone: "+7 999 000-00-00",
      email: "checkout-pii@example.com",
      company: "Secret Co",
    },
    consent: true,
  };
  const order = buildProductionOrderRequestFromConstructor(snapshot, quote);
  const exportPack = buildProductionExportFromPayload(order);
  const serialized = JSON.stringify(exportPack);

  assert.ok(!serialized.includes("checkout-pii@example.com"));
  assert.ok(!serialized.includes("Checkout PII Name"));
  assert.ok(!serialized.includes("Secret Co"));
});

test("M8-P0-02 order payload boundary is deterministic for identical snapshot+quote", () => {
  const first = buildOrderPayloadFromConstructor(baseSnapshot, quote);
  const second = buildOrderPayloadFromConstructor(baseSnapshot, quote);
  assert.deepEqual(first.dimensions, second.dimensions);
  assert.deepEqual(first.layout, second.layout);
  assert.deepEqual(first.materials, second.materials);
  assert.equal(first.source, "constructor-store-adapter");
});

test("M8-P0-02 active constructor route resolves to Constructor3D, not legacy page", () => {
  const appSource = readFileSync("src/App.tsx", "utf8");
  assert.match(appSource, /pathname === "\/configurator-3d"/);
  assert.match(appSource, /staticPage === "constructor" \? LazyConstructor3DPage/);
  assert.match(appSource, /staticPage === "constructorLegacy" \? LazyConstructorPage/);
  assert.match(appSource, /constructor-legacy/);
});

function runTests() {
  for (const item of tests) {
    item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

runTests();
