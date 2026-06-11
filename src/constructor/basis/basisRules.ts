export type BasisRuleSeverity = 'info' | 'warning' | 'critical'

export interface BasisDesignRule {
  id: string
  title: string
  severity: BasisRuleSeverity
  source: 'Bazis.pdf' | 'Razmerno production convention'
  implementation: 'enforced' | 'exported-for-manual-check' | 'planned'
  description: string
}

export const BASIS_DESIGN_RULES: BasisDesignRule[] = [
  {
    id: 'basis-document-3d-mm',
    title: 'Проект передаётся как 3D-модель в миллиметрах',
    severity: 'info',
    source: 'Bazis.pdf',
    implementation: 'exported-for-manual-check',
    description: 'Экспорт фиксирует тип документа, габариты и единицы измерения, чтобы технолог вручную создал 3D-документ БАЗИС-Мебельщик.',
  },
  {
    id: 'panel-core-properties',
    title: 'Каждая панель должна иметь материал, размеры, положение и лицевую сторону',
    severity: 'critical',
    source: 'Bazis.pdf',
    implementation: 'exported-for-manual-check',
    description: 'В JSON каждая деталь содержит роль, материал, толщину, габариты, ориентацию, координаты и faceSide.',
  },
  {
    id: 'edge-per-side',
    title: 'Кромка задаётся по сторонам панели',
    severity: 'critical',
    source: 'Bazis.pdf',
    implementation: 'exported-for-manual-check',
    description: 'Кромка экспортируется как side-level операция: front/back/left/right с материалом, толщиной и шириной.',
  },
  {
    id: 'edge-trimming-awareness',
    title: 'Подрезка заготовки и толщина кромки должны учитываться технологом',
    severity: 'warning',
    source: 'Bazis.pdf',
    implementation: 'exported-for-manual-check',
    description: 'БАЗИС может уменьшать размер заготовки на толщину кромки либо увеличивать готовую панель; в MVP экспорт помечает это как ручную проверку.',
  },
  {
    id: 'edge-allowance-awareness',
    title: 'Припуск под фрезерование кромки фиксируется как технологическая проверка',
    severity: 'warning',
    source: 'Bazis.pdf',
    implementation: 'exported-for-manual-check',
    description: 'Если производство использует прифуговку, технолог задаёт припуск вручную по правилам станка.',
  },
  {
    id: 'hardware-as-separate-objects',
    title: 'Фурнитура и крепёж передаются отдельными объектами',
    severity: 'warning',
    source: 'Bazis.pdf',
    implementation: 'exported-for-manual-check',
    description: 'JSON не встраивает фурнитуру в панель: петли, направляющие, ручки и крепёж идут отдельными позициями для сопоставления с библиотеками БАЗИС.',
  },
  {
    id: 'drilling-manual-review',
    title: 'Присадка требует проверки координат перед производством',
    severity: 'critical',
    source: 'Razmerno production convention',
    implementation: 'exported-for-manual-check',
    description: 'Координаты отверстий экспортируются, но имеют флаг requiresTechnologistCheck до утверждения шаблонов под конкретную фурнитуру.',
  },
  {
    id: 'grooves-as-panel-property',
    title: 'Пазы фиксируются как свойство панели',
    severity: 'warning',
    source: 'Bazis.pdf',
    implementation: 'planned',
    description: 'Для ХДФ-задников и будущих конструкций с пазами экспорт оставляет раздел grooves, пока без автоматического построения.',
  },
]

export const RAZMERNO_PHASE_F_DECISIONS = {
  corpus: 'Крышка между боковыми панелями; боковые панели крепятся к дну.',
  backPanel: 'ХДФ в паз.',
  facadeGaps: 'Каждый фасад уменьшается на 1.5 мм с каждой стороны по периметру.',
  facadeMount: 'Полное наложение.',
  shelves: 'Полки на усиленных полкодержателях.',
  drawers: 'Скрытые направляющие Hettich/Firmax.',
  edge: 'Корпус — ABS 0.8 мм, фасады — ABS 2 мм, все стороны.',
  base: 'Регулируемые ножки + цоколь.',
  limits: {
    minSectionHeightMm: 400,
    minShelfGapMm: 200,
    minDepthMm: 300,
    minSectionWidthMm: 300,
    maxHeightMm: 2700,
    maxSectionWidthMm: 900,
    maxDepthMm: 900,
  },
  hingeRules: [
    { maxFacadeHeightMm: 500, hinges: 2 },
    { minFacadeHeightMm: 501, maxFacadeHeightMm: 700, hinges: 3 },
    { minFacadeHeightMm: 701, maxFacadeHeightMm: 1100, hinges: 4 },
    { minFacadeHeightMm: 1101, maxFacadeHeightMm: 1500, hinges: 5 },
    { minFacadeHeightMm: 1501, hinges: 6 },
  ],
  basisAutomation: 'JSON → ручная сборка в БАЗИС.',
} as const

export const RAZMERNO_MANUAL_BASIS_WORKFLOW = [
  'Создать 3D-документ в БАЗИС-Мебельщик в миллиметрах.',
  'Сопоставить материалы корпуса, фасадов, ХДФ и кромки с библиотеками БАЗИС.',
  'Создать панели по списку деталей: дно, боковины, крышка между боковинами, полки, перегородки, фасады, задняя стенка ХДФ в паз.',
  'Нанести кромку по сторонам деталей согласно edge[]: корпус 0.8 мм по всем сторонам, фасады 2 мм по всем сторонам.',
  'Добавить фурнитуру и крепёж из hardware[]: петли по высоте фасада, скрытые направляющие, усиленные полкодержатели, ножки и цоколь.',
  'Проверить присадку drilling[] под реальные петли, направляющие, ручки и крепёж.',
  'Проверить подрезку заготовок, припуски и итоговые размеры после кромления.',
  'Сохранить проект как .b3d и передать в дальнейшие модули БАЗИС при необходимости.',
]
