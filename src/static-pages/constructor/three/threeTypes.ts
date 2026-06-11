import type {
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  ConstructorSection,
  ConstructorSectionFacadeLayout,
  ConstructorZoneFacadeLayout,
  ConstructorSceneViewMode,
  FillKey,
  FurnitureKey,
  MaterialToken,
} from "../types";

export type ThreeSceneViewMode = ConstructorSceneViewMode;
export type ThreeSceneQuality = "standard" | "reduced";
export type ThreeSceneProductMode = "sizes" | "fill" | "materials" | "checkout";

export type ThreeFurnitureInput = {
  furniture: FurnitureKey;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  sections: number;
  sectionLayout?: ConstructorSection[];
  compartmentLayout?: ConstructorCompartmentLayout;
  fillingLayout?: ConstructorFillingLayout;
  facadeLayout?: ConstructorSectionFacadeLayout;
  zoneFacadeLayout?: ConstructorZoneFacadeLayout;
  compartments: number;
  shelvesCount: number;
  drawersCount: number;
  rodsCount: number;
  fill: FillKey;
  material: MaterialToken;
  facadeMaterial: MaterialToken;
  handleless: boolean;
  selectedSectionId?: string | null;
  selectedCompartmentId?: string | null;
  sceneMode?: ThreeSceneProductMode;
};

export type ThreeInteractionTarget = {
  id: string;
  kind: "section" | "compartment";
  sectionId: string;
  compartmentId?: string;
  index: number;
  label: string;
  fullLabel: string;
  position: [number, number, number];
  labelPosition: [number, number, number];
  size: [number, number, number];
  selected: boolean;
};


export type ThreePanel = {
  id: string;
  kind:
    | "side"
    | "top"
    | "bottom"
    | "back"
    | "divider"
    | "shelf"
    | "drawer"
    | "drawerSide"
    | "slide"
    | "rod"
    | "facade"
    | "hinge"
    | "handle"
    | "screw"
    | "leg"
    | "plinth"
    | "selection";
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number, number];
  material: "body" | "facade" | "facadeGhost" | "back" | "hardware" | "hardwareLight" | "accent" | "shadow";
};

export type ThreeFurnitureSceneModel = {
  dimensions: [number, number, number];
  panels: ThreePanel[];
  safeSections: number;
  safeCompartments: number;
  interactionTargets: ThreeInteractionTarget[];
};
