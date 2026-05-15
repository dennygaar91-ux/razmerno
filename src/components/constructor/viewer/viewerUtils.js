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
  return {
    dimensions: project.dimensions,
    sections: project.sections,
    activeSection: project.activeSection,
    filling: project.filling,
    material: project.material,
  }
}
