import { useMemo } from "react";
import { facadeOptions, furnitureOptions, materialOptions } from "../options";
import { resolveMaterialId } from "../../../shared/materials/materialCatalog";
import type { ConstructorSnapshot } from "../adapters/constructorPayload";
import { useConstructorStore } from "../store/constructorStore";
import { getCompartmentFilling } from "../rules/projectRules";
import {
  selectAdvancedFill,
  selectExactModeEnabled,
  selectCanonicalConstructorState,
  selectBackPanelMaterial,
  selectAdvancedSizes,
  selectAssemblyEnabled,
  selectCompartmentLayout,
  selectCompartments,
  selectConsent,
  selectProjectMaterials,
  selectContact,
  selectDeliveryAddress,
  selectDrawersCount,
  selectDeliveryEnabled,
  selectDepth,
  selectFacadeMaterial,
  selectFill,
  selectFillingLayout,
  selectFacadeLayout,
  selectZoneFacadeLayout,
  selectFurniture,
  selectHandleless,
  selectHeight,
  selectMaterial,
  selectRodsCount,
  selectValidation,
  selectSections,
  selectSectionLayout,
  selectSelectedCompartmentId,
  selectSelectedZoneId,
  selectSelectedSectionId,
  selectShelvesCount,
  selectSetAdvancedFill,
  selectSetAdvancedSizes,
  selectSetExactModeEnabled,
  selectSceneRenderMode,
  selectSceneViewMode,
  selectSetAssemblyEnabled,
  selectEqualizeCompartments,
  selectSetCompartmentHeight,
  selectSetCompartments,
  selectSetConsent,
  selectSetContact,
  selectSetDeliveryAddress,
  selectSetDrawersCount,
  selectSetDeliveryEnabled,
  selectSetDepth,
  selectSetFacadeMaterial,
  selectSetFill,
  selectSetFurniture,
  selectSetHandleless,
  selectSetHeight,
  selectSetMaterial,
  selectSetRodsCount,
  selectSetSceneRenderMode,
  selectSetSceneViewMode,
  selectSetSections,
  selectSetSectionWidth,
  selectEqualizeSections,
  selectSelectCompartment,
  selectSelectZone,
  selectSetCompartmentFilling,
  selectAddShelfToCompartment,
  selectRemoveShelfDivider,
  selectRemoveCompartmentElement,
  selectApplyRandomPresetToSection,
  selectApplyAutoFixForIssue,
  selectSetSectionFacadeMode,
  selectSetZoneFacadeMode,
  selectSetAllSectionFacadeMode,
  selectSelectSection,
  selectSetShelvesCount,
  selectSetStep,
  selectSetWidth,
  selectReset,
  selectStep,
  selectWidth,
} from "../store/constructorSelectors";

