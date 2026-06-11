import rawDimensionLimits from '../../shared/dimension-limits.json'
import type { Dimensions, FacadeMode, ProductType, Section } from './schema'

export interface DimensionBounds {
  min: number
  max: number
  step: number
}

export interface ProductOption {
  id: ProductType
  title: string
  description: string
  status: 'available' | 'consultation'
}


export const DIMENSION_LIMITS_BY_PRODUCT = rawDimensionLimits satisfies Record<
  ProductType,
  Record<keyof Dimensions, DimensionBounds>
>

export interface ProductConfig {
  id: ProductType
  title: string
  shortTitle: string
  setupHint: string
  dimensionLimits: Record<keyof Dimensions, DimensionBounds>
  sectionLimits: { min: number; max: number }
  defaultDimensions: Dimensions
  defaultSectionsCount: number
  defaultSection: Omit<Section, 'id'>
  allowedFillingPresetIds: string[]
  allowRod: boolean
  defaultFacadeMode: FacadeMode
  allowedFacadeModes: FacadeMode[]
  minSectionWidth: number
  minDrawerWidth: number
  minDrawerFace: number
}

export const PRODUCT_OPTIONS: ProductOption[] = [
  {
    id: 'wardrobe',
    title: 'Шкаф',
    description: 'Секции, полки, ящики и штанга для одежды.',
    status: 'available',
  },
  {
    id: 'cabinet',
    title: 'Тумба',
    description: 'Низкая корпусная мебель с полками или ящиками.',
    status: 'available',
  },
  {
    id: 'dresser',
    title: 'Комод',
    description: 'Корпус с ящиками без сложных фасадных систем.',
    status: 'available',
  },
]

export const PRODUCT_CONFIGS: Record<ProductType, ProductConfig> = {
  wardrobe: {
    id: 'wardrobe',
    title: 'Шкаф',
    shortTitle: 'шкафа',
    setupHint: 'Укажите точные размеры ниши или места установки. Для одежды на плечиках нужна глубина от 550 мм.',
    dimensionLimits: DIMENSION_LIMITS_BY_PRODUCT.wardrobe,
    sectionLimits: { min: 1, max: 6 },
    defaultDimensions: { width: 1800, height: 2400, depth: 600 },
    defaultSectionsCount: 3,
    defaultSection: { shelves: 3, drawers: 0, hasRod: true },
    allowedFillingPresetIds: ['clothes', 'shelves', 'drawers', 'combo'],
    allowRod: true,
    defaultFacadeMode: 'hinged',
    allowedFacadeModes: ['open', 'hinged'],
    minSectionWidth: 350,
    minDrawerWidth: 420,
    minDrawerFace: 150,
  },
  cabinet: {
    id: 'cabinet',
    title: 'Тумба',
    shortTitle: 'тумбы',
    setupHint: 'Тумба ниже шкафа: обычно используется под хранение, ТВ-зону или прихожую. Штанга для одежды здесь не используется.',
    dimensionLimits: DIMENSION_LIMITS_BY_PRODUCT.cabinet,
    sectionLimits: { min: 1, max: 4 },
    defaultDimensions: { width: 1200, height: 700, depth: 450 },
    defaultSectionsCount: 2,
    defaultSection: { shelves: 1, drawers: 1, hasRod: false },
    allowedFillingPresetIds: ['cabinet-shelves', 'cabinet-drawers'],
    allowRod: false,
    defaultFacadeMode: 'hinged',
    allowedFacadeModes: ['open', 'hinged', 'drawers'],
    minSectionWidth: 300,
    minDrawerWidth: 360,
    minDrawerFace: 150,
  },
  dresser: {
    id: 'dresser',
    title: 'Комод',
    shortTitle: 'комода',
    setupHint: 'Комод рассчитан на ящики. На старте лучше держать простую прямую форму без сложных фасадов — так меньше риск ошибки при сборке.',
    dimensionLimits: DIMENSION_LIMITS_BY_PRODUCT.dresser,
    sectionLimits: { min: 1, max: 3 },
    defaultDimensions: { width: 1000, height: 900, depth: 450 },
    defaultSectionsCount: 2,
    defaultSection: { shelves: 0, drawers: 3, hasRod: false },
    allowedFillingPresetIds: ['dresser-drawers', 'dresser-combo'],
    allowRod: false,
    defaultFacadeMode: 'drawers',
    allowedFacadeModes: ['drawers', 'hinged', 'open'],
    minSectionWidth: 360,
    minDrawerWidth: 360,
    minDrawerFace: 180,
  },
}

