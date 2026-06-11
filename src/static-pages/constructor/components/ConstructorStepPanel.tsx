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
  MaterialToken,
  QuoteState,
  StepKey,
} from "../types";
import { formatRuPhone } from "../utils";
import { CheckoutStep } from "./CheckoutStep";
import { FillStep } from "./FillStep";
import { MaterialsStep } from "./MaterialsStep";
import { SizesStep } from "./SizesStep";

export function ConstructorStepPanel({
  step,
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
  deliveryEnabled,
  assemblyEnabled,
  deliveryAddress,
  contact,
  consent,
  errors,
  quote,
  quoteError,
  formatPrice,
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
  onDeliveryEnabledChange,
  onAssemblyEnabledChange,
  onDeliveryAddressChange,
  onContactChange,
  onConsentChange,
}: {
  step: StepKey;
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
  deliveryEnabled: boolean;
  assemblyEnabled: boolean;
  deliveryAddress: string;
  contact: ContactState;
  consent: boolean;
  errors: ConstructorFormErrors;
  quote: QuoteState | null;
  quoteError: string;
  formatPrice: (value: number) => string;
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
  onDeliveryEnabledChange: (enabled: boolean) => void;
  onAssemblyEnabledChange: (enabled: boolean) => void;
  onDeliveryAddressChange: (address: string) => void;
  onContactChange: (contact: ContactState) => void;
  onConsentChange: (consent: boolean) => void;
}) {
  return (
    <>
      {step === "sizes" && (
        <SizesStep
          width={width}
          height={height}
          depth={depth}
          sections={sections}
          sectionLayout={sectionLayout}
          selectedSectionId={selectedSectionId}
          focusedValidationIssue={focusedValidationIssue}
          advancedSizes={advancedSizes}
          onSectionsChange={onSectionsChange}
          onSectionWidthChange={onSectionWidthChange}
          onEqualizeSections={onEqualizeSections}
          onSelectSection={onSelectSection}
          onWidthChange={onWidthChange}
          onHeightChange={onHeightChange}
          onDepthChange={onDepthChange}
        />
      )}

      {step === "fill" && (
        <FillStep
          sections={sections}
          sectionLayout={sectionLayout}
          selectedSectionId={selectedSectionId}
          compartmentLayout={compartmentLayout}
          fillingLayout={fillingLayout}
          facadeLayout={facadeLayout}
          selectedCompartmentId={selectedCompartmentId}
          compartments={compartments}
          advancedFill={advancedFill}
          activeCompartmentFilling={activeCompartmentFilling}
          validation={validation}
          focusedValidationIssue={focusedValidationIssue}
          handleless={handleless}
          onFillChange={onFillChange}
          onCompartmentsChange={onSetCompartments}
          onCompartmentHeightChange={onCompartmentHeightChange}
          onEqualizeCompartments={onEqualizeCompartments}
          onSelectSection={onSelectSection}
          onSelectCompartment={onSelectCompartment}
          onCompartmentFillingChange={onCompartmentFillingChange}
          onSectionFacadeModeChange={onSectionFacadeModeChange}
          onAllSectionFacadeModeChange={onAllSectionFacadeModeChange}
          onHandlelessChange={onHandlelessChange}
        />
      )}

      {step === "materials" && (
        <MaterialsStep
          bodyValue={material}
          facadeValue={facadeMaterial}
          onBodyChange={onMaterialChange}
          focusedValidationIssue={focusedValidationIssue}
          onFacadeChange={onFacadeMaterialChange}
        />
      )}

      {step === "checkout" && (
        <CheckoutStep
          contact={contact}
          errors={errors}
          consent={consent}
          deliveryEnabled={deliveryEnabled}
          assemblyEnabled={assemblyEnabled}
          deliveryAddress={deliveryAddress}
          quote={quote}
          quoteError={quoteError}
          formatPrice={formatPrice}
          onContactChange={(nextContact) =>
            onContactChange({
              ...contact,
              ...nextContact,
              phone:
                nextContact.phone !== contact.phone
                  ? formatRuPhone(nextContact.phone)
                  : nextContact.phone,
            })
          }
          onConsentChange={onConsentChange}
          onDeliveryEnabledChange={onDeliveryEnabledChange}
          onAssemblyEnabledChange={onAssemblyEnabledChange}
          onDeliveryAddressChange={onDeliveryAddressChange}
        />
      )}
    </>
  );
}
