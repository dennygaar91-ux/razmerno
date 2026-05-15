export const DIMENSION_LIMITS = {
  height: { min: 200, max: 2800, step: 100 },
  width: { min: 400, max: 3000, step: 100 },
  depth: { min: 300, max: 800, step: 50 },
}

export const MATERIALS = [
  {
    id: 'sonoma',
    title: 'ЛДСП Дуб Сонома',
    text: 'Тёплый древесный декор',
    thickness: '16 мм',
    edge: 'ПВХ 2 мм в цвет',
    priceFactor: 1,
    tone: 'wood',
  },
  {
    id: 'white',
    title: 'ЛДСП Белый матовый',
    text: 'Светлый минимализм',
    thickness: '16 мм',
    edge: 'ПВХ 2 мм белая',
    priceFactor: 0.94,
    tone: 'white',
  },
  {
    id: 'stone',
    title: 'ЛДСП Серый камень',
    text: 'Нейтральный современный тон',
    thickness: '16 мм',
    edge: 'ПВХ 2 мм серая',
    priceFactor: 1.08,
    tone: 'gray',
  },
  {
    id: 'natural-oak',
    title: 'ЛДСП Дуб натуральный',
    text: 'Более выраженная текстура',
    thickness: '16 мм',
    edge: 'ПВХ 2 мм в цвет',
    priceFactor: 1.12,
    tone: 'oak',
  },
]

export const HANDLE_OPTIONS = [
  {
    id: 'handles',
    title: 'С ручками',
    text: 'Базовый вариант открывания',
    priceAdd: 0,
  },
  {
    id: 'push',
    title: 'Без ручек',
    text: 'Push-to-open и толкатели фасадов',
    priceAdd: 1450,
  },
]

export const DEFAULT_PROJECT = {
  dimensions: { height: 2400, width: 1800, depth: 600 },
  sections: 3,
  activeSection: 1,
  filling: [
    { shelves: 4, drawers: 2, rail: false },
    { shelves: 1, drawers: 0, rail: true },
    { shelves: 3, drawers: 0, rail: false },
  ],
  material: {
    body: 'ЛДСП Дуб Сонома',
    materialId: 'sonoma',
    thickness: '16 мм',
    edge: 'ПВХ 2 мм в цвет',
    tone: 'wood',
    handles: 'С ручками',
    handleId: 'handles',
  },
}
