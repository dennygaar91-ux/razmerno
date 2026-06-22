import type { OrderLayoutModel } from './order-types.js'

const MIN_COMPARTMENT_HEIGHT_MM = 300
const ROD_DEFAULT_HEIGHT_MM = 1200
const MAX_SECTIONS = 8
const MAX_COMPARTMENTS_PER_SECTION = 12

export function validateOrderLayout(layout: OrderLayoutModel | undefined, dimensions?: { width: number; height: number; depth: number }): string | null {
  if (!layout) return null

  if (!Array.isArray(layout.sections) || layout.sections.length < 1) {
    return 'Схема изделия должна содержать хотя бы одну секцию'
  }

  if (layout.sections.length > MAX_SECTIONS) {
    return `Слишком много секций. Максимум ${MAX_SECTIONS}`
  }

  const totalWidth = layout.sections.reduce((sum, section) => sum + Number(section.widthMm || 0), 0)
  if (dimensions?.width && Math.abs(totalWidth - dimensions.width) > layout.sections.length) {
    return 'Сумма ширин секций не совпадает с шириной изделия'
  }

  for (const section of layout.sections) {
    if (!section.id || section.widthMm <= 0) {
      return 'Каждая секция должна иметь id и положительную ширину'
    }

    if (!Array.isArray(section.compartments) || section.compartments.length < 1) {
      return 'Каждая секция должна содержать хотя бы один отсек'
    }

    if (section.compartments.length > MAX_COMPARTMENTS_PER_SECTION) {
      return `Слишком много отсеков в секции. Максимум ${MAX_COMPARTMENTS_PER_SECTION}`
    }

    const totalHeight = section.compartments.reduce((sum, compartment) => sum + Number(compartment.heightMm || 0), 0)
    if (dimensions?.height && Math.abs(totalHeight - dimensions.height) > section.compartments.length) {
      return 'Сумма высот отсеков не совпадает с высотой изделия'
    }

    for (const compartment of section.compartments) {
      if (!compartment.id) return 'Каждый отсек должен иметь id'

      if (compartment.heightMm < MIN_COMPARTMENT_HEIGHT_MM) {
        return `Отсек ниже ${MIN_COMPARTMENT_HEIGHT_MM} мм`
      }

      if (!['empty', 'shelves', 'drawers', 'rod'].includes(compartment.kind)) {
        return 'Неизвестный тип отсека'
      }

      if (compartment.kind === 'rod' && compartment.heightMm < ROD_DEFAULT_HEIGHT_MM) {
        return `Отсек со штангой должен быть не ниже ${ROD_DEFAULT_HEIGHT_MM} мм`
      }

      if (compartment.shelves < 0 || compartment.drawers < 0) {
        return 'Количество полок и ящиков не может быть отрицательным'
      }

      if (compartment.kind === 'drawers' && compartment.drawers < 1) {
        return 'Для отсека с ящиками укажите количество ящиков'
      }

      if (compartment.kind === 'shelves' && compartment.shelves < 1) {
        return 'Для отсека с полками укажите количество полок'
      }
    }
  }

  return null
}
