import type {
  ConstructorCompartment,
  ConstructorCompartmentFilling,
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  FurnitureKey,
} from "../types";
import { CONSTRUCTOR_COMPARTMENT_RULES } from "./projectRuleConstants";
import {
  EMPTY_COMPARTMENT_FILLING,
  getCompartmentFilling,
  normalizeCompartmentFilling,
} from "./fillingRules";
import { roundMm } from "./ruleMath";
import { normalizeCompartmentItems } from "./compartmentRules";

function makeCompartmentId(sectionId: string, index: number) {
  return `${sectionId}-compartment-${index + 1}`;
}

function reindexCompartments(sectionId: string, compartments: ConstructorCompartment[]) {
  return compartments.map((compartment, index) => ({
    ...compartment,
    id: makeCompartmentId(sectionId, index),
  }));
}

function remapFillingForCompartmentList(input: {
  sectionId: string;
  previousCompartments: ConstructorCompartment[];
  nextCompartments: ConstructorCompartment[];
  fillingLayout: ConstructorFillingLayout;
  mappings: Array<{ nextIndex: number; previousIndex?: number; empty?: boolean }>;
  furniture: FurnitureKey;
}) {
  const nextSectionFilling: Record<string, ConstructorCompartmentFilling> = {};
  for (const mapping of input.mappings) {
    const nextCompartment = input.nextCompartments[mapping.nextIndex];
    if (!nextCompartment) continue;
    const previousCompartment = mapping.previousIndex !== undefined
      ? input.previousCompartments[mapping.previousIndex]
      : undefined;
    const previous = mapping.empty || !previousCompartment
      ? EMPTY_COMPARTMENT_FILLING
      : getCompartmentFilling({
          fillingLayout: input.fillingLayout,
          sectionId: input.sectionId,
          compartmentId: previousCompartment.id,
        });
    const normalized = normalizeCompartmentFilling(previous);
    nextSectionFilling[nextCompartment.id] = {
      ...normalized,
      rodsCount: input.furniture === "wardrobe" ? normalized.rodsCount : 0,
    };
  }

  return {
    ...input.fillingLayout,
    [input.sectionId]: nextSectionFilling,
  };
}

export function splitCompartmentWithShelf(input: {
  heightMm: number;
  compartmentLayout: ConstructorCompartmentLayout;
  fillingLayout: ConstructorFillingLayout;
  sectionId: string;
  compartmentId: string;
  shelfHeightFromZoneBottomMm: number;
  furniture: FurnitureKey;
}): {
  compartmentLayout: ConstructorCompartmentLayout;
  fillingLayout: ConstructorFillingLayout;
  selectedCompartmentId: string;
} {
  const previousCompartments = normalizeCompartmentItems({
    sectionId: input.sectionId,
    heightMm: input.heightMm,
    compartments: input.compartmentLayout[input.sectionId]?.length ?? 1,
    compartmentsLayout: input.compartmentLayout[input.sectionId],
  });
  const targetIndex = previousCompartments.findIndex(
    (compartment) => compartment.id === input.compartmentId,
  );
  if (targetIndex < 0) {
    return {
      compartmentLayout: input.compartmentLayout,
      fillingLayout: input.fillingLayout,
      selectedCompartmentId: input.compartmentId,
    };
  }

  const minHeight = CONSTRUCTOR_COMPARTMENT_RULES.minHeightMm;
  const target = previousCompartments[targetIndex];
  if (target.heightMm < minHeight * 2) {
    return {
      compartmentLayout: input.compartmentLayout,
      fillingLayout: input.fillingLayout,
      selectedCompartmentId: input.compartmentId,
    };
  }

  const lowerHeight = Math.max(
    minHeight,
    Math.min(target.heightMm - minHeight, roundMm(input.shelfHeightFromZoneBottomMm)),
  );
  const upperHeight = target.heightMm - lowerHeight;
  const expanded = [
    ...previousCompartments.slice(0, targetIndex),
    { id: target.id, heightMm: lowerHeight },
    { id: `${target.id}-upper`, heightMm: upperHeight },
    ...previousCompartments.slice(targetIndex + 1),
  ];
  const nextCompartments = reindexCompartments(input.sectionId, expanded);
  const mappings = expanded.map((_compartment, index) => {
    if (index < targetIndex) return { nextIndex: index, previousIndex: index };
    if (index === targetIndex) return { nextIndex: index, previousIndex: targetIndex };
    if (index === targetIndex + 1) return { nextIndex: index, empty: true };
    return { nextIndex: index, previousIndex: index - 1 };
  });

  return {
    compartmentLayout: {
      ...input.compartmentLayout,
      [input.sectionId]: normalizeCompartmentItems({
        sectionId: input.sectionId,
        heightMm: input.heightMm,
        compartments: nextCompartments.length,
        compartmentsLayout: nextCompartments,
      }),
    },
    fillingLayout: remapFillingForCompartmentList({
      sectionId: input.sectionId,
      previousCompartments,
      nextCompartments,
      fillingLayout: input.fillingLayout,
      mappings,
      furniture: input.furniture,
    }),
    selectedCompartmentId: nextCompartments[targetIndex + 1]?.id ?? nextCompartments[targetIndex]?.id ?? input.compartmentId,
  };
}

