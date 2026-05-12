export type PartEdgeMap = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

export type CabinetPart = {
  id: string;

  /**
   * Название детали.
   * Например: Левая боковина, Полка секции 1.
   */
  name: string;

  /**
   * ID материала.
   */
  materialId: string;

  /**
   * Размер детали в мм.
   */
  size: {
    width: number;
    height: number;
    thickness: number;
  };

  /**
   * Кромка по сторонам детали.
   */
  edge: PartEdgeMap;

  /**
   * Позиция детали в 3D-пространстве.
   */
  position: {
    x: number;
    y: number;
    z: number;
  };

  /**
   * Поворот детали для 3D.
   */
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
};
