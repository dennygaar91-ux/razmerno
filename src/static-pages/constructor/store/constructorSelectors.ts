import { buildCanonicalConstructorState } from "./constructorCanonicalState";
import type { ConstructorStoreState } from "./constructorStore";

export const selectStep = (state: ConstructorStoreState) => state.step;
export const selectFurniture = (state: ConstructorStoreState) =>
  state.furniture;
export const selectWidth = (state: ConstructorStoreState) => state.width;
export const selectHeight = (state: ConstructorStoreState) => state.height;
export const selectDepth = (state: ConstructorStoreState) => state.depth;
export const selectFill = (state: ConstructorStoreState) => state.fill;
export const selectSections = (state: ConstructorStoreState) => state.sections;
export const selectSectionLayout = (state: ConstructorStoreState) =>
  state.sectionLayout;
export const selectSelectedSectionId = (state: ConstructorStoreState) =>
  state.selectedSectionId;
export const selectCompartmentLayout = (state: ConstructorStoreState) =>
  state.compartmentLayout;
export const selectSelectedCompartmentId = (state: ConstructorStoreState) =>
  state.selectedCompartmentId;
export const selectSelectedZoneId = (state: ConstructorStoreState) =>
  state.selectedZoneId ?? state.selectedCompartmentId;
export const selectFillingLayout = (state: ConstructorStoreState) =>
  state.fillingLayout;
export const selectFacadeLayout = (state: ConstructorStoreState) =>
  state.facadeLayout;
export const selectZoneFacadeLayout = (state: ConstructorStoreState) =>
  state.zoneFacadeLayout;
export const selectCompartments = (state: ConstructorStoreState) =>
  state.compartments;
export const selectHandleless = (state: ConstructorStoreState) =>
  state.handleless;
export const selectMaterial = (state: ConstructorStoreState) => state.material;
export const selectFacadeMaterial = (state: ConstructorStoreState) =>
  state.facadeMaterial;
export const selectBackPanelMaterial = (state: ConstructorStoreState) =>
  state.backPanelMaterial;
export const selectProjectMaterials = (state: ConstructorStoreState) =>
  state.projectMaterials;
export const selectValidation = (state: ConstructorStoreState) =>
  state.validation;
export const selectShelvesCount = (state: ConstructorStoreState) =>
  state.shelvesCount;
export const selectDrawersCount = (state: ConstructorStoreState) =>
  state.drawersCount;
export const selectRodsCount = (state: ConstructorStoreState) =>
  state.rodsCount;
export const selectExactModeEnabled = (state: ConstructorStoreState) =>
  state.exactModeEnabled;
export const selectAdvancedSizes = (state: ConstructorStoreState) =>
  state.advancedSizes;
export const selectAdvancedFill = (state: ConstructorStoreState) =>
  state.advancedFill;
export const selectSceneRenderMode = (state: ConstructorStoreState) =>
  state.sceneRenderMode;
export const selectSceneViewMode = (state: ConstructorStoreState) =>
  state.sceneViewMode;
export const selectProductionSnapshot = (state: ConstructorStoreState) =>
  state.productionSnapshot;
export const selectDeliveryEnabled = (state: ConstructorStoreState) =>
  state.deliveryEnabled;
export const selectAssemblyEnabled = (state: ConstructorStoreState) =>
  state.assemblyEnabled;
export const selectDeliveryAddress = (state: ConstructorStoreState) =>
  state.deliveryAddress;
export const selectContact = (state: ConstructorStoreState) => state.contact;
export const selectConsent = (state: ConstructorStoreState) => state.consent;

export const selectSetStep = (state: ConstructorStoreState) => state.setStep;
export const selectSetFurniture = (state: ConstructorStoreState) =>
  state.setFurniture;
export const selectSetWidth = (state: ConstructorStoreState) => state.setWidth;
export const selectSetHeight = (state: ConstructorStoreState) =>
  state.setHeight;
export const selectSetDepth = (state: ConstructorStoreState) => state.setDepth;
export const selectSetFill = (state: ConstructorStoreState) => state.setFill;
export const selectSetSections = (state: ConstructorStoreState) =>
  state.setSections;
export const selectSetSectionWidth = (state: ConstructorStoreState) =>
  state.setSectionWidth;
export const selectEqualizeSections = (state: ConstructorStoreState) =>
  state.equalizeSections;
export const selectSelectSection = (state: ConstructorStoreState) =>
  state.selectSection;
export const selectSetCompartments = (state: ConstructorStoreState) =>
  state.setCompartments;
export const selectSetCompartmentHeight = (state: ConstructorStoreState) =>
  state.setCompartmentHeight;
export const selectEqualizeCompartments = (state: ConstructorStoreState) =>
  state.equalizeCompartments;
