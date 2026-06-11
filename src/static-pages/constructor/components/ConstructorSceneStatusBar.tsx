import { getProjectMaterialLayers } from "../../../shared/materials/materialPresentation";
import type {
  ConstructorCompartmentLayout,
  ConstructorSection,
  ConstructorValidationState,
  MaterialToken,
} from "../types";

function getSceneMaterialName(name: string) {
  return name
    .replace(/^Egger\s+/i, "")
    .replace(/^Kronospan\s+/i, "")
    .replace(/^W960\s+SM\s+/i, "")
    .replace(/^W960\s+/i, "")
    .replace(/^H\d+\s+/i, "")
    .replace(/^R\d+\s+/i, "")
    .replace(/\s+натуральный$/i, "")
    .replace(/\s+монументальный$/i, " монумент")
    .replace(/\s+классический$/i, " классик")
    .replace(/\s+графитовый$/i, " графит")
    .replace(/\s+кремовый$/i, " крем")
    .trim();
}

function getSelectionSummary({
  sectionLayout,
  selectedSectionId,
  compartmentLayout,
  selectedCompartmentId,
}: {
  sectionLayout: ConstructorSection[];
  selectedSectionId: string | null;
  compartmentLayout: ConstructorCompartmentLayout;
  selectedCompartmentId: string | null;
}) {
  const sectionIndex = Math.max(
    0,
    sectionLayout.findIndex((section) => section.id === selectedSectionId),
  );
  const activeSection = sectionLayout[sectionIndex] ?? sectionLayout[0] ?? null;
  const activeSectionNumber = activeSection ? sectionIndex + 1 : 1;
  const compartments = activeSection ? compartmentLayout[activeSection.id] ?? [] : [];
  const compartmentIndex = Math.max(
    0,
    compartments.findIndex((compartment) => compartment.id === selectedCompartmentId),
  );
  const activeCompartment = compartments[compartmentIndex] ?? compartments[0] ?? null;
  const activeCompartmentNumber = activeCompartment ? compartmentIndex + 1 : 1;

  return {
    title: activeSection ? `Секция ${activeSectionNumber} · отсек ${activeCompartmentNumber}` : "Секция не выбрана",
    details: [
      activeSection?.widthMm ? `${activeSection.widthMm} мм ширина` : null,
      activeCompartment?.heightMm ? `${activeCompartment.heightMm} мм высота` : null,
    ].filter(Boolean).join(" · "),
  };
}

function getValidationCopy(validation: ConstructorValidationState) {
  const blockingIssues = validation.issues.filter((issue) => issue.blocksCheckout);
  const warnings = validation.issues.filter((issue) => !issue.blocksCheckout);

  if (blockingIssues.length > 0) {
    return {
      tone: "error",
      icon: "!",
      text: blockingIssues[0]?.title ?? "Нужно исправить",
      meta: `${blockingIssues.length} блокир.`,
    };
  }

  if (warnings.length > 0) {
    return {
      tone: "warning",
      icon: "!",
      text: warnings[0]?.title ?? "Нужна проверка",
      meta: `${warnings.length} предупрежд.`,
    };
  }

  return {
    tone: "ready",
    icon: "✓",
    text: "Готово к заявке",
    meta: "без ошибок",
  };
}

export function ConstructorSceneStatusBar({
  width,
  height,
  depth,
  sectionLayout,
  selectedSectionId,
  compartmentLayout,
  selectedCompartmentId,
  material,
  facadeMaterial,
  validation,
}: {
  width: number;
  height: number;
  depth: number;
  sectionLayout: ConstructorSection[];
  selectedSectionId: string | null;
  compartmentLayout: ConstructorCompartmentLayout;
  selectedCompartmentId: string | null;
  material: MaterialToken;
  facadeMaterial: MaterialToken;
  validation: ConstructorValidationState;
}) {
  const selection = getSelectionSummary({
    sectionLayout,
    selectedSectionId,
    compartmentLayout,
    selectedCompartmentId,
  });
  const validationCopy = getValidationCopy(validation);
  const layers = getProjectMaterialLayers({
    bodyMaterialId: material,
    facadeMaterialId: facadeMaterial,
  });
  const bodyLayer = layers.find((layer) => layer.key === "body") ?? layers[0];
  const facadeLayer = layers.find((layer) => layer.key === "facade") ?? layers[1];

  return (
    <div className="rzm-scene-status-bar rzm-scene-status-bar--r27" aria-label="Сводка сцены">
      <div className="rzm-r27-status-main">
        <span>{selection.title}</span>
        <strong>{width} × {height} × {depth} мм</strong>
        {selection.details ? <small>{selection.details}</small> : null}
      </div>

      <div className="rzm-r27-status-materials" aria-label="Материалы проекта">
        {bodyLayer ? (
          <span title={bodyLayer.material.name}>
            Корпус: <strong>{getSceneMaterialName(bodyLayer.material.name)}</strong>
          </span>
        ) : null}
        {facadeLayer ? (
          <span title={facadeLayer.material.name}>
            Фасады: <strong>{getSceneMaterialName(facadeLayer.material.name)}</strong>
          </span>
        ) : null}
      </div>

      <div className={`rzm-r27-status-check rzm-r27-status-check--${validationCopy.tone}`} title={validationCopy.meta}>
        <i aria-hidden="true">{validationCopy.icon}</i>
        <span>{validationCopy.text}</span>
      </div>
    </div>
  );
}
