import { round2 } from './productionModelMath'
import type { DrillingOperation, HardwareItem, MaterialType, ProductionModel, ProductionPanel } from './productionModel.types'

export function getProductionTotals(
  panels: ProductionPanel[],
  hardware: HardwareItem[],
  drilling: DrillingOperation[],
): ProductionModel['totals'] {
  const materialAreas: Record<MaterialType, number> = {
    ldsp: round2(panels.filter(item => item.materialType === 'ldsp').reduce((sum, item) => sum + item.areaM2, 0)),
    hdf: round2(panels.filter(item => item.materialType === 'hdf').reduce((sum, item) => sum + item.areaM2, 0)),
    mdf: round2(panels.filter(item => item.materialType === 'mdf').reduce((sum, item) => sum + item.areaM2, 0)),
  }
  const bodyAreaM2 = round2(panels.filter(item => item.materialType === 'ldsp' && !item.role.startsWith('facade')).reduce((sum, item) => sum + item.areaM2, 0))
  const facadeAreaM2 = round2(panels.filter(item => item.role.startsWith('facade')).reduce((sum, item) => sum + item.areaM2, 0))
  const edgeTotal = round2(panels.reduce((sum, item) => sum + item.edgeLm, 0))
  const panelAreaTotal = round2(materialAreas.ldsp + materialAreas.hdf + materialAreas.mdf)
  const panelCount = panels.reduce((sum, item) => sum + item.quantity, 0)
  const hardwareCount = hardware.reduce((sum, item) => sum + item.quantity, 0)

  return {
    panelAreaM2: panelAreaTotal,
    bodyAreaM2,
    facadeAreaM2,
    hdfAreaM2: materialAreas.hdf,
    edgeLm: edgeTotal,
    panelCount,
    drillingCount: drilling.length,
    hardwareCount,
    materialAreas,
  }
}
