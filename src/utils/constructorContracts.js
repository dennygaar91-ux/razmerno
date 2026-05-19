import { calculatePrice, getPriceBreakdown, getProjectSummary, getWarnings } from './constructorPricing'
import { buildConstructorPayload } from './constructorPayload'

export const CONSTRUCTOR_CONTRACT_VERSION = 'razmerno-constructor-v1'
export const CONSTRUCTOR_PROJECT_SCHEMA_VERSION = 'wardrobe-mvp-v1'
export const CONSTRUCTOR_ESTIMATE_SCHEMA_VERSION = 'estimate-mvp-v1'
export const CONSTRUCTOR_ORDER_SCHEMA_VERSION = 'order-mvp-v1'
export const BASIS_EXPORT_SCHEMA_VERSION = 'basis-json-mvp-v1'

function createRequestId(prefix = 'rzm') {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${timestamp}_${random}`
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeFilling(project) {
  return safeArray(project.filling).map((section, index) => ({
    sectionId: `section-${index + 1}`,
    sectionNumber: index + 1,
    shelves: Number(section.shelves) || 0,
    drawers: Number(section.drawers) || 0,
    rail: Boolean(section.rail),
    zones: safeArray(section.zones),
  }))
}

export function buildBackendProjectContract(project) {
  return {
    contractVersion: CONSTRUCTOR_CONTRACT_VERSION,
    schemaVersion: CONSTRUCTOR_PROJECT_SCHEMA_VERSION,
    productType: 'wardrobe',
    productSubtype: 'straight_cabinet',
    source: 'constructor_frontend',
    dimensions: {
      width: Number(project.dimensions?.width) || 0,
      height: Number(project.dimensions?.height) || 0,
      depth: Number(project.dimensions?.depth) || 0,
      unit: 'mm',
    },
    sections: {
      count: Number(project.sections) || 1,
      activeSection: Number(project.activeSection) || 1,
      filling: normalizeFilling(project),
    },
    material: {
      bodyMaterialId: project.material?.materialId ?? '',
      bodyTitle: project.material?.body ?? '',
      manufacturer: project.material?.manufacturer ?? '',
      article: project.material?.article ?? '',
      thickness: project.material?.thickness ?? '',
      tone: project.material?.tone ?? '',
      priceFactor: Number(project.material?.priceFactor) || 1,
      edgeId: project.material?.edgeId ?? '',
      edgeTitle: project.material?.edge ?? '',
      edgePriceAdd: Number(project.material?.edgePriceAdd) || 0,
      openingId: project.material?.handleId ?? '',
      openingTitle: project.material?.handles ?? '',
      openingPriceAdd: Number(project.material?.handlePriceAdd) || 0,
      hardwareId: project.material?.hardwareId ?? '',
      hardwareTitle: project.material?.hardware ?? 'Стандарт',
      hardwarePriceAdd: Number(project.material?.hardwarePriceAdd) || 0,
    },
    productionRules: {
      edgeAllSides: true,
      edgeAffectsFinalPartSize: true,
      shelfMinClearanceMm: 200,
      drawerMinFrontHeightMm: 200,
      drillingRequired: true,
      managerReviewRequired: true,
    },
  }
}

export function buildEstimateRequestContract(project) {
  const summary = getProjectSummary(project)
  const warnings = getWarnings(project, summary)

  return {
    requestId: createRequestId('estimate'),
    contractVersion: CONSTRUCTOR_CONTRACT_VERSION,
    schemaVersion: CONSTRUCTOR_ESTIMATE_SCHEMA_VERSION,
    project: buildBackendProjectContract(project),
    requestedOutputs: ['summary', 'warnings', 'priceBreakdown', 'totalPrice'],
    fallbackPolicy: {
      allowFrontendEstimate: true,
      currency: 'RUB',
    },
    frontendSnapshot: {
      summary,
      warnings,
      estimate: {
        total: calculatePrice(project, summary),
        breakdown: getPriceBreakdown(project, summary),
        currency: 'RUB',
      },
    },
  }
}

export function buildOrderRequestContract(project, orderPayload, customerData = {}) {
  const summary = getProjectSummary(project)
  const warnings = getWarnings(project, summary)
  const frontendPayload = buildConstructorPayload(project, { summary, warnings })

  return {
    requestId: createRequestId('order'),
    contractVersion: CONSTRUCTOR_CONTRACT_VERSION,
    schemaVersion: CONSTRUCTOR_ORDER_SCHEMA_VERSION,
    project: buildBackendProjectContract(project),
    order: {
      ...frontendPayload,
      ...orderPayload,
      customer: orderPayload?.customer ?? customerData,
      status: 'created_by_frontend',
      managerReviewRequired: true,
    },
    audit: {
      createdBy: 'guest_checkout',
      source: 'razmerno_constructor',
      paymentRequiredNow: false,
      finalPriceRequiresManagerReview: true,
    },
  }
}

export function buildBasisExportContract(project) {
  const summary = getProjectSummary(project)
  const warnings = getWarnings(project, summary)

  return {
    requestId: createRequestId('basis'),
    contractVersion: CONSTRUCTOR_CONTRACT_VERSION,
    schemaVersion: BASIS_EXPORT_SCHEMA_VERSION,
    target: {
      system: 'basis_mebelshchik',
      version: '20+',
      exportMode: 'json_for_local_script',
    },
    project: buildBackendProjectContract(project),
    summary,
    warnings,
    manufacturing: {
      needCuttingList: true,
      needEdgebanding: true,
      needDrillingMap: true,
      needHardwareMap: true,
      outputFiles: ['json', 'future_b3d'],
    },
  }
}