export function getProductOption(id: ProductType): ProductOption {
  return PRODUCT_OPTIONS.find(item => item.id === id) ?? PRODUCT_OPTIONS[0]
}

export function getProductConfig(id: ProductType): ProductConfig {
  return PRODUCT_CONFIGS[id] ?? PRODUCT_CONFIGS.wardrobe
}

export interface MaterialOption {
  id: string
  title: string
  short: string
  description: string
  producer: string
  article: string
  thicknessMm: number
  availability: 'in-stock' | 'order'
  swatch: string
  edgeMatch: string
  priceFactor: number
  isPopular?: boolean
  decorType: 'wood' | 'solid' | 'stone'
  materialType: 'ЛДСП' | 'МДФ'
  recommendedFor: string
}

export interface OptionItem {
  id: string
  title: string
  description: string
  priceAdd: number
}

export interface FillingPreset {
  id: string
  title: string
  description: string
  apply: () => Omit<Section, 'id'>
}

export interface DimensionPreset {
  id: string
  productType: ProductType
  title: string
  dimensions: Dimensions
  sectionsCount: number
}

export const MATERIALS: MaterialOption[] = [
  {
    id: 'sonoma',
    title: 'Дуб Сонома',
    short: 'Тёплый древесный',
    description: 'Универсальный тёплый декор. Подходит к большинству интерьеров.',
    producer: 'Kronospan',
    article: 'D3025 MX',
    thicknessMm: 16,
    availability: 'in-stock',
    swatch: '#C9A57A',
    edgeMatch: '#A8865C',
    priceFactor: 1.0,
    isPopular: true,
    decorType: 'wood',
    materialType: 'ЛДСП',
    recommendedFor: 'шкафов, тумб и тёплых интерьеров',
  },
  {
    id: 'white',
    title: 'Белый классический',
    short: 'Светлый минимализм',
    description: 'Складской базовый белый декор из прайс-листа Egger.',
    producer: 'Egger',
    article: 'W960 SM',
    thicknessMm: 16,
    availability: 'in-stock',
    swatch: '#F1EFEA',
    edgeMatch: '#D9D5CC',
    priceFactor: 0.94,
    decorType: 'solid',
    materialType: 'ЛДСП',
    recommendedFor: 'минимализма и светлых корпусов',
  },
  {
    id: 'stone',
    title: 'Бетон Чикаго светло-серый',
    short: 'Современный бетон',
    description: 'Серый декор Egger для минималистичных интерьеров.',
    producer: 'Egger',
    article: 'F186 ST9',
    thicknessMm: 16,
    availability: 'in-stock',
    swatch: '#9B9892',
    edgeMatch: '#76736D',
    priceFactor: 1.08,
    decorType: 'stone',
    materialType: 'ЛДСП',
    recommendedFor: 'современных тумб и акцентных фасадов',
  },
  {
    id: 'oak',
    title: 'Дикий дуб натуральный',
    short: 'Выраженная текстура',
    description: 'Тёплый древесный декор Egger из складской программы.',
    producer: 'Egger',
    article: 'H1318 ST10',
    thicknessMm: 16,
    availability: 'in-stock',
    swatch: '#A87B4A',
    edgeMatch: '#7E5630',
    priceFactor: 1.12,
    decorType: 'wood',
    materialType: 'МДФ',
    recommendedFor: 'фасадов с выраженной древесной текстурой',
  },

  {
    id: 'anthracite',
    title: 'Антрацит матовый',
    short: 'Глубокий графит',
    description: 'Спокойный тёмный декор для акцентных фасадов и современных тумб.',
    producer: 'Egger',
    article: 'U961 ST9',
    thicknessMm: 16,
    availability: 'order',
    swatch: '#343434',
    edgeMatch: '#262626',
    priceFactor: 1.15,
    decorType: 'solid',
    materialType: 'ЛДСП',
    recommendedFor: 'акцентных фасадов и современных интерьеров',
  },
  {
    id: 'cashmere',
    title: 'Кашемир серо-бежевый',
    short: 'Мягкий нейтральный',
    description: 'Тёплый однотонный декор, хорошо сочетается с дубом и белым корпусом.',
    producer: 'Kronospan',
    article: '5981 BS',
    thicknessMm: 16,
    availability: 'order',
    swatch: '#B9AEA2',
    edgeMatch: '#A79B8F',
    priceFactor: 1.06,
    isPopular: true,
    decorType: 'solid',
    materialType: 'ЛДСП',
    recommendedFor: 'спален, прихожих и спокойных фасадов',
  },
  {
    id: 'mdf-white-matte',
    title: 'МДФ белый матовый',
    short: 'Гладкий фасад',
    description: 'МДФ для фасадов с ровной матовой поверхностью. Подходит для минималистичных решений.',
    producer: 'Egger',
    article: 'MDF W1000',
    thicknessMm: 18,
    availability: 'order',
    swatch: '#F7F5F0',
    edgeMatch: '#E4E0D8',
    priceFactor: 1.28,
    decorType: 'solid',
    materialType: 'МДФ',
    recommendedFor: 'фасадов, где важна гладкая матовая поверхность',
  },
  {
    id: 'mdf-graphite',
    title: 'МДФ графит матовый',
    short: 'Премиальный тёмный',
    description: 'Плотный графитовый фасадный материал для контрастных современных проектов.',
    producer: 'Kronospan',
    article: 'MDF U164',
    thicknessMm: 18,
    availability: 'order',
    swatch: '#4B4A46',
    edgeMatch: '#363532',
    priceFactor: 1.34,
    decorType: 'solid',
    materialType: 'МДФ',
    recommendedFor: 'фасадов тумб, комодов и контрастных вставок',
  },
]


