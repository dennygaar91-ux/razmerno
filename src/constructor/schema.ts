/**
 * Единая модель конструктора «Размерно».
 *
 * Адаптирована под shadcn-based UIKit:
 *   — секции хранятся явным массивом (как в WardrobeCanvas),
 *   — каждая секция настраивается отдельно (per-section),
 *   — действие «применить ко всем» — utility, а не отдельный режим.
 */

export type ProductType = 'wardrobe' | 'cabinet' | 'dresser'

export interface Dimensions {
  width: number
  height: number
  depth: number
}

export interface Section {
  id: number
  shelves: number
  drawers: number
  hasRod: boolean
}

export type FacadeMode = 'open' | 'hinged' | 'drawers'
export type FacadeMount = 'overlay' | 'inset'
export type DoorSwing = 'left' | 'right' | 'pair'

export interface Material {
  bodyDecorId: string
  facadeDecorId: string
  edgeDecorId: string
  thicknessMm: 16
  edge: 'auto' | 'white' | 'contrast'
  opening: 'handles' | 'push'
  hardware: 'standard' | 'soft-close'
  facadeMode: FacadeMode
  facadeMount: FacadeMount
  doorSwing: DoorSwing
}

export interface ProjectMeta {
  projectId?: string
  createdAt?: string
  updatedAt?: string
}

export interface ConstructorProject {
  schemaVersion: 1
  productType: ProductType
  dimensions: Dimensions
  sections: Section[]
  material: Material
  meta?: ProjectMeta
}

export const SCHEMA_VERSION = 1 as const


export const SECTIONS_LIMITS = { min: 1, max: 6 } as const
export const SHELVES_LIMITS  = { min: 0, max: 8 } as const
export const DRAWERS_LIMITS  = { min: 0, max: 4 } as const

export function createDefaultProject(): ConstructorProject {
  return {
    schemaVersion: SCHEMA_VERSION,
    productType: 'wardrobe',
    dimensions: { width: 1800, height: 2400, depth: 600 },
    sections: [
      { id: 1, shelves: 3, drawers: 0, hasRod: true  },
      { id: 2, shelves: 4, drawers: 0, hasRod: false },
      { id: 3, shelves: 2, drawers: 2, hasRod: false },
    ],
    material: {
      bodyDecorId: 'sonoma',
      facadeDecorId: 'sonoma',
      edgeDecorId: 'sonoma',
      thicknessMm: 16,
      edge: 'auto',
      opening: 'handles',
      hardware: 'standard',
      facadeMode: 'hinged',
      facadeMount: 'overlay',
      doorSwing: 'pair',
    },
  }
}
