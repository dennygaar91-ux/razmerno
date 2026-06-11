import type { ConstructorProject } from './schema'
import { getEstimate } from './pricing'
import { buildProductionModel, type DrillingOperation, type ProductionModel, type ProductionPanel } from './productionModel'
import { getMaterial } from './catalog'
import { HDF_PRICE } from './priceList'
import { BASIS_DESIGN_RULES, RAZMERNO_MANUAL_BASIS_WORKFLOW, RAZMERNO_PHASE_F_DECISIONS } from './basis/basisRules'

export type BasisCommandStatus = 'ready' | 'needs-mapping' | 'needs-technologist-check'
export type BasisCommandType =
  | 'create-document'
  | 'register-material'
  | 'create-panel'
  | 'apply-edge'
  | 'add-drilling'
  | 'place-hardware'
  | 'validate-model'

export interface BasisCommand<TPayload = unknown> {
  id: string
  type: BasisCommandType
  status: BasisCommandStatus
  title: string
  payload: TPayload
  note?: string
}

export interface BasisMaterialMapping {
  materialId: string
  title: string
  materialType: ProductionPanel['materialType'] | 'edge'
  thicknessMm?: number
  source: 'constructor-catalog' | 'price-list' | 'mvp-manual'
  basisMaterialName?: string
  basisLibraryPath?: string
  status: 'mapped' | 'requires-basis-library-match'
  note?: string
}

export interface BasisPanelPayload {
  panelId: string
  name: string
  role: ProductionPanel['role']
  materialId: string
  materialType: ProductionPanel['materialType']
  thicknessMm: number
  widthMm: number
  heightMm: number
  quantity: number
  faceSide: ProductionPanel['faceSide']
  placement: ProductionPanel['basis']
  facade?: ProductionPanel['facade']
}

export interface BasisEdgePayload {
  panelId: string
  side: string
  materialId: string
  thicknessMm: number
  widthMm: number
  note?: string
}

export interface BasisDrillingPayload extends DrillingOperation {
  requiresTechnologistCheck: boolean
  templateId?: string
}

export interface BasisScriptPlan {
  schema: 'razmerno.basis-script-plan.v1'
  sourceProductionSchema: ProductionModel['schema']
  createdAt: string
  productType: ConstructorProject['productType']
  dimensions: ConstructorProject['dimensions']
  pricingSource: ReturnType<typeof getEstimate>['pricingSource']
  estimateTotal: number
  materialMappings: BasisMaterialMapping[]
  commands: BasisCommand<unknown>[]
  warnings: string[]
  nextSteps: string[]
  designRules: typeof BASIS_DESIGN_RULES
  manualWorkflow: string[]
  phaseFDecisions: typeof RAZMERNO_PHASE_F_DECISIONS
}

export interface TechnicalProjectExport {
  schema: 'razmerno.technical-project-export.v1'
  createdAt: string
  project: ConstructorProject
  estimate: ReturnType<typeof getEstimate>
  productionModel: ProductionModel
  basisScriptPlan: BasisScriptPlan
}

