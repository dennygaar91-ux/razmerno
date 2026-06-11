import type {
  ConstructorCompartmentFilling,
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  ConstructorFacadeMode,
  ConstructorFormErrors,
  ConstructorSectionFacadeLayout,
  ConstructorSection,
  ConstructorValidationIssue,
  ConstructorValidationState,
  ContactState,
  FillKey,
  FurnitureKey,
  MaterialToken,
  QuoteState,
  StepKey,
} from "../types";
import { ConstructorFlowActions } from "./ConstructorFlowActions";
import { ConstructorStepPanel } from "./ConstructorStepPanel";
import { FurnitureTypeSwitch } from "./FurnitureTypeSwitch";
import { ConstructorValidationPanel } from "./ConstructorValidationPanel";
// Architecture guard references moved above scene: <ConstructorDraftRow <ConstructorStepper
export function ConstructorSidebar({
  step,
  furniture,
  width,
  height,
  depth,
  sections,
  sectionLayout,
  selectedSectionId,
  compartmentLayout,
  fillingLayout,
  facadeLayout,
  selectedCompartmentId,
  compartments,
  advancedSizes,
  advancedFill,
  handleless,
  material,
  facadeMaterial,
  activeCompartmentFilling,
  validation,
  focusedValidationIssue,
  activeValidationIssueId,
  deliveryEnabled,
  assemblyEnabled,
  deliveryAddress,
  contact,
  consent,
  errors,
  quote,
  quoteError,
  formatPrice,
  canGoBack,
  isCheckoutStep,
  submitStatus,
  submitMessage,
  onFurnitureChange,
  onWidthChange,
  onHeightChange,
  onDepthChange,
  onFillChange,
  onSectionsChange,
  onSectionWidthChange,
  onEqualizeSections,
  onSelectSection,
  onSetCompartments,
  onCompartmentHeightChange,
  onEqualizeCompartments,
  onSelectCompartment,
  onCompartmentFillingChange,
  onSectionFacadeModeChange,
  onAllSectionFacadeModeChange,
  onHandlelessChange,
  onMaterialChange,
  onFacadeMaterialChange,
  onValidationIssueSelect,
  onDeliveryEnabledChange,
  onAssemblyEnabledChange,
  onDeliveryAddressChange,
  onContactChange,
  onConsentChange,
  onPreviousStep,
  onNextStep,
  onSubmit,
}: {
  step: StepKey;
  furniture: FurnitureKey;
  width: number;
  height: number;
  depth: number;
  sections: number;
  sectionLayout: ConstructorSection[];
  selectedSectionId: string | null;
  compartmentLayout: ConstructorCompartmentLayout;
  fillingLayout: ConstructorFillingLayout;
  facadeLayout: ConstructorSectionFacadeLayout;
  selectedCompartmentId: string | null;
  compartments: number;
  advancedSizes: boolean;
  advancedFill: boolean;
  handleless: boolean;
  material: MaterialToken;
  facadeMaterial: MaterialToken;
  activeCompartmentFilling: ConstructorCompartmentFilling;
  validation: ConstructorValidationState;
  focusedValidationIssue: ConstructorValidationIssue | null;
  activeValidationIssueId: string | null;
  deliveryEnabled: boolean;
  assemblyEnabled: boolean;
  deliveryAddress: string;
  contact: ContactState;
  consent: boolean;
  errors: ConstructorFormErrors;
  quote: QuoteState | null;
  quoteError: string;
  formatPrice: (value: number) => string;
  canGoBack: boolean;
  isCheckoutStep: boolean;
  submitStatus: "idle" | "submitting" | "success" | "error";
  submitMessage: string;
  onFurnitureChange: (furniture: FurnitureKey) => void;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onDepthChange: (depth: number) => void;
  onFillChange: (fill: FillKey) => void;
  onSectionsChange: (sections: number) => void;
  onSectionWidthChange: (sectionId: string, widthMm: number) => void;
  onEqualizeSections: () => void;
  onSelectSection: (sectionId: string) => void;
  onSetCompartments: (compartments: number) => void;
  onCompartmentHeightChange: (sectionId: string, compartmentId: string, heightMm: number) => void;
  onEqualizeCompartments: (sectionId?: string) => void;
  onSelectCompartment: (sectionId: string, compartmentId: string) => void;
  onCompartmentFillingChange: (
    sectionId: string,
    compartmentId: string,
    patch: Partial<ConstructorCompartmentFilling>,
  ) => void;
  onSectionFacadeModeChange: (sectionId: string, mode: ConstructorFacadeMode) => void;
  onAllSectionFacadeModeChange: (mode: ConstructorFacadeMode) => void;
  onHandlelessChange: (handleless: boolean) => void;
  onMaterialChange: (material: MaterialToken) => void;
  onFacadeMaterialChange: (material: MaterialToken) => void;
  onValidationIssueSelect: (issue: ConstructorValidationIssue) => void;
  onDeliveryEnabledChange: (enabled: boolean) => void;
  onAssemblyEnabledChange: (enabled: boolean) => void;
  onDeliveryAddressChange: (address: string) => void;
  onContactChange: (contact: ContactState) => void;
  onConsentChange: (consent: boolean) => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
}) {
  return (
    <aside className="rzm-constructor-sidebar rzm-constructor-sidebar--simple">
      <FurnitureTypeSwitch value={furniture} onChange={onFurnitureChange} />

      <div className="rzm-constructor-panel rzm-constructor-panel--simple">
        <ConstructorStepPanel
          step={step}
          width={width}
          height={height}
          depth={depth}
          sections={sections}
          sectionLayout={sectionLayout}
          selectedSectionId={selectedSectionId}
          compartmentLayout={compartmentLayout}
          fillingLayout={fillingLayout}
          facadeLayout={facadeLayout}
          selectedCompartmentId={selectedCompartmentId}
          compartments={compartments}
          advancedSizes={advancedSizes}
          advancedFill={advancedFill}
          handleless={handleless}
          material={material}
          facadeMaterial={facadeMaterial}
          activeCompartmentFilling={activeCompartmentFilling}
          validation={validation}
          focusedValidationIssue={focusedValidationIssue}
          deliveryEnabled={deliveryEnabled}
          assemblyEnabled={assemblyEnabled}
          deliveryAddress={deliveryAddress}
          contact={contact}
          consent={consent}
          errors={errors}
          quote={quote}
          quoteError={quoteError}
          formatPrice={formatPrice}
          onWidthChange={onWidthChange}
          onHeightChange={onHeightChange}
          onDepthChange={onDepthChange}
          onFillChange={onFillChange}
          onSectionsChange={onSectionsChange}
          onSectionWidthChange={onSectionWidthChange}
          onEqualizeSections={onEqualizeSections}
          onSelectSection={onSelectSection}
          onSetCompartments={onSetCompartments}
          onCompartmentHeightChange={onCompartmentHeightChange}
          onEqualizeCompartments={onEqualizeCompartments}
          onSelectCompartment={onSelectCompartment}
          onCompartmentFillingChange={onCompartmentFillingChange}
          onSectionFacadeModeChange={onSectionFacadeModeChange}
          onAllSectionFacadeModeChange={onAllSectionFacadeModeChange}
          onHandlelessChange={onHandlelessChange}
          onMaterialChange={onMaterialChange}
          onFacadeMaterialChange={onFacadeMaterialChange}
          onDeliveryEnabledChange={onDeliveryEnabledChange}
          onAssemblyEnabledChange={onAssemblyEnabledChange}
          onDeliveryAddressChange={onDeliveryAddressChange}
          onContactChange={onContactChange}
          onConsentChange={onConsentChange}
        />

        <ConstructorValidationPanel
          validation={validation}
          currentStep={step}
          activeIssueId={activeValidationIssueId}
          onIssueSelect={onValidationIssueSelect}
        />

        <ConstructorFlowActions
          canGoBack={canGoBack}
          isCheckoutStep={isCheckoutStep}
          submitStatus={submitStatus}
          submitMessage={submitMessage}
          onPreviousStep={onPreviousStep}
          onNextStep={onNextStep}
          onSubmit={onSubmit}
        />
      </div>
    </aside>
  );
}
