/**
 * MVP-прайс для расчёта «Размерно».
 * Источник: «Прайс-лист для дилеров до 01.04.26.xlsx».
 * Важно: ко всем значениям из прайса применяется дилерская надбавка +30%.
 *
 * Единицы:
 * - материалы: ₽ / м²
 * - кромка: ₽ / п.м.
 * - услуги: согласно unit
 */

export const PRICE_MARKUP_MULTIPLIER = 1.3 as const

export interface DecorPriceItem {
  decorId: string
  producer: string
  article: string
  title: string
  thicknessMm: number
  unit: 'm2'
  sourcePrice: number
  price: number
  availability: 'in-stock' | 'order'
  sourceSheet: 'Kronospan' | 'Egger' | 'AGT' | 'Eterno'
}

export interface EdgePriceItem {
  id: string
  title: string
  unit: 'lm'
  sourcePricePlain: number
  sourcePriceWood: number
  pricePlain: number
  priceWood: number
  sourceSheet: 'Кромка'
}

export interface ServicePriceItem {
  id: string
  title: string
  unit: 'm2' | 'lm' | 'piece'
  sourcePrice: number
  price: number
  sourceSheet: 'Услуги'
}

function marked(sourcePrice: number): number {
  return Math.round(sourcePrice * PRICE_MARKUP_MULTIPLIER)
}

export const DECOR_PRICES: Record<string, DecorPriceItem> = {
  sonoma: {
    decorId: 'sonoma',
    producer: 'Kronospan',
    article: '3025 PR',
    title: 'Дуб Сонома Светлый',
    thicknessMm: 16,
    unit: 'm2',
    sourcePrice: 1420.28,
    price: marked(1420.28),
    availability: 'in-stock',
    sourceSheet: 'Kronospan',
  },
  white: {
    decorId: 'white',
    producer: 'Egger',
    article: 'W960 SM',
    title: 'Белый классический',
    thicknessMm: 16,
    unit: 'm2',
    sourcePrice: 1709.45,
    price: marked(1709.45),
    availability: 'in-stock',
    sourceSheet: 'Egger',
  },
  stone: {
    decorId: 'stone',
    producer: 'Egger',
    article: 'F186 ST9',
    title: 'Бетон Чикаго светло-серый',
    thicknessMm: 16,
    unit: 'm2',
    sourcePrice: 2227.93,
    price: marked(2227.93),
    availability: 'in-stock',
    sourceSheet: 'Egger',
  },
  oak: {
    decorId: 'oak',
    producer: 'Egger',
    article: 'H1318 ST10',
    title: 'Дикий дуб натуральный',
    thicknessMm: 16,
    unit: 'm2',
    sourcePrice: 2021.79,
    price: marked(2021.79),
    availability: 'in-stock',
    sourceSheet: 'Egger',
  },

  anthracite: {
    decorId: 'anthracite',
    producer: 'Egger',
    article: 'U961 ST9',
    title: 'Антрацит матовый',
    thicknessMm: 16,
    unit: 'm2',
    sourcePrice: 2150,
    price: marked(2150),
    availability: 'order',
    sourceSheet: 'Egger',
  },
  cashmere: {
    decorId: 'cashmere',
    producer: 'Kronospan',
    article: '5981 BS',
    title: 'Кашемир серо-бежевый',
    thicknessMm: 16,
    unit: 'm2',
    sourcePrice: 1840,
    price: marked(1840),
    availability: 'order',
    sourceSheet: 'Kronospan',
  },
  'mdf-white-matte': {
    decorId: 'mdf-white-matte',
    producer: 'Egger',
    article: 'MDF W1000',
    title: 'МДФ белый матовый',
    thicknessMm: 18,
    unit: 'm2',
    sourcePrice: 2650,
    price: marked(2650),
    availability: 'order',
    sourceSheet: 'Egger',
  },
  'mdf-graphite': {
    decorId: 'mdf-graphite',
    producer: 'Kronospan',
    article: 'MDF U164',
    title: 'МДФ графит матовый',
    thicknessMm: 18,
    unit: 'm2',
    sourcePrice: 2780,
    price: marked(2780),
    availability: 'order',
    sourceSheet: 'Kronospan',
  },
}


export const HDF_PRICE = {
  id: 'hdf-white-4mm',
  title: 'ХДФ 4 мм белый / технический',
  unit: 'm2' as const,
  sourcePrice: 420,
  price: marked(420),
  sourceSheet: 'MVP' as const,
}

export const EDGE_PRICE_19X1: EdgePriceItem = {
  id: 'abs-19x1',
  title: 'ABS 19×1 мм',
  unit: 'lm',
  sourcePricePlain: 61,
  sourcePriceWood: 72,
  pricePlain: marked(61),
  priceWood: marked(72),
  sourceSheet: 'Кромка',
}

export const SERVICE_PRICES: Record<string, ServicePriceItem> = {
  customPanelProcessing: {
    id: 'customPanelProcessing',
    title: 'Обработка заказного ЛДСП',
    unit: 'm2',
    sourcePrice: 1500,
    price: marked(1500),
    sourceSheet: 'Услуги',
  },
  cardboardPackaging: {
    id: 'cardboardPackaging',
    title: 'Упаковка заказа в гофрокартон',
    unit: 'm2',
    sourcePrice: 120,
    price: marked(120),
    sourceSheet: 'Услуги',
  },
  stretchPackaging: {
    id: 'stretchPackaging',
    title: 'Упаковка заказа в стрейч',
    unit: 'm2',
    sourcePrice: 20,
    price: marked(20),
    sourceSheet: 'Услуги',
  },
}

export function getDecorPrice(decorId: string): DecorPriceItem {
  return DECOR_PRICES[decorId] ?? DECOR_PRICES.sonoma
}

export function isWoodDecor(decorId: string): boolean {
  return decorId === 'sonoma' || decorId === 'oak'
}

export function getEdgePricePerMeter(decorId: string): number {
  return isWoodDecor(decorId) ? EDGE_PRICE_19X1.priceWood : EDGE_PRICE_19X1.pricePlain
}
