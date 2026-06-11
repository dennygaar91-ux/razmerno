import type { DrillingPurpose, PanelFaceSide } from './productionModel'

export interface DrillingTemplateOperation {
  x: number
  y: number
  z: number
  diameterMm: number
  depthMm: number
  side: PanelFaceSide
  purpose: DrillingPurpose
  note: string
}

export interface DrillingTemplate {
  id: string
  title: string
  operations: DrillingTemplateOperation[]
  requiresTechnologistCheck: boolean
}

export const DRILLING_TEMPLATES: Record<string, DrillingTemplate> = {
  'confirmat-5x50': {
    id: 'confirmat-5x50',
    title: 'Конфирмат 5×50 MVP',
    requiresTechnologistCheck: true,
    operations: [
      { x: 37, y: 8, z: 50, diameterMm: 5, depthMm: 50, side: 'front', purpose: 'confirmat', note: 'MVP: конфирмат, перед .b3d уточнить карту.' },
      { x: 37, y: 8, z: 250, diameterMm: 5, depthMm: 50, side: 'front', purpose: 'confirmat', note: 'MVP: конфирмат, перед .b3d уточнить карту.' },
    ],
  },
  'shelf-pin-5': {
    id: 'shelf-pin-5',
    title: 'Полкодержатель / эксцентрик Ø5 MVP',
    requiresTechnologistCheck: true,
    operations: [
      { x: 37, y: 0, z: 0, diameterMm: 5, depthMm: 12, side: 'left', purpose: 'shelf-pin', note: 'MVP: отверстие под полкодержатель/эксцентрик.' },
      { x: -37, y: 0, z: 0, diameterMm: 5, depthMm: 12, side: 'right', purpose: 'shelf-pin', note: 'MVP: отверстие под полкодержатель/эксцентрик.' },
    ],
  },
  'hinge-cup-35': {
    id: 'hinge-cup-35',
    title: 'Петля чашка Ø35 MVP',
    requiresTechnologistCheck: true,
    operations: [
      { x: 22, y: 0, z: 100, diameterMm: 35, depthMm: 12, side: 'front', purpose: 'hinge', note: 'MVP: чашка петли Ø35.' },
    ],
  },
  'runner-hidden-450': {
    id: 'runner-hidden-450',
    title: 'Направляющая скрытого монтажа MVP',
    requiresTechnologistCheck: true,
    operations: [
      { x: 37, y: 0, z: 120, diameterMm: 4, depthMm: 12, side: 'left', purpose: 'runner', note: 'MVP: крепление направляющей.' },
      { x: -37, y: 0, z: 120, diameterMm: 4, depthMm: 12, side: 'right', purpose: 'runner', note: 'MVP: крепление направляющей.' },
    ],
  },
  'handle-two-hole': {
    id: 'handle-two-hole',
    title: 'Ручка два отверстия MVP',
    requiresTechnologistCheck: true,
    operations: [
      { x: 0, y: 0, z: 90, diameterMm: 4, depthMm: 16, side: 'front', purpose: 'handle', note: 'MVP: ручка, межцентровое расстояние уточнить.' },
    ],
  },
  'rod-holder': {
    id: 'rod-holder',
    title: 'Штангодержатель MVP',
    requiresTechnologistCheck: true,
    operations: [
      { x: 37, y: 0, z: 1200, diameterMm: 5, depthMm: 12, side: 'left', purpose: 'rod-holder', note: 'MVP: крепление штангодержателя.' },
    ],
  },
}
