import { buildConstructorCheckoutReviewSummary } from "./constructorCheckoutReview";
import type { ConstructorSnapshot } from "./constructorPayload";
import type { ConstructorValidationState } from "../types";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const snapshot: ConstructorSnapshot = {
  furniture: "wardrobe",
  width: 1600,
  height: 2200,
  depth: 600,
  fill: "shelves",
  sections: 2,
  compartments: 2,
  handleless: true,
  material: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  facadeMaterial: "mdf-egger-r010-seryy-grafitovyy-ms",
  backPanelMaterial: "hdf-kronospan-k101-belyy-fasadnyy",
  projectMaterials: {
    bodyMaterialId: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    facadeMaterialKind: "mdf",
    facadeMaterialId: "mdf-egger-r010-seryy-grafitovyy-ms",
    backPanelMaterialId: "hdf-kronospan-k101-belyy-fasadnyy",
  },
  sectionLayout: [
    { id: "section-1", widthMm: 700 },
    { id: "section-2", widthMm: 900 },
  ],
  compartmentLayout: {
    "section-1": [
      { id: "section-1-compartment-1", heightMm: 1000 },
      { id: "section-1-compartment-2", heightMm: 1200 },
    ],
    "section-2": [
      { id: "section-2-compartment-1", heightMm: 2200 },
    ],
  },
  fillingLayout: {
    "section-1": {
      "section-1-compartment-1": { shelvesCount: 2, drawersCount: 0, rodsCount: 0 },
      "section-1-compartment-2": { shelvesCount: 0, drawersCount: 2, rodsCount: 0 },
    },
    "section-2": {
      "section-2-compartment-1": { shelvesCount: 0, drawersCount: 0, rodsCount: 1 },
    },
  },
  facadeLayout: {
    "section-1": "hinged",
    "section-2": "open",
  },
  selectedSectionId: "section-1",
  selectedCompartmentId: "section-1-compartment-1",
  shelvesCount: 2,
  drawersCount: 2,
  rodsCount: 1,
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

const validation: ConstructorValidationState = {
  status: "valid",
  issues: [],
  stepStatuses: {
    sizes: "done",
    fill: "done",
    materials: "done",
    checkout: "active",
  },
};

test("checkout review: summarizes actual dimensions, layout, filling and materials", () => {
  const summary = buildConstructorCheckoutReviewSummary(snapshot, validation);
  assert(summary.furnitureLabel === "Шкаф", "Expected furniture label");
  assert(summary.dimensionsText === "1600 × 2200 × 600 мм", "Expected dimensions");
  assert(summary.layoutText.includes("2 секции"), "Expected section count");
  assert(summary.layoutText.includes("3 отсека"), "Expected compartment count");
  assert(summary.fillingText.includes("2 полки"), "Expected shelves summary");
  assert(summary.fillingText.includes("2 ящика"), "Expected drawers summary");
  assert(summary.fillingText.includes("1 штанга"), "Expected rod summary");
  assert(summary.facadeText.includes("без ручек"), "Expected handleless summary");
  assert(summary.bodyMaterialText.includes("16 мм"), "Expected body thickness");
  assert(summary.facadeMaterialText.includes("18 мм"), "Expected facade thickness");
  assert(summary.backPanelMaterialText.includes("3 мм"), "Expected back panel thickness");
  assert(summary.validationTone === "valid", "Expected valid tone");
});

test("checkout review: warns about blocking validation", () => {
  const summary = buildConstructorCheckoutReviewSummary(snapshot, {
    ...validation,
    status: "error",
    issues: [
      {
        id: "bad-section",
        severity: "error",
        stepId: "sizes",
        targetType: "section",
        targetId: "section-1",
        title: "Секция слишком узкая",
        message: "Минимальная ширина секции — 200 мм.",
        fixHint: "Увеличьте ширину секции.",
        blocksCheckout: true,
      },
    ],
  });
  assert(summary.validationTone === "error", "Expected error tone");
  assert(summary.validationStatusText.includes("блокирует"), "Expected blocking copy");
});