export function removeCompartmentShelfDivider(input: {
  heightMm: number;
  compartmentLayout: ConstructorCompartmentLayout;
  fillingLayout: ConstructorFillingLayout;
  sectionId: string;
  lowerCompartmentId: string;
  furniture: FurnitureKey;
}): {
  compartmentLayout: ConstructorCompartmentLayout;
  fillingLayout: ConstructorFillingLayout;
  selectedCompartmentId: string | null;
} {
  const previousCompartments = normalizeCompartmentItems({
    sectionId: input.sectionId,
    heightMm: input.heightMm,
    compartments: input.compartmentLayout[input.sectionId]?.length ?? 1,
    compartmentsLayout: input.compartmentLayout[input.sectionId],
  });
  const lowerIndex = previousCompartments.findIndex(
    (compartment) => compartment.id === input.lowerCompartmentId,
  );
  if (lowerIndex < 0 || lowerIndex >= previousCompartments.length - 1) {
    return {
      compartmentLayout: input.compartmentLayout,
      fillingLayout: input.fillingLayout,
      selectedCompartmentId: input.lowerCompartmentId,
    };
  }

  const merged = {
    id: previousCompartments[lowerIndex].id,
    heightMm: previousCompartments[lowerIndex].heightMm + previousCompartments[lowerIndex + 1].heightMm,
  };
  const collapsed = [
    ...previousCompartments.slice(0, lowerIndex),
    merged,
    ...previousCompartments.slice(lowerIndex + 2),
  ];
  const nextCompartments = reindexCompartments(input.sectionId, collapsed);
  const nextSectionFilling: Record<string, ConstructorCompartmentFilling> = {};

  nextCompartments.forEach((compartment, index) => {
    if (index < lowerIndex) {
      const previous = previousCompartments[index];
      nextSectionFilling[compartment.id] = getCompartmentFilling({
        fillingLayout: input.fillingLayout,
        sectionId: input.sectionId,
        compartmentId: previous?.id,
      });
      return;
    }
    if (index === lowerIndex) {
      const lowerFilling = getCompartmentFilling({
        fillingLayout: input.fillingLayout,
        sectionId: input.sectionId,
        compartmentId: previousCompartments[lowerIndex]?.id,
      });
      const upperFilling = getCompartmentFilling({
        fillingLayout: input.fillingLayout,
        sectionId: input.sectionId,
        compartmentId: previousCompartments[lowerIndex + 1]?.id,
      });
      nextSectionFilling[compartment.id] = normalizeCompartmentFilling({
        shelvesCount: lowerFilling.shelvesCount + upperFilling.shelvesCount,
        drawersCount: lowerFilling.drawersCount + upperFilling.drawersCount,
        rodsCount: input.furniture === "wardrobe" ? lowerFilling.rodsCount + upperFilling.rodsCount : 0,
      });
      return;
    }
    const previous = previousCompartments[index + 1];
    nextSectionFilling[compartment.id] = getCompartmentFilling({
      fillingLayout: input.fillingLayout,
      sectionId: input.sectionId,
      compartmentId: previous?.id,
    });
  });

  return {
    compartmentLayout: {
      ...input.compartmentLayout,
      [input.sectionId]: normalizeCompartmentItems({
        sectionId: input.sectionId,
        heightMm: input.heightMm,
        compartments: nextCompartments.length,
        compartmentsLayout: nextCompartments,
      }),
    },
    fillingLayout: {
      ...input.fillingLayout,
      [input.sectionId]: nextSectionFilling,
    },
    selectedCompartmentId: nextCompartments[lowerIndex]?.id ?? nextCompartments[0]?.id ?? null,
  };
}
