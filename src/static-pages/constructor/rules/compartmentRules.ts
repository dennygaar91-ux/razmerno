import type {
  ConstructorCompartment,
  ConstructorCompartmentLayout,
  ConstructorSection,
} from "../types";
import { CONSTRUCTOR_COMPARTMENT_RULES } from "./projectRuleConstants";
import { clampCount, roundMm } from "./ruleMath";

function makeCompartmentId(sectionId: string, index: number) {
  return `${sectionId}-compartment-${index + 1}`;
}

export function createEvenCompartmentLayout(
  sectionId: string,
  count: number,
  heightMm: number,
): ConstructorCompartment[] {
  const safeCount = clampCount(
    count,
    CONSTRUCTOR_COMPARTMENT_RULES.minCount,
    CONSTRUCTOR_COMPARTMENT_RULES.maxCount,
  );
  const safeHeight = roundMm(heightMm);
  const base = Math.floor(safeHeight / safeCount);
  let remainder = safeHeight - base * safeCount;

  return Array.from({ length: safeCount }, (_, index) => {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return {
      id: makeCompartmentId(sectionId, index),
      heightMm: base + extra,
    };
  });
}

export function normalizeCompartmentItems(input: {
  sectionId: string;
  heightMm: number;
  compartments: number;
  compartmentsLayout?: ConstructorCompartment[] | null;
}): ConstructorCompartment[] {
  const safeHeight = roundMm(input.heightMm);
  const safeCount = clampCount(
    input.compartments,
    CONSTRUCTOR_COMPARTMENT_RULES.minCount,
    CONSTRUCTOR_COMPARTMENT_RULES.maxCount,
  );
  const existing = Array.isArray(input.compartmentsLayout)
    ? input.compartmentsLayout.slice(0, safeCount)
    : [];

  if (
    existing.length !== safeCount ||
    safeHeight < CONSTRUCTOR_COMPARTMENT_RULES.minHeightMm * safeCount
  ) {
    return createEvenCompartmentLayout(input.sectionId, safeCount, safeHeight);
  }

  const positive = existing.map((compartment, index) => ({
    id: compartment.id || makeCompartmentId(input.sectionId, index),
    heightMm: Math.max(
      CONSTRUCTOR_COMPARTMENT_RULES.minHeightMm,
      roundMm(compartment.heightMm),
    ),
  }));
  const currentTotal = positive.reduce(
    (sum, compartment) => sum + compartment.heightMm,
    0,
  );
  if (currentTotal <= 0)
    return createEvenCompartmentLayout(input.sectionId, safeCount, safeHeight);

  let scaled = positive.map((compartment) => ({
    ...compartment,
    heightMm: Math.max(
      CONSTRUCTOR_COMPARTMENT_RULES.minHeightMm,
      Math.floor((compartment.heightMm / currentTotal) * safeHeight),
    ),
  }));

  let diff =
    safeHeight - scaled.reduce((sum, compartment) => sum + compartment.heightMm, 0);
  let guard = 0;
  while (diff !== 0 && guard < 1000) {
    guard += 1;
    if (diff > 0) {
      const index = (guard - 1) % scaled.length;
      scaled[index] = {
        ...scaled[index],
        heightMm: scaled[index].heightMm + 1,
      };
      diff -= 1;
    } else {
      const index = scaled.findIndex(
        (compartment) =>
          compartment.heightMm > CONSTRUCTOR_COMPARTMENT_RULES.minHeightMm,
      );
      if (index < 0) break;
      scaled[index] = {
        ...scaled[index],
        heightMm: scaled[index].heightMm - 1,
      };
      diff += 1;
    }
  }

  const total = scaled.reduce((sum, compartment) => sum + compartment.heightMm, 0);
  if (total !== safeHeight)
    return createEvenCompartmentLayout(input.sectionId, safeCount, safeHeight);
  return scaled;
}

export function normalizeCompartmentLayout(input: {
  heightMm: number;
  compartments: number;
  sectionLayout: ConstructorSection[];
  compartmentLayout?: ConstructorCompartmentLayout | null;
}): ConstructorCompartmentLayout {
  return input.sectionLayout.reduce<ConstructorCompartmentLayout>((result, section) => {
    const existingCompartments = input.compartmentLayout?.[section.id];
    result[section.id] = normalizeCompartmentItems({
      sectionId: section.id,
      heightMm: input.heightMm,
      compartments: existingCompartments?.length ?? input.compartments,
      compartmentsLayout: existingCompartments,
    });
    return result;
  }, {});
}

export function setCompartmentHeightInLayout(input: {
  heightMm: number;
  compartmentLayout: ConstructorCompartmentLayout;
  sectionId: string;
  compartmentId: string;
  nextHeightMm: number;
}): ConstructorCompartmentLayout {
  const current = normalizeCompartmentItems({
    sectionId: input.sectionId,
    heightMm: input.heightMm,
    compartments: input.compartmentLayout[input.sectionId]?.length ?? 1,
    compartmentsLayout: input.compartmentLayout[input.sectionId],
  });
  const targetIndex = current.findIndex(
    (compartment) => compartment.id === input.compartmentId,
  );
  if (targetIndex < 0) return input.compartmentLayout;

  const minHeight = CONSTRUCTOR_COMPARTMENT_RULES.minHeightMm;
  const maxTargetHeight = Math.max(
    minHeight,
    roundMm(input.heightMm) - minHeight * (current.length - 1),
  );
  const nextTargetHeight = Math.max(
    minHeight,
    Math.min(maxTargetHeight, roundMm(input.nextHeightMm)),
  );
  const delta = nextTargetHeight - current[targetIndex].heightMm;
  if (delta === 0) return input.compartmentLayout;

  const next = current.map((compartment) => ({ ...compartment }));
  next[targetIndex].heightMm = nextTargetHeight;

  if (delta > 0) {
    let remaining = delta;
    for (let offset = 1; offset < next.length && remaining > 0; offset += 1) {
      const index = (targetIndex + offset) % next.length;
      const available = Math.max(0, next[index].heightMm - minHeight);
      const take = Math.min(available, remaining);
      next[index].heightMm -= take;
      remaining -= take;
    }
  } else {
    let remaining = Math.abs(delta);
    for (let offset = 1; offset < next.length && remaining > 0; offset += 1) {
      const index = (targetIndex + offset) % next.length;
      next[index].heightMm += remaining;
      remaining = 0;
    }
  }

  return {
    ...input.compartmentLayout,
    [input.sectionId]: normalizeCompartmentItems({
      sectionId: input.sectionId,
      heightMm: input.heightMm,
      compartments: next.length,
      compartmentsLayout: next,
    }),
  };
}


