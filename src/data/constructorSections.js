export const createDefaultSection = (index = 0) => ({
  id: `section-${index + 1}`,
  name: `Секция ${index + 1}`,
  shelves: 2,
  drawers: 0,
  rail: index === 0,
  door: true,
  handles: true,
  handleType: "rail-128",
});

export const createSections = (count) => {
  return Array.from({ length: count }, (_, index) => createDefaultSection(index));
};

export const handleOptions = [
  { id: "rail-96", name: "Рейлинг", size: "96 мм" },
  { id: "rail-128", name: "Рейлинг", size: "128 мм" },
  { id: "rail-160", name: "Рейлинг", size: "160 мм" },
  { id: "bracket-96", name: "Скоба", size: "96 мм" },
  { id: "bracket-128", name: "Скоба", size: "128 мм" },
  { id: "gola", name: "Профиль Gola", size: "встроенный" },
  { id: "round", name: "Кнопка", size: "круглая" },
  { id: "inset-120", name: "Врезная", size: "120 мм" },
  { id: "edge-200", name: "Торцевая", size: "200 мм" },
  { id: "tipon", name: "Tip-on", size: "без ручки" },
];

export const bodyMaterials = [
  { id: "white", name: "Белый", tone: "#F6F4EF" },
  { id: "sonoma", name: "Дуб Сонома", tone: "#C9B08D" },
  { id: "natural-oak", name: "Дуб натуральный", tone: "#B88A55" },
  { id: "anthracite", name: "Антрацит", tone: "#3A3A3A" },
  { id: "graphite", name: "Графит", tone: "#565656" },
  { id: "wenge", name: "Венге", tone: "#2A1B12" },
];

export const frontMaterials = [
  { id: "front-white", name: "Белый матовый", tone: "#F7F6F2" },
  { id: "front-sonoma", name: "Дуб Сонома", tone: "#C9B08D" },
  { id: "front-cashmere", name: "Кашемир", tone: "#D8CFC0" },
  { id: "front-anthracite", name: "Антрацит", tone: "#3A3A3A" },
  { id: "front-mdf-white", name: "МДФ белый", tone: "#FFFFFF" },
  { id: "front-mdf-graphite", name: "МДФ графит", tone: "#4B4B4B" },
];

export const hardwareBrands = [
  { id: "hettich", name: "Hettich", description: "Премиальная фурнитура" },
  { id: "firmax", name: "Firmax", description: "Надёжный стандарт" },
];