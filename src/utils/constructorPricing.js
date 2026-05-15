export function getProjectSummary(project) {
  const shelves = project.filling.reduce((total, section) => total + section.shelves, 0)
  const drawers = project.filling.reduce((total, section) => total + section.drawers, 0)
  const rails = project.filling.reduce((total, section) => total + (section.rail ? 1 : 0), 0)

  return {
    shelves,
    drawers,
    rails,
    elements: shelves + drawers + rails,
  }
}

export function calculatePrice(project, summary) {
  const { height, width, depth } = project.dimensions
  const volumeFactor = (height * width * depth) / (2400 * 1800 * 600)
  const materialFactor = project.material.priceFactor ?? 1
  const handleAdd = project.material.handlePriceAdd ?? 0

  const base = 11200 * volumeFactor * materialFactor
  const sections = project.sections * 620
  const shelves = summary.shelves * 420
  const drawers = summary.drawers * 1550
  const rails = summary.rails * 690

  return Math.round((base + sections + shelves + drawers + rails + handleAdd) / 10) * 10
}

export function getWarnings(project, summary) {
  const warnings = []
  const { height, width, depth } = project.dimensions

  if (depth < 520 && summary.rails > 0) {
    warnings.push('Для штанги рекомендуем глубину от 520 мм. Сейчас одежда может не помещаться по плечикам.')
  }

  if (height < 1200 && summary.shelves > 4) {
    warnings.push('При такой высоте слишком много полок: минимальный комфортный шаг между полками — около 200 мм.')
  }

  if (width / project.sections < 350) {
    warnings.push('Ширина секции меньше 350 мм. Лучше уменьшить количество секций или увеличить ширину шкафа.')
  }

  if (project.material.handleId === 'push' && summary.drawers > 0) {
    warnings.push('Для варианта без ручек ящики потребуют push-to-open фурнитуру. Стоимость уже учитывает базовую надбавку.')
  }

  return warnings
}
