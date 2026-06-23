export type FactoryProfileId = "default_mvp";

export interface FactoryProfile {
  id: FactoryProfileId;
  title: string;
  materials: {
    body: { material: "ldsp"; thicknessMm: 16 };
    facade: Array<{ material: "ldsp" | "mdf"; thicknessMm: 16 | 18 }>;
    backPanel: { material: "hdf"; thicknessMm: 3 };
  };
  edgeBanding: {
    facadeThicknessMm: 2;
    otherThicknessMm: 1;
    edgeAllSides: true;
  };
  shelves: {
    maxWidthWithoutReinforcementMm: 600;
  };
  drawers: {
    minWidthMm: 400;
    maxWidthMm: 800;
    synchronizeAboveWidthMm: 600;
    brands: Array<"Hettich" | "Firmax">;
  };
  hinges: {
    brands: Array<"Hettich" | "Firmax">;
    byFacadeHeight: Array<{ maxHeightMm: number; count: number }>;
    countAboveMax: number;
  };
  facadeGaps: {
    perSideMm: 1.5;
  };
}

export const DEFAULT_FACTORY_PROFILE: FactoryProfile = {
  id: "default_mvp",
  title: "Размерно MVP / ручная проверка в БАЗИС",
  materials: {
    body: { material: "ldsp", thicknessMm: 16 },
    facade: [
      { material: "ldsp", thicknessMm: 16 },
      { material: "mdf", thicknessMm: 18 },
    ],
    backPanel: { material: "hdf", thicknessMm: 3 },
  },
  edgeBanding: {
    facadeThicknessMm: 2,
    otherThicknessMm: 1,
    edgeAllSides: true,
  },
  shelves: {
    maxWidthWithoutReinforcementMm: 600,
  },
  drawers: {
    minWidthMm: 400,
    maxWidthMm: 800,
    synchronizeAboveWidthMm: 600,
    brands: ["Hettich", "Firmax"],
  },
  hinges: {
    brands: ["Hettich", "Firmax"],
    byFacadeHeight: [
      { maxHeightMm: 700, count: 2 },
      { maxHeightMm: 1000, count: 3 },
      { maxHeightMm: 1500, count: 4 },
    ],
    countAboveMax: 5,
  },
  facadeGaps: {
    perSideMm: 1.5,
  },
};

export function getDefaultFactoryProfile(): FactoryProfile {
  return DEFAULT_FACTORY_PROFILE;
}
