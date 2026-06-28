import type {
  ConstructorCompartmentFilling,
  ConstructorCompartmentLayout,
  ConstructorFacadeMode,
  ConstructorFillingLayout,
  ConstructorProductionSnapshotState,
  ConstructorSceneRenderMode,
  ConstructorSceneViewMode,
  ConstructorSection,
  ConstructorSectionFacadeLayout,
  ConstructorValidationState,
  ConstructorZoneFacadeLayout,
  ConstructorZoneFacadeMode,
  ContactState,
  FillKey,
  FurnitureKey,
  MaterialToken,
  ProjectMaterials,
  StepKey,
} from "../types";

export interface ConstructorStoreState {
  step: StepKey;
  furniture: FurnitureKey;
  width: number;
  height: number;
  depth: number;
  fill: FillKey;
  sections: number;
  sectionLayout: ConstructorSection[];
  selectedSectionId: string | null;
  selectedZoneId: string | null;
  compartmentLayout: ConstructorCompartmentLayout;
  fillingLayout: ConstructorFillingLayout;
  facadeLayout: ConstructorSectionFacadeLayout;
  zoneFacadeLayout: ConstructorZoneFacadeLayout;
  selectedCompartmentId: string | null;
  compartments: number;
  handleless: boolean;
  material: MaterialToken;
  facadeMaterial: MaterialToken;
  backPanelMaterial: MaterialToken;
  projectMaterials: ProjectMaterials;
  validation: ConstructorValidationState;
  shelvesCount: number;
  drawersCount: number;
  rodsCount: number;
  exactModeEnabled: boolean;
  advancedSizes: boolean;
  advancedFill: boolean;
  sceneRenderMode: ConstructorSceneRenderMode;
  sceneViewMode: ConstructorSceneViewMode;
  productionSnapshot: ConstructorProductionSnapshotState;
  deliveryEnabled: boolean;
  assemblyEnabled: boolean;
  deliveryAddress: string;
  contact: ContactState;
  consent: boolean;
  setStep: (step: StepKey) => void;
  setFurniture: (furniture: FurnitureKey) => void;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setDepth: (depth: number) => void;
  setFill: (fill: FillKey) => void;
  setSections: (sections: number) => void;
  setSectionWidth: (sectionId: string, widthMm: number) => void;
  equalizeSections: () => void;
  selectSection: (sectionId: string) => void;
  setCompartments: (compartments: number) => void;
  setCompartmentHeight: (
    sectionId: string,
    compartmentId: string,
    heightMm: number,
  ) => void;
  equalizeCompartments: (sectionId?: string) => void;
  selectCompartment: (sectionId: string, compartmentId: string) => void;
  selectZone: (sectionId: string, zoneId: string) => void;
  setCompartmentFilling: (
    sectionId: string,
    compartmentId: string,
    patch: Partial<ConstructorCompartmentFilling>,
  ) => void;
  addShelfToCompartment: (
    sectionId: string,
    compartmentId: string,
    shelfHeightFromZoneBottomMm?: number,
  ) => void;
  removeShelfDivider: (sectionId: string, lowerCompartmentId: string) => void;
  removeCompartmentElement: (
    sectionId: string,
    compartmentId: string,
    kind: keyof ConstructorCompartmentFilling,
  ) => void;
  applyRandomPresetToSection: (sectionId?: string | null) => void;
  applyAutoFixForIssue: (issueId?: string | null) => void;
  setSectionFacadeMode: (
    sectionId: string,
    mode: ConstructorFacadeMode,
  ) => void;
  setZoneFacadeMode: (
    sectionId: string,
    compartmentId: string,
    mode: ConstructorZoneFacadeMode,
  ) => void;
  setAllSectionFacadeMode: (mode: ConstructorFacadeMode) => void;
  setHandleless: (handleless: boolean) => void;
  setMaterial: (material: MaterialToken) => void;
  setFacadeMaterial: (material: MaterialToken) => void;
  syncBackPanelMaterial: () => void;
  validateProject: () => void;
  setShelvesCount: (count: number) => void;
  setDrawersCount: (count: number) => void;
  setRodsCount: (count: number) => void;
  setExactModeEnabled: (exactModeEnabled: boolean) => void;
  setAdvancedSizes: (advancedSizes: boolean) => void;
  setAdvancedFill: (advancedFill: boolean) => void;
  setSceneRenderMode: (mode: ConstructorSceneRenderMode) => void;
  setSceneViewMode: (mode: ConstructorSceneViewMode) => void;
  setProductionSnapshotLoading: () => void;
  setProductionSnapshotReady: (
    snapshot: Omit<
      ConstructorProductionSnapshotState,
      | "status"
      | "updatedAt"
      | "error"
      | "panelPricing"
      | "hardwarePricing"
      | "hardwareDecision"
      | "servicesPricing"
      | "servicesDecision"
    > &
      Pick<
        Partial<ConstructorProductionSnapshotState>,
        | "panelPricing"
        | "hardwarePricing"
        | "hardwareDecision"
        | "servicesPricing"
        | "servicesDecision"
      >,
  ) => void;
  setProductionSnapshotError: (error: string) => void;
  clearProductionSnapshot: () => void;
  setDeliveryEnabled: (deliveryEnabled: boolean) => void;
  setAssemblyEnabled: (assemblyEnabled: boolean) => void;
  setDeliveryAddress: (deliveryAddress: string) => void;
  setContact: (contact: ContactState) => void;
  setConsent: (consent: boolean) => void;
  restoreDraft: (draft: {
    width: number;
    height: number;
    depth: number;
    sections: number;
    compartments?: number;
    sectionLayout?: ConstructorSection[];
    compartmentLayout?: ConstructorCompartmentLayout;
    fillingLayout?: ConstructorFillingLayout;
    facadeLayout?: ConstructorSectionFacadeLayout;
    zoneFacadeLayout?: ConstructorZoneFacadeLayout;
    filling: FillKey;
    furniture: FurnitureKey;
    material: MaterialToken;
    facadeMaterial?: MaterialToken;
    handleless?: boolean;
  }) => void;
  reset: () => void;
}
