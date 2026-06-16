import assert from 'node:assert/strict'
import { buildProductionModel } from '../../src/constructor/productionModel'
import type { DrillingOperation, HardwareItem, ProductionModel, ProductionPanel } from '../../src/constructor/productionModel.types'
import { productionGoldenCases } from '../fixtures/production-golden-cases'

type NormalizedPanel = Pick<
  ProductionPanel,
  | 'id'
  | 'role'
  | 'materialType'
  | 'materialDecorId'
  | 'thicknessMm'
  | 'widthMm'
  | 'heightMm'
  | 'quantity'
  | 'faceSide'
  | 'edge'
  | 'basis'
  | 'facade'
>

type NormalizedOperation = Pick<
  DrillingOperation,
  | 'id'
  | 'panelId'
  | 'x'
  | 'y'
  | 'z'
  | 'diameterMm'
  | 'depthMm'
  | 'side'
  | 'purpose'
  | 'templateId'
  | 'requiresTechnologistCheck'
>

type NormalizedHardware = Pick<
  HardwareItem,
  | 'id'
  | 'catalogItemId'
  | 'quantity'
  | 'unit'
  | 'relatedPanelIds'
>

interface ProductionSnapshot {
  schema: ProductionModel['schema']
  source: ProductionModel['source']
  productType: ProductionModel['productType']
  dimensions: ProductionModel['dimensions']
  thicknessMm: number
  panels: NormalizedPanel[]
  drilling: NormalizedOperation[]
  hardware: NormalizedHardware[]
  totals: ProductionModel['totals']
  productionStatus: {
    requiresTechnologistCheck: boolean
    operationCheckCount: number
    basisExportStatuses: string[]
  }
  basisExportPlan: ProductionModel['basisExportPlan']
}

const VOLATILE_FIELD_NAMES = ['generatedAt', 'createdAt', 'updatedAt', 'orderId', 'projectId', 'timestamp']

function roundValue(value: unknown): unknown {
  if (typeof value === 'number') return Number(value.toFixed(4))
  if (Array.isArray(value)) return value.map(roundValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !VOLATILE_FIELD_NAMES.includes(key))
        .map(([key, child]) => [key, roundValue(child)]),
    )
  }
  return value
}

export function normalizeProductionSnapshot(model: ProductionModel): ProductionSnapshot {
  const panels = [...model.panels]
    .map(panel => roundValue({
      id: panel.id,
      role: panel.role,
      materialType: panel.materialType,
      materialDecorId: panel.materialDecorId,
      thicknessMm: panel.thicknessMm,
      widthMm: panel.widthMm,
      heightMm: panel.heightMm,
      quantity: panel.quantity,
      faceSide: panel.faceSide,
      edge: panel.edge,
      basis: panel.basis,
      facade: panel.facade,
    }) as NormalizedPanel)
    .sort((a, b) => a.id.localeCompare(b.id))

  const drilling = [...model.drilling]
    .map(operation => roundValue({
      id: operation.id,
      panelId: operation.panelId,
      x: operation.x,
      y: operation.y,
      z: operation.z,
      diameterMm: operation.diameterMm,
      depthMm: operation.depthMm,
      side: operation.side,
      purpose: operation.purpose,
      templateId: operation.templateId,
      requiresTechnologistCheck: operation.requiresTechnologistCheck,
    }) as NormalizedOperation)
    .sort((a, b) => a.id.localeCompare(b.id))

  const hardware = [...model.hardware]
    .map(item => roundValue({
      id: item.id,
      catalogItemId: item.catalogItemId,
      quantity: item.quantity,
      unit: item.unit,
      relatedPanelIds: item.relatedPanelIds ? [...item.relatedPanelIds].sort() : undefined,
    }) as NormalizedHardware)
    .sort((a, b) => a.id.localeCompare(b.id))

  const operationCheckCount = drilling.filter(operation => operation.requiresTechnologistCheck).length

  return {
    schema: model.schema,
    source: model.source,
    productType: model.productType,
    dimensions: model.dimensions,
    thicknessMm: model.thicknessMm,
    panels,
    drilling,
    hardware,
    totals: roundValue(model.totals) as ProductionModel['totals'],
    productionStatus: {
      requiresTechnologistCheck: operationCheckCount > 0,
      operationCheckCount,
      basisExportStatuses: model.basisExportPlan.map(step => step.status).sort(),
    },
    basisExportPlan: [...model.basisExportPlan].sort((a, b) => a.id.localeCompare(b.id)),
  }
}

