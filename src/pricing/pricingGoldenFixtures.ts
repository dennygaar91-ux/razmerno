import type { MaterialToken } from '../shared/materials/materialCatalog';

export type PricingFixtureProductType = 'wardrobe' | 'dresser' | 'nightstand';

export type PricingFixtureFilling = {
  shelves: number;
  drawers: number;
  hangingRod: boolean;
};

export type PricingFixtureStyle = {
  facadeStyleId: 'regular' | 'hidden-handle' | 'no-handle';
  hardwareId: 'base' | 'comfort';
};

export type PricingGoldenExpected = {
  body: number;
  facades: number;
  filling: number;
  hardware: number;
  production: number;
  materials: number;
  edgeBanding: number;
  services: number;
  delivery: number;
  assembly: number;
  total: number;
  source: 'catalog';
};

export type PricingGoldenFixture = {
  id: string;
  label: string;
  productType: PricingFixtureProductType;
  dimensions: { width: number; height: number; depth: number };
  sections: number;
  filling: PricingFixtureFilling;
  materials: {
    bodyId: MaterialToken;
    facadeId: MaterialToken;
    facadeKind: 'ldsp' | 'mdf';
    backPanelId: MaterialToken;
    backPanelKind: 'hdf';
  };
  style: PricingFixtureStyle;
  delivery: { enabled: boolean; address: string };
  assembly: { enabled: boolean };
  expected: PricingGoldenExpected;
};

const defaultMaterials = {
  bodyId: 'ldsp-egger-w960-belyy-klassicheskiy-sm',
  facadeId: 'ldsp-egger-w960-belyy-klassicheskiy-sm',
  facadeKind: 'ldsp' as const,
  backPanelId: 'hdf-kronospan-k101-belyy-fasadnyy',
  backPanelKind: 'hdf' as const,
} satisfies PricingGoldenFixture['materials'];

const mdfFacadeMaterials = {
  bodyId: 'ldsp-egger-w960-belyy-klassicheskiy-sm',
  facadeId: 'mdf-egger-r006-belyy-kremovyy-ms',
  facadeKind: 'mdf' as const,
  backPanelId: 'hdf-kronospan-k101-belyy-fasadnyy',
  backPanelKind: 'hdf' as const,
} satisfies PricingGoldenFixture['materials'];

