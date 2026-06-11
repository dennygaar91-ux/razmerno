import {
  buildConstructorProductionPreview,
  buildProductionOrderRequestFromConstructor,
} from "./productionPreviewAdapter";
import { buildConstructorProductionPricingBundle } from "./productionPricingPreview";
import { buildProductionSnapshotReadyState } from "./productionSnapshotSync";
import type { ConstructorSnapshot } from "./constructorPayload";
import type { QuoteState } from "../types";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const quote: QuoteState = {
  total: 52000,
  materials: 31000,
  hardwareAndFilling: 7000,
  services: 8000,
  extra: 6000,
  message: "Доставка в пределах МКАД",
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
    basePrice: 46000,
    price: 0,
    message: "Сборку можно добавить позже",
  },
  formatPrice: (value) => `${value} ₽`,
};

const baseSnapshot: ConstructorSnapshot = {
  furniture: "wardrobe",
  width: 1800,
  height: 2400,
  depth: 600,
  fill: "shelves",
  sections: 3,
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

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test("production preview: builds order request without real PII", () => {
  const order = buildProductionOrderRequestFromConstructor(baseSnapshot, quote);

  assert(order.customer?.email === "preview@razmerno.local", "Preview order must not include real email");
  assert(order.customer?.phone === "+7 (999) 000-00-00", "Preview order must not include real phone");
  assert(order.layout?.sections.length === 3, "Preview order should include layout");
});

test("production preview: builds production export summary", () => {
  const preview = buildConstructorProductionPreview(baseSnapshot, quote);

  assert(preview.schema === "razmerno.constructor-production-preview.v1", "Unexpected preview schema");
  assert(preview.summary.panels > 0, "Preview should include panels");
  assert(preview.summary.basisSteps >= preview.summary.panels, "Preview should include basis steps");
  assert(preview.project.dimensions.width === baseSnapshot.width, "Preview should keep width");
});

test("production preview: handleless maps to production no-handle/push-to-open", () => {
  const preview = buildConstructorProductionPreview({ ...baseSnapshot, handleless: true }, quote);

  assert(preview.project.facadeStyleId === "no-handle", "Handleless UI must map to production no-handle");
  assert(
    preview.productionExport.project.structure.openingMode === "push-to-open",
    "Production openingMode should be push-to-open",
  );
});

test("production preview: uses real HDF back panel and material thicknesses", () => {
  const snapshot = {
    ...baseSnapshot,
    material: "ldsp-egger-u961-chernyy-grafit-st7",
    facadeMaterial: "mdf-egger-r010-seryy-grafitovyy-ms",
  } satisfies ConstructorSnapshot;
  const preview = buildConstructorProductionPreview(snapshot, quote);

  assert(
    preview.productionExport.project.material.bodyMaterialId === "ldsp-egger-u961-chernyy-grafit-st7",
    "Production project should use selected LDSP body material",
  );
  assert(
    preview.productionExport.project.material.facadeMaterialId === "mdf-egger-r010-seryy-grafitovyy-ms",
    "Production project should use selected MDF facade material",
  );
  assert(
    preview.productionExport.project.material.backPanelMaterialId === "hdf-kronospan-k190-chernyy",
    "Production project should map black graphite LDSP to black HDF",
  );
  assert(preview.productionExport.project.material.bodyThicknessMm === 16, "LDSP body should be 16 mm");
  assert(preview.productionExport.project.material.facadeThicknessMm === 18, "MDF facade should be 18 mm");
  assert(preview.productionExport.project.material.backPanelThicknessMm === 3, "HDF back panel should be 3 mm");

  const backPanel = preview.productionExport.productionModel.panels.find((panel) => panel.role === "back-panel");
  const facade = preview.productionExport.productionModel.panels.find((panel) => panel.role === "facade-door");
  assert(backPanel?.materialType === "hdf", "Back panel should be HDF in production model");
  assert(backPanel?.thicknessMm === 3, "Back panel production panel should be 3 mm");
  assert(facade?.materialType === "mdf", "MDF facade should create MDF facade panels");
});

test("production preview: respects manual section widths and open section facade modes", () => {
  const snapshot = {
    ...baseSnapshot,
    width: 1200,
    sections: 2,
    sectionLayout: [
      { id: "section-1", widthMm: 400 },
      { id: "section-2", widthMm: 800 },
    ],
    facadeLayout: {
      "section-1": "open",
      "section-2": "hinged",
    },
    compartmentLayout: {
      "section-1": [{ id: "section-1-compartment-1", heightMm: 2400 }],
      "section-2": [{ id: "section-2-compartment-1", heightMm: 2400 }],
    },
    fillingLayout: {
      "section-1": {
        "section-1-compartment-1": { shelvesCount: 1, drawersCount: 0, rodsCount: 0 },
      },
      "section-2": {
        "section-2-compartment-1": { shelvesCount: 2, drawersCount: 0, rodsCount: 0 },
      },
    },
  } satisfies ConstructorSnapshot;

  const preview = buildConstructorProductionPreview(snapshot, quote);
  const doors = preview.productionExport.productionModel.panels.filter((panel) => panel.role === "facade-door");
  const shelves = preview.productionExport.productionModel.panels.filter((panel) => panel.role === "shelf");

  assert(doors.length > 0, "Hinged section should create facade panels");
  assert(
    doors.every((door) => Number(door.basis.userProperties.sectionId) === 1),
    "Open first section should not create facade panels",
  );
  assert(shelves.length === 3, "Shelf panels should follow explicit compartment filling totals");
  assert(
    preview.productionExport.project.structure.layout?.sections[0]?.facadeMode === "open",
    "Production project layout should carry section facade mode",
  );
});


test("production pricing bundle: builds preview and panel pricing from one helper", () => {
  const bundle = buildConstructorProductionPricingBundle({
    snapshot: baseSnapshot,
    catalogQuote: quote,
    catalogPrice: quote.price,
  });

  assert(bundle.preview.summary.panels > 0, "Bundle should include production preview");
  assert(bundle.panelPricing.panelCount === bundle.preview.productionExport.productionModel.panels.length, "Panel pricing should use preview panels");
  assert(bundle.hardwarePricing.hardwareCount === bundle.preview.productionExport.productionModel.hardware.length, "Hardware pricing should audit preview hardware");
  assert(bundle.hardwarePricing.hardwareEstimate > 0, "Hardware audit estimate should be positive for base snapshot");
  assert(bundle.hardwareDecision.schema === "razmerno.production-hardware-pricing-decision.v1", "Hardware pricing decision should be created");
  assert(bundle.hardwareDecision.status !== "candidate" || bundle.hardwareDecision.recommendedSourceOfTruth === "production-hardware", "Candidate hardware decision should recommend production-hardware");
  assert(bundle.servicesPricing.servicesEstimate > 0, "Services audit estimate should be positive for base snapshot");
  assert(bundle.servicesDecision.schema === "razmerno.production-services-pricing-decision.v1", "Services pricing decision should be created");
  assert(bundle.servicesDecision.status !== "candidate" || bundle.servicesDecision.recommendedSourceOfTruth === "production-services", "Candidate services decision should recommend production-services");
  assert(bundle.appliedPrice.price.source === "production-panels", "Bundle should return production-panel live price application");
});

test("production snapshot sync: creates ready store payload from quote-owned preview", () => {
  const bundle = buildConstructorProductionPricingBundle({
    snapshot: baseSnapshot,
    catalogQuote: quote,
    catalogPrice: quote.price,
  });
  const ready = buildProductionSnapshotReadyState({
    preview: bundle.preview,
    panelPricing: bundle.panelPricing,
    hardwarePricing: bundle.hardwarePricing,
    hardwareDecision: bundle.hardwareDecision,
    servicesPricing: bundle.servicesPricing,
    servicesDecision: bundle.servicesDecision,
  });

  assert(ready.validationStatus === bundle.preview.status, "Ready payload should keep preview status");
  assert(ready.summary?.panels === bundle.preview.summary.panels, "Ready payload should keep summary");
  assert(ready.panelPricing?.panelCount === bundle.panelPricing.panelCount, "Ready payload should keep panel pricing");
  assert(ready.hardwarePricing?.hardwareCount === bundle.hardwarePricing.hardwareCount, "Ready payload should keep hardware pricing audit");
  assert(ready.hardwareDecision?.status === bundle.hardwareDecision.status, "Ready payload should keep hardware pricing decision");
  assert(ready.servicesPricing?.drillingCount === bundle.servicesPricing.drillingCount, "Ready payload should keep services pricing audit");
  assert(ready.servicesDecision?.status === bundle.servicesDecision.status, "Ready payload should keep services pricing decision");
  assert(!JSON.stringify(ready).includes("ivan@example.ru"), "Ready payload must not include customer email");
  assert(!JSON.stringify(ready).includes("111-22-33"), "Ready payload must not include customer phone");
});
