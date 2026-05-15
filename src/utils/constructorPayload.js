export function buildConstructorPayload(project, summary) {
  return {
    productType: 'cabinet_wardrobe',
    version: 'frontend-mvp-v1',
    dimensions: project.dimensions,
    sections: project.sections,
    activeSection: project.activeSection,
    filling: project.filling.map((section, index) => ({
      section: index + 1,
      shelves: section.shelves,
      drawers: section.drawers,
      rail: section.rail,
    })),
    material: {
      id: project.material.materialId,
      title: project.material.body,
      manufacturer: project.material.manufacturer ?? '',
      article: project.material.article ?? '',
      thickness: project.material.thickness,
      tone: project.material.tone,
      priceFactor: project.material.priceFactor ?? 1,
      edge: {
        id: project.material.edgeId,
        title: project.material.edge,
        priceAdd: project.material.edgePriceAdd ?? 0,
      },
      opening: {
        id: project.material.handleId,
        title: project.material.handles,
        priceAdd: project.material.handlePriceAdd ?? 0,
      },
      hardware: {
        id: project.material.hardwareId,
        title: project.material.hardware ?? 'Стандарт',
        priceAdd: project.material.hardwarePriceAdd ?? 0,
      },
    },
    summary,
    estimate: {
      total: project.price,
      breakdown: project.priceBreakdown,
      currency: 'RUB',
      note: 'frontend_preliminary_estimate_until_backend_pricing',
    },
    production: {
      leadTime: '10–14 дней',
      city: 'Москва',
      deliveryInsideMkad: 6000,
      deliveryOutsideMkadPerKm: 75,
      managerReviewRequired: true,
    },
  }
}
