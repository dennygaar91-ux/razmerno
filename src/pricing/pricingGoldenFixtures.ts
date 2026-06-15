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
    bodyId: string;
    facadeId: string;
    facadeKind: 'ldsp' | 'mdf';
    backPanelId: string;
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
};

const mdfFacadeMaterials = {
  bodyId: 'ldsp-egger-w960-belyy-klassicheskiy-sm',
  facadeId: 'mdf-egger-r006-belyy-kremovyy-ms',
  facadeKind: 'mdf' as const,
  backPanelId: 'hdf-kronospan-k101-belyy-fasadnyy',
  backPanelKind: 'hdf' as const,
};

const zeroExpected: PricingGoldenExpected = {
  body: 0,
  facades: 0,
  filling: 0,
  hardware: 0,
  production: 0,
  materials: 0,
  edgeBanding: 0,
  services: 0,
  delivery: 0,
  assembly: 0,
  total: 0,
  source: 'catalog',
};

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
    expected: zeroExpected,
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
    expected: zeroExpected,
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
    expected: zeroExpected,
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
    expected: zeroExpected,
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
    expected: zeroExpected,
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
    expected: zeroExpected,
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
