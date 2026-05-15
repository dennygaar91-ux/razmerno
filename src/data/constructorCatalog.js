export const DIMENSION_LIMITS = {
  height: { min: 200, max: 2800, step: 100 },
  width: { min: 400, max: 3000, step: 100 },
  depth: { min: 300, max: 800, step: 50 },
}

export const MATERIALS = [
  {
    id: 'sonoma',
    title: 'Дуб Сонома',
    fullTitle: 'ЛДСП Дуб Сонома',
    text: 'Тёплый древесный декор для универсального шкафа',
    collection: 'Базовый древесный',
    thickness: '16 мм',
    edge: 'ПВХ 2 мм в цвет',
    priceFactor: 1,
    tone: 'wood',
    badge: 'Популярно',
  },
  {
    id: 'white',
    title: 'Белый матовый',
    fullTitle: 'ЛДСП Белый матовый',
    text: 'Светлый минимализм, визуально расширяет пространство',
    collection: 'Минимализм',
    thickness: '16 мм',
    edge: 'ПВХ 2 мм белая',
    priceFactor: 0.94,
    tone: 'white',
    badge: 'Бюджетнее',
  },
  {
    id: 'stone',
    title: 'Серый камень',
    fullTitle: 'ЛДСП Серый камень',
    text: 'Нейтральный современный тон под спокойный интерьер',
    collection: 'Современный',
    thickness: '16 мм',
    edge: 'ПВХ 2 мм серая',
    priceFactor: 1.08,
    tone: 'gray',
    badge: 'Современно',
  },
  {
    id: 'natural-oak',
    title: 'Дуб натуральный',
    fullTitle: 'ЛДСП Дуб натуральный',
    text: 'Более выраженная текстура дерева и тёплый акцент',
    collection: 'Текстурный',
    thickness: '16 мм',
    edge: 'ПВХ 2 мм в цвет',
    priceFactor: 1.12,
    tone: 'oak',
    badge: 'Премиальнее',
  },
]

export const HANDLE_OPTIONS = [
  {
    id: 'handles',
    title: 'С ручками',
    text: 'Базовый вариант открывания, проще в эксплуатации',
    helper: 'Рекомендуем для первого MVP и понятной сборки',
    priceAdd: 0,
    badge: 'База',
  },
  {
    id: 'push',
    title: 'Без ручек',
    text: 'Push-to-open и толкатели фасадов',
    helper: 'Выглядит чище, но требует более точной настройки',
    priceAdd: 1450,
    badge: '+ фурнитура',
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