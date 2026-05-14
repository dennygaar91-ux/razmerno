import type { CabinetConfig } from "../types";

export const defaultCabinetConfig: CabinetConfig = {
  id: "cabinet_default_001",
  type: "wardrobe",

  dimensions: {
    width: 1800,
    height: 2400,
    depth: 600,
  },

  materials: {
    bodyMaterialId: "egger_w980_16",
    facadeMaterialId: "mdf_white_18",
    backPanelMaterialId: "hdf_white_3",
  },

  facade: {
    enabled: true,
    openingType: "with_handles",
    materialId: "mdf_white_18",
    handleVariant: "rail_96"
  },

  options: {
    hardwareBrand: "Hettich",
    hasLegs: true,
    hasBackPanel: true,
    wallMount: true
  },

  sections: [
    {
      id: "section_1",
      width: 1768,
      items: [
        {
          id: "section_1_shelves",
          type: "shelf",
          count: 3,
        },
        {
          id: "section_1_hanger_rail",
          type: "hanger_rail",
          count: 1,
        }
      ],
    },
  ],
};
