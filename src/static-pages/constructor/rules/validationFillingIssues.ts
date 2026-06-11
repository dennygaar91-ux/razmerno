import type {
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  ConstructorValidationIssue,
  FurnitureKey,
} from "../types";
import { getCompartmentFilling } from "./fillingRules";
import {
  CONSTRUCTOR_COMPARTMENT_RULES,
  CONSTRUCTOR_FILLING_RULES,
} from "./projectRuleConstants";
import { makeIssue } from "./validationStatus";

export function pushFillingIssues(input: {
  issues: ConstructorValidationIssue[];
  furniture: FurnitureKey;
  compartmentLayout: ConstructorCompartmentLayout;
  fillingLayout?: ConstructorFillingLayout | null;
}) {
  for (const [sectionId, compartments] of Object.entries(input.compartmentLayout)) {
    for (const compartment of compartments) {
      const filling = getCompartmentFilling({
        fillingLayout: input.fillingLayout,
        sectionId,
        compartmentId: compartment.id,
      });
      const label = `секция ${sectionId.replace("section-", "")}, отсек ${compartment.id.split("-compartment-")[1] ?? ""}`.trim();

      if (filling.shelvesCount > 0) {
        const minHeightForShelves =
          (filling.shelvesCount + 1) * CONSTRUCTOR_FILLING_RULES.minShelfGapMm;
        if (compartment.heightMm < minHeightForShelves) {
          input.issues.push(
            makeIssue({
              id: `${compartment.id}-shelves-gap`,
              severity: "error",
              stepId: "fill",
              targetType: "compartment",
              targetId: compartment.id,
              title: "Полки не помещаются",
              message: `В отсеке ${label} для ${filling.shelvesCount} полк. нужно минимум ${minHeightForShelves} мм высоты.`,
              fixHint: `Уменьшите количество полок или увеличьте высоту отсека. Минимальный просвет — ${CONSTRUCTOR_FILLING_RULES.minShelfGapMm} мм.`,
              blocksCheckout: true,
            }),
          );
        }
      }

      if (filling.drawersCount > 0) {
        const drawerFrontHeight = Math.floor(compartment.heightMm / filling.drawersCount);
        if (drawerFrontHeight < CONSTRUCTOR_FILLING_RULES.minDrawerFrontHeightMm) {
          input.issues.push(
            makeIssue({
              id: `${compartment.id}-drawers-height`,
              severity: "error",
              stepId: "fill",
              targetType: "compartment",
              targetId: compartment.id,
              title: "Ящики не помещаются",
              message: `В отсеке ${label} высота фасада ящика получится меньше ${CONSTRUCTOR_FILLING_RULES.minDrawerFrontHeightMm} мм.`,
              fixHint: "Уменьшите количество ящиков или увеличьте высоту отсека.",
              blocksCheckout: true,
            }),
          );
        }
      }

      if (filling.rodsCount > 0) {
        if (input.furniture !== "wardrobe") {
          input.issues.push(
            makeIssue({
              id: `${compartment.id}-rod-only-wardrobe`,
              severity: "error",
              stepId: "fill",
              targetType: "compartment",
              targetId: compartment.id,
              title: "Штанга доступна только для шкафа",
              message: `В отсеке ${label} штанга недоступна для выбранного типа мебели.`,
              fixHint: "Выберите полки или ящики либо переключите тип мебели на шкаф.",
              blocksCheckout: true,
            }),
          );
        } else if (compartment.heightMm < CONSTRUCTOR_COMPARTMENT_RULES.recommendedRodHeightMm) {
          input.issues.push(
            makeIssue({
              id: `${compartment.id}-rod-height`,
              severity: "error",
              stepId: "fill",
              targetType: "compartment",
              targetId: compartment.id,
              title: "Для штанги мало высоты",
              message: `В отсеке ${label} для штанги рекомендуется минимум ${CONSTRUCTOR_COMPARTMENT_RULES.recommendedRodHeightMm} мм высоты.`,
              fixHint: "Увеличьте высоту отсека или перенесите штангу в другой отсек.",
              blocksCheckout: true,
            }),
          );
        }
      }
    }
  }
}
