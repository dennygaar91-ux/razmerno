function getItemCount(section, type) {
  return section?.items?.find((item) => item.type === type)?.count || 0;
}

function push(items, type, title, text) {
  items.push({ type, title, text });
}

export function getCabinetIntelligence(config, validation = []) {
  const items = [];
  const sections = config.sections || [];
  const hardwareBrand = config.options?.hardwareBrand || "Hettich";
  const hasHandles = config.facade?.openingType === "with_handles";

  const totalDrawers = sections.reduce((sum, section) => sum + getItemCount(section, "drawer"), 0);
  const totalRails = sections.reduce((sum, section) => sum + getItemCount(section, "hanger_rail"), 0);
  const wideSections = sections.filter((section) => Number(section.width) > 850);
  const narrowSections = sections.filter((section) => Number(section.width) < 420);
  const emptySections = sections.filter((section) => !section.items?.length);

  if (validation.some((message) => message.type === "error")) {
    push(items, "danger", "Есть критичные ограничения", "Перед заказом нужно исправить ошибки геометрии или наполнения.");
  }

  if (wideSections.length > 0) {
    push(items, "warning", "Широкие секции", "Для широких фасадов лучше делить дверь на две створки и усиливать петли.");
  }

  if (narrowSections.length > 0) {
    push(items, "warning", "Узкие секции", "В узких секциях лучше избегать глубоких ящиков и широких ручек.");
  }

  if (totalDrawers > 0) {
    push(items, "success", "Направляющие", `${hardwareBrand}: для ${totalDrawers} ящ. заложить скрытые направляющие с доводчиком.`);
  }

  if (totalRails > 0 && config.dimensions.depth < 520) {
    push(items, "warning", "Глубина под одежду", "Для плечиков комфортнее глубина от 520 мм. При меньшей глубине нужна поперечная штанга.");
  }

  if (hasHandles) {
    push(items, "success", "Открывание", "С ручками можно использовать стандартные петли/направляющие с доводчиком.");
  } else {
    push(items, "info", "Без ручек", "Для фасадов без ручек потребуется push-to-open/tip-on логика.");
  }

  if (emptySections.length > 0) {
    push(items, "info", "Пустые секции", "Пустые секции можно оставить под крупные вещи или быстро заполнить пресетом.");
  }

  if (items.length === 0) {
    push(items, "success", "Конфигурация стабильна", "Критичных ограничений не найдено. Можно переходить к заказу.");
  }

  return items.slice(0, 5);
}
