import { SCHEMA_VERSION, type ConstructorProject } from './schema'
import { getEstimate } from './pricing'
import { validateProject } from './rules'
import { getMaterial, getOpening, getHardware, getFacadeMode } from './catalog'
import { buildProductionModel, type ProductionModel } from './productionModel'
import { buildBasisScriptPlan, type BasisScriptPlan } from './basisAdapter'

export interface CustomerDraft {
  name: string
  phone: string
  address?: string
  requestType?: 'order' | 'consultation'
  contactMethod?: 'phone' | 'whatsapp' | 'telegram'
  comment?: string
  assembly?: boolean
  agreed?: boolean
}

export interface OrderPayload {
  schemaVersion: 1
  idempotencyKey: string
  project: {
    productType: ConstructorProject['productType']
    dimensions: ConstructorProject['dimensions']
    sections: ConstructorProject['sections']
    material: {
      bodyDecor: { id: string; title: string }
      facadeDecor: { id: string; title: string }
      edgeDecor: { id: string; title: string }
      thicknessMm: 16
      edge: ConstructorProject['material']['edge']
      facadeMode: { id: string; title: string }
      opening: { id: string; title: string }
      hardware: { id: string; title: string }
    }
  }
  estimate: ReturnType<typeof getEstimate>
  productionModel: ProductionModel
  basisScriptPlan: BasisScriptPlan
  issues: ReturnType<typeof validateProject>
  customer: Required<Pick<CustomerDraft, 'name' | 'phone' | 'comment'>> & {
    address?: string
    assembly: boolean
    agreed: boolean
  }
  clientMeta: {
    submittedAt: string
    userAgent: string
    locale: string
  }
}

function makeIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function buildOrderPayload(
  project: ConstructorProject,
  customer: CustomerDraft,
  options: { idempotencyKey?: string } = {},
): OrderPayload {
  const estimate = getEstimate(project)
  const issues = validateProject(project)
  const material = getMaterial(project.material.bodyDecorId)
  const facadeMaterial = getMaterial(project.material.facadeDecorId)
  const edgeMaterial = getMaterial(project.material.edgeDecorId)
  const facadeMode = getFacadeMode(project.material.facadeMode)
  const productionModel = buildProductionModel(project)
  const basisScriptPlan = buildBasisScriptPlan(project)
  const opening = getOpening(project.material.opening)
  const hardware = getHardware(project.material.hardware)

  return {
    schemaVersion: SCHEMA_VERSION,
    idempotencyKey: options.idempotencyKey ?? makeIdempotencyKey(),
    project: {
      productType: project.productType,
      dimensions: project.dimensions,
      sections: project.sections,
      material: {
        bodyDecor: { id: material.id, title: material.title },
        facadeDecor: { id: facadeMaterial.id, title: facadeMaterial.title },
        edgeDecor: { id: edgeMaterial.id, title: edgeMaterial.title },
        thicknessMm: 16,
        edge: project.material.edge,
        facadeMode: { id: facadeMode.id, title: facadeMode.title },
        opening: { id: opening.id, title: opening.title },
        hardware: { id: hardware.id, title: hardware.title },
      },
    },
    estimate,
    productionModel,
    basisScriptPlan,
    issues,
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      address: customer.address?.trim() || undefined,
      comment: [
        customer.requestType ? `Тип обращения: ${customer.requestType === 'consultation' ? 'консультация' : 'заказ'}` : '',
        customer.contactMethod ? `Удобный способ связи: ${customer.contactMethod}` : '',
        (customer.comment ?? '').trim(),
      ].filter(Boolean).join(' · '),
      assembly: Boolean(customer.assembly),
      agreed: Boolean(customer.agreed),
    },
    clientMeta: {
      submittedAt: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      locale: typeof navigator !== 'undefined' ? navigator.language : 'ru-RU',
    },
  }
}
