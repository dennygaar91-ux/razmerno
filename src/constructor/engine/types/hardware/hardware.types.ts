export type HardwareType =
  | "hinge"
  | "drawer_slide"
  | "handle"
  | "leg"
  | "confirmat"
  | "eccentric"
  | "nail"
  | "screw"
  | "euro_screw"
  | "shelf_support";

export type HardwareBrand = "Hettich" | "Firmax" | "MDM" | "Other";

export type CabinetHardware = {
  id: string;

  /**
   * Тип фурнитуры или крепежа.
   */
  type: HardwareType;

  /**
   * Название.
   */
  name: string;

  /**
   * Бренд.
   */
  brand?: HardwareBrand;

  /**
   * Артикул.
   */
  article?: string;

  /**
   * Количество.
   */
  quantity: number;
};
