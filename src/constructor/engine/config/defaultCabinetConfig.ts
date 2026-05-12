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
    facadeMaterialId: "egger_w980_16",
    backPanelMaterialId: "hdf_white_3",
  },

  facade: {
    enabled: true,
    openingType: "with_handles",
    materialId: "egger_w980_16",
  },

  sections: [
    {
      id: "section_1",
      width: 600,
      items: [
        {
          id: "section_1_shelves",
          type: "shelf",
          count: 4,
        },
      ],
    },
    {
      id: "section_2",
      width: 600,
      items: [
        {
          id: "section_2_drawers",
          type: "drawer",
          count: 3,
          height: 200,
        },
      ],
    },
    {
      id: "section_3",
      width: 600,
      items: [
        {
          id: "section_3_hanger_rail",
          type: "hanger_rail",
          count: 1,
        },
      ],
    },
  ],
};