function unique<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = getKey(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function materialMappingFromPanel(panel: ProductionPanel): BasisMaterialMapping {
  if (panel.materialType === 'hdf') {
    return {
      materialId: panel.materialDecorId,
      title: HDF_PRICE.title,
      materialType: 'hdf',
      thicknessMm: panel.thicknessMm,
      source: 'mvp-manual',
      status: 'requires-basis-library-match',
      note: 'ХДФ добавлен как отдельный технический материал. Нужно сопоставить с материалом в базе БАЗИС.',
    }
  }

  const catalogItem = getMaterial(panel.materialDecorId)
  return {
    materialId: panel.materialDecorId,
    title: catalogItem.title,
    materialType: panel.materialType,
    thicknessMm: panel.thicknessMm,
    source: 'constructor-catalog',
    status: 'requires-basis-library-match',
    note: `${catalogItem.producer ?? 'Производитель не указан'} ${catalogItem.article ?? ''}`.trim(),
  }
}

function edgeMappings(model: ProductionModel): BasisMaterialMapping[] {
  const edges = model.panels.flatMap(panel => Object.values(panel.edge).filter(Boolean))
  return unique(edges, edge => `${edge.materialId}-${edge.thicknessMm}`).map(edge => {
    const catalogItem = getMaterial(edge.materialId)
    return {
      materialId: `${edge.materialId}-${edge.thicknessMm}mm-edge`,
      title: `Кромка ${catalogItem.title} ${edge.thicknessMm} мм`,
      materialType: 'edge',
      thicknessMm: edge.thicknessMm,
      source: 'constructor-catalog',
      status: 'requires-basis-library-match',
      note: `Ширина ${edge.widthMm} мм. Сопоставить с материалом кромки в БАЗИС.`,
    }
  })
}

function createPanelCommands(model: ProductionModel): BasisCommand<BasisPanelPayload>[] {
  return model.panels.map(panel => ({
    id: `panel:${panel.id}`,
    type: 'create-panel',
    status: 'ready',
    title: `Создать панель: ${panel.name}`,
    payload: {
      panelId: panel.id,
      name: panel.name,
      role: panel.role,
      materialId: panel.materialDecorId,
      materialType: panel.materialType,
      thicknessMm: panel.thicknessMm,
      widthMm: panel.widthMm,
      heightMm: panel.heightMm,
      quantity: panel.quantity,
      faceSide: panel.faceSide,
      placement: panel.basis,
      facade: panel.facade,
    },
    note: panel.note,
  }))
}

function createEdgeCommands(model: ProductionModel): BasisCommand<BasisEdgePayload>[] {
  return model.panels.flatMap(panel => Object.values(panel.edge).filter(Boolean).map(edge => ({
    id: `edge:${panel.id}:${edge.side}`,
    type: 'apply-edge' as const,
    status: 'ready' as const,
    title: `Нанести кромку: ${panel.name} / ${edge.side}`,
    payload: {
      panelId: panel.id,
      side: edge.side,
      materialId: edge.materialId,
      thicknessMm: edge.thicknessMm,
      widthMm: edge.widthMm,
      note: edge.note,
    },
    note: 'Стороны кромки заданы в терминах productionModel; в БАЗИС-скрипте нужно сопоставить с ориентацией панели.',
  })))
}

function createDrillingCommands(model: ProductionModel): BasisCommand<BasisDrillingPayload>[] {
  return model.drilling.map(operation => ({
    id: `drilling:${operation.id}`,
    type: 'add-drilling',
    status: 'needs-technologist-check',
    title: `Добавить присадку: ${operation.purpose}`,
    payload: {
      ...operation,
      requiresTechnologistCheck: operation.requiresTechnologistCheck,
    },
    note: operation.note ?? 'MVP-координата. Проверить перед генерацией .b3d.',
  }))
}

function createHardwareCommands(model: ProductionModel): BasisCommand<unknown>[] {
  return model.hardware.map(item => ({
    id: `hardware:${item.id}`,
    type: 'place-hardware',
    status: 'needs-mapping',
    title: `Разместить фурнитуру: ${item.title}`,
    payload: {
      hardwareId: item.id,
      title: item.title,
      quantity: item.quantity,
      unit: item.unit,
      relatedPanelIds: item.relatedPanelIds ?? [],
    },
    note: item.note ?? 'Сопоставить с фурнитурой в базе БАЗИС и уточнить координаты.',
  }))
}

export function buildBasisScriptPlan(project: ConstructorProject): BasisScriptPlan {
  const productionModel = buildProductionModel(project)
  const estimate = getEstimate(project)
  const panelMappings = unique(
    productionModel.panels.map(materialMappingFromPanel),
    item => `${item.materialId}-${item.materialType}-${item.thicknessMm ?? 0}`,
  )
  const materialMappings = [...panelMappings, ...edgeMappings(productionModel)]

  const commands: BasisCommand<unknown>[] = [
    {
      id: 'document:create-b3d',
      type: 'create-document',
      status: 'needs-mapping',
      title: 'Создать 3D-документ БАЗИС-Мебельщик',
      payload: {
        documentType: 'b3d',
        units: 'mm',
        productType: project.productType,
        dimensions: project.dimensions,
      },
      note: 'В БАЗИС-Мебельщик модели создаются как 3D-документы; этот шаг является планом для будущего скрипта.',
    },
    ...materialMappings.map<BasisCommand<unknown>>(mapping => ({
      id: `material:${mapping.materialId}`,
      type: 'register-material',
      status: mapping.status === 'mapped' ? 'ready' : 'needs-mapping',
      title: `Сопоставить материал: ${mapping.title}`,
      payload: mapping,
      note: mapping.note,
    })),
    ...createPanelCommands(productionModel),
    ...createEdgeCommands(productionModel),
    ...createDrillingCommands(productionModel),
    ...createHardwareCommands(productionModel),
    {
      id: 'validate:technologist-review',
      type: 'validate-model',
      status: 'needs-technologist-check',
      title: 'Проверить модель технологом перед производством',
      payload: {
        panels: productionModel.totals.panelCount,
        drilling: productionModel.totals.drillingCount,
        hardware: productionModel.totals.hardwareCount,
      },
      note: 'До автоматической генерации .b3d нужна проверка координат, петель, направляющих, кромки и пазов.',
    },
  ]

  return {
    schema: 'razmerno.basis-script-plan.v1',
    sourceProductionSchema: productionModel.schema,
    createdAt: new Date().toISOString(),
    productType: project.productType,
    dimensions: project.dimensions,
    pricingSource: estimate.pricingSource,
    estimateTotal: estimate.total,
    materialMappings,
    commands,
    warnings: [
      'Это не готовый .b3d-файл, а JSON-план для ручной сборки проекта в БАЗИС-Мебельщик.',
      'Материалы, кромку и фурнитуру нужно сопоставить с реальными библиотеками БАЗИС на рабочем месте технолога.',
      'drilling[] содержит координаты для проверки; перед запуском в производство обязательна проверка технологом.',
      'Подрезка заготовки, припуск и итоговый размер после кромления проверяются вручную.',
    ],
    nextSteps: [
      'Сопоставить materialId/edge materialId с библиотеками БАЗИС.',
      'Уточнить координаты присадки под выбранные петли, направляющие, ручки и крепёж.',
      'Создать проект вручную в БАЗИС по JSON-экспорту.',
      'После проверки сохранить результат как .b3d на рабочем месте с установленным БАЗИС-Мебельщик.',
    ],
    designRules: BASIS_DESIGN_RULES,
    manualWorkflow: RAZMERNO_MANUAL_BASIS_WORKFLOW,
    phaseFDecisions: RAZMERNO_PHASE_F_DECISIONS,
  }
}

export function buildTechnicalProjectExport(project: ConstructorProject): TechnicalProjectExport {
  return {
    schema: 'razmerno.technical-project-export.v1',
    createdAt: new Date().toISOString(),
    project,
    estimate: getEstimate(project),
    productionModel: buildProductionModel(project),
    basisScriptPlan: buildBasisScriptPlan(project),
  }
}

export function downloadTechnicalProjectJson(project: ConstructorProject): void {
  const exportModel = buildTechnicalProjectExport(project)
  const fileName = `razmerno-${project.productType}-${project.dimensions.width}x${project.dimensions.height}x${project.dimensions.depth}.json`
  const blob = new Blob([JSON.stringify(exportModel, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
