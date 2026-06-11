import type { ConstructorProject } from '../schema'
import { getEstimate } from '../pricing'
import { buildProductionModel } from '../productionModel'
import { buildBasisScriptPlan } from '../basisAdapter'
import { BASIS_DESIGN_RULES, RAZMERNO_MANUAL_BASIS_WORKFLOW } from './basisRules'

export interface ManualBasisJsonExport {
  schema: 'razmerno.manual-basis-json.v1'
  createdAt: string
  disclaimer: string
  workflow: string[]
  designRules: typeof BASIS_DESIGN_RULES
  project: ConstructorProject
  estimate: ReturnType<typeof getEstimate>
  productionModel: ReturnType<typeof buildProductionModel>
  basisScriptPlan: ReturnType<typeof buildBasisScriptPlan>
  manualChecklist: string[]
}

export function buildManualBasisJsonExport(project: ConstructorProject): ManualBasisJsonExport {
  return {
    schema: 'razmerno.manual-basis-json.v1',
    createdAt: new Date().toISOString(),
    disclaimer: 'MVP-экспорт для ручной сборки проекта в БАЗИС-Мебельщик. Это не .b3d и не автоматический API-интегратор.',
    workflow: RAZMERNO_MANUAL_BASIS_WORKFLOW,
    designRules: BASIS_DESIGN_RULES,
    project,
    estimate: getEstimate(project),
    productionModel: buildProductionModel(project),
    basisScriptPlan: buildBasisScriptPlan(project),
    manualChecklist: [
      'Проверить габариты изделия и единицы измерения.',
      'Сопоставить все материалы с библиотекой БАЗИС.',
      'Проверить ориентацию панелей и лицевую сторону.',
      'Проверить кромление каждой стороны детали.',
      'Проверить координаты присадки.',
      'Проверить фурнитуру и крепёж.',
      'Проверить итоговую спецификацию и смету.',
    ],
  }
}

export function downloadManualBasisJson(project: ConstructorProject): void {
  const payload = buildManualBasisJsonExport(project)
  const { productType, dimensions } = project
  const fileName = `razmerno-basis-manual-${productType}-${dimensions.width}x${dimensions.height}x${dimensions.depth}.json`
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
