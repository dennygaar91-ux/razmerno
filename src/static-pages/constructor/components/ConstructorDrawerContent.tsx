import { MaterialsStepPanel } from "./MaterialsStepPanel";
import { SizesStepPanel } from "./SizesStepPanel";
import { StepIntro, ValidationAssist } from "./ConstructorDrawerPrimitives";
import { Checkout3DStep } from "./Checkout3DStep";
import { FillingStepPanel } from "./FillingStepPanel";
import type {
  ConstructorCompartmentFilling,
  ConstructorFormErrors,
  ContactState,
  FurnitureKey,
  ConstructorSection,
  ConstructorValidationState,
  MaterialOption,
  QuoteState,
  StepKey,
} from "../types";

export function DrawerContent({
  step,
  furniture,
  width,
  height,
  depth,
  sections,
  sectionLayout,
  selectedSectionId,
  selectedCompartmentId,
  compartmentLayout,
  fillingLayout,
  facadeLayout,
  zoneFacadeLayout,
  activeAddTarget,
  validation,
  advancedSizes,
  advancedFill,
  handleless,
  deliveryEnabled,
  assemblyEnabled,
  deliveryAddress,
  contact,
  errors,
  quote,
  quoteError,
  formatPrice,
  material,
  facadeMaterial,
  selectedMaterial,
  selectedFacadeMaterial,
  onFurnitureChange,
  onWidthChange,
  onHeightChange,
  onDepthChange,
  onSectionsChange,
  onSectionWidthChange,
  onEqualizeSections,
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
  onAdvancedSizesChange,
  onAdvancedFillChange,
  onCloseAddMenu,
  onMaterialChange,
  onFacadeMaterialChange,
  onDeliveryEnabledChange,
  onAssemblyEnabledChange,
  onDeliveryAddressChange,
  onContactChange,
}: {
  step: StepKey;
  furniture: FurnitureKey;
  width: number;
  height: number;
  depth: number;
  sections: number;
  sectionLayout: ConstructorSection[];
  selectedSectionId: string | null;
  selectedCompartmentId: string | null;
  compartmentLayout: Record<string, Array<{ id: string; heightMm: number }>>;
  fillingLayout: Record<string, Record<string, ConstructorCompartmentFilling>>;
  facadeLayout: Record<string, "open" | "hinged">;
  zoneFacadeLayout: Record<string, Record<string, "inherit" | "open">>;
  activeAddTarget: { sectionId: string; compartmentId?: string } | null;
  validation: ConstructorValidationState;
  advancedSizes: boolean;
  advancedFill: boolean;
  handleless: boolean;
  deliveryEnabled: boolean;
  assemblyEnabled: boolean;
  deliveryAddress: string;
  contact: ContactState;
  errors: ConstructorFormErrors;
  quote: QuoteState | null;
  quoteError: string;
  formatPrice: (value: number) => string;
  material: string;
  facadeMaterial: string;
  selectedMaterial: MaterialOption;
  selectedFacadeMaterial: MaterialOption;
  onFurnitureChange: (value: FurnitureKey) => void;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
  onDepthChange: (value: number) => void;
  onSectionsChange: (value: number) => void;
  onSectionWidthChange: (sectionId: string, value: number) => void;
  onEqualizeSections: () => void;
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
  onSetSectionFacadeMode: (sectionId: string, mode: "open" | "hinged") => void;
  onSetZoneFacadeMode: (
    sectionId: string,
    compartmentId: string,
    mode: "inherit" | "open",
  ) => void;
  onHandlelessChange: (value: boolean) => void;
  onAdvancedSizesChange: (value: boolean) => void;
  onAdvancedFillChange: (value: boolean) => void;
  onCloseAddMenu: () => void;
  onMaterialChange: (value: any) => void;
  onFacadeMaterialChange: (value: any) => void;
  onDeliveryEnabledChange: (value: boolean) => void;
  onAssemblyEnabledChange: (value: boolean) => void;
  onDeliveryAddressChange: (value: string) => void;
  onContactChange: (value: ContactState) => void;
}) {
  if (step === "sizes") {
    return (
      <SizesStepPanel
        furniture={furniture}
        width={width}
        height={height}
        depth={depth}
        sections={sections}
        sectionLayout={sectionLayout}
        advancedSizes={advancedSizes}
        validation={validation}
        onFurnitureChange={onFurnitureChange}
        onWidthChange={onWidthChange}
        onHeightChange={onHeightChange}
        onDepthChange={onDepthChange}
        onSectionsChange={onSectionsChange}
        onSectionWidthChange={onSectionWidthChange}
        onEqualizeSections={onEqualizeSections}
        onAdvancedSizesChange={onAdvancedSizesChange}
        onAutoFix={onApplyAutoFixForIssue}
      />
    );
  }

  if (step === "fill") {
    return (
      <FillingStepPanel
        sections={sections}
        selectedSectionId={selectedSectionId}
        selectedCompartmentId={selectedCompartmentId}
        compartmentLayout={compartmentLayout}
        fillingLayout={fillingLayout}
        facadeLayout={facadeLayout}
        zoneFacadeLayout={zoneFacadeLayout}
        activeAddTarget={activeAddTarget}
        validation={validation}
        advancedFill={advancedFill}
        handleless={handleless}
        onSelectSection={onSelectSection}
        onSelectCompartment={onSelectCompartment}
        onSetCompartmentFilling={onSetCompartmentFilling}
        onApplyRandomPreset={onApplyRandomPreset}
        onApplyAutoFixForIssue={onApplyAutoFixForIssue}
        onAddShelfToCompartment={onAddShelfToCompartment}
        onRemoveShelfDivider={onRemoveShelfDivider}
        onRemoveCompartmentElement={onRemoveCompartmentElement}
        onSetSectionFacadeMode={onSetSectionFacadeMode}
        onSetZoneFacadeMode={onSetZoneFacadeMode}
        onHandlelessChange={onHandlelessChange}
        onAdvancedFillChange={onAdvancedFillChange}
        onCloseAddMenu={onCloseAddMenu}
      />
    );
  }

  if (step === "materials") {
    return (
      <MaterialsStepPanel
        material={material}
        facadeMaterial={facadeMaterial}
        selectedMaterial={selectedMaterial}
        selectedFacadeMaterial={selectedFacadeMaterial}
        validation={validation}
        onMaterialChange={onMaterialChange}
        onFacadeMaterialChange={onFacadeMaterialChange}
        onAutoFix={onApplyAutoFixForIssue}
        ValidationAssist={ValidationAssist}
        StepIntro={StepIntro}
      />
    );
  }

  return (
    <Checkout3DStep
      contact={contact}
      errors={errors}
      deliveryEnabled={deliveryEnabled}
      assemblyEnabled={assemblyEnabled}
      deliveryAddress={deliveryAddress}
      quote={quote}
      quoteError={quoteError}
      validation={validation}
      formatPrice={formatPrice}
      onContactChange={onContactChange}
      onDeliveryEnabledChange={onDeliveryEnabledChange}
      onAssemblyEnabledChange={onAssemblyEnabledChange}
      onDeliveryAddressChange={onDeliveryAddressChange}
      onAutoFix={onApplyAutoFixForIssue}
    />
  );
}
