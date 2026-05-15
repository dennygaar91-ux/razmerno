export function buildConstructorPayload(project, summary) {
  return {
    productType: 'cabinet_wardrobe',
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
      thickness: project.material.thickness,
      edge: project.material.edge,
      opening: project.material.handles,
      openingId: project.material.handleId,
    },
    summary,
    estimate: {
      total: project.price,
      breakdown: project.priceBreakdown,
      currency: 'RUB',
    },
    production: {
      leadTime: '10–14 дней',
      city: 'Москва',
      deliveryFrom: 6000,
    },
  }
}
