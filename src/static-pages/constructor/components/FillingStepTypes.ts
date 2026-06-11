import type {
  ConstructorCompartmentFilling,
  ConstructorValidationIssue,
  ConstructorValidationState,
} from "../types";

export type FillingZone = { id: string; heightMm: number };
export type SectionFacadeMode = "open" | "hinged";
export type ZoneFacadeMode = "inherit" | "open";
export type FillingLayout = Record<string, Record<string, ConstructorCompartmentFilling>>;
export type CompartmentLayout = Record<string, FillingZone[]>;
export type FacadeLayout = Record<string, SectionFacadeMode>;
export type ZoneFacadeLayout = Record<string, Record<string, ZoneFacadeMode>>;
export type FillAddTarget = { sectionId: string; compartmentId?: string } | null;

export type FillingStepDerivedState = {
  activeSection: string;
  sectionNumber: string;
  sectionZones: FillingZone[];
  hasSelectedZone: boolean;
  activeZone: FillingZone | null;
  activeZoneId: string | null;
  activeZoneIndex: number;
  activeFilling: ConstructorCompartmentFilling;
  facadeMode: SectionFacadeMode;
  zoneFacadeMode: ZoneFacadeMode;
  zoneFacadeLabel: string;
  showAddMenu: boolean;
  dividerShelfCount: number;
  zoneElementCount: number;
  selectedZoneIssue: ConstructorValidationIssue | null;
};

export type FillingStepActions = {
  onSelectSection: (sectionId: string) => void;
  onSelectCompartment: (sectionId: string, compartmentId: string) => void;
  onSetCompartmentFilling: (
    sectionId: string,
    compartmentId: string,
    patch: Partial<ConstructorCompartmentFilling>,
  ) => void;
  onApplyRandomPreset: (sectionId?: string | null) => void;
  onApplyAutoFixForIssue: (issueId?: string | null) => void;
  onAddShelfToCompartment: (
    sectionId: string,
    compartmentId: string,
    shelfHeightFromZoneBottomMm?: number,
  ) => void;
  onRemoveShelfDivider: (sectionId: string, lowerCompartmentId: string) => void;
  onRemoveCompartmentElement: (
    sectionId: string,
    compartmentId: string,
    kind: keyof ConstructorCompartmentFilling,
  ) => void;
  onSetSectionFacadeMode: (sectionId: string, mode: SectionFacadeMode) => void;
  onSetZoneFacadeMode: (
    sectionId: string,
    compartmentId: string,
    mode: ZoneFacadeMode,
  ) => void;
  onHandlelessChange: (value: boolean) => void;
  onAdvancedFillChange: (value: boolean) => void;
  onCloseAddMenu: () => void;
};

export type FillingValidationProps = {
  validation: ConstructorValidationState;
  onApplyAutoFixForIssue: (issueId?: string | null) => void;
};
