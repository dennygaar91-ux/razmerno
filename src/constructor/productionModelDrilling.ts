import { getHingeCountByFacadeHeight } from './productionRules'
import type { DrillingOperation } from './productionModel.types'

export function addDrillingForPanelMounts(drilling: DrillingOperation[], panelId: string, panelIndex: number): void {
  const zBase = panelIndex * 16
  drilling.push(
    {
      id: `${panelId}-confirmat-left-front`,
      panelId,
      x: 37,
      y: 8,
      z: zBase + 50,
      diameterMm: 5,
      depthMm: 50,
      side: 'front',
      purpose: 'confirmat',
      templateId: 'confirmat-5x50',
      requiresTechnologistCheck: true,
      note: 'MVP-координата крепежа. Перед .b3d уточнить технологическую карту.',
    },
    {
      id: `${panelId}-confirmat-right-front`,
      panelId,
      x: 37,
      y: 8,
      z: zBase + 250,
      diameterMm: 5,
      depthMm: 50,
      side: 'front',
      purpose: 'confirmat',
      templateId: 'confirmat-5x50',
      requiresTechnologistCheck: true,
      note: 'MVP-координата крепежа. Перед .b3d уточнить технологическую карту.',
    },
  )
}

export function addShelfPins(
  drilling: DrillingOperation[],
  sectionId: number,
  shelfPanelId: string,
  shelfCount: number,
  sectionWidth: number,
): void {
  for (let shelfIndex = 0; shelfIndex < shelfCount; shelfIndex += 1) {
    const z = 220 + shelfIndex * 260
    drilling.push(
      {
        id: `section-${sectionId}-shelf-${shelfIndex + 1}-pin-left`,
        panelId: shelfPanelId,
        x: 37,
        y: 0,
        z,
        diameterMm: 5,
        depthMm: 12,
        side: 'left',
        purpose: 'shelf-pin',
        templateId: 'shelf-pin-5',
        requiresTechnologistCheck: true,
        note: 'MVP: отверстие под полкодержатель/эксцентрик. Шаг уточняется технологом.',
      },
      {
        id: `section-${sectionId}-shelf-${shelfIndex + 1}-pin-right`,
        panelId: shelfPanelId,
        x: sectionWidth - 37,
        y: 0,
        z,
        diameterMm: 5,
        depthMm: 12,
        side: 'right',
        purpose: 'shelf-pin',
        templateId: 'shelf-pin-5',
        requiresTechnologistCheck: true,
        note: 'MVP: отверстие под полкодержатель/эксцентрик. Шаг уточняется технологом.',
      },
    )
  }
}

export function getHingeCount(doorHeight: number): number {
  return getHingeCountByFacadeHeight(doorHeight)
}

export function getHingePositions(doorHeight: number): number[] {
  const hingeCount = getHingeCount(doorHeight)
  if (hingeCount <= 2) return [100, doorHeight - 100]
  const topOffset = 120
  const bottomOffset = doorHeight - 120
  const interval = (bottomOffset - topOffset) / (hingeCount - 1)
  return Array.from({ length: hingeCount }, (_, index) => Math.round(topOffset + interval * index))
}

export function addHingeDrilling(drilling: DrillingOperation[], panelId: string, doorIndex: number, doorHeight: number): void {
  const hinges = getHingePositions(doorHeight)
  hinges.forEach((z, hingeIndex) => {
    drilling.push({
      id: `${panelId}-door-${doorIndex + 1}-hinge-${hingeIndex + 1}`,
      panelId,
      x: 22,
      y: 0,
      z,
      diameterMm: 35,
      depthMm: 12,
      side: 'front',
      purpose: 'hinge',
      templateId: 'hinge-cup-35',
      requiresTechnologistCheck: true,
      note: 'MVP: чашка петли Ø35. Точные отступы зависят от выбранной петли.',
    })
  })
}

export function addRunnerDrilling(drilling: DrillingOperation[], panelId: string, drawerIndex: number, sectionWidth: number): void {
  drilling.push(
    {
      id: `${panelId}-drawer-${drawerIndex + 1}-runner-left`,
      panelId,
      x: 37,
      y: 0,
      z: 120 + drawerIndex * 180,
      diameterMm: 4,
      depthMm: 12,
      side: 'left',
      purpose: 'runner',
      templateId: 'runner-hidden-450',
      requiresTechnologistCheck: true,
      note: 'MVP: крепление направляющей. Координаты уточняются под Hettich/Firmax.',
    },
    {
      id: `${panelId}-drawer-${drawerIndex + 1}-runner-right`,
      panelId,
      x: sectionWidth - 37,
      y: 0,
      z: 120 + drawerIndex * 180,
      diameterMm: 4,
      depthMm: 12,
      side: 'right',
      purpose: 'runner',
      templateId: 'runner-hidden-450',
      requiresTechnologistCheck: true,
      note: 'MVP: крепление направляющей. Координаты уточняются под Hettich/Firmax.',
    },
  )
}