export function useConstructorPageState() {
  const step = useConstructorStore(selectStep);
  const furniture = useConstructorStore(selectFurniture);
  const width = useConstructorStore(selectWidth);
  const height = useConstructorStore(selectHeight);
  const depth = useConstructorStore(selectDepth);
  const fill = useConstructorStore(selectFill);
  const sections = useConstructorStore(selectSections);
  const sectionLayout = useConstructorStore(selectSectionLayout);
  const selectedSectionId = useConstructorStore(selectSelectedSectionId);
  const compartmentLayout = useConstructorStore(selectCompartmentLayout);
  const selectedCompartmentId = useConstructorStore(
    selectSelectedCompartmentId,
  );
  const selectedZoneId = useConstructorStore(selectSelectedZoneId);
  const fillingLayout = useConstructorStore(selectFillingLayout);
  const facadeLayout = useConstructorStore(selectFacadeLayout);
  const zoneFacadeLayout = useConstructorStore(selectZoneFacadeLayout);
  const compartments = useConstructorStore(selectCompartments);
  const handleless = useConstructorStore(selectHandleless);
  const material = useConstructorStore(selectMaterial);
  const facadeMaterial = useConstructorStore(selectFacadeMaterial);
  const backPanelMaterial = useConstructorStore(selectBackPanelMaterial);
  const projectMaterials = useConstructorStore(selectProjectMaterials);
  const validation = useConstructorStore(selectValidation);
  const shelvesCount = useConstructorStore(selectShelvesCount);
  const drawersCount = useConstructorStore(selectDrawersCount);
  const rodsCount = useConstructorStore(selectRodsCount);
  const exactModeEnabled = useConstructorStore(selectExactModeEnabled);
  const advancedSizes = useConstructorStore(selectAdvancedSizes);
  const advancedFill = useConstructorStore(selectAdvancedFill);
  const canonicalState = useConstructorStore(selectCanonicalConstructorState);
  const sceneRenderMode = useConstructorStore(selectSceneRenderMode);
  const sceneViewMode = useConstructorStore(selectSceneViewMode);
  const deliveryEnabled = useConstructorStore(selectDeliveryEnabled);
  const assemblyEnabled = useConstructorStore(selectAssemblyEnabled);
  const deliveryAddress = useConstructorStore(selectDeliveryAddress);
  const contact = useConstructorStore(selectContact);
  const consent = useConstructorStore(selectConsent);

  const setStep = useConstructorStore(selectSetStep);
  const setFurniture = useConstructorStore(selectSetFurniture);
  const setWidth = useConstructorStore(selectSetWidth);
  const setHeight = useConstructorStore(selectSetHeight);
  const setDepth = useConstructorStore(selectSetDepth);
  const setFill = useConstructorStore(selectSetFill);
  const setSections = useConstructorStore(selectSetSections);
  const setSectionWidth = useConstructorStore(selectSetSectionWidth);
  const equalizeSections = useConstructorStore(selectEqualizeSections);
  const selectSection = useConstructorStore(selectSelectSection);
  const setCompartments = useConstructorStore(selectSetCompartments);
  const setCompartmentHeight = useConstructorStore(selectSetCompartmentHeight);
  const equalizeCompartments = useConstructorStore(selectEqualizeCompartments);
  const selectCompartment = useConstructorStore(selectSelectCompartment);
  const selectZone = useConstructorStore(selectSelectZone);
  const setCompartmentFilling = useConstructorStore(
    selectSetCompartmentFilling,
  );
  const addShelfToCompartment = useConstructorStore(
    selectAddShelfToCompartment,
  );
  const removeShelfDivider = useConstructorStore(selectRemoveShelfDivider);
  const removeCompartmentElement = useConstructorStore(
    selectRemoveCompartmentElement,
  );
  const applyRandomPresetToSection = useConstructorStore(
    selectApplyRandomPresetToSection,
  );
  const applyAutoFixForIssue = useConstructorStore(selectApplyAutoFixForIssue);
  const setSectionFacadeMode = useConstructorStore(selectSetSectionFacadeMode);
  const setZoneFacadeMode = useConstructorStore(selectSetZoneFacadeMode);
  const setAllSectionFacadeMode = useConstructorStore(
    selectSetAllSectionFacadeMode,
  );
  const setHandleless = useConstructorStore(selectSetHandleless);
  const setMaterial = useConstructorStore(selectSetMaterial);
  const setFacadeMaterial = useConstructorStore(selectSetFacadeMaterial);
  const setShelvesCount = useConstructorStore(selectSetShelvesCount);
  const setDrawersCount = useConstructorStore(selectSetDrawersCount);
  const setRodsCount = useConstructorStore(selectSetRodsCount);
  const setExactModeEnabled = useConstructorStore(selectSetExactModeEnabled);
  const setAdvancedSizes = useConstructorStore(selectSetAdvancedSizes);
  const setAdvancedFill = useConstructorStore(selectSetAdvancedFill);
  const setSceneRenderMode = useConstructorStore(selectSetSceneRenderMode);
  const setSceneViewMode = useConstructorStore(selectSetSceneViewMode);
  const setDeliveryEnabled = useConstructorStore(selectSetDeliveryEnabled);
  const setAssemblyEnabled = useConstructorStore(selectSetAssemblyEnabled);
  const setDeliveryAddress = useConstructorStore(selectSetDeliveryAddress);
  const setContact = useConstructorStore(selectSetContact);
  const setConsent = useConstructorStore(selectSetConsent);
  const resetProject = useConstructorStore(selectReset);

  const selectedFurniture =
    furnitureOptions.find((item) => item.key === furniture) ??
    furnitureOptions[0];
  const selectedMaterial =
    materialOptions.find(
      (item) => item.materialId === resolveMaterialId(material),
    ) ?? materialOptions[0];
  const selectedFacadeMaterial =
    facadeOptions.find(
      (item) => item.materialId === resolveMaterialId(facadeMaterial),
    ) ?? selectedMaterial;

  const activeCompartmentFilling = getCompartmentFilling({
    fillingLayout,
    sectionId: selectedSectionId,
    compartmentId: selectedCompartmentId,
  });

  const snapshot = useMemo<ConstructorSnapshot>(
    () => ({
      furniture,
      width,
      height,
      depth,
      fill,
      sections,
      sectionLayout,
      selectedSectionId,
      compartmentLayout,
      fillingLayout,
      facadeLayout,
      zoneFacadeLayout,
      selectedCompartmentId,
      selectedZoneId,
      compartments,
      handleless,
      material,
      facadeMaterial,
      backPanelMaterial,
      projectMaterials,
      validation,
      shelvesCount,
      drawersCount,
      rodsCount,
      deliveryEnabled,
      assemblyEnabled,
      deliveryAddress,
      contact,
      consent,
    }),
    [
      assemblyEnabled,
      compartments,
      compartmentLayout,
      fillingLayout,
      facadeLayout,
      zoneFacadeLayout,
      selectedCompartmentId,
      consent,
      contact,
      deliveryAddress,
      deliveryEnabled,
      depth,
      fill,
      furniture,
      handleless,
      height,
      material,
      facadeMaterial,
      backPanelMaterial,
      projectMaterials,
      validation,
      shelvesCount,
      drawersCount,
      rodsCount,
      sections,
      sectionLayout,
      selectedSectionId,
      selectedCompartmentId,
      width,
    ],
  );

  return {
    values: {
      step,
      furniture,
      width,
      height,
      depth,
      fill,
      sections,
      sectionLayout,
      selectedSectionId,
      compartmentLayout,
      fillingLayout,
      facadeLayout,
      zoneFacadeLayout,
      selectedCompartmentId,
      selectedZoneId,
      compartments,
      handleless,
      material,
      facadeMaterial,
      backPanelMaterial,
      projectMaterials,
      validation,
      shelvesCount,
      drawersCount,
      rodsCount,
      activeCompartmentFilling,
      exactModeEnabled,
      canonicalState,
      advancedSizes,
      advancedFill,
      sceneRenderMode,
      sceneViewMode,
      deliveryEnabled,
      assemblyEnabled,
      deliveryAddress,
      contact,
      consent,
    },
    actions: {
      setStep,
      setFurniture,
      setWidth,
      setHeight,
      setDepth,
      setFill,
      setSections,
      setSectionWidth,
      equalizeSections,
      selectSection,
      setCompartments,
      setCompartmentHeight,
      equalizeCompartments,
      selectCompartment,
      selectZone,
      setCompartmentFilling,
      addShelfToCompartment,
      removeShelfDivider,
      removeCompartmentElement,
      applyRandomPresetToSection,
      applyAutoFixForIssue,
      setSectionFacadeMode,
      setZoneFacadeMode,
      setAllSectionFacadeMode,
      setHandleless,
      setMaterial,
      setFacadeMaterial,
      setShelvesCount,
      setDrawersCount,
      setRodsCount,
      setExactModeEnabled,
      setAdvancedSizes,
      setAdvancedFill,
      setSceneRenderMode,
      setSceneViewMode,
      setDeliveryEnabled,
      setAssemblyEnabled,
      setDeliveryAddress,
      setContact,
      setConsent,
      resetProject,
    },
    selectedFurniture,
    selectedMaterial,
    selectedFacadeMaterial,
    snapshot,
  };
}