export interface FacadeModeOption {
  id: FacadeMode
  title: string
  description: string
  priceAdd: number
}

export const FACADE_MODES: FacadeModeOption[] = [
  { id: 'open', title: 'Открытый корпус', description: 'Без фасадов. Быстрее и дешевле, но хранение видно.', priceAdd: 0 },
  { id: 'hinged', title: 'Распашные фасады', description: 'Закрытые секции с петлями и выбранным открыванием.', priceAdd: 3200 },
  { id: 'drawers', title: 'Ящики', description: 'Фасады ящиков для тумб и комодов.', priceAdd: 4800 },
]

export function getFacadeMode(id: string): FacadeModeOption {
  return FACADE_MODES.find(mode => mode.id === id) ?? FACADE_MODES[1]
}

export function getFacadeModes(productType: ProductType): FacadeModeOption[] {
  const allowed = new Set(getProductConfig(productType).allowedFacadeModes)
  return FACADE_MODES.filter(mode => allowed.has(mode.id))
}

export const OPENINGS: OptionItem[] = [
  { id: 'handles', title: 'С ручками', description: 'Базовый вариант. Проще в сборке.', priceAdd: 0 },
  { id: 'push',    title: 'Без ручек', description: 'Push-to-open, чище визуально.',    priceAdd: 1450 },
]

export const HARDWARES: OptionItem[] = [
  { id: 'standard',   title: 'Стандарт',       description: 'Базовая фурнитура и крепёж.',     priceAdd: 0 },
  { id: 'soft-close', title: 'С доводчиками',  description: 'Мягкое закрывание ящиков и фасадов.', priceAdd: 1800 },
]

