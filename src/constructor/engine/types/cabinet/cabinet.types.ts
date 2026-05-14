import type { CabinetSection } from "./section.types";
import type { CabinetFacade } from "./facade.types";

export type CabinetType = "wardrobe";

export type CabinetDimensions = {
  /**
   * Внешняя ширина шкафа в мм.
   */
  width: number;

  /**
   * Внешняя высота шкафа в мм.
   */
  height: number;

  /**
   * Внешняя глубина шкафа в мм.
   */
  depth: number;
};

export type CabinetConfig = {
  id: string;

  /**
   * Пока поддерживаем только шкаф.
   */
  type: CabinetType;

  /**
   * Внешние размеры изделия.
   */
  dimensions: CabinetDimensions;

  /**
   * Материалы, выбранные для изделия.
   */
  materials: {
    bodyMaterialId: string;
    facadeMaterialId?: string;
    backPanelMaterialId?: string;
  };

  /**
   * Настройки фасадов.
   */
  facade: CabinetFacade;

  options: {
    hardwareBrand: "Hettich" | "Firmax";
    hasLegs: boolean;
    hasBackPanel: boolean;
    wallMount: boolean;
  };

  /**
   * Секции шкафа.
   */
  sections: CabinetSection[];
};
