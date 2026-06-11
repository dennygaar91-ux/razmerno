import { getRequiredMaterial } from "../../../shared/materials/materialCatalog";
import { buildProjectMaterials } from "../rules/projectRules";
import type { ConstructorValidationState } from "../types";
import {
  buildConstructorLayout,
  getSelectedFacadeMaterial,
  getSelectedFurniture,
  getSelectedMaterial,
  type ConstructorSnapshot,
} from "./constructorPayload";

export type ConstructorCheckoutReviewSummary = {
  furnitureLabel: string;
  dimensionsText: string;
  layoutText: string;
  fillingText: string;
  facadeText: string;
  bodyMaterialText: string;
  facadeMaterialText: string;
  backPanelMaterialText: string;
  validationStatusText: string;
  validationTone: "valid" | "warning" | "error";
};

function pluralizeRu(count: number, one: string, few: string, many: string) {
  const abs = Math.abs(count);
  const lastTwo = abs % 100;
  const last = abs % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

function formatCount(count: number, one: string, few: string, many: string) {
  return `${count} ${pluralizeRu(count, one, few, many)}`;
}

function buildFillingText(layout: ReturnType<typeof buildConstructorLayout>) {
  const totals = layout.sections.reduce(
    (acc, section) => {
      for (const compartment of section.compartments) {
        acc.shelves += Math.max(0, compartment.shelves ?? 0);
        acc.drawers += Math.max(0, compartment.drawers ?? 0);
        acc.rods += compartment.hasRod ? 1 : 0;
      }
      return acc;
    },
    { shelves: 0, drawers: 0, rods: 0 },
  );

  const parts = [
    totals.shelves > 0 ? formatCount(totals.shelves, "полка", "полки", "полок") : "",
    totals.drawers > 0 ? formatCount(totals.drawers, "ящик", "ящика", "ящиков") : "",
    totals.rods > 0 ? formatCount(totals.rods, "штанга", "штанги", "штанг") : "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Без наполнения";
}

function buildFacadeText(layout: ReturnType<typeof buildConstructorLayout>, handleless: boolean) {
  const hinged = layout.sections.filter((section) => section.facadeMode !== "open").length;
  const open = layout.sections.length - hinged;
  const mode = handleless ? "без ручек" : "с ручками";
  if (hinged === 0) return `Открытые секции · ${mode}`;
  if (open === 0) return `Распашные фасады · ${mode}`;
  return `${formatCount(hinged, "закрытая секция", "закрытые секции", "закрытых секций")} · ${formatCount(open, "открытая", "открытые", "открытых")} · ${mode}`;
}

function buildValidationText(validation: ConstructorValidationState | null | undefined) {
  if (!validation || validation.issues.length === 0) {
    return { text: "Ошибок нет — проект можно отправлять на проверку", tone: "valid" as const };
  }

  const blocking = validation.issues.filter((issue) => issue.blocksCheckout).length;
  if (blocking > 0) {
    return {
      text: `${formatCount(blocking, "ошибка блокирует", "ошибки блокируют", "ошибок блокируют")} отправку`,
      tone: "error" as const,
    };
  }

  return {
    text: `${formatCount(validation.issues.length, "предупреждение", "предупреждения", "предупреждений")} — менеджер проверит`,
    tone: "warning" as const,
  };
}

export function buildConstructorCheckoutReviewSummary(
  snapshot: ConstructorSnapshot,
  validation?: ConstructorValidationState | null,
): ConstructorCheckoutReviewSummary {
  const layout = buildConstructorLayout(snapshot);
  const selectedFurniture = getSelectedFurniture(snapshot);
  const selectedBodyMaterial = getSelectedMaterial(snapshot);
  const selectedFacadeMaterial = getSelectedFacadeMaterial(snapshot);
  const projectMaterials = snapshot.projectMaterials ?? buildProjectMaterials({
    bodyMaterialId: selectedBodyMaterial.materialId,
    facadeMaterialId: selectedFacadeMaterial.materialId,
  });
  const backPanelMaterial = getRequiredMaterial(projectMaterials.backPanelMaterialId);
  const compartmentCount = layout.sections.reduce((sum, section) => sum + section.compartments.length, 0);
  const validationSummary = buildValidationText(validation);

  return {
    furnitureLabel: selectedFurniture.label,
    dimensionsText: `${snapshot.width} × ${snapshot.height} × ${snapshot.depth} мм`,
    layoutText: `${formatCount(layout.sections.length, "секция", "секции", "секций")} · ${formatCount(compartmentCount, "отсек", "отсека", "отсеков")}`,
    fillingText: buildFillingText(layout),
    facadeText: buildFacadeText(layout, snapshot.handleless),
    bodyMaterialText: `${selectedBodyMaterial.displayName} · ${selectedBodyMaterial.thicknessMm} мм`,
    facadeMaterialText: `${selectedFacadeMaterial.displayName} · ${selectedFacadeMaterial.thicknessMm} мм`,
    backPanelMaterialText: `${backPanelMaterial.displayName} · ${backPanelMaterial.thicknessMm} мм`,
    validationStatusText: validationSummary.text,
    validationTone: validationSummary.tone,
  };
}
