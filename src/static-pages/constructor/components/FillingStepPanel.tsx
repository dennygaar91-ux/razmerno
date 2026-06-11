import { FillingAddMenu } from "./FillingAddMenu";
import {
  FillingElementsList,
  FillingRandomPresetAction,
  FillingValidationPanel,
  FillingZoneList,
  FillingZoneSummary,
} from "./FillingElementsList";
import { FillingFacadeControls } from "./FillingFacadeControls";
import { FillingSelectionPanel } from "./FillingSelectionPanel";
import type {
  CompartmentLayout,
  FacadeLayout,
  FillAddTarget,
  FillingLayout,
  FillingStepActions,
  FillingStepDerivedState,
  ZoneFacadeLayout,
} from "./FillingStepTypes";
import type {
  ConstructorCompartmentFilling,
  ConstructorValidationState,
} from "../types";

export function FillingStepPanel({
  sections,
  selectedSectionId,
  selectedCompartmentId,
  compartmentLayout,
  fillingLayout,
  facadeLayout,
  zoneFacadeLayout,
  activeAddTarget,
  validation,
  advancedFill,
  handleless,
  onSelectSection,
  onSelectCompartment,
  onSetCompartmentFilling,
  onApplyRandomPreset,
  onApplyAutoFixForIssue,
  onAddShelfToCompartment,
  onRemoveShelfDivider,
  onRemoveCompartmentElement,
  onSetSectionFacadeMode,
  onSetZoneFacadeMode,
  onHandlelessChange,
  onAdvancedFillChange,
  onCloseAddMenu,
}: {
  sections: number;
  selectedSectionId: string | null;
  selectedCompartmentId: string | null;
  compartmentLayout: CompartmentLayout;
  fillingLayout: FillingLayout;
  facadeLayout: FacadeLayout;
  zoneFacadeLayout: ZoneFacadeLayout;
  activeAddTarget: FillAddTarget;
  validation: ConstructorValidationState;
  advancedFill: boolean;
  handleless: boolean;
} & FillingStepActions) {
  const state = getFillingStepDerivedState({
    selectedSectionId,
    selectedCompartmentId,
    compartmentLayout,
    fillingLayout,
    facadeLayout,
    zoneFacadeLayout,
    activeAddTarget,
    validation,
  });

  const actions: FillingStepActions = {
    onSelectSection,
    onSelectCompartment,
    onSetCompartmentFilling,
    onApplyRandomPreset,
    onApplyAutoFixForIssue,
    onAddShelfToCompartment,
    onRemoveShelfDivider,
    onRemoveCompartmentElement,
    onSetSectionFacadeMode,
    onSetZoneFacadeMode,
    onHandlelessChange,
    onAdvancedFillChange,
    onCloseAddMenu,
  };

  return (
    <div className="rzm-3d-drawer-body rzm-3d-fill-polish">
      <FillingSelectionPanel
        sections={sections}
        state={state}
        onSelectSection={onSelectSection}
      />
      <FillingAddMenu
        state={state}
        advancedFill={advancedFill}
        actions={actions}
      />
      <FillingZoneSummary state={state} />
      <FillingFacadeControls
        state={state}
        advancedFill={advancedFill}
        handleless={handleless}
        actions={actions}
      />
      <FillingRandomPresetAction
        activeSection={state.activeSection}
        onApplyRandomPreset={onApplyRandomPreset}
      />
      <FillingZoneList
        state={state}
        fillingLayout={fillingLayout}
        zoneFacadeLayout={zoneFacadeLayout}
        onSelectCompartment={onSelectCompartment}
      />
      <FillingElementsList
        state={state}
        onRemoveShelfDivider={onRemoveShelfDivider}
        onRemoveCompartmentElement={onRemoveCompartmentElement}
      />
      <FillingValidationPanel
        state={state}
        validation={validation}
        onApplyAutoFixForIssue={onApplyAutoFixForIssue}
      />
    </div>
  );
}

function getFillingStepDerivedState({
  selectedSectionId,
  selectedCompartmentId,
  compartmentLayout,
  fillingLayout,
  facadeLayout,
  zoneFacadeLayout,
  activeAddTarget,
  validation,
}: {
  selectedSectionId: string | null;
  selectedCompartmentId: string | null;
  compartmentLayout: CompartmentLayout;
  fillingLayout: FillingLayout;
  facadeLayout: FacadeLayout;
  zoneFacadeLayout: ZoneFacadeLayout;
  activeAddTarget: FillAddTarget;
  validation: ConstructorValidationState;
}): FillingStepDerivedState {
  const activeSection = selectedSectionId ?? "section-1";
  const sectionNumber = activeSection.replace(/\D+/g, "") || "1";
  const sectionZones = compartmentLayout[activeSection] ?? [];
  const hasSelectedZone = Boolean(selectedCompartmentId);
  const activeZone = selectedCompartmentId
    ? (sectionZones.find((zone) => zone.id === selectedCompartmentId) ??
      sectionZones[0] ??
      null)
    : null;
  const activeZoneId = activeZone?.id ?? null;
  const activeZoneIndex = activeZoneId
    ? Math.max(
        0,
        sectionZones.findIndex((zone) => zone.id === activeZoneId),
      )
    : -1;
  const activeFilling: ConstructorCompartmentFilling = activeZoneId
    ? (fillingLayout[activeSection]?.[activeZoneId] ?? {
        shelvesCount: 0,
        drawersCount: 0,
        rodsCount: 0,
      })
    : { shelvesCount: 0, drawersCount: 0, rodsCount: 0 };
  const facadeMode = facadeLayout[activeSection] ?? "hinged";
  const zoneFacadeMode = activeZoneId
    ? (zoneFacadeLayout[activeSection]?.[activeZoneId] ?? "inherit")
    : "inherit";
  const zoneFacadeLabel =
    zoneFacadeMode === "open"
      ? "без фасада"
      : facadeMode === "open"
        ? "открытая секция"
        : "как у секции";
  const showAddMenu = Boolean(
    activeAddTarget &&
      activeAddTarget.sectionId === activeSection &&
      (!activeAddTarget.compartmentId ||
        activeAddTarget.compartmentId === activeZoneId),
  );
  const dividerShelfCount = Math.max(sectionZones.length - 1, 0);
  const zoneElementCount =
    activeFilling.shelvesCount + activeFilling.drawersCount + activeFilling.rodsCount;
  const selectedZoneIssue = findIssue(validation, activeZoneId ?? activeSection);

  return {
    activeSection,
    sectionNumber,
    sectionZones,
    hasSelectedZone,
    activeZone,
    activeZoneId,
    activeZoneIndex,
    activeFilling,
    facadeMode,
    zoneFacadeMode,
    zoneFacadeLabel,
    showAddMenu,
    dividerShelfCount,
    zoneElementCount,
    selectedZoneIssue,
  };
}

function findIssue(
  validation: ConstructorValidationState,
  targetId?: string | null,
) {
  if (!targetId) return null;
  return (
    validation.issues.find(
      (issue) => issue.targetId === targetId || issue.targetType === targetId,
    ) ?? null
  );
}
