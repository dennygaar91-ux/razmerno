import { applyProductionPanelPricingToCatalogPrice, summarizeProductionPanelPricing } from "./productionPanelPricing";
import { buildConstructorProductionPreview } from "../static-pages/constructor/adapters/productionPreviewAdapter";
import type { ConstructorSnapshot } from "../static-pages/constructor/adapters/constructorPayload";
import type { QuoteState } from "../static-pages/constructor/types";

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

const snapshot: ConstructorSnapshot = {
  furniture: "wardrobe",
  width: 1200,
  height: 2200,
  depth: 600,
  fill: "shelves",
  sections: 2,
  compartments: 1,
  handleless: false,
  material: "ldsp-egger-u961-chernyy-grafit-st7",
  facadeMaterial: "mdf-egger-r010-seryy-grafitovyy-ms",
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
  sectionLayout: [
    { id: "section-1", widthMm: 400 },
    { id: "section-2", widthMm: 800 },
  ],
  facadeLayout: {
    "section-1": "open",
    "section-2": "hinged",
  },
  compartmentLayout: {
    "section-1": [{ id: "section-1-compartment-1", heightMm: 2200 }],
    "section-2": [{ id: "section-2-compartment-1", heightMm: 2200 }],
  },
  fillingLayout: {
    "section-1": {
      "section-1-compartment-1": { shelvesCount: 1, drawersCount: 0, rodsCount: 0 },
    },
    "section-2": {
      "section-2-compartment-1": { shelvesCount: 0, drawersCount: 0, rodsCount: 0 },
    },
  },
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

test("production panel pricing summarizes panel areas by material type", () => {
  const preview = buildConstructorProductionPreview(snapshot, quote);
  const summary = summarizeProductionPanelPricing({
    productionExport: preview.productionExport,
    catalogMaterialsPrice: quote.materials,
  });

  assert(summary.schema === "razmerno.production-panel-pricing.v1", "Unexpected schema");
  assert(summary.panelCount === preview.productionExport.productionModel.panels.length, "Panel count mismatch");
  assert(summary.bodyAreaM2 > 0, "Body area should be positive");
  assert(summary.facadeAreaM2 > 0, "Facade area should be positive for hinged second section");
  assert(summary.backPanelAreaM2 > 0, "Back panel area should be positive");
  assert(summary.buckets.some((bucket) => bucket.materialType === "mdf"), "MDF facade bucket should exist");
  assert(summary.buckets.some((bucket) => bucket.materialType === "hdf"), "HDF back panel bucket should exist");
});

test("production panel pricing keeps catalog comparison separate from live price", () => {
  const preview = buildConstructorProductionPreview(snapshot, quote);
  const summary = summarizeProductionPanelPricing({
    productionExport: preview.productionExport,
    catalogMaterialsPrice: quote.materials,
  });

  assert(summary.catalogMaterialsPrice === quote.materials, "Catalog material price should be kept as comparison only");
  assert(typeof summary.deltaToCatalogMaterials === "number", "Delta should be available for manager/debug audit");
  assert(summary.estimatedMaterialsWithEdge > 0, "Panel estimate should be positive");
});


test("production panel pricing can become controlled live material source", () => {
  const preview = buildConstructorProductionPreview(snapshot, quote);
  const summary = summarizeProductionPanelPricing({
    productionExport: preview.productionExport,
    catalogMaterialsPrice: quote.materials,
  });
  const applied = applyProductionPanelPricingToCatalogPrice({
    catalogPrice: quote.price,
    panelPricing: summary,
  });

  assert(applied.applied, "Panel pricing should be applied");
  assert(applied.price.source === "production-panels", "Price source should be production-panels");
  assert(applied.price.materials === summary.estimatedMaterialsWithEdge, "Materials should come from panel estimate");
  assert(applied.price.debug.panelPricingDelta === summary.deltaToCatalogMaterials, "Debug delta should be preserved");
  assert(applied.price.total > 0, "Adjusted total should stay positive");
});
