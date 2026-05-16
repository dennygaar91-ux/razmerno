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

function getSectionBounds(project, index, sectionWidth) {
  const xMin = Math.round(index * sectionWidth)
  const xMax = Math.round((index + 1) * sectionWidth)

  return {
    xMin,
    xMax,
    yMin: 0,
    yMax: project.dimensions.height,
    zMin: 0,
    zMax: project.dimensions.depth,
  }
}

function buildSectionSlots(section) {
  const slots = []

  for (let index = 0; index < section.shelves; index += 1) {
    slots.push({ type: 'shelf', index, label: `Полка ${index + 1}` })
  }

  for (let index = 0; index < section.drawers; index += 1) {
    slots.push({ type: 'drawer', index, label: `Ящик ${index + 1}` })
  }

  if (section.rail) {
    slots.push({ type: 'rail', index: 0, label: 'Штанга' })
  }

  return slots
}

export function buildViewerSceneProps(project) {
  const sectionWidth = Math.round(project.dimensions.width / project.sections)
  const fillingElements = project.filling.reduce((total, section) => total + section.shelves + section.drawers + (section.rail ? 1 : 0), 0)
  const threeSections = project.filling.map((section, index) => ({
    id: `section-${index + 1}`,
    index,
    number: index + 1,
    width: sectionWidth,
    height: project.dimensions.height,
    depth: project.dimensions.depth,
    bounds: getSectionBounds(project, index, sectionWidth),
    active: project.activeSection === index + 1,
    shelves: section.shelves,
    drawers: section.drawers,
    rail: section.rail,
    label: getSectionLabel(section),
    shortLabel: formatSection(section),
    slots: buildSectionSlots(section),
  }))

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
      activeSectionLabel: threeSections.find(section => section.active)?.label ?? 'Секция',
    },
    three: {
      version: 1,
      unit: 'mm',
      coordinateSystem: 'width-x_height-y_depth-z',
      interaction: {
        selectable: 'section',
        activeSection: project.activeSection,
        emits: ['section:select'],
      },
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
        manufacturer: project.material.manufacturer,
        article: project.material.article,
        thickness: project.material.thickness,
        edge: project.material.edge,
      },
      sections: threeSections,
    },
  }
}