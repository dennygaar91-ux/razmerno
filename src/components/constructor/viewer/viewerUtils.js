export function getSectionLabel(section) {
  if (section.rail && section.shelves <= 2 && section.drawers === 0) return 'Одежда'
  if (section.shelves >= 4 && section.drawers === 0 && !section.rail) return 'Полки'
  if (section.drawers >= 2) return 'Ящики'
  if (!section.shelves && !section.drawers && !section.rail) return 'Пусто'
  return 'Смешанная'
}

export function formatSection(section) {
  const parts = []
  if (section.shelves) parts.push(`${section.shelves}П`)
  if (section.drawers) parts.push(`${section.drawers}Я`)
  if (section.rail) parts.push('Ш')
  return parts.length ? parts.join(' · ') : 'Пусто'
}

export function buildViewerSceneProps(project) {
  const sectionWidth = Math.round(project.dimensions.width / project.sections)
  const fillingElements = project.filling.reduce((total, section) => total + section.shelves + section.drawers + (section.rail ? 1 : 0), 0)

  return {
    dimensions: project.dimensions,
    sections: project.sections,
    sectionWidth,
    activeSection: project.activeSection,
    filling: project.filling,
    material: project.material,
    meta: {
      sectionWidth,
      fillingElements,
      materialTone: project.material.body,
      rendererReady: false,
    },
    three: {
      unit: 'mm',
      coordinateSystem: 'width-x_height-y_depth-z',
      cabinet: {
        width: project.dimensions.width,
        height: project.dimensions.height,
        depth: project.dimensions.depth,
        sectionWidth,
        sectionCount: project.sections,
      },
      material: {
        id: project.material.materialId,
        tone: project.material.tone,
        title: project.material.body,
        thickness: project.material.thickness,
      },
      sections: project.filling.map((section, index) => ({
        id: `section-${index + 1}`,
        index,
        number: index + 1,
        width: sectionWidth,
        height: project.dimensions.height,
        depth: project.dimensions.depth,
        active: project.activeSection === index + 1,
        shelves: section.shelves,
        drawers: section.drawers,
        rail: section.rail,
        label: getSectionLabel(section),
      })),
    },
  }
}