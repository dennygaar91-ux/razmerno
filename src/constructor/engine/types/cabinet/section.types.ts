import type { CabinetSectionItem } from "./item.types";

export type CabinetSection = {
  id: string;

  /**
   * Ширина секции в мм.
   */
  width: number;

  /**
   * Наполнение секции: полки, ящики, штанги, корзины.
   */
  items: CabinetSectionItem[];
};
