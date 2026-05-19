import { apiPost, shouldUseMockApi } from './constructorApiClient'

async function createMockOrder(payload) {
  await new Promise(resolve => setTimeout(resolve, 350))

  return {
    ok: true,
    orderId: `RZM-${Date.now().toString().slice(-6)}`,
    status: 'created',
    payment: {
      status: 'pending',
      paymentUrl: null,
    },
    managerReviewRequired: true,
    payload,
  }
}

function normalizeOrderContract(payload) {
  if (payload?.contractVersion && payload?.schemaVersion) {
    return payload
  }

  return {
    contractVersion: 'razmerno-constructor-v1',
    schemaVersion: 'order-mvp-v1',
    requestId: `order_${Date.now().toString(36)}`,
    order: payload,
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
