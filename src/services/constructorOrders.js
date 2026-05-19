import { apiPost, shouldUseMockApi } from './constructorApiClient'

function createRequestId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

async function createMockOrder(payload) {
  await new Promise(resolve => setTimeout(resolve, 350))

  return {
    ok: true,
    orderId: `RZM-${createRequestId('mock').slice(-8).toUpperCase()}`,
    status: 'created',
    payment: {
      status: 'pending',
      paymentUrl: null,
    },
    managerReviewRequired: true,
    payload,
  }
}

function buildProjectSnapshot(payload) {
  return {
    productType: payload?.productType ?? 'cabinet_wardrobe',
    schemaVersion: payload?.version ?? 'frontend-mvp-v1',
    dimensions: payload?.dimensions ?? null,
    sections: payload?.sections ?? null,
    filling: payload?.filling ?? [],
    material: payload?.material ?? null,
    summary: payload?.summary ?? null,
    estimate: payload?.estimate ?? null,
    production: payload?.production ?? null,
  }
}

function normalizeOrderContract(payload) {
  if (payload?.contractVersion && payload?.schemaVersion) {
    return payload
  }

  return {
    contractVersion: 'razmerno-constructor-v1',
    schemaVersion: 'order-mvp-v1',
    requestId: createRequestId('order'),
    project: buildProjectSnapshot(payload),
    order: {
      customer: payload?.customer ?? {},
      delivery: payload?.delivery ?? {},
      services: payload?.services ?? {},
      payment: payload?.payment ?? {},
      agreements: payload?.agreements ?? {},
      auth: payload?.auth ?? {},
      sourcePayload: payload,
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

export async function createConstructorOrder(payload) {
  const contractPayload = normalizeOrderContract(payload)

  if (shouldUseMockApi()) {
    return createMockOrder(contractPayload)
  }

  return apiPost('/api/constructor/orders', contractPayload)
}