function assertNoVolatileFields(value: unknown, path = 'snapshot'): void {
  if (Array.isArray(value)) {
    value.forEach((child, index) => assertNoVolatileFields(child, `${path}[${index}]`))
    return
  }
  if (!value || typeof value !== 'object') return
  Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
    assert(!VOLATILE_FIELD_NAMES.includes(key), `${path}.${key} is volatile and must not be present in production golden snapshots`)
    assertNoVolatileFields(child, `${path}.${key}`)
  })
}

function buildSnapshot(caseId: string): ProductionSnapshot {
  const goldenCase = productionGoldenCases.find(item => item.id === caseId)
  assert(goldenCase, `Missing golden case: ${caseId}`)
  return normalizeProductionSnapshot(buildProductionModel(goldenCase.project))
}

const EXPECTED_CONTRACT = {
  'basic-wardrobe': {
    minPanels: 6,
    requiredPanelRoles: ['side-left', 'side-right', 'top', 'bottom', 'back', 'plinth', 'facade-door'],
    requiredHardware: ['adjustable-legs-plinth', 'confirmats', 'hinges'],
    requiredOperations: ['confirmat', 'hinge'],
    requiresTechnologistCheck: true,
  },
  'wardrobe-with-shelves': {
    minPanels: 8,
    requiredPanelRoles: ['partition', 'shelf', 'facade-door'],
    requiredHardware: ['reinforced-shelf-holders', 'hinges', 'confirmats'],
    requiredOperations: ['shelf-pin', 'hinge', 'confirmat'],
    requiresTechnologistCheck: true,
  },
  'wardrobe-with-drawers-and-rod': {
    minPanels: 10,
    requiredPanelRoles: ['drawer-side', 'drawer-front-back', 'facade-drawer', 'facade-door'],
    requiredHardware: ['drawer-runners', 'clothes-rod', 'hinges', 'confirmats'],
    requiredOperations: ['runner', 'rod-holder', 'handle', 'hinge'],
    requiresTechnologistCheck: true,
  },
  'wardrobe-with-production-warnings': {
    minPanels: 7,
    requiredPanelRoles: ['shelf', 'plinth', 'back'],
    requiredHardware: ['clothes-rod', 'reinforced-shelf-holders', 'confirmats'],
    requiredOperations: ['rod-holder', 'shelf-pin', 'confirmat'],
    requiresTechnologistCheck: true,
  },
} as const

for (const goldenCase of productionGoldenCases) {
  const expected = EXPECTED_CONTRACT[goldenCase.id as keyof typeof EXPECTED_CONTRACT]

  assert(expected, `Missing expected contract for ${goldenCase.id}`)

  const first = buildSnapshot(goldenCase.id)
  const second = buildSnapshot(goldenCase.id)

  assert.deepEqual(first, second, `${goldenCase.id} production output must be deterministic`)
  assert.equal(first.schema, 'razmerno.production-model.v2')
  assert.equal(first.source, 'constructor')
  assert.equal(first.productType, 'wardrobe')
  assert.equal(first.thicknessMm, 16)
  assert(first.panels.length >= expected.minPanels, `${goldenCase.id} must keep expected minimum panel coverage`)
  assert(first.drilling.length > 0, `${goldenCase.id} must include drilling/operations coverage`)
  assert(first.hardware.length > 0, `${goldenCase.id} must include hardware coverage`)
  assert.equal(first.totals.panelCount, first.panels.reduce((sum, panel) => sum + panel.quantity, 0))
  assert.equal(first.totals.drillingCount, first.drilling.length)
  assert.equal(first.totals.hardwareCount, first.hardware.reduce((sum, item) => sum + item.quantity, 0))
  assert.equal(first.productionStatus.requiresTechnologistCheck, expected.requiresTechnologistCheck)
  assert(first.basisExportPlan.length > 0, `${goldenCase.id} must keep basis/export-ready section in production JSON`)
  assertNoVolatileFields(first)

  for (const role of expected.requiredPanelRoles) {
    assert(first.panels.some(panel => panel.role === role), `${goldenCase.id} must include panel role: ${role}`)
  }
  for (const hardwareId of expected.requiredHardware) {
    assert(first.hardware.some(item => item.id === hardwareId), `${goldenCase.id} must include hardware: ${hardwareId}`)
  }
  for (const purpose of expected.requiredOperations) {
    assert(first.drilling.some(operation => operation.purpose === purpose), `${goldenCase.id} must include operation: ${purpose}`)
  }
}

assert.equal(productionGoldenCases.length, 4, 'Production golden snapshots must keep exactly four MVP golden cases for this contract version')

console.log('Production golden snapshots contract passed:', productionGoldenCases.map(item => item.id).join(', '))
