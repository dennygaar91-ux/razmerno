import type { ConstructorStoreState } from "./constructorStoreTypes";
import type { FillKey } from "../types";
import {
  getCompartmentFilling,
  getFillingTotals,
  setCompartmentFillingInLayout,
} from "../rules/projectRules";
import { deriveFromState } from "./constructorStoreDerivation";
import { clampCount, ensureSelectedCompartment } from "./constructorStoreUtils";

type FillingCounterKind = "shelvesCount" | "drawersCount" | "rodsCount";

const COUNTER_LIMITS: Record<FillingCounterKind, number> = {
  shelvesCount: 8,
  drawersCount: 6,
  rodsCount: 2,
};

const COUNTER_FILL_KEY: Record<FillingCounterKind, FillKey> = {
  shelvesCount: "shelves",
  drawersCount: "drawers",
  rodsCount: "rod",
};

export const createFillingCounterPatch = (
  state: ConstructorStoreState,
  kind: FillingCounterKind,
  nextCount: number,
) => {
  const sectionId = state.selectedSectionId ?? state.sectionLayout[0]?.id ?? null;
  const compartmentId = ensureSelectedCompartment(
    sectionId,
    state.selectedCompartmentId,
    state.compartmentLayout,
  );
  if (!sectionId || !compartmentId) return state;
  const current = getCompartmentFilling({
    fillingLayout: state.fillingLayout,
    sectionId,
    compartmentId,
  });
  const clampedCount = clampCount(nextCount, 0, COUNTER_LIMITS[kind]);
  const fillingLayout = setCompartmentFillingInLayout({
    fillingLayout: state.fillingLayout,
    sectionId,
    compartmentId,
    patch: { [kind]: clampedCount },
    furniture: state.furniture,
  });
  const totals = getFillingTotals(fillingLayout);
  const next = {
    ...state,
    fill: nextCount > current[kind] ? COUNTER_FILL_KEY[kind] : state.fill,
    fillingLayout,
    selectedSectionId: sectionId,
    selectedCompartmentId: compartmentId,
    shelvesCount: totals.shelvesCount,
    drawersCount: totals.drawersCount,
    rodsCount: kind === "rodsCount" && state.furniture !== "wardrobe" ? 0 : totals.rodsCount,
  } satisfies ConstructorStoreState;
  return {
    ...next,
    ...deriveFromState(next),
    selectedSectionId: sectionId,
    selectedCompartmentId: compartmentId,
  };
};
