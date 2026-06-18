export type ConstructorCompartmentKind = "empty" | "shelves" | "drawers" | "rod";

export interface ConstructorCompartmentModel {
  id: string;
  kind: ConstructorCompartmentKind;
  heightMm: number;
  shelves: number;
  drawers: number;
  hasRod: boolean;
}

export interface ConstructorSectionModel {
  id: string;
  widthMm: number;
  facadeMode?: "open" | "hinged";
  compartments: ConstructorCompartmentModel[];
}

export interface ConstructorLayoutModel {
  sections: ConstructorSectionModel[];
}
