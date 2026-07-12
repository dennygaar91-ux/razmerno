import { getMaterial } from './catalog'
import { areaM2 } from './productionModelMath'
import { edgeLm } from './productionModelEdges'
import type { MaterialType, ProductionPanel } from './productionModel.types'

export function materialTitle(materialType: MaterialType, materialDecorId: string): string {
  if (materialType === 'hdf') return 'ХДФ 3 мм белый / технический'
  if (materialType === 'mdf') return 'МДФ'
  return getMaterial(materialDecorId).title
}

export function panel(
  input: Omit<ProductionPanel, 'areaM2' | 'edgeLm' | 'materialTitle'>,
): ProductionPanel | null {
  if (input.quantity <= 0) return null
  return {
    ...input,
    materialTitle: materialTitle(input.materialType, input.materialDecorId),
    areaM2: areaM2(input.widthMm, input.heightMm, input.quantity),
    edgeLm: edgeLm(input.edge, input.widthMm, input.heightMm, input.quantity),
  }
}

export function pushPanel(
  panels: ProductionPanel[],
  input: Omit<ProductionPanel, 'areaM2' | 'edgeLm' | 'materialTitle'>,
): void {
  const next = panel(input)
  if (next) panels.push(next)
}
