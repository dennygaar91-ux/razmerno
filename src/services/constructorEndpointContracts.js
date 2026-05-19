export const CONSTRUCTOR_ENDPOINTS = {
  estimate: {
    method: 'POST',
    path: '/api/constructor/estimate',
    requestSchema: 'estimate-mvp-v1',
    responseShape: {
      ok: 'boolean',
      estimate: 'object',
      summary: 'object',
      warnings: 'array',
    },
  },
  orders: {
    method: 'POST',
    path: '/api/constructor/orders',
    requestSchema: 'order-mvp-v1',
    responseShape: {
      ok: 'boolean',
      orderId: 'string',
      status: 'string',
      payment: 'object',
      managerReviewRequired: 'boolean',
    },
  },
  projectsSave: {
    method: 'POST',
    path: '/api/constructor/projects',
    requestSchema: 'wardrobe-mvp-v1',
    responseShape: {
      ok: 'boolean',
      projectId: 'string',
      updatedAt: 'string',
    },
  },
  projectsLoad: {
    method: 'GET',
    path: '/api/constructor/projects/:projectId',
    requestSchema: 'project-id',
    responseShape: {
      ok: 'boolean',
      projectId: 'string',
      project: 'object',
    },
  },
  basisExport: {
    method: 'POST',
    path: '/api/constructor/basis-export',
    requestSchema: 'basis-json-mvp-v1',
    responseShape: {
      ok: 'boolean',
      exportId: 'string',
      status: 'string',
      fileName: 'string',
      contract: 'object',
    },
  },
}

export function getConstructorEndpoint(name) {
  return CONSTRUCTOR_ENDPOINTS[name] ?? null
}
