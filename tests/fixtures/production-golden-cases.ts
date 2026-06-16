import type { ConstructorProject } from '../../src/constructor/schema'

export interface ProductionGoldenCase {
  id: string
  title: string
  description: string
  project: ConstructorProject
}

const baseMaterial: ConstructorProject['material'] = {
  bodyDecorId: 'white-matte',
  facadeDecorId: 'white-matte',
  edgeDecorId: 'white-matte',
  thicknessMm: 16,
  edge: 'auto',
  opening: 'handles',
  hardware: 'standard',
  facadeMode: 'hinged',
  facadeMount: 'overlay',
  doorSwing: 'pair',
}

export const productionGoldenCases: ProductionGoldenCase[] = [
  {
    id: 'basic-wardrobe',
    title: 'Basic wardrobe',
    description: 'Single-section wardrobe with hinged facade and minimum filling.',
    project: {
      schemaVersion: 1,
      productType: 'wardrobe',
      dimensions: { width: 900, height: 2200, depth: 550 },
      sections: [{ id: 1, shelves: 0, drawers: 0, hasRod: false }],
      material: { ...baseMaterial },
    },
  },
  {
    id: 'wardrobe-with-shelves',
    title: 'Wardrobe with shelves',
    description: 'Three-section wardrobe with shelves to lock shelf panels, partitions and shelf-pin drilling.',
    project: {
      schemaVersion: 1,
      productType: 'wardrobe',
      dimensions: { width: 1800, height: 2400, depth: 600 },
      sections: [
        { id: 1, shelves: 3, drawers: 0, hasRod: false },
        { id: 2, shelves: 4, drawers: 0, hasRod: false },
        { id: 3, shelves: 2, drawers: 0, hasRod: false },
      ],
      material: { ...baseMaterial, bodyDecorId: 'sonoma', facadeDecorId: 'sonoma', edgeDecorId: 'sonoma' },
    },
  },
  {
    id: 'wardrobe-with-drawers-and-rod',
    title: 'Wardrobe with drawers / rod',
    description: 'Mixed wardrobe with drawers and clothes rod to cover runners, rod hardware and manual-check operations.',
    project: {
      schemaVersion: 1,
      productType: 'wardrobe',
      dimensions: { width: 1600, height: 2400, depth: 600 },
      sections: [
        { id: 1, shelves: 1, drawers: 0, hasRod: true },
        { id: 2, shelves: 0, drawers: 3, hasRod: false },
      ],
      material: { ...baseMaterial, hardware: 'soft-close', facadeDecorId: 'graphite', edgeDecorId: 'graphite' },
    },
  },
  {
    id: 'wardrobe-with-production-warnings',
    title: 'Wardrobe with warnings',
    description: 'Open wardrobe with rod operation that must keep a stable technologist-check warning flag.',
    project: {
      schemaVersion: 1,
      productType: 'wardrobe',
      dimensions: { width: 700, height: 2100, depth: 500 },
      sections: [{ id: 1, shelves: 1, drawers: 0, hasRod: true }],
      material: { ...baseMaterial, facadeMode: 'open', opening: 'push' },
    },
  },
]

export function getProductionGoldenCase(id: string): ProductionGoldenCase {
  const goldenCase = productionGoldenCases.find(item => item.id === id)
  if (!goldenCase) {
    throw new Error(`Unknown production golden case: ${id}`)
  }
  return goldenCase
}
