export type CabinetItemType =
  | "shelf"
  | "drawer"
  | "hanger_rail"
  | "basket";

export type CabinetSectionItem = {
  id: string;
  type: CabinetItemType;

  /**
   * Количество элементов.
   * Например: 4 полки или 3 ящика.
   */
  count?: number;

  /**
   * Позиция элемента по высоте внутри секции.
   * Пока необязательно, позже понадобится для ручного размещения.
   */
  positionY?: number;

  /**
   * Высота элемента.
   * Особенно важно для фасадов ящиков.
   */
  height?: number;
};
