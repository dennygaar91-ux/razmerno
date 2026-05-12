export type HoleType =
  | "confirmat"
  | "eccentric"
  | "hinge"
  | "drawer_slide"
  | "shelf_support"
  | "handle";

export type CabinetHole = {
  id: string;

  /**
   * ID детали, на которой находится отверстие.
   */
  partId: string;

  /**
   * Тип отверстия.
   */
  type: HoleType;

  /**
   * Диаметр отверстия в мм.
   */
  diameter: number;

  /**
   * Глубина отверстия в мм.
   */
  depth: number;

  /**
   * Координаты отверстия.
   */
  position: {
    x: number;
    y: number;
    z?: number;
  };
};
