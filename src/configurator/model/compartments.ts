import type { FurnitureType, Filling } from "../context";

export type CompartmentKind = "empty" | "shelves" | "drawers" | "rod";

export interface CompartmentModel {
  id: string;
  kind: CompartmentKind;
  heightMm: number;
  shelves: number;
  drawers: number;
  hasRod: boolean;
}

export interface SectionModel {
  id: string;
  widthMm: number;
  facadeMode?: "open" | "hinged";
  compartments: CompartmentModel[];
}

export interface LayoutModel {
  sections: SectionModel[];
}

export interface LayoutDimensions {
  width: number;
  height: number;
  depth: number;
}

const ROD_DEFAULT_HEIGHT_MM = 1200;
const MIN_COMPARTMENT_HEIGHT_MM = 300;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function makeId(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`;
}

export function createEqualCompartments({
  sectionId,
  count,
  heightMm,
}: {
  sectionId: string;
  count: number;
  heightMm: number;
}): CompartmentModel[] {
  const safeCount = clamp(Math.floor(count || 1), 1, 12);
  const baseHeight = Math.floor(heightMm / safeCount);
  const remainder = heightMm - baseHeight * safeCount;

  return Array.from({ length: safeCount }, (_, index) => ({
    id: `${sectionId}-compartment-${index + 1}`,
    kind: "empty",
    heightMm: baseHeight + (index === safeCount - 1 ? remainder : 0),
    shelves: 0,
    drawers: 0,
    hasRod: false,
  }));
}

export function createLayoutModel({
  type,
  dimensions,
  sectionCount,
  compartmentsPerSection = 1,
}: {
  type: FurnitureType;
  dimensions: LayoutDimensions;
  sectionCount: number;
  compartmentsPerSection?: number;
}): LayoutModel {
  const safeSectionCount = clamp(Math.floor(sectionCount || 1), 1, type === "nightstand" ? 1 : 6);
  const baseWidth = Math.floor(dimensions.width / safeSectionCount);
  const remainder = dimensions.width - baseWidth * safeSectionCount;

  return {
    sections: Array.from({ length: safeSectionCount }, (_, index) => {
      const id = makeId("section", index);
      return {
        id,
        widthMm: baseWidth + (index === safeSectionCount - 1 ? remainder : 0),
        compartments: createEqualCompartments({
          sectionId: id,
          count: compartmentsPerSection,
          heightMm: dimensions.height,
        }),
      };
    }),
  };
}

export function legacyFillingToLayout({
  type,
  dimensions,
  sectionCount,
  filling,
}: {
  type: FurnitureType;
  dimensions: LayoutDimensions;
  sectionCount: number;
  filling: Filling;
}): LayoutModel {
  const layout = createLayoutModel({
    type,
    dimensions,
    sectionCount,
    compartmentsPerSection: 1,
  });

  if (layout.sections.length === 0) return layout;

  const shelvesPerSection = Math.floor(filling.shelves / layout.sections.length);
  let shelvesRemainder = filling.shelves - shelvesPerSection * layout.sections.length;

  for (const section of layout.sections) {
    const compartment = section.compartments[0];
    if (!compartment) continue;

    const sectionShelves = shelvesPerSection + (shelvesRemainder > 0 ? 1 : 0);
    shelvesRemainder = Math.max(0, shelvesRemainder - 1);

    compartment.kind = sectionShelves > 0 ? "shelves" : "empty";
    compartment.shelves = sectionShelves;
  }

  if (filling.drawers > 0) {
    const first = layout.sections[0]?.compartments[0];
    if (first) {
      first.kind = "drawers";
      first.drawers = filling.drawers;
      // Legacy model allowed shelves and drawers simultaneously.
      // Keep shelves for pricing/compatibility; future per-compartment UI will make this explicit.
    }
  }

  if (filling.hangingRod && type === "wardrobe") {
    const last = layout.sections[layout.sections.length - 1]?.compartments[0];
    if (last) {
      last.kind = "rod";
      last.hasRod = true;
      // Legacy model allowed shelves and rod simultaneously.
      // Keep shelves for pricing/compatibility; future per-compartment UI will make this explicit.
      last.heightMm = Math.max(last.heightMm, ROD_DEFAULT_HEIGHT_MM);
    }
  }

  return layout;
}

export function summarizeLayoutFilling(layout: LayoutModel): Filling {
  let shelves = 0;
  let drawers = 0;
  let hangingRod = false;

  for (const section of layout.sections) {
    for (const compartment of section.compartments) {
      shelves += compartment.shelves;
      drawers += compartment.drawers;
      hangingRod = hangingRod || compartment.hasRod || compartment.kind === "rod";
    }
  }

  return { shelves, drawers, hangingRod };
}


function rebalanceSectionWidths(sections: SectionModel[], totalWidthMm: number): SectionModel[] {
  const safeCount = Math.max(1, sections.length);
  const baseWidth = Math.floor(totalWidthMm / safeCount);
  const remainder = totalWidthMm - baseWidth * safeCount;

  return sections.map((section, index) => ({
    ...section,
    widthMm: baseWidth + (index === safeCount - 1 ? remainder : 0),
  }));
}

export function addSectionByWidth(layout: LayoutModel, dimensions: LayoutDimensions): LayoutModel {
  const nextIndex = layout.sections.length;
  const id = makeId("section", nextIndex);
  const compartmentsPerSection = layout.sections[0]?.compartments.length ?? 1;

  const sections = [
    ...layout.sections,
    {
      id,
      widthMm: 0,
      compartments: createEqualCompartments({
        sectionId: id,
        count: compartmentsPerSection,
        heightMm: dimensions.height,
      }),
    },
  ];

  return {
    sections: rebalanceSectionWidths(sections, dimensions.width),
  };
}

export function addCompartmentByHeight(layout: LayoutModel, sectionId: string, heightMm: number): LayoutModel {
  return {
    sections: layout.sections.map((section) => {
      if (section.id !== sectionId) return section;

      return {
        ...section,
        compartments: createEqualCompartments({
          sectionId: section.id,
          count: section.compartments.length + 1,
          heightMm,
        }),
      };
    }),
  };
}


export function setCompartmentKind(
  layout: LayoutModel,
  sectionId: string,
  compartmentId: string,
  kind: CompartmentKind,
): LayoutModel {
  return {
    sections: layout.sections.map((section) => {
      if (section.id !== sectionId) return section;

      return {
        ...section,
        compartments: section.compartments.map((compartment) => {
          if (compartment.id !== compartmentId) return compartment;

          if (kind === "rod") {
            return {
              ...compartment,
              kind,
              hasRod: true,
              shelves: 0,
              drawers: 0,
              heightMm: Math.max(compartment.heightMm, ROD_DEFAULT_HEIGHT_MM),
            };
          }

          if (kind === "drawers") {
            return {
              ...compartment,
              kind,
              hasRod: false,
              shelves: 0,
              drawers: Math.max(1, compartment.drawers || 2),
            };
          }

          if (kind === "shelves") {
            return {
              ...compartment,
              kind,
              hasRod: false,
              shelves: Math.max(1, compartment.shelves || 2),
              drawers: 0,
            };
          }

          return {
            ...compartment,
            kind: "empty",
            hasRod: false,
            shelves: 0,
            drawers: 0,
          };
        }),
      };
    }),
  };
}


export function setCompartmentShelves(
  layout: LayoutModel,
  sectionId: string,
  compartmentId: string,
  shelves: number,
): LayoutModel {
  const safeShelves = clamp(Math.floor(shelves || 0), 0, 12);

  return {
    sections: layout.sections.map((section) => {
      if (section.id !== sectionId) return section;

      return {
        ...section,
        compartments: section.compartments.map((compartment) => {
          if (compartment.id !== compartmentId) return compartment;
          return {
            ...compartment,
            kind: safeShelves > 0 ? "shelves" : "empty",
            shelves: safeShelves,
            drawers: 0,
            hasRod: false,
          };
        }),
      };
    }),
  };
}

export function setCompartmentDrawers(
  layout: LayoutModel,
  sectionId: string,
  compartmentId: string,
  drawers: number,
): LayoutModel {
  const safeDrawers = clamp(Math.floor(drawers || 0), 0, 8);

  return {
    sections: layout.sections.map((section) => {
      if (section.id !== sectionId) return section;

      return {
        ...section,
        compartments: section.compartments.map((compartment) => {
          if (compartment.id !== compartmentId) return compartment;
          return {
            ...compartment,
            kind: safeDrawers > 0 ? "drawers" : "empty",
            shelves: 0,
            drawers: safeDrawers,
            hasRod: false,
          };
        }),
      };
    }),
  };
}


export function validateLayout(layout: LayoutModel): string[] {
  const errors: string[] = [];

  for (const section of layout.sections) {
    for (const compartment of section.compartments) {
      if (compartment.heightMm < MIN_COMPARTMENT_HEIGHT_MM) {
        errors.push(`Отсек ${compartment.id} ниже ${MIN_COMPARTMENT_HEIGHT_MM} мм`);
      }
      if (compartment.kind === "rod" && compartment.heightMm < ROD_DEFAULT_HEIGHT_MM) {
        errors.push(`Отсек ${compartment.id} со штангой должен быть не ниже ${ROD_DEFAULT_HEIGHT_MM} мм`);
      }
    }
  }

  return errors;
}

export const COMPARTMENT_RULES = {
  minCompartmentHeightMm: MIN_COMPARTMENT_HEIGHT_MM,
  rodDefaultHeightMm: ROD_DEFAULT_HEIGHT_MM,
} as const;
