import type {
  ConstructorCompartmentLayout,
  ConstructorSceneViewMode,
  ConstructorSection,
  ConstructorValidationState,
  StepKey,
} from "../types";
import { stepOrder } from "../options";

export const stepLabels: Record<StepKey, string> = {
  sizes: "Размеры",
  fill: "Наполнение",
  materials: "Материалы",
  checkout: "Заявка",
};

export const viewLabels: Record<ConstructorSceneViewMode, string> = {
  free: "Свободно",
  front: "Спереди",
  side: "Сбоку",
  top: "Сверху",
};

export const stepDescriptions: Record<StepKey, string> = {
  sizes: "Габариты и секции",
  fill: "Зоны и наполнение",
  materials: "Декоры и фасады",
  checkout: "Контакты и смета",
};

export const stepStateLabels: Record<string, string> = {
  active: "текущий шаг",
  completed: "шаг пройден",
  warning: "есть предупреждение",
  error: "нужно исправить",
  future: "следующий шаг",
};

export function getStepVisualState(
  item: StepKey,
  index: number,
  currentStepIndex: number,
  validation: ConstructorValidationState,
) {
  const validationStatus = validation.stepStatuses[item];
  if (item === stepOrder[currentStepIndex]) return "active";
  if (validationStatus === "error") return "error";
  if (validationStatus === "warning") return "warning";
  if (index < currentStepIndex || validationStatus === "done") {
    return "completed";
  }
  return "future";
}

export function getStepIssueCount(
  stepId: StepKey,
  validation: ConstructorValidationState,
) {
  return validation.issues.filter((issue) => issue.stepId === stepId).length;
}

export function formatMm(value: number) {
  return `${Math.round(value).toLocaleString("ru-RU")} мм`;
}

function getSectionNumber(
  sectionLayout: ConstructorSection[],
  sectionId: string | null,
) {
  if (!sectionId) return null;
  const index = sectionLayout.findIndex((section) => section.id === sectionId);
  return index >= 0 ? index + 1 : null;
}

function getZoneNumber(
  compartmentLayout: ConstructorCompartmentLayout,
  sectionId: string | null,
  compartmentId: string | null,
) {
  if (!sectionId || !compartmentId) return null;
  const index = (compartmentLayout[sectionId] ?? []).findIndex(
    (zone) => zone.id === compartmentId,
  );
  return index >= 0 ? index + 1 : null;
}

export function getSceneInfo(input: {
  width: number;
  height: number;
  depth: number;
  sectionLayout: ConstructorSection[];
  compartmentLayout: ConstructorCompartmentLayout;
  selectedSectionId: string | null;
  selectedCompartmentId: string | null;
}) {
  const selectedSectionId =
    input.selectedSectionId ?? input.sectionLayout[0]?.id ?? null;
  const sectionNumber = getSectionNumber(
    input.sectionLayout,
    selectedSectionId,
  );
  const selectedSection = input.sectionLayout.find(
    (section) => section.id === selectedSectionId,
  );
  const zones = selectedSectionId
    ? (input.compartmentLayout[selectedSectionId] ?? [])
    : [];
  const selectedCompartmentId =
    input.selectedCompartmentId ?? zones[0]?.id ?? null;
  const zoneNumber = getZoneNumber(
    input.compartmentLayout,
    selectedSectionId,
    selectedCompartmentId,
  );
  const selectedZone = zones.find((zone) => zone.id === selectedCompartmentId);
  const title = sectionNumber
    ? zoneNumber
      ? `Секция ${sectionNumber} · Зона ${zoneNumber}`
      : `Секция ${sectionNumber}`
    : "Проект";
  const size =
    selectedZone && selectedSection
      ? `${formatMm(selectedSection.widthMm)} × ${formatMm(selectedZone.heightMm)} · глубина ${formatMm(input.depth)}`
      : `${formatMm(input.width)} × ${formatMm(input.height)} × ${formatMm(input.depth)}`;
  return { title, size };
}

export function SceneInfoBar({ info }: { info: { title: string; size: string } }) {
  return (
    <div
      className="rzm-3d-scene-info"
      aria-live="polite"
      aria-label="Выбранная область сцены"
    >
      <span>{info.title}</span>
      <strong>{info.size}</strong>
    </div>
  );
}
