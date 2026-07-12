import { useMemo, useState } from "react";
import { stepOrder } from "./constructor/options";
import { ConstructorHeader } from "./constructor/components/ConstructorHeader";
import { ConstructorScene } from "./constructor/components/ConstructorScene";
import { ConstructorSidebar } from "./constructor/components/ConstructorSidebar";
import { ConstructorCheckoutLayout } from "./constructor/components/ConstructorCheckoutLayout";
import { useConstructorQuote } from "./constructor/hooks/useConstructorQuote";
import { useConstructorSubmit } from "./constructor/hooks/useConstructorSubmit";
import { useProductionPreview } from "./constructor/hooks/useProductionPreview";
import { useConstructorPageState } from "./constructor/hooks/useConstructorPageState";
import { formatFallbackPrice } from "./constructor/utils";
import { useCheckoutAuthGate } from "../shared/auth/useCheckoutAuthGate";
import { useSessionContext } from "../shared/auth/SessionProvider";
import type { ConstructorValidationIssue, StepKey } from "./constructor/types";

export default function ConstructorPage() {
  const [activeValidationIssueId, setActiveValidationIssueId] = useState<string | null>(null);
  const {
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
      selectedCompartmentId,
      compartments,
      handleless,
      material,
      facadeMaterial,
      shelvesCount,
      drawersCount,
      rodsCount,
      activeCompartmentFilling,
      advancedSizes,
      advancedFill,
      sceneRenderMode,
      sceneViewMode,
      deliveryEnabled,
      assemblyEnabled,
      deliveryAddress,
      contact,
      consent,
      validation,
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
      setCompartmentFilling,
      setSectionFacadeMode,
      setAllSectionFacadeMode,
      setHandleless,
      setMaterial,
      setFacadeMaterial,
      setAdvancedSizes,
      setAdvancedFill,
      setSceneRenderMode,
      setSceneViewMode,
      setDeliveryEnabled,
      setAssemblyEnabled,
      setDeliveryAddress,
      setContact,
      setConsent,
    },
    selectedFurniture,
    selectedMaterial,
    selectedFacadeMaterial,
    snapshot: constructorSnapshot,
  } = useConstructorPageState();
  const { session } = useSessionContext();

  function saveDraft() {
    // Autosave is intentionally deferred; checkout submit keeps the current model intact.
  }
  const { quote, quoteError } = useConstructorQuote({
    selectedFurniture,
    width,
    height,
    depth,
    fill,
    sections,
    compartments,
    shelvesCount,
    drawersCount,
    rodsCount,
    handleless,
    deliveryEnabled,
    deliveryAddress,
    assemblyEnabled,
    material: selectedMaterial,
    facadeMaterial: selectedFacadeMaterial,
    snapshot: constructorSnapshot,
  });
  const { errors, submitStatus, submitMessage, submit } = useConstructorSubmit({
    snapshot: constructorSnapshot,
    quote,
    onStepChange: setStep,
    onDraftSave: saveDraft,
    accessToken: session?.access_token ?? null,
  });
  const { authGateError, attemptCheckoutSubmit, checkoutAuthModal } = useCheckoutAuthGate(submit);
  const {
    preview: productionPreview,
    productionSnapshot,
    isPreviewLoading: isProductionPreviewLoading,
    previewError: productionPreviewError,
  } = useProductionPreview(quote);

  const formatPrice = quote?.formatPrice ?? formatFallbackPrice;
  const currentStepIndex = stepOrder.indexOf(step);
  const canGoBack = currentStepIndex > 0;
  const isCheckoutStep = step === "checkout";
  const blockingIssues = validation.issues.filter((issue) => issue.blocksCheckout);
  const isCheckoutBlocked = blockingIssues.length > 0;
  const focusedValidationIssue = useMemo(
    () => validation.issues.find((issue) => issue.id === activeValidationIssueId) ?? null,
    [activeValidationIssueId, validation.issues],
  );

  function focusValidationIssue(issue: ConstructorValidationIssue) {
    setActiveValidationIssueId(issue.id);
    setStep(issue.stepId);
    if ((issue.targetType === "section" || issue.targetType === "facade") && issue.targetId) {
      selectSection(issue.targetId);
      return;
    }
    if (issue.targetType === "compartment" && issue.targetId) {
      const sectionId = Object.entries(compartmentLayout).find(([, compartments]) =>
        compartments.some((compartment) => compartment.id === issue.targetId),
      )?.[0];
      if (sectionId) selectCompartment(sectionId, issue.targetId);
    }
  }

  function guardedStepChange(nextStep: StepKey) {
    if (nextStep === "checkout" && isCheckoutBlocked) {
      focusValidationIssue(blockingIssues[0]);
      return;
    }
    setStep(nextStep);
  }

  function goToPreviousStep() {
    const previousStep = stepOrder[Math.max(0, currentStepIndex - 1)];
    guardedStepChange(previousStep);
  }
  function goToNextStep() {
    const nextStep =
      stepOrder[Math.min(stepOrder.length - 1, currentStepIndex + 1)];
    guardedStepChange(nextStep);
  }

  function guardedSubmit() {
    if (isCheckoutBlocked) {
      focusValidationIssue(blockingIssues[0]);
      return;
    }
    attemptCheckoutSubmit();
  }

  return (
    <>
      <ConstructorHeader />

      <main className="rzm-constructor-page rzm-stage-r15-2d-drawing rzm-stage-r16-sidebar-polish rzm-stage-r17-three-product-polish rzm-stage-r18-checkout-simplification rzm-stage-r19-desktop-hardening rzm-stage-r20-desktop-qa-polish rzm-stage-r21-browser-and-desktop-polish rzm-stage-r22-scene-status-polish rzm-stage-r23-three-runtime-repair rzm-stage-r24-blueprint-finalization rzm-stage-r25-sidebar-wizard-finalization rzm-stage-r26-materials-final-polish rzm-stage-r27-scene-toolbar-status-simplification rzm-stage-r28-checkout-qa-polish rzm-stage-r29-e2e-cleanup">
        {isCheckoutStep ? (
          <ConstructorCheckoutLayout
            step={step}
            onStepChange={guardedStepChange}
            contact={contact}
            errors={errors}
            consent={consent}
            deliveryEnabled={deliveryEnabled}
            assemblyEnabled={assemblyEnabled}
            deliveryAddress={deliveryAddress}
            quote={quote}
            quoteError={quoteError}
            snapshot={constructorSnapshot}
            validation={validation}
            formatPrice={formatPrice}
            submitStatus={submitStatus}
            submitMessage={authGateError ?? submitMessage}
            onContactChange={setContact}
            onConsentChange={setConsent}
            onDeliveryEnabledChange={setDeliveryEnabled}
            onAssemblyEnabledChange={setAssemblyEnabled}
            onDeliveryAddressChange={setDeliveryAddress}
            onPreviousStep={goToPreviousStep}
            onSubmit={guardedSubmit}
          />
        ) : (
          <section className="rzm-constructor-shell rzm-constructor-shell--simple rzm-r19-workspace">
            <ConstructorSidebar
              step={step}
              furniture={furniture}
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
              activeValidationIssueId={focusedValidationIssue?.id ?? null}
              deliveryEnabled={deliveryEnabled}
              assemblyEnabled={assemblyEnabled}
              deliveryAddress={deliveryAddress}
              contact={contact}
              consent={consent}
              errors={errors}
              quote={quote}
              quoteError={quoteError}
              formatPrice={formatPrice}
              canGoBack={canGoBack}
              isCheckoutStep={isCheckoutStep}
              submitStatus={submitStatus}
              submitMessage={authGateError ?? submitMessage}
              onFurnitureChange={setFurniture}
              onWidthChange={setWidth}
              onHeightChange={setHeight}
              onDepthChange={setDepth}
              onFillChange={setFill}
              onSectionsChange={setSections}
              onSectionWidthChange={setSectionWidth}
              onEqualizeSections={equalizeSections}
              onSelectSection={selectSection}
              onSetCompartments={setCompartments}
              onCompartmentHeightChange={setCompartmentHeight}
              onEqualizeCompartments={equalizeCompartments}
              onSelectCompartment={selectCompartment}
              onCompartmentFillingChange={setCompartmentFilling}
              onSectionFacadeModeChange={setSectionFacadeMode}
              onAllSectionFacadeModeChange={setAllSectionFacadeMode}
              onHandlelessChange={setHandleless}
              onMaterialChange={setMaterial}
              onFacadeMaterialChange={setFacadeMaterial}
              onValidationIssueSelect={focusValidationIssue}
              onDeliveryEnabledChange={setDeliveryEnabled}
              onAssemblyEnabledChange={setAssemblyEnabled}
              onDeliveryAddressChange={setDeliveryAddress}
              onContactChange={setContact}
              onConsentChange={setConsent}
              onPreviousStep={goToPreviousStep}
              onNextStep={goToNextStep}
              onSubmit={guardedSubmit}
            />
            <ConstructorScene
              step={step}
              onStepChange={guardedStepChange}
              advancedEnabled={
                step === "sizes"
                  ? advancedSizes
                  : step === "fill"
                    ? advancedFill
                    : false
              }
              onAdvancedEnabledChange={
                step === "sizes" ? setAdvancedSizes : setAdvancedFill
              }
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
              fill={fill}
              material={material}
              facadeMaterial={facadeMaterial}
              selectedFurniture={selectedFurniture}
              handleless={handleless}
              shelvesCount={shelvesCount}
              drawersCount={drawersCount}
              rodsCount={rodsCount}
              validation={validation}
              quote={quote}
              quoteError={quoteError}
              formatPrice={formatPrice}
              productionPreview={productionPreview}
              productionSnapshot={productionSnapshot}
              isProductionPreviewLoading={isProductionPreviewLoading}
              productionPreviewError={productionPreviewError}
              sceneRenderMode={sceneRenderMode}
              sceneViewMode={sceneViewMode}
              onSceneRenderModeChange={setSceneRenderMode}
              onSceneViewModeChange={setSceneViewMode}
            />
          </section>
        )}
      </main>
      {checkoutAuthModal}
    </>
  );
}
