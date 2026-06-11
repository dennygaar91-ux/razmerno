import {
  CONSTRUCTOR_DRAFT_STORAGE_KEY,
  loadConstructorDraft,
  saveConstructorDraft,
} from "./store/constructorDraft";
import { buildOrderPayloadFromConstructor, type ConstructorSnapshot } from "./adapters/constructorPayload";
import type { QuoteState } from "./types";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

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

const pii = {
  name: "Пётр Петров",
  phone: "+7 (916) 555-44-33",
  phoneDigits: "916",
  email: "petr.petrov@example.ru",
  address: "Москва, Тверская 10, квартира 15",
  company: "invisible-honeypot-value",
};

const snapshot: ConstructorSnapshot = {
  furniture: "wardrobe",
  width: 2200,
  height: 2500,
  depth: 650,
  fill: "rod",
  sections: 3,
  compartments: 2,
  handleless: true,
  material: "oak",
  deliveryEnabled: true,
  assemblyEnabled: true,
  deliveryAddress: pii.address,
  contact: {
    name: pii.name,
    phone: pii.phone,
    email: pii.email,
    company: pii.company,
  },
  consent: true,
};

const quote: QuoteState = {
  total: 89000,
  materials: 50000,
  hardwareAndFilling: 14000,
  services: 19000,
  extra: 6000,
  message: "Доставка в пределах МКАД",
  price: {
    body: 22000,
    facades: 17000,
    filling: 7000,
    hardware: 7000,
    production: 12000,
    delivery: 0,
    total: 83000,
    isPreliminary: true,
    materials: 50000,
    edgeBanding: 4000,
    services: 15000,
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
    address: pii.address,
    zone: "mkad",
    distanceKm: 0,
    price: 6000,
    message: "Доставка в пределах МКАД",
  },
  assemblyQuote: {
    enabled: true,
    rate: 0.1,
    basePrice: 83000,
    price: 8300,
    message: "Сборка",
  },
  formatPrice: (value) => `${value} ₽`,
};

function collectStringPaths(value: unknown, basePath = "$"): Array<{ path: string; value: string }> {
  if (typeof value === "string") return [{ path: basePath, value }];
  if (!value || typeof value !== "object") return [];

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectStringPaths(item, `${basePath}[${index}]`));
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
    collectStringPaths(item, `${basePath}.${key}`),
  );
}

function pathsContaining(value: unknown, needle: string) {
  return collectStringPaths(value)
    .filter((item) => item.value.includes(needle))
    .map((item) => item.path);
}

function assertOnlyAllowedPaths(value: unknown, needle: string, allowedPaths: string[]) {
  const paths = pathsContaining(value, needle);
  const unexpected = paths.filter((path) => !allowedPaths.includes(path));
  assert(unexpected.length === 0, `${needle} leaked into unexpected paths: ${unexpected.join(", ")}`);
}

test("PII guard: constructor draft storage excludes customer and delivery PII", () => {
  const storage = new MemoryStorage();
  const draft = saveConstructorDraft(snapshot, storage);
  const raw = storage.getItem(CONSTRUCTOR_DRAFT_STORAGE_KEY) ?? "";
  const loaded = loadConstructorDraft(storage);

  assert(loaded !== null, "Draft should load");
  assert(draft.dimensions[0] === 2200, "Draft should keep width");

  for (const forbidden of [pii.name, pii.phone, pii.phoneDigits, pii.email, pii.address, pii.company]) {
    assert(!raw.includes(forbidden), `Draft localStorage payload must not include ${forbidden}`);
    assert(!JSON.stringify(draft).includes(forbidden), `Draft return value must not include ${forbidden}`);
    assert(!JSON.stringify(loaded).includes(forbidden), `Loaded draft must not include ${forbidden}`);
  }
});

test("PII guard: order payload keeps PII only in explicit customer/delivery/honeypot paths", () => {
  const payload = buildOrderPayloadFromConstructor(snapshot, quote, {
    source: "constructor-pii-order-test",
    acceptedAt: "2026-01-01T00:00:00.000Z",
  });

  assertOnlyAllowedPaths(payload, pii.name, ["$.customer.name"]);
  assertOnlyAllowedPaths(payload, pii.phone, ["$.customer.phone"]);
  assertOnlyAllowedPaths(payload, pii.email, ["$.customer.email"]);
  assertOnlyAllowedPaths(payload, pii.address, ["$.delivery.address"]);
  assertOnlyAllowedPaths(payload, pii.company, ["$.honeypot"]);

  assert(payload.consent.personalData === true, "Consent should be preserved");
  assert(payload.source === "constructor-pii-order-test", "Source should be preserved");
});

test("PII guard: product/configuration branches contain no customer PII", () => {
  const payload = buildOrderPayloadFromConstructor(snapshot, quote, {
    source: "constructor-pii-order-test",
    acceptedAt: "2026-01-01T00:00:00.000Z",
  });

  const productBranch = JSON.stringify({
    productType: payload.productType,
    dimensions: payload.dimensions,
    sections: payload.sections,
    filling: payload.filling,
    layout: payload.layout,
    materials: payload.materials,
    style: payload.style,
    priceBreakdown: payload.priceBreakdown,
    totalPrice: payload.totalPrice,
  });

  for (const forbidden of [pii.name, pii.phone, pii.phoneDigits, pii.email, pii.address, pii.company]) {
    assert(!productBranch.includes(forbidden), `Product/configuration branch must not include ${forbidden}`);
  }
});
