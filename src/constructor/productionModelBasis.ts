import type { ProductionModel } from './productionModel.types'

export const PRODUCTION_MODEL_BASIS_EXPORT_PLAN: ProductionModel['basisExportPlan'] = [
  {
    id: 'map-materials',
    title: 'Сопоставить материалы',
    status: 'requires-mapping',
    note: 'materialDecorId и edge.materialId нужно связать с реальными материалами и кромкой в базе БАЗИС.',
  },
  {
    id: 'create-panels',
    title: 'Создать панели',
    status: 'ready-for-script',
    note: 'panels[] содержит габариты, толщину, материал, лицевую сторону и базовое положение.',
  },
  {
    id: 'apply-edging',
    title: 'Нанести кромку',
    status: 'ready-for-script',
    note: 'edge хранит стороны, материал и толщину кромки: корпус 0.8 мм, фасады 2 мм.',
  },
  {
    id: 'apply-drilling',
    title: 'Добавить присадку',
    status: 'requires-technologist-check',
    note: 'drilling[] содержит MVP-координаты. Перед .b3d нужно проверить под выбранную фурнитуру.',
  },
]

export const PRODUCTION_MODEL_BASIS_NOTES: ProductionModel['basisNotes'] = [
  'Корпус: крышка между боковыми панелями, боковины опираются на дно.',
  'Задняя стенка: ХДФ в паз, параметры паза переданы в productionRules/backPanel.',
  'Координаты и ориентации подготовлены как промежуточная JSON-модель для будущего скрипта БАЗИС-Мебельщик.',
  'Перед генерацией .b3d нужно сопоставить materialDecorId/edge.materialId с материалами в базе БАЗИС.',
  'Лицевая сторона панели хранится в panels[].faceSide, кромление — в panels[].edge по сторонам.',
  'ХДФ вынесен отдельным materialType=hdf и не считается как ЛДСП.',
  'drilling[] — MVP-слой присадки: координаты требуют проверки технологом под выбранную фурнитуру.',
  'facade хранит режим, тип навешивания, зазор и связь фасада с секцией для будущих правил БАЗИС.',
]