export const pricingGoldenFixtures: PricingGoldenFixture[] = [
  {
    id: 'wardrobe-small',
    label: 'Маленький шкаф без доставки и сборки',
    productType: 'wardrobe',
    dimensions: { width: 1200, height: 2100, depth: 500 },
    sections: 2,
    filling: { shelves: 2, drawers: 0, hangingRod: true },
    materials: defaultMaterials,
    style: { facadeStyleId: 'regular', hardwareId: 'base' },
    delivery: { enabled: false, address: '' },
    assembly: { enabled: false },
    expected: {
      body: 12978,
      facades: 6267,
      filling: 1820,
      hardware: 5304,
      production: 0,
      materials: 26565,
      edgeBanding: 5191,
      services: 1744,
      delivery: 0,
      assembly: 0,
      total: 35433,
      source: 'catalog',
    },
  },
  {
    id: 'wardrobe-medium',
    label: 'Средний шкаф без ручек',
    productType: 'wardrobe',
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sections: 2,
    filling: { shelves: 4, drawers: 0, hangingRod: true },
    materials: defaultMaterials,
    style: { facadeStyleId: 'no-handle', hardwareId: 'comfort' },
    delivery: { enabled: false, address: '' },
    assembly: { enabled: false },
    expected: {
      body: 22667,
      facades: 12369,
      filling: 1820,
      hardware: 7854,
      production: 0,
      materials: 47870,
      edgeBanding: 9184,
      services: 3020,
      delivery: 0,
      assembly: 0,
      total: 60564,
      source: 'catalog',
    },
  },
  {
    id: 'wardrobe-large',
    label: 'Большой шкаф с ящиками и МДФ фасадом',
    productType: 'wardrobe',
    dimensions: { width: 2400, height: 2600, depth: 650 },
    sections: 3,
    filling: { shelves: 6, drawers: 2, hangingRod: true },
    materials: mdfFacadeMaterials,
    style: { facadeStyleId: 'no-handle', hardwareId: 'comfort' },
    delivery: { enabled: false, address: '' },
    assembly: { enabled: false },
    expected: {
      body: 34090,
      facades: 19054,
      filling: 7410,
      hardware: 8652,
      production: 0,
      materials: 73924,
      edgeBanding: 15507,
      services: 4457,
      delivery: 0,
      assembly: 0,
      total: 94443,
      source: 'catalog',
    },
  },
  {
    id: 'wardrobe-with-delivery',
    label: 'Шкаф с доставкой по Москве',
    productType: 'wardrobe',
    dimensions: { width: 1200, height: 2100, depth: 500 },
    sections: 2,
    filling: { shelves: 2, drawers: 0, hangingRod: true },
    materials: defaultMaterials,
    style: { facadeStyleId: 'regular', hardwareId: 'base' },
    delivery: { enabled: true, address: 'Москва, Тверская 1' },
    assembly: { enabled: false },
    expected: {
      body: 12978,
      facades: 6267,
      filling: 1820,
      hardware: 5304,
      production: 0,
      materials: 26565,
      edgeBanding: 5191,
      services: 1744,
      delivery: 6000,
      assembly: 0,
      total: 41433,
      source: 'catalog',
    },
  },
  {
    id: 'wardrobe-with-assembly',
    label: 'Средний шкаф со сборкой',
    productType: 'wardrobe',
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sections: 2,
    filling: { shelves: 4, drawers: 0, hangingRod: true },
    materials: defaultMaterials,
    style: { facadeStyleId: 'no-handle', hardwareId: 'comfort' },
    delivery: { enabled: false, address: '' },
    assembly: { enabled: true },
    expected: {
      body: 22667,
      facades: 12369,
      filling: 1820,
      hardware: 7854,
      production: 0,
      materials: 47870,
      edgeBanding: 9184,
      services: 3020,
      delivery: 0,
      assembly: 6056,
      total: 66620,
      source: 'catalog',
    },
  },
  {
    id: 'wardrobe-with-delivery-and-assembly',
    label: 'Большой шкаф с доставкой за МКАД и сборкой',
    productType: 'wardrobe',
    dimensions: { width: 2400, height: 2600, depth: 650 },
    sections: 3,
    filling: { shelves: 6, drawers: 2, hangingRod: true },
    materials: mdfFacadeMaterials,
    style: { facadeStyleId: 'no-handle', hardwareId: 'comfort' },
    delivery: { enabled: true, address: 'Московская область, Химки, 12 км от МКАД' },
    assembly: { enabled: true },
    expected: {
      body: 34090,
      facades: 19054,
      filling: 7410,
      hardware: 8652,
      production: 0,
      materials: 73924,
      edgeBanding: 15507,
      services: 4457,
      delivery: 6600,
      assembly: 9444,
      total: 110487,
      source: 'catalog',
    },
  },
];

export const pricingValidationFixtures = [
  {
    id: 'warning-unknown-delivery-zone',
    label: 'Warning: адрес доставки без определённой зоны',
    delivery: { enabled: true, address: 'Зеленоград, корпус 1234' },
    expectedDeliveryPrice: 6000,
    expectedDeliveryMessage: 'Предварительно: доставка в пределах МКАД. Для МО укажите расстояние от МКАД',
    expectedValidationError: null,
  },
  {
    id: 'error-outside-mkad-without-distance',
    label: 'Error: доставка за МКАД без расстояния',
    delivery: { enabled: true, address: 'Московская область, Одинцово' },
    expectedDeliveryPrice: 6000,
    expectedDeliveryMessage: 'Доставка за МКАД: 6 000 ₽ + 50 ₽/км. Уточните расстояние от МКАД',
    expectedValidationError: 'Для доставки за МКАД укажите расстояние от МКАД в километрах',
  },
] as const;
