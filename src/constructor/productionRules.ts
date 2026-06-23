import type { ProductType } from './schema'

export const RAZMERNO_PRODUCTION_RULES = {
  schema: 'razmerno.production-rules.v1',
  corpus: {
    construction: 'top-between-sides-bottom-under-sides',
    description: 'Крышка находится между боковыми панелями; боковые панели опираются на дно для устойчивости корпуса.',
    panelThicknessMm: 16,
  },
  backPanel: {
    material: 'hdf',
    thicknessMm: 3,
    installation: 'groove',
    grooveDepthMm: 8,
    grooveOffsetMm: 10,
    note: 'Задняя стенка ХДФ устанавливается в паз. В JSON паз фиксируется как технологическая операция для ручной сборки в БАЗИС.',
  },
  facades: {
    mount: 'full-overlay',
    perimeterGapEachSideMm: 1.5,
    totalGapPerDimensionMm: 3,
    edgeThicknessMm: 2,
  },
  bodyEdge: {
    thicknessMm: 0.8,
    sides: ['front', 'back', 'left', 'right'] as const,
  },
  shelves: {
    support: 'reinforced-shelf-holders',
    minGapMm: 200,
    supportsPerShelf: 4,
  },
  dimensions: {
    minSectionHeightMm: 400,
    minShelfGapMm: 200,
    minDepthMm: 300,
    minSectionWidthMm: 300,
    maxHeightMm: 2700,
    maxSectionWidthMm: 900,
    maxDepthMm: 900,
  },
  drawers: {
    runnerType: 'hidden-runner',
    brands: ['Hettich', 'Firmax'] as const,
    minFaceHeightMm: 200,
  },
  base: {
    type: 'adjustable-legs-with-plinth',
    plinthHeightMm: 80,
  },
  basis: {
    automationLevel: 'manual-json-to-basis',
    jsonRole: 'technical-card-for-manual-basis-assembly',
  },
} as const

export function getHingeCountByFacadeHeight(facadeHeightMm: number): number {
  if (facadeHeightMm <= 500) return 2
  if (facadeHeightMm <= 700) return 3
  if (facadeHeightMm <= 1100) return 4
  if (facadeHeightMm <= 1500) return 5
  return 6
}

export function getProductionDimensionLimits(productType: ProductType) {
  const base = RAZMERNO_PRODUCTION_RULES.dimensions
  if (productType === 'wardrobe') {
    return {
      minWidthMm: 600,
      maxWidthMm: Number.POSITIVE_INFINITY,
      minHeightMm: 1200,
      maxHeightMm: base.maxHeightMm,
      minDepthMm: base.minDepthMm,
      maxDepthMm: base.maxDepthMm,
      minSectionWidthMm: base.minSectionWidthMm,
      maxSectionWidthMm: base.maxSectionWidthMm,
    }
  }

  if (productType === 'dresser') {
    return {
      minWidthMm: 500,
      maxWidthMm: Number.POSITIVE_INFINITY,
      minHeightMm: 600,
      maxHeightMm: Math.min(1400, base.maxHeightMm),
      minDepthMm: base.minDepthMm,
      maxDepthMm: 650,
      minSectionWidthMm: base.minSectionWidthMm,
      maxSectionWidthMm: base.maxSectionWidthMm,
    }
  }

  return {
    minWidthMm: 400,
    maxWidthMm: Number.POSITIVE_INFINITY,
    minHeightMm: base.minSectionHeightMm,
    maxHeightMm: Math.min(1200, base.maxHeightMm),
    minDepthMm: base.minDepthMm,
    maxDepthMm: 650,
    minSectionWidthMm: base.minSectionWidthMm,
    maxSectionWidthMm: base.maxSectionWidthMm,
  }
}
