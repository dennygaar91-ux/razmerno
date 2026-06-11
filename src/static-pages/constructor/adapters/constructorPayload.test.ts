import { validateOrderLayout } from "../../../../api/_shared/layout-validation";
import {
  buildConstructorDraft,
  buildConstructorFilling,
  buildConstructorLayout,
  buildOrderPayloadFromConstructor,
  type ConstructorSnapshot,
} from "./constructorPayload";
import type { QuoteState } from "../types";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

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
  deliveryEnabled: true,
  assemblyEnabled: true,
  deliveryAddress: "Москва, в пределах МКАД",
  contact: {
    name: "Иван",
    phone: "+7 (999) 111-22-33",
    email: "ivan@example.ru",
    company: "",
  },
  consent: true,
};

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
    enabled: true,
    address: "Москва, в пределах МКАД",
    zone: "mkad",
    distanceKm: 0,
    price: 6000,
    message: "Доставка в пределах МКАД",
  },
  assemblyQuote: {
    enabled: true,
    rate: 0.1,
    basePrice: 46000,
    price: 4600,
    message: "Сборка",
  },
  formatPrice: (value) => `${value} ₽`,
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

test("adapter: shelves filling follows sections and compartments", () => {
  const filling = buildConstructorFilling(baseSnapshot);
  assert(filling.shelves === 6, "Expected 3 sections × 2 compartments = 6 shelves");
  assert(filling.drawers === 0, "Expected no drawers");
  assert(filling.hangingRod === false, "Expected no rod");
});

test("adapter: layout widths and heights match dimensions", () => {
  const layout = buildConstructorLayout(baseSnapshot);
  assert(layout.sections.length === 3, "Expected 3 sections");

  const widthSum = layout.sections.reduce((sum, section) => sum + section.widthMm, 0);
  assert(widthSum === baseSnapshot.width, "Section width sum should equal product width");

  for (const section of layout.sections) {
    const heightSum = section.compartments.reduce((sum, compartment) => sum + compartment.heightMm, 0);
    assert(heightSum === baseSnapshot.height, "Compartment height sum should equal product height");
  }

  const validationError = validateOrderLayout(layout, {
    width: baseSnapshot.width,
    height: baseSnapshot.height,
    depth: baseSnapshot.depth,
  });
  assert(validationError === null, validationError ?? "Layout should be valid");
});

test("adapter: order payload contains layout and production-safe basics", () => {
  const payload = buildOrderPayloadFromConstructor(baseSnapshot, quote, {
    acceptedAt: "2026-01-01T00:00:00.000Z",
  });

  assert(payload.productType === "wardrobe", "Expected wardrobe product type");
  assert(payload.layout?.sections.length === 3, "Expected layout in payload");
  assert(payload.materials.bodyId === "ldsp-egger-w960-belyy-klassicheskiy-sm", "Expected selected real material id");
  assert(payload.materials.backPanelId === "hdf-kronospan-k101-belyy-fasadnyy", "Expected automatic HDF back panel material id");
  assert(payload.materials.backPanelKind === "hdf", "Expected HDF back panel material kind");
  assert(payload.totalPrice === quote.total, "Expected quote total");
  assert(payload.delivery?.price === quote.deliveryQuote.price, "Expected delivery price");
  assert(payload.assembly?.price === quote.assemblyQuote.price, "Expected assembly price");
  assert(payload.consent.acceptedAt === "2026-01-01T00:00:00.000Z", "Expected deterministic acceptedAt");
});

test("adapter: draft excludes PII", () => {
  const draft = buildConstructorDraft(baseSnapshot);
  assert(!JSON.stringify(draft).includes("ivan@example.ru"), "Draft must not include email");
  assert(!JSON.stringify(draft).includes("+7"), "Draft must not include phone");
});

test("adapter: layout filling follows explicit selected compartment filling", () => {
  const snapshot = {
    ...baseSnapshot,
    sections: 2,
    compartments: 2,
    sectionLayout: [
      { id: "section-1", widthMm: 600 },
      { id: "section-2", widthMm: 600 },
    ],
    compartmentLayout: {
      "section-1": [
        { id: "section-1-compartment-1", heightMm: 1100 },
        { id: "section-1-compartment-2", heightMm: 1100 },
      ],
      "section-2": [
        { id: "section-2-compartment-1", heightMm: 1100 },
        { id: "section-2-compartment-2", heightMm: 1100 },
      ],
    },
    fillingLayout: {
      "section-2": {
        "section-2-compartment-2": {
          shelvesCount: 2,
          drawersCount: 1,
          rodsCount: 0,
        },
      },
    },
  } satisfies ConstructorSnapshot;

  const layout = buildConstructorLayout(snapshot);
  const target = layout.sections[1]?.compartments[1];
  assert(target?.shelves === 2, "Explicit shelves should stay on target compartment");
  assert(target?.drawers === 1, "Explicit drawers should stay on target compartment");
  assert(layout.sections[0]?.compartments[0]?.shelves === 0, "Other compartments should stay empty");
});

test("adapter: layout carries facade mode per section", () => {
  const snapshot = {
    ...baseSnapshot,
    sections: 2,
    sectionLayout: [
      { id: "section-1", widthMm: 900 },
      { id: "section-2", widthMm: 900 },
    ],
    facadeLayout: {
      "section-1": "hinged",
      "section-2": "open",
    },
  } satisfies ConstructorSnapshot;

  const layout = buildConstructorLayout(snapshot);
  assert(layout.sections[0]?.facadeMode === "hinged", "Section 1 should be hinged");
  assert(layout.sections[1]?.facadeMode === "open", "Section 2 should be open");
});
