import type { MaterialToken } from "../../../shared/materials/materialCatalog";
import type {
  ConstructorFacadeMode,
  ConstructorFurnitureDefaults,
  FurnitureKey,
} from "../types";

export const CONSTRUCTOR_FURNITURE_DEFAULTS: Record<
  FurnitureKey,
  ConstructorFurnitureDefaults
> = {
  wardrobe: {
    furniture: "wardrobe",
    width: 1800,
    height: 2400,
    depth: 600,
    sections: 2,
    compartments: 1,
    fill: "shelves",
    shelvesCount: 0,
    drawersCount: 0,
    rodsCount: 0,
  },
  nightstand: {
    furniture: "nightstand",
    width: 800,
    height: 600,
    depth: 450,
    sections: 2,
    compartments: 1,
    fill: "drawers",
    shelvesCount: 0,
    drawersCount: 2,
    rodsCount: 0,
  },
  dresser: {
    furniture: "dresser",
    width: 900,
    height: 900,
    depth: 450,
    sections: 1,
    compartments: 1,
    fill: "drawers",
    shelvesCount: 0,
    drawersCount: 3,
    rodsCount: 0,
  },
};

export const CONSTRUCTOR_DIMENSION_LIMITS: Record<
  FurnitureKey,
  {
    minWidthMm: number;
    maxWidthMm: number;
    minHeightMm: number;
    maxHeightMm: number;
    minDepthMm: number;
    maxDepthMm: number;
  }
> = {
  wardrobe: {
    minWidthMm: 400,
    maxWidthMm: 3000,
    minHeightMm: 1200,
    maxHeightMm: 2700,
    minDepthMm: 350,
    maxDepthMm: 700,
  },
  nightstand: {
    minWidthMm: 300,
    maxWidthMm: 1800,
    minHeightMm: 300,
    maxHeightMm: 900,
    minDepthMm: 250,
    maxDepthMm: 600,
  },
  dresser: {
    minWidthMm: 400,
    maxWidthMm: 2000,
    minHeightMm: 500,
    maxHeightMm: 1300,
    minDepthMm: 300,
    maxDepthMm: 600,
  },
};

export const DEFAULT_BODY_MATERIAL_ID =
  "ldsp-egger-w960-belyy-klassicheskiy-sm" as MaterialToken;
export const DEFAULT_FACADE_MATERIAL_ID =
  "ldsp-egger-w960-belyy-klassicheskiy-sm" as MaterialToken;

export const CONSTRUCTOR_SECTION_RULES = {
  minCount: 1,
  maxCount: 6,
  minWidthMm: 200,
  warningWidthMm: 900,
} as const;

export const CONSTRUCTOR_FACADE_RULES = {
  defaultMode: "hinged" as ConstructorFacadeMode,
  warningHingedWidthMm: 900,
} as const;

export const CONSTRUCTOR_COMPARTMENT_RULES = {
  minCount: 1,
  maxCount: 5,
  minHeightMm: 300,
  recommendedRodHeightMm: 1200,
} as const;

export const CONSTRUCTOR_FILLING_RULES = {
  maxShelvesPerCompartment: 8,
  maxDrawersPerCompartment: 6,
  maxRodsPerCompartment: 2,
  minShelfGapMm: 300,
  minDrawerFrontHeightMm: 200,
} as const;
