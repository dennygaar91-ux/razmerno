export type FacadeOpeningType = "with_handles" | "handleless";

export type CabinetFacade = {
  /**
   * Есть ли фасады у шкафа.
   */
  enabled: boolean;

  /**
   * С ручками или без ручек.
   */
  openingType: FacadeOpeningType;

  /**
   * Материал фасада.
   */
  materialId: string;
};
