import { PRICE_MARKUP_MULTIPLIER } from './priceList'

export type HardwareCategory = 'hinge' | 'runner' | 'rod' | 'handle' | 'fastener' | 'push' | 'shelf-support' | 'leg'

export interface HardwareCatalogItem {
  id: string
  title: string
  category: HardwareCategory
  brand: 'Hettich' | 'Firmax' | 'MDM' | 'MVP'
  unit: 'piece' | 'set'
  sourcePrice: number
  price: number
  source: 'price-list' | 'mvp-market-average'
  basisLibraryName?: string
  drillingTemplateId?: string
  note?: string
}

function marked(value: number): number {
  return Math.round(value * PRICE_MARKUP_MULTIPLIER)
}

export const HARDWARE_CATALOG: Record<string, HardwareCatalogItem> = {
  'hinge-soft-close-110': {
    id: 'hinge-soft-close-110',
    title: 'Петля 110° с доводчиком',
    category: 'hinge',
    brand: 'Hettich',
    unit: 'piece',
    sourcePrice: 180,
    price: marked(180),
    source: 'mvp-market-average',
    basisLibraryName: 'Петля 110 с доводчиком',
    drillingTemplateId: 'hinge-cup-35',
  },
  'hinge-standard-110': {
    id: 'hinge-standard-110',
    title: 'Петля 110° стандартная',
    category: 'hinge',
    brand: 'Firmax',
    unit: 'piece',
    sourcePrice: 95,
    price: marked(95),
    source: 'mvp-market-average',
    basisLibraryName: 'Петля 110 стандартная',
    drillingTemplateId: 'hinge-cup-35',
  },
  'runner-hidden-450': {
    id: 'runner-hidden-450',
    title: 'Направляющие скрытого монтажа 450 мм',
    category: 'runner',
    brand: 'Firmax',
    unit: 'set',
    sourcePrice: 980,
    price: marked(980),
    source: 'mvp-market-average',
    drillingTemplateId: 'runner-hidden-450',
  },
  'rod-oval-set': {
    id: 'rod-oval-set',
    title: 'Штанга овальная + держатели',
    category: 'rod',
    brand: 'MVP',
    unit: 'set',
    sourcePrice: 530,
    price: marked(530),
    source: 'mvp-market-average',
    drillingTemplateId: 'rod-holder',
  },
  'handle-basic': {
    id: 'handle-basic',
    title: 'Ручка мебельная базовая',
    category: 'handle',
    brand: 'MVP',
    unit: 'piece',
    sourcePrice: 160,
    price: marked(160),
    source: 'mvp-market-average',
    drillingTemplateId: 'handle-two-hole',
  },
  'push-to-open': {
    id: 'push-to-open',
    title: 'Толкатель push-to-open',
    category: 'push',
    brand: 'MVP',
    unit: 'piece',
    sourcePrice: 210,
    price: marked(210),
    source: 'mvp-market-average',
    drillingTemplateId: 'push-front',
  },
  'reinforced-shelf-holder': {
    id: 'reinforced-shelf-holder',
    title: 'Усиленный полкодержатель',
    category: 'shelf-support',
    brand: 'MDM',
    unit: 'piece',
    sourcePrice: 18,
    price: marked(18),
    source: 'mvp-market-average',
    basisLibraryName: 'Полкодержатель усиленный',
    drillingTemplateId: 'shelf-pin-5',
    note: 'MVP: используется для всех полок по 4 шт. на полку.',
  },
  'adjustable-leg-plinth-set': {
    id: 'adjustable-leg-plinth-set',
    title: 'Регулируемые ножки + крепёж цоколя',
    category: 'leg',
    brand: 'MVP',
    unit: 'set',
    sourcePrice: 420,
    price: marked(420),
    source: 'mvp-market-average',
    basisLibraryName: 'Ножки регулируемые и клипсы цоколя',
    note: 'MVP: комплект опор для корпуса с цоколем.',
  },
  confirmat: {
    id: 'confirmat',
    title: 'Конфирмат корпусный',
    category: 'fastener',
    brand: 'MVP',
    unit: 'piece',
    sourcePrice: 6,
    price: marked(6),
    source: 'mvp-market-average',
    drillingTemplateId: 'confirmat-5x50',
  },
}

export function getHardwareCatalogItem(id: string): HardwareCatalogItem {
  return HARDWARE_CATALOG[id] ?? HARDWARE_CATALOG.confirmat
}
