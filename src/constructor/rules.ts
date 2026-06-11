import type { ConstructorProject } from './schema'
import { getProductConfig } from './catalog'
import { buildGeometry, getDrawerInnerWidth } from './legacyGeometry'
import { RAZMERNO_PRODUCTION_RULES, getProductionDimensionLimits } from './productionRules'

export type IssueSeverity = 'error' | 'warning' | 'info'

export interface ProjectIssue {
  code: string
  severity: IssueSeverity
  title: string
  text: string
  sectionIndex?: number
}

const FALLBACK_MIN_SECTION_WIDTH = RAZMERNO_PRODUCTION_RULES.dimensions.minSectionWidthMm
const FALLBACK_MIN_DRAWER_WIDTH  = 420
const MIN_SHELF_GAP     = RAZMERNO_PRODUCTION_RULES.shelves.minGapMm
const FALLBACK_MIN_DRAWER_FACE   = RAZMERNO_PRODUCTION_RULES.drawers.minFaceHeightMm

/**
 * Полная валидация проекта. Чистая функция, никаких side-effects.
 */
export function validateProject(project: ConstructorProject): ProjectIssue[] {
  const issues: ProjectIssue[] = []
  const config = getProductConfig(project.productType)
  const geometry = buildGeometry(project)
  const productionLimits = getProductionDimensionLimits(project.productType)
  const minSectionWidth = Math.max(config.minSectionWidth ?? FALLBACK_MIN_SECTION_WIDTH, productionLimits.minSectionWidthMm)
  const minDrawerWidth = config.minDrawerWidth ?? FALLBACK_MIN_DRAWER_WIDTH
  const minDrawerFace = Math.max(config.minDrawerFace ?? FALLBACK_MIN_DRAWER_FACE, RAZMERNO_PRODUCTION_RULES.drawers.minFaceHeightMm)

  if (project.dimensions.height > productionLimits.maxHeightMm) {
    issues.push({
      code: 'production-height-max',
      severity: 'error',
      title: 'Высота выше производственного ограничения',
      text: `Максимальная высота для текущего MVP — ${productionLimits.maxHeightMm} мм. Сейчас ${project.dimensions.height} мм.`,
    })
  }

  if (project.dimensions.depth < productionLimits.minDepthMm || project.dimensions.depth > productionLimits.maxDepthMm) {
    issues.push({
      code: 'production-depth-range',
      severity: 'error',
      title: 'Глубина вне производственного диапазона',
      text: `Глубина должна быть от ${productionLimits.minDepthMm} до ${productionLimits.maxDepthMm} мм. Сейчас ${project.dimensions.depth} мм.`,
    })
  }

  const narrowestSection = Math.min(...geometry.layouts.map(layout => layout.innerWidthMm))
  const widestSection = Math.max(...geometry.layouts.map(layout => layout.innerWidthMm))
  if (narrowestSection < minSectionWidth) {
    issues.push({
      code: 'section-too-narrow',
      severity: 'error',
      title: 'Секции получаются слишком узкими',
      text: `Самая узкая секция ${narrowestSection} мм. Минимум для сценария «${config.title}» — ${minSectionWidth} мм.`,
    })
  }

  if (widestSection > productionLimits.maxSectionWidthMm) {
    issues.push({
      code: 'production-section-too-wide',
      severity: 'error',
      title: 'Секция шире производственного ограничения',
      text: `Максимальная ширина одной секции — ${productionLimits.maxSectionWidthMm} мм. Сейчас самая широкая секция ${widestSection} мм. Добавьте секции или уменьшите общую ширину.`,
    })
  }

  if (geometry.innerHeightMm < RAZMERNO_PRODUCTION_RULES.dimensions.minSectionHeightMm) {
    issues.push({
      code: 'production-section-height-small',
      severity: 'error',
      title: 'Полезная высота секции слишком мала',
      text: `Минимальная высота секции — ${RAZMERNO_PRODUCTION_RULES.dimensions.minSectionHeightMm} мм. Сейчас полезная высота около ${geometry.innerHeightMm} мм.`,
    })
  }

  const anyRod = project.sections.some(s => s.hasRod)
  if (anyRod && !config.allowRod) {
    issues.push({
      code: 'rod-not-supported',
      severity: 'error',
      title: `Штанга не подходит для сценария «${config.title}»`,
      text: 'Выберите шкаф или уберите штангу из наполнения.',
    })
  }

  if (anyRod && config.allowRod && project.dimensions.depth < geometry.clearances.rodDepthMinimumMm) {
    issues.push({
      code: 'rail-needs-depth',
      severity: 'warning',
      title: 'Глубина мала для штанги',
      text: `Для одежды на плечиках нужна глубина от ${geometry.clearances.rodDepthMinimumMm} мм. Сейчас ${project.dimensions.depth} мм.`,
    })
  }

  project.sections.forEach((section, index) => {
    const layout = geometry.layouts[index]
    const sectionWidth = layout?.innerWidthMm ?? 0
    const drawerInnerWidth = getDrawerInnerWidth(sectionWidth)
    if (section.drawers > 0 && drawerInnerWidth < minDrawerWidth) {
      issues.push({
        code: 'drawer-section-narrow',
        severity: 'warning',
        title: `Секция ${index + 1}: для ящиков узковато`,
        text: `Для скрытых направляющих Hettich/Firmax комфортно от ${minDrawerWidth} мм ширины секции (сейчас ${sectionWidth} мм).`,
        sectionIndex: index,
      })
    }

    const usefulHeight =
      (layout?.innerHeightMm ?? project.dimensions.height) -
      section.drawers * 170 -
      (section.hasRod ? 950 : 0)
    const shelfGap = section.shelves > 1 ? usefulHeight / (section.shelves + 1) : usefulHeight

    if (section.shelves > 1 && shelfGap < MIN_SHELF_GAP) {
      issues.push({
        code: 'shelf-gap-small',
        severity: 'error',
        title: `Секция ${index + 1}: полки слишком близко`,
        text: `Между полками выходит ~${Math.round(shelfGap)} мм. Минимум ${MIN_SHELF_GAP} мм.`,
        sectionIndex: index,
      })
    }


    if (project.material.facadeMode === 'hinged' && sectionWidth > RAZMERNO_PRODUCTION_RULES.dimensions.maxSectionWidthMm) {
      issues.push({
        code: 'facade-door-wide',
        severity: 'error',
        title: `Секция ${index + 1}: секция слишком широкая`,
        text: `Ширина секции ${sectionWidth} мм больше максимума ${RAZMERNO_PRODUCTION_RULES.dimensions.maxSectionWidthMm} мм. Добавьте секцию: количество секций в MVP не ограничиваем, но каждая секция должна быть не шире 900 мм.`,
        sectionIndex: index,
      })
    }

    if (section.drawers > 0 && project.dimensions.depth < 350) {
      issues.push({
        code: 'drawer-depth-small',
        severity: 'warning',
        title: `Секция ${index + 1}: глубина мала для ящиков`,
        text: 'Для направляющих и полезной глубины ящика лучше закладывать от 350 мм.',
        sectionIndex: index,
      })
    }

    if (section.drawers > 0) {
      const drawerFace = (layout?.innerHeightMm ?? project.dimensions.height) / section.drawers
      if (drawerFace < minDrawerFace) {
        issues.push({
          code: 'drawer-face-low',
          severity: 'error',
          title: `Секция ${index + 1}: фасады ящиков низкие`,
          text: `Высота фасада ~${Math.round(drawerFace)} мм. Минимум ${minDrawerFace} мм.`,
          sectionIndex: index,
        })
      }
    }
  })

  return issues
}

export function groupIssues(issues: ProjectIssue[]) {
  return {
    errors:   issues.filter(i => i.severity === 'error'),
    warnings: issues.filter(i => i.severity === 'warning'),
    infos:    issues.filter(i => i.severity === 'info'),
  }
}

export function isReadyForOrder(issues: ProjectIssue[]): boolean {
  return issues.every(i => i.severity !== 'error')
}
