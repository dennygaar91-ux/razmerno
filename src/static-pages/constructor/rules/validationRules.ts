import { isBodyMaterial, isFacadeMaterial, type MaterialToken } from "../../../shared/materials/materialCatalog";
import type {
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  ConstructorSection,
  ConstructorSectionFacadeLayout,
  ConstructorZoneFacadeLayout,
  ConstructorValidationIssue,
  ConstructorValidationState,
  FillKey,
  FurnitureKey,
  ProjectMaterials,
} from "../types";
import { normalizeCompartmentLayout } from "./compartmentRules";
import { normalizeFacadeLayout } from "./facadeRules";
import {
  CONSTRUCTOR_COMPARTMENT_RULES,
  CONSTRUCTOR_DIMENSION_LIMITS,
  CONSTRUCTOR_FACADE_RULES,
  CONSTRUCTOR_SECTION_RULES,
} from "./projectRuleConstants";
import { normalizeSectionLayout } from "./sectionRules";
import { pushFillingIssues } from "./validationFillingIssues";
import { createEmptyStepStatuses, makeIssue } from "./validationStatus";

export function validateConstructorProject(input: {
  furniture: FurnitureKey;
  width: number;
  height: number;
  depth: number;
  sections: number;
  sectionLayout?: ConstructorSection[];
  compartmentLayout?: ConstructorCompartmentLayout;
  fillingLayout?: ConstructorFillingLayout;
  facadeLayout?: ConstructorSectionFacadeLayout;
  zoneFacadeLayout?: ConstructorZoneFacadeLayout;
  compartments: number;
  fill: FillKey;
  shelvesCount?: number;
  drawersCount?: number;
  rodsCount: number;
  material: MaterialToken;
  facadeMaterial: MaterialToken;
  projectMaterials?: ProjectMaterials;
}): ConstructorValidationState {
  const issues: ConstructorValidationIssue[] = [];
  const limits =
    CONSTRUCTOR_DIMENSION_LIMITS[input.furniture] ??
    CONSTRUCTOR_DIMENSION_LIMITS.wardrobe;

  if (
    input.width > 0 &&
    (input.width < limits.minWidthMm || input.width > limits.maxWidthMm)
  ) {
    issues.push(
      makeIssue({
        id: "dimensions-width-range",
        severity: "error",
        stepId: "sizes",
        targetType: "dimensions",
        targetId: "width",
        title: "Ширина вне диапазона",
        message: `Для выбранного типа мебели ширина должна быть от ${limits.minWidthMm} до ${limits.maxWidthMm} мм.`,
        fixHint: "Измените ширину или выберите другой тип мебели.",
        blocksCheckout: true,
      }),
    );
  }

  if (
    input.height > 0 &&
    (input.height < limits.minHeightMm || input.height > limits.maxHeightMm)
  ) {
    issues.push(
      makeIssue({
        id: "dimensions-height-range",
        severity: "error",
        stepId: "sizes",
        targetType: "dimensions",
        targetId: "height",
        title: "Высота вне диапазона",
        message: `Для выбранного типа мебели высота должна быть от ${limits.minHeightMm} до ${limits.maxHeightMm} мм.`,
        fixHint: "Измените высоту или выберите другой тип мебели.",
        blocksCheckout: true,
      }),
    );
  }

  if (
    input.depth > 0 &&
    (input.depth < limits.minDepthMm || input.depth > limits.maxDepthMm)
  ) {
    issues.push(
      makeIssue({
        id: "dimensions-depth-range",
        severity: "error",
        stepId: "sizes",
        targetType: "dimensions",
        targetId: "depth",
        title: "Глубина вне диапазона",
        message: `Для выбранного типа мебели глубина должна быть от ${limits.minDepthMm} до ${limits.maxDepthMm} мм.`,
        fixHint: "Измените глубину или выберите другой тип мебели.",
        blocksCheckout: true,
      }),
    );
  }

  const sectionLayout = normalizeSectionLayout({
    widthMm: input.width,
    sections: input.sections,
    sectionLayout: input.sectionLayout,
  });
  if (
    input.sections > 0 &&
    input.width > 0 &&
    input.width / input.sections < CONSTRUCTOR_SECTION_RULES.minWidthMm
  ) {
    issues.push(
      makeIssue({
        id: "sections-min-width",
        severity: "error",
        stepId: "sizes",
        targetType: "sections",
        title: "Секции слишком узкие",
        message: `Минимальная ширина одной секции — ${CONSTRUCTOR_SECTION_RULES.minWidthMm} мм.`,
        fixHint: "Уменьшите количество секций или увеличьте ширину мебели.",
        blocksCheckout: true,
      }),
    );
  }

  for (const section of sectionLayout) {
    if (section.widthMm < CONSTRUCTOR_SECTION_RULES.minWidthMm) {
      issues.push(
        makeIssue({
          id: `section-${section.id}-min-width`,
          severity: "error",
          stepId: "sizes",
          targetType: "section",
          targetId: section.id,
          title: "Секция слишком узкая",
          message: `Секция ${section.id.replace("section-", "")} меньше ${CONSTRUCTOR_SECTION_RULES.minWidthMm} мм.`,
          fixHint:
            "Увеличьте ширину секции или выровняйте секции автоматически.",
          blocksCheckout: true,
        }),
      );
    } else if (section.widthMm > CONSTRUCTOR_SECTION_RULES.warningWidthMm) {
      issues.push(
        makeIssue({
          id: `section-${section.id}-wide`,
          severity: "warning",
          stepId: "sizes",
          targetType: "section",
          targetId: section.id,
          title: "Нужна проверка фасада",
          message: `Секция ${section.id.replace("section-", "")} шире ${CONSTRUCTOR_SECTION_RULES.warningWidthMm} мм.`,
          fixHint: "Можно продолжить: фасад и фурнитуру проверят перед запуском.",
          blocksCheckout: false,
        }),
      );
    }
  }

  const facadeLayout = normalizeFacadeLayout({
    sectionLayout,
    facadeLayout: input.facadeLayout,
  });
  for (const section of sectionLayout) {
    if (facadeLayout[section.id] === "hinged" && section.widthMm > CONSTRUCTOR_FACADE_RULES.warningHingedWidthMm) {
      issues.push(
        makeIssue({
          id: `facade-${section.id}-wide-hinged`,
          severity: "warning",
          stepId: "fill",
          targetType: "facade",
          targetId: section.id,
          title: "Нужна проверка фасада",
          message: `Секция ${section.id.replace("section-", "")} шире ${CONSTRUCTOR_FACADE_RULES.warningHingedWidthMm} мм для одного распашного фасада.`,
          fixHint: "Можно оставить так или открыть секцию — менеджер проверит перед запуском.",
          blocksCheckout: false,
        }),
      );
    }
  }

  const compartmentLayout = normalizeCompartmentLayout({
    heightMm: input.height,
    compartments: input.compartments,
    sectionLayout,
    compartmentLayout: input.compartmentLayout,
  });
  for (const [sectionId, compartments] of Object.entries(compartmentLayout)) {
    for (const compartment of compartments) {
      if (compartment.heightMm < CONSTRUCTOR_COMPARTMENT_RULES.minHeightMm) {
        issues.push(
          makeIssue({
            id: `${compartment.id}-min-height`,
            severity: "error",
            stepId: "fill",
            targetType: "compartment",
            targetId: compartment.id,
            title: "Отсек слишком низкий",
            message: `Отсек в секции ${sectionId.replace("section-", "")} меньше ${CONSTRUCTOR_COMPARTMENT_RULES.minHeightMm} мм.`,
            fixHint: "Увеличьте высоту отсека или выровняйте отсеки автоматически.",
            blocksCheckout: true,
          }),
        );
      }
    }
  }

  pushFillingIssues({
    issues,
    furniture: input.furniture,
    compartmentLayout,
    fillingLayout: input.fillingLayout,
  });

  if (
    input.compartments > 0 &&
    input.height > 0 &&
    input.height / input.compartments < CONSTRUCTOR_COMPARTMENT_RULES.minHeightMm
  ) {
    issues.push(
      makeIssue({
        id: "compartments-min-height",
        severity: "error",
        stepId: "fill",
        targetType: "compartments",
        title: "Отсеки слишком низкие",
        message: `Минимальная высота одного отсека — ${CONSTRUCTOR_COMPARTMENT_RULES.minHeightMm} мм.`,
        fixHint: "Уменьшите количество отсеков или увеличьте высоту мебели.",
        blocksCheckout: true,
      }),
    );
  }

  if (
    (input.fill === "rod" || input.rodsCount > 0) &&
    input.furniture !== "wardrobe"
  ) {
    issues.push(
      makeIssue({
        id: "rod-only-wardrobe",
        severity: "error",
        stepId: "fill",
        targetType: "compartments",
        title: "Штанга доступна только для шкафа",
        message: "Для тумбы и комода штанга недоступна.",
        fixHint:
          "Выберите полки или ящики либо переключите тип мебели на шкаф.",
        blocksCheckout: true,
      }),
    );
  }

  if (!isBodyMaterial(input.material)) {
    issues.push(
      makeIssue({
        id: "material-body-kind",
        severity: "error",
        stepId: "materials",
        targetType: "material",
        targetId: "bodyMaterialId",
        title: "Некорректный материал корпуса",
        message: "Корпус можно выбрать только из ЛДСП 16 мм.",
        fixHint: "Выберите один из декоров ЛДСП для корпуса.",
        blocksCheckout: true,
      }),
    );
  }

  if (!isFacadeMaterial(input.facadeMaterial)) {
    issues.push(
      makeIssue({
        id: "material-facade-kind",
        severity: "error",
        stepId: "materials",
        targetType: "material",
        targetId: "facadeMaterialId",
        title: "Некорректный материал фасадов",
        message: "Фасады можно выбрать из ЛДСП 16 мм или МДФ 18 мм.",
        fixHint: "Выберите подходящий декор для фасадов.",
        blocksCheckout: true,
      }),
    );
  }

  const stepStatuses = createEmptyStepStatuses();
  for (const issue of issues) {
    if (issue.severity === "error") {
      stepStatuses[issue.stepId] = "error";
    } else if (stepStatuses[issue.stepId] !== "error") {
      stepStatuses[issue.stepId] = "warning";
    }
  }

  const hasError = issues.some((issue) => issue.severity === "error");
  const hasWarning = issues.some((issue) => issue.severity === "warning");

  return {
    status: hasError ? "error" : hasWarning ? "warning" : "valid",
    issues,
    stepStatuses,
  };
}
