import {
  type ConstructorProject,
  type Section,
  type Material,
  type ProductType,
  SCHEMA_VERSION,
  SECTIONS_LIMITS,
  SHELVES_LIMITS,
  DRAWERS_LIMITS,
  createDefaultProject,
} from './schema'
import { getMaterial, getOpening, getHardware, getProductConfig, getFacadeMode } from './catalog'

function clamp(value: unknown, min: number, max: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(min, Math.round(n)))
}

function clampStep(value: unknown, bound: { min: number; max: number; step: number }): number {
  const c = clamp(value, bound.min, bound.max)
  return Math.round(c / bound.step) * bound.step
}

function normalizeSection(
  s: Partial<Section> | undefined,
  fallback: Omit<Section, 'id'>,
  id: number,
): Section {
  return {
    id,
    shelves: clamp(s?.shelves ?? fallback.shelves, SHELVES_LIMITS.min, SHELVES_LIMITS.max),
    drawers: clamp(s?.drawers ?? fallback.drawers, DRAWERS_LIMITS.min, DRAWERS_LIMITS.max),
    hasRod: Boolean(s?.hasRod ?? fallback.hasRod),
  }
}

const ALLOWED_PRODUCT_TYPES: ProductType[] = ['wardrobe', 'cabinet', 'dresser']

/**
 * Привести произвольный объект к валидной ConstructorProject.
 * Используется на каждое изменение состояния и при загрузке из localStorage.
 */
export function normalizeProject(raw: unknown): ConstructorProject {
  const defaults = createDefaultProject()
  const src = (raw && typeof raw === 'object' ? raw : defaults) as Partial<ConstructorProject>

  const productType: ProductType = ALLOWED_PRODUCT_TYPES.includes(src.productType as ProductType)
    ? (src.productType as ProductType)
    : 'wardrobe'
  const productConfig = getProductConfig(productType)

  const dimensions = {
    width:  clampStep(src.dimensions?.width  ?? productConfig.defaultDimensions.width,  productConfig.dimensionLimits.width),
    height: clampStep(src.dimensions?.height ?? productConfig.defaultDimensions.height, productConfig.dimensionLimits.height),
    depth:  clampStep(src.dimensions?.depth  ?? productConfig.defaultDimensions.depth,  productConfig.dimensionLimits.depth),
  }

  // Секции: всегда массив допустимой для выбранного изделия длины, переиндексированный по порядку.
  const rawSections = Array.isArray(src.sections) && src.sections.length > 0
    ? src.sections
    : Array.from({ length: productConfig.defaultSectionsCount }, (_, index) => ({
        id: index + 1,
        ...productConfig.defaultSection,
      }))
  const count = clamp(rawSections.length, productConfig.sectionLimits.min, productConfig.sectionLimits.max)
  const sectionTemplate: Omit<Section, 'id'> = { ...productConfig.defaultSection }
  const sections: Section[] = Array.from({ length: count }, (_, i) => {
    const section = normalizeSection(rawSections[i], sectionTemplate, i + 1)
    return productConfig.allowRod ? section : { ...section, hasRod: false }
  })

  const edgeRaw = src.material?.edge
  const edge: Material['edge'] =
    edgeRaw === 'white' || edgeRaw === 'contrast' ? edgeRaw : 'auto'

  const defaultFacadeMode = productConfig.defaultFacadeMode
  const normalizedFacadeMode = getFacadeMode(src.material?.facadeMode ?? defaultFacadeMode).id
  const facadeMode = productConfig.allowedFacadeModes.includes(normalizedFacadeMode)
    ? normalizedFacadeMode
    : defaultFacadeMode

  const material: Material = {
    bodyDecorId: getMaterial(src.material?.bodyDecorId ?? defaults.material.bodyDecorId).id,
    facadeDecorId: getMaterial(src.material?.facadeDecorId ?? src.material?.bodyDecorId ?? defaults.material.facadeDecorId).id,
    edgeDecorId: getMaterial(src.material?.edgeDecorId ?? src.material?.bodyDecorId ?? defaults.material.edgeDecorId).id,
    thicknessMm: 16,
    edge,
    opening: getOpening(src.material?.opening ?? defaults.material.opening).id as Material['opening'],
    hardware: getHardware(src.material?.hardware ?? defaults.material.hardware).id as Material['hardware'],
    facadeMode,
    facadeMount: src.material?.facadeMount === 'inset' ? 'inset' : 'overlay',
    doorSwing: src.material?.doorSwing === 'left' || src.material?.doorSwing === 'right' || src.material?.doorSwing === 'pair'
      ? src.material.doorSwing
      : 'pair',
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    productType,
    dimensions,
    sections,
    material,
    meta: src.meta,
  }
}

/**
 * Изменить количество секций, сохраняя существующие настройки.
 * Новые секции получают наполнение по образцу последней существующей.
 */
export function resizeSections(sections: Section[], nextCount: number): Section[] {
  const count = clamp(nextCount, SECTIONS_LIMITS.min, SECTIONS_LIMITS.max)
  if (count === sections.length) return sections
  if (count < sections.length) {
    return sections.slice(0, count).map((s, i) => ({ ...s, id: i + 1 }))
  }
  const template = sections[sections.length - 1] ?? { shelves: 3, drawers: 0, hasRod: false }
  const extras: Section[] = Array.from({ length: count - sections.length }, (_, i) => ({
    id: sections.length + i + 1,
    shelves: template.shelves,
    drawers: template.drawers,
    hasRod: template.hasRod,
  }))
  return [...sections, ...extras]
}