export const FILLING_PRESETS: FillingPreset[] = [
  {
    id: 'clothes',
    title: 'Для одежды',
    description: 'Штанга и верхняя полка под вещи на плечиках.',
    apply: () => ({ shelves: 1, drawers: 0, hasRod: true }),
  },
  {
    id: 'shelves',
    title: 'Открытые полки',
    description: 'Пять полок под книги и коробки.',
    apply: () => ({ shelves: 5, drawers: 0, hasRod: false }),
  },
  {
    id: 'drawers',
    title: 'Ящики снизу',
    description: 'Три ящика плюс полки сверху.',
    apply: () => ({ shelves: 2, drawers: 3, hasRod: false }),
  },
  {
    id: 'combo',
    title: 'Комбо',
    description: 'Штанга, полки и пара ящиков.',
    apply: () => ({ shelves: 2, drawers: 2, hasRod: true }),
  },
  {
    id: 'cabinet-shelves',
    title: 'Полки в тумбе',
    description: 'Одна–две полки без штанги.',
    apply: () => ({ shelves: 2, drawers: 0, hasRod: false }),
  },
  {
    id: 'cabinet-drawers',
    title: 'Ящики в тумбе',
    description: 'Два ящика для хранения мелочей.',
    apply: () => ({ shelves: 0, drawers: 2, hasRod: false }),
  },
  {
    id: 'dresser-drawers',
    title: 'Комод с ящиками',
    description: 'Три ящика в каждой секции.',
    apply: () => ({ shelves: 0, drawers: 3, hasRod: false }),
  },
  {
    id: 'dresser-combo',
    title: 'Ящики + полка',
    description: 'Ящики снизу и открытая полка сверху.',
    apply: () => ({ shelves: 1, drawers: 2, hasRod: false }),
  },
]

export const DIMENSION_PRESETS: DimensionPreset[] = [
  { id: 'wardrobe-narrow',   productType: 'wardrobe', title: 'Компактная ниша до 1 м',      dimensions: { width: 900,  height: 2200, depth: 550 }, sectionsCount: 1 },
  { id: 'wardrobe-standard', productType: 'wardrobe', title: 'Типовая ниша 1,5–2 м', dimensions: { width: 1800, height: 2400, depth: 600 }, sectionsCount: 3 },
  { id: 'wardrobe-wide',     productType: 'wardrobe', title: 'Широкая стена от 2 м',    dimensions: { width: 2400, height: 2500, depth: 600 }, sectionsCount: 4 },
  { id: 'cabinet-low',       productType: 'cabinet',  title: 'Низкая тумба для хранения',    dimensions: { width: 1200, height: 600,  depth: 450 }, sectionsCount: 2 },
  { id: 'cabinet-tv',        productType: 'cabinet',  title: 'ТВ-зона под технику',        dimensions: { width: 1800, height: 450,  depth: 400 }, sectionsCount: 3 },
  { id: 'cabinet-hall',      productType: 'cabinet',  title: 'Прихожая и обувь', dimensions: { width: 900,  height: 900,  depth: 400 }, sectionsCount: 2 },
  { id: 'dresser-compact',   productType: 'dresser',  title: 'Компактный комод до 1 м', dimensions: { width: 800,  height: 850,  depth: 450 }, sectionsCount: 1 },
  { id: 'dresser-standard',  productType: 'dresser',  title: 'Стандартный комод',  dimensions: { width: 1200, height: 900,  depth: 450 }, sectionsCount: 2 },
  { id: 'dresser-wide',      productType: 'dresser',  title: 'Широкий комод',   dimensions: { width: 1600, height: 950,  depth: 500 }, sectionsCount: 3 },
]

export function getDimensionPresets(productType: ProductType): DimensionPreset[] {
  return DIMENSION_PRESETS.filter(preset => preset.productType === productType)
}

export function getFillingPresets(productType: ProductType): FillingPreset[] {
  const allowed = new Set(getProductConfig(productType).allowedFillingPresetIds)
  return FILLING_PRESETS.filter(preset => allowed.has(preset.id))
}

export function getMaterial(id: string): MaterialOption {
  return MATERIALS.find(m => m.id === id) ?? MATERIALS[0]
}
export function getOpening(id: string): OptionItem {
  return OPENINGS.find(o => o.id === id) ?? OPENINGS[0]
}
export function getHardware(id: string): OptionItem {
  return HARDWARES.find(h => h.id === id) ?? HARDWARES[0]
}
