export type MaterialType = "ldsp" | "mdf" | "hdf";

export type MaterialBrand = "Egger" | "Kronospan" | "Other";

export type CabinetMaterial = {
  id: string;

  /**
   * ЛДСП, МДФ или ХДФ.
   */
  type: MaterialType;

  /**
   * Название материала.
   */
  name: string;

  /**
   * Производитель.
   */
  brand: MaterialBrand;

  /**
   * Толщина материала в мм.
   */
  thickness: number;

  /**
   * Ссылка на текстуру материала.
   */
  textureUrl?: string;
};
