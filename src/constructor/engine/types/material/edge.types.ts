export type EdgeType = "abs_0_8" | "abs_2";

export type CabinetEdge = {
  id: string;

  /**
   * Тип кромки.
   */
  type: EdgeType;

  /**
   * Название кромки.
   */
  name: string;

  /**
   * Толщина кромки в мм.
   */
  thickness: number;

  /**
   * Привязка к материалу.
   */
  linkedMaterialId?: string;
};