export const selectSelectCompartment = (state: ConstructorStoreState) =>
  state.selectCompartment;
export const selectSelectZone = (state: ConstructorStoreState) =>
  state.selectZone;
export const selectSetCompartmentFilling = (state: ConstructorStoreState) =>
  state.setCompartmentFilling;
export const selectSetSectionFacadeMode = (state: ConstructorStoreState) =>
  state.setSectionFacadeMode;
export const selectSetZoneFacadeMode = (state: ConstructorStoreState) =>
  state.setZoneFacadeMode;
export const selectSetAllSectionFacadeMode = (state: ConstructorStoreState) =>
  state.setAllSectionFacadeMode;
export const selectSetHandleless = (state: ConstructorStoreState) =>
  state.setHandleless;
export const selectSetMaterial = (state: ConstructorStoreState) =>
  state.setMaterial;
export const selectSetFacadeMaterial = (state: ConstructorStoreState) =>
  state.setFacadeMaterial;
export const selectSyncBackPanelMaterial = (state: ConstructorStoreState) =>
  state.syncBackPanelMaterial;
export const selectValidateProject = (state: ConstructorStoreState) =>
  state.validateProject;
export const selectSetShelvesCount = (state: ConstructorStoreState) =>
  state.setShelvesCount;
export const selectSetDrawersCount = (state: ConstructorStoreState) =>
  state.setDrawersCount;
export const selectSetRodsCount = (state: ConstructorStoreState) =>
  state.setRodsCount;
export const selectSetExactModeEnabled = (state: ConstructorStoreState) =>
  state.setExactModeEnabled;
export const selectSetAdvancedSizes = (state: ConstructorStoreState) =>
  state.setAdvancedSizes;
export const selectSetAdvancedFill = (state: ConstructorStoreState) =>
  state.setAdvancedFill;
export const selectSetSceneRenderMode = (state: ConstructorStoreState) =>
  state.setSceneRenderMode;
export const selectSetSceneViewMode = (state: ConstructorStoreState) =>
  state.setSceneViewMode;
export const selectSetProductionSnapshotLoading = (
  state: ConstructorStoreState,
) => state.setProductionSnapshotLoading;
export const selectSetProductionSnapshotReady = (
  state: ConstructorStoreState,
) => state.setProductionSnapshotReady;
export const selectSetProductionSnapshotError = (
  state: ConstructorStoreState,
) => state.setProductionSnapshotError;
export const selectClearProductionSnapshot = (state: ConstructorStoreState) =>
  state.clearProductionSnapshot;
export const selectSetDeliveryEnabled = (state: ConstructorStoreState) =>
  state.setDeliveryEnabled;
export const selectSetAssemblyEnabled = (state: ConstructorStoreState) =>
  state.setAssemblyEnabled;
export const selectSetDeliveryAddress = (state: ConstructorStoreState) =>
  state.setDeliveryAddress;
export const selectSetContact = (state: ConstructorStoreState) =>
  state.setContact;
export const selectSetConsent = (state: ConstructorStoreState) =>
  state.setConsent;
export const selectRestoreDraft = (state: ConstructorStoreState) =>
  state.restoreDraft;
export const selectReset = (state: ConstructorStoreState) => state.reset;

export const selectAddShelfToCompartment = (state: ConstructorStoreState) =>
  state.addShelfToCompartment;
export const selectRemoveShelfDivider = (state: ConstructorStoreState) =>
  state.removeShelfDivider;
export const selectRemoveCompartmentElement = (state: ConstructorStoreState) =>
  state.removeCompartmentElement;
export const selectApplyRandomPresetToSection = (
  state: ConstructorStoreState,
) => state.applyRandomPresetToSection;

export const selectApplyAutoFixForIssue = (state: ConstructorStoreState) =>
  state.applyAutoFixForIssue;

export const selectCanonicalConstructorState = (state: ConstructorStoreState) =>
  buildCanonicalConstructorState({
    furniture: state.furniture,
    width: state.width,
    height: state.height,
    depth: state.depth,
    fill: state.fill,
    sectionLayout: state.sectionLayout,
    compartmentLayout: state.compartmentLayout,
    fillingLayout: state.fillingLayout,
    facadeLayout: state.facadeLayout,
    zoneFacadeLayout: state.zoneFacadeLayout,
    selectedSectionId: state.selectedSectionId,
    selectedCompartmentId: state.selectedZoneId ?? state.selectedCompartmentId,
    material: state.material,
    facadeMaterial: state.facadeMaterial,
    backPanelMaterial: state.backPanelMaterial,
    projectMaterials: state.projectMaterials,
    exactModeEnabled: state.exactModeEnabled,
    validation: state.validation,
  });
