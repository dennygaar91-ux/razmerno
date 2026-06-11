/**
 * @deprecated Legacy production model v2.
 *
 * Новые Three.js/geometry-процессы должны использовать `src/constructor/geometry/*`
 * и `buildCabinetGeometry()`.
 *
 * Файл оставлен временно, потому что на него ещё завязаны старые процессы:
 * pricing, payload, basisAdapter/manualExport, rules/drillingTemplates.
 * Не добавлять новые импорты на этот слой.
 */

import type { ConstructorProject } from './schema'

export type PanelRole =
  | 'side-left'
  | 'side-right'
  | 'top'
  | 'bottom'
  | 'partition'
  | 'shelf'
  | 'back'
  | 'facade-door'
  | 'facade-drawer'
  | 'drawer-side'
  | 'drawer-front-back'
  | 'drawer-bottom'
  | 'plinth'

export type MaterialType = 'ldsp' | 'hdf' | 'mdf'
export type EdgeSide = 'front' | 'back' | 'left' | 'right'
export type PanelFaceSide = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'

export interface EdgeBandingSide {
  side: EdgeSide
  materialId: string
  thicknessMm: 0.8 | 1 | 2
  widthMm: number
  facade?: FacadeProductionMeta
  note?: string
}

export type EdgeBanding = Partial<Record<EdgeSide, EdgeBandingSide>>

export interface BasisPlacement {
  x: number
  y: number
  z: number
  /** Размер панели по X в мм */
  width: number
  /** Размер панели по Z/Y в мм — зависит от ориентации, на этапе MVP хранится как производственный размер */
  height: number
  /** Толщина панели в мм */
  thickness: number
  /** Ориентация для будущего скрипта БАЗИС */
  orientation: 'vertical-xz' | 'horizontal-xz' | 'front-xy' | 'back-xy'
}

export interface FacadeProductionMeta {
  mode: ConstructorProject['material']['facadeMode']
  mount: ConstructorProject['material']['facadeMount']
  swing?: ConstructorProject['material']['doorSwing']
  gapMm: number
  sectionId?: number
  facadeIndex?: number
  totalInSection?: number
}

export interface ProductionPanel {
  id: string
  name: string
  role: PanelRole
  materialType: MaterialType
  materialDecorId: string
  materialTitle: string
  thicknessMm: number
  widthMm: number
  heightMm: number
  quantity: number
  faceSide: PanelFaceSide
  edge: EdgeBanding
  areaM2: number
  edgeLm: number
  basis: BasisPlacement
  facade?: FacadeProductionMeta
  note?: string
}

export type DrillingPurpose = 'confirmat' | 'shelf-pin' | 'hinge' | 'runner' | 'handle' | 'rod-holder' | 'eccentric'

export interface DrillingOperation {
  id: string
  panelId: string
  x: number
  y: number
  z: number
  diameterMm: number
  depthMm: number
  side: PanelFaceSide
  purpose: DrillingPurpose
  templateId?: string
  requiresTechnologistCheck: boolean
  note?: string
}

export interface HardwareItem {
  id: string
  catalogItemId: string
  title: string
  quantity: number
  unit: 'piece' | 'set'
  unitPrice: number
  totalPrice: number
  relatedPanelIds?: string[]
  note?: string
}

export interface BasisExportPlanStep {
  id: string
  title: string
  status: 'ready-for-script' | 'requires-mapping' | 'requires-technologist-check'
  note: string
}

export interface ProductionModel {
  schema: 'razmerno.production-model.v2'
  source: 'constructor'
  productType: ConstructorProject['productType']
  dimensions: ConstructorProject['dimensions']
  thicknessMm: number
  panels: ProductionPanel[]
  drilling: DrillingOperation[]
  hardware: HardwareItem[]
  totals: {
    panelAreaM2: number
    bodyAreaM2: number
    facadeAreaM2: number
    hdfAreaM2: number
    edgeLm: number
    panelCount: number
    drillingCount: number
    hardwareCount: number
    materialAreas: Record<MaterialType, number>
  }
  basisExportPlan: BasisExportPlanStep[]
  basisNotes: string[]
}

