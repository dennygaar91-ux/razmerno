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

export async function createConstructorOrder(payload) {
  if (shouldUseMockApi()) {
    return createMockOrder(payload)
  }

  return apiPost('/api/constructor/orders', payload)
}
