function roundMoney(value) {
  return Math.round(value / 10) * 10
}

function getSectionWarnings(section, sectionIndex, project) {
  const warnings = []
  const sectionHeight = project.dimensions.height
  const usefulHeight = sectionHeight - section.drawers * 220 - (section.rail ? 950 : 0)
  const shelfGap = section.shelves > 1 ? usefulHeight / (section.shelves + 1) : usefulHeight

  if (section.rail && project.dimensions.depth < 520) {
    warnings.push(`Секция ${sectionIndex + 1}: для штанги нужна глубина от 520 мм.`)
  }

  if (section.drawers > 0 && project.dimensions.width / project.sections < 420) {
    warnings.push(`Секция ${sectionIndex + 1}: для ящиков лучше ширина секции от 420 мм.`)
  }

  if (section.shelves > 1 && shelfGap < 200) {
    warnings.push(`Секция ${sectionIndex + 1}: между полками получается меньше 200 мм.`)
  }

  if (section.drawers > 3 && project.dimensions.height < 1600) {
    warnings.push(`Секция ${sectionIndex + 1}: для четырёх ящиков лучше высота шкафа от 1600 мм.`)
  }

  return warnings
}

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

export function getPriceBreakdown(project, summary) {
  const { height, width, depth } = project.dimensions
  const volumeFactor = (height * width * depth) / (2400 * 1800 * 600)
  const materialFactor = project.material.priceFactor ?? 1
  const handleAdd = project.material.handlePriceAdd ?? 0

  const materialBase = 11200 * volumeFactor * materialFactor
  const sections = project.sections * 620
  const shelves = summary.shelves * 420
  const drawers = summary.drawers * 1550
  const rails = summary.rails * 690
  const cutting = 1800 + project.sections * 180
  const edging = 1100 + summary.shelves * 90 + summary.drawers * 160
  const hardware = drawers + rails + handleAdd
  const packaging = 850

  return {
    material: roundMoney(materialBase + sections + shelves),
    cutting: roundMoney(cutting),
    edging: roundMoney(edging),
    hardware: roundMoney(hardware),
    packaging: roundMoney(packaging),
  }
}

export function calculatePrice(project, summary) {
  const breakdown = getPriceBreakdown(project, summary)
  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0)

  return roundMoney(total)
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

  project.filling.forEach((section, index) => {
    warnings.push(...getSectionWarnings(section, index, project))
  })

  return [...new Set(warnings)]
}

export function getActiveSectionWarnings(project) {
  const index = project.activeSection - 1
  const section = project.filling[index]

  if (!section) return []

  return getSectionWarnings(section, index, project)
}
