function roundMoney(value) {
  return Math.round(value / 10) * 10
}

export function getSummary(project) {
  const shelves = project.filling.reduce((total, section) => total + Number(section.shelves ?? 0), 0)
  const drawers = project.filling.reduce((total, section) => total + Number(section.drawers ?? 0), 0)
  const rails = project.filling.reduce((total, section) => total + (section.rail ? 1 : 0), 0)

  return {
    shelves,
    drawers,
    rails,
    elements: shelves + drawers + rails,
  }
}

function getWarnings(project, summary) {
  const warnings = []
  const { height, width, depth } = project.dimensions
  const sectionWidth = width / project.sections

  if (depth < 520 && summary.rails > 0) {
    warnings.push('Для штанги рекомендуем глубину от 520 мм.')
  }

  if (sectionWidth < 350) {
    warnings.push('Ширина секции меньше 350 мм. Лучше уменьшить количество секций или увеличить ширину шкафа.')
  }

  project.filling.forEach((section, index) => {
    const usefulHeight = height - Number(section.drawers ?? 0) * 220 - (section.rail ? 950 : 0)
    const shelfGap = section.shelves > 1 ? usefulHeight / (section.shelves + 1) : usefulHeight

    if (section.drawers > 0 && sectionWidth < 420) {
      warnings.push(`Секция ${index + 1}: для ящиков лучше ширина секции от 420 мм.`)
    }

    if (section.shelves > 1 && shelfGap < 200) {
      warnings.push(`Секция ${index + 1}: между полками получается меньше 200 мм.`)
    }
  })

  return [...new Set(warnings)]
}

export function calculateEstimate(project) {
  const summary = getSummary(project)
  const { height, width, depth } = project.dimensions
  const materialFactor = project.material?.priceFactor ?? 1
  const handleAdd = project.material?.handlePriceAdd ?? 0
  const volumeFactor = (height * width * depth) / (2400 * 1800 * 600)

  const materialBase = 11200 * volumeFactor * materialFactor
  const sections = project.sections * 620
  const shelves = summary.shelves * 420
  const drawers = summary.drawers * 1550
  const rails = summary.rails * 690
  const cutting = 1800 + project.sections * 180
  const edging = 1100 + summary.shelves * 90 + summary.drawers * 160
  const hardware = drawers + rails + handleAdd
  const packaging = 850

  const breakdown = {
    material: roundMoney(materialBase + sections + shelves),
    cutting: roundMoney(cutting),
    edging: roundMoney(edging),
    hardware: roundMoney(hardware),
    packaging: roundMoney(packaging),
  }

  const total = roundMoney(Object.values(breakdown).reduce((sum, value) => sum + value, 0))

  return {
    estimate: {
      total,
      currency: 'RUB',
      breakdown,
    },
    summary,
    warnings: getWarnings(project, summary),
  }
}
