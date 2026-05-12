import type {
  CabinetConfig,
  ValidationMessage
} from "../types";

import {
  MIN_CABINET_WIDTH,
  MIN_CABINET_HEIGHT,
  MIN_CABINET_DEPTH,
  MIN_SECTION_WIDTH,
  MIN_SHELF_SPACING,
  MIN_DRAWER_HEIGHT
} from "./validation.constants";

export function validateCabinet(
  config: CabinetConfig
): ValidationMessage[] {
  const messages: ValidationMessage[] = [];
  const MATERIAL_THICKNESS = 16;

const innerCabinetWidth =
  config.dimensions.width - MATERIAL_THICKNESS * 2;

const totalSectionsWidth =
  config.sections.reduce((sum, section) => {
    return sum + section.width;
  }, 0);

if (Number.isNaN(config.dimensions.width) || config.dimensions.width <= 0) {
  messages.push({
    type: "error",
    code: "INVALID_WIDTH",
    message: `Ширина должна быть положительным числом`
  });
}

if (Number.isNaN(config.dimensions.height) || config.dimensions.height <= 0) {
  messages.push({
    type: "error",
    code: "INVALID_HEIGHT",
    message: `Высота должна быть положительным числом`
  });
}

if (Number.isNaN(config.dimensions.depth) || config.dimensions.depth <= 0) {
  messages.push({
    type: "error",
    code: "INVALID_DEPTH",
    message: `Глубина должна быть положительным числом`
  });
}

if (totalSectionsWidth !== innerCabinetWidth) {
  messages.push({
    type: "warning",
    code: "SECTIONS_WIDTH_MISMATCH",
    message: `Сумма ширин секций (${totalSectionsWidth} мм) не совпадает с внутренней шириной шкафа (${innerCabinetWidth} мм)`
  });
}

  /**
   * Проверка размеров шкафа
   */
  if (
    config.dimensions.width < MIN_CABINET_WIDTH
  ) {
    messages.push({
      type: "error",
      code: "INVALID_WIDTH",
      message: `Минимальная ширина шкафа ${MIN_CABINET_WIDTH} мм`
    });
  }

  if (
    config.dimensions.height <
    MIN_CABINET_HEIGHT
  ) {
    messages.push({
      type: "error",
      code: "INVALID_HEIGHT",
      message: `Минимальная высота шкафа ${MIN_CABINET_HEIGHT} мм`
    });
  }

  if (
    config.dimensions.depth < MIN_CABINET_DEPTH
  ) {
    messages.push({
      type: "error",
      code: "INVALID_DEPTH",
      message: `Минимальная глубина шкафа ${MIN_CABINET_DEPTH} мм`
    });
  }

  /**
   * Проверка секций
   */
  if (config.sections.length === 0) {
    messages.push({
      type: "warning",
      code: "NO_SECTIONS",
      message: "Добавьте секции для расчёта шкафа"
    });
  }

  config.sections.forEach((section, sectionIndex) => {
    if (Number.isNaN(section.width) || section.width <= 0) {
      messages.push({
        type: "error",
        code: "SECTION_INVALID_WIDTH",
        message: `Ширина секции ${sectionIndex + 1} должна быть положительным числом`
      });
    }

    if (section.width < MIN_SECTION_WIDTH) {
      messages.push({
        type: "error",
        code: "SECTION_TOO_SMALL",
        message: `Секция ${sectionIndex + 1} слишком узкая`
      });
    }

    if (section.items.length === 0) {
      messages.push({
        type: "warning",
        code: "EMPTY_SECTION",
        message: `Секция ${sectionIndex + 1} пуста`
      });
    }

    section.items.forEach((item) => {
      if (item.type === "shelf" && item.count) {
        const spacing = config.dimensions.height / (item.count + 1);

        if (spacing < MIN_SHELF_SPACING) {
          messages.push({
            type: "warning",
            code: "SHELF_SPACING_TOO_SMALL",
            message: "Слишком маленькое расстояние между полками"
          });
        }
      }

      if (item.type === "drawer" && item.height) {
        if (item.height < MIN_DRAWER_HEIGHT) {
          messages.push({
            type: "error",
            code: "DRAWER_TOO_SMALL",
            message: "Высота ящика меньше минимальной"
          });
        }
      }
    });
  });

  return messages;
}