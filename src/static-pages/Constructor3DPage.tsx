import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ConstructorDraftRow } from "./constructor/components/ConstructorDraftRow";
import { ConstructorHeader } from "./constructor/components/ConstructorHeader";
import { ConstructorDrawerFooter } from "./constructor/components/ConstructorDrawerFooter";
import { ConstructorStagebar } from "./constructor/components/ConstructorStagebar";
import { DrawerContent } from "./constructor/components/ConstructorDrawerContent";
import { ResetProjectDialog } from "./constructor/components/ResetProjectDialog";
import {
  SceneRuntimeStatus,
  ThreeSceneLoading,
  TwoDFallbackScene,
} from "./constructor/components/SceneRuntimePanels";
import {
  formatMm,
  getSceneInfo,
  SceneInfoBar,
  stepLabels,
  viewLabels,
} from "./constructor/components/Constructor3DPageMeta";
import { getModelMetrics } from "./constructor/components/ConstructorSceneModel";
import {
  LazyThreeFurnitureViewer,
  type ThreeRuntimeFailureReason,
} from "./constructor/components/LazyThreeFurnitureViewer";
import { useConstructorDraftLifecycle } from "./constructor/hooks/useConstructorDraftLifecycle";
import { useWebGLDiagnostics } from "./constructor/three/useWebGLAvailable";
import { useThreeSceneQuality } from "./constructor/three/useThreeSceneQuality";
import { useConstructorPageState } from "./constructor/hooks/useConstructorPageState";
import { useConstructorQuote } from "./constructor/hooks/useConstructorQuote";
import { useConstructorSubmit } from "./constructor/hooks/useConstructorSubmit";
import { stepOrder } from "./constructor/options";
import { formatFallbackPrice } from "./constructor/utils";
import type {
  ConstructorSceneViewMode,
} from "./constructor/types";

export default function Constructor3DPage() {
  const [threeFailed, setThreeFailed] = useState(false);
  const [threeFailureReason, setThreeFailureReason] =
    useState<ThreeRuntimeFailureReason | null>(null);
  const [threeRecoveryAttempt, setThreeRecoveryAttempt] = useState(0);
  const [forceReduced3D, setForceReduced3D] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [activeAddTarget, setActiveAddTarget] = useState<{
    sectionId: string;
    compartmentId?: string;
  } | null>(null);
  const webglDiagnostics = useWebGLDiagnostics();
  const detectedThreeQuality = useThreeSceneQuality();
  const threeQuality = forceReduced3D ? "reduced" : detectedThreeQuality;

  const handleThreeRuntimeError = useCallback(
    (reason?: ThreeRuntimeFailureReason) => {
      setThreeFailureReason(reason ?? "three-boundary-error");
      setThreeFailed(true);
    },
    [],
  );

  const handleThreeReady = useCallback(() => {
    setThreeFailureReason(null);
    setThreeFailed(false);
  }, []);

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
      zoneFacadeLayout,
      selectedCompartmentId,
      compartments,
      handleless,
      material,
      facadeMaterial,
      shelvesCount,
      drawersCount,
      rodsCount,
      validation,
      canonicalState,
      advancedSizes,
      advancedFill,
      sceneRenderMode,
      deliveryEnabled,
      assemblyEnabled,
      deliveryAddress,
      sceneViewMode,
      contact,
      consent,
    },
    actions: {
      setStep,
      setFurniture,
      setWidth,
      setHeight,
      setDepth,
      setSections,
      setSectionWidth,
      equalizeSections,
      selectSection,
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
      setHandleless,
      setMaterial,
      setFacadeMaterial,
      setSceneRenderMode,
      setSceneViewMode,
      setExactModeEnabled,
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
  } = useConstructorPageState();
  const {
    draftStatus,
    hasStoredDraft,
    saveDraft,
    restoreDraft,
    clearDraft,
  } = useConstructorDraftLifecycle(snapshot);

  const retryThreeScene = useCallback((reduced = false) => {
    setForceReduced3D(reduced);
    setSceneRenderMode("three");
    setThreeFailureReason(null);
    setThreeFailed(false);
    setThreeRecoveryAttempt((attempt) => attempt + 1);
  }, [setSceneRenderMode]);

  const showBlueprintFallback = useCallback(() => {
    setSceneRenderMode("svg");
  }, [setSceneRenderMode]);

  const webglAvailable = webglDiagnostics.status === "available";
  const canRenderThree =
    sceneRenderMode === "three" && webglAvailable && !threeFailed;
  const useBlueprintFallback =
    sceneRenderMode === "svg" || !canRenderThree;
  const activeRuntimeRenderMode = canRenderThree ? "three" : "blueprint";

  const { quote, quoteError, quoteStatus } = useConstructorQuote({
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
    snapshot,
  });

  const {
    errors,
    submitStatus,
    submitMessage,
    submit,
    isCooldownActive,
    cooldownRemainingMs,
  } = useConstructorSubmit({
    snapshot,
    quote,
    onStepChange: setStep,
    onDraftSave: () => {
      saveDraft();
    },
  });
  const formatPrice = quote?.formatPrice ?? formatFallbackPrice;
  const currentStepIndex = stepOrder.indexOf(step);
  const nextStep =
    stepOrder[Math.min(stepOrder.length - 1, currentStepIndex + 1)];
  const previousStep = stepOrder[Math.max(0, currentStepIndex - 1)];
  const priceLabel = quoteError
    ? "Ошибка расчёта"
    : quote
      ? formatPrice(quote.total)
      : "Считаем";
  const priceStatusLabel = quoteError
    ? "Ошибка расчёта"
    : quoteStatus === "calculating" || !quote
      ? "Пересчитываем стоимость"
      : "Стоимость обновлена";
  const blockingCheckoutIssues = validation.issues.filter(
    (issue) => issue.blocksCheckout,
  );
  const checkoutBlocked =
    step === "checkout" && blockingCheckoutIssues.length > 0;
  const checkoutRequiredMissing =
    step === "checkout" &&
    (!contact.name.trim() ||
      !contact.phone.trim() ||
      !contact.email.trim() ||
      !consent);
  const checkoutSubmitDisabled =
    step === "checkout" &&
    (checkoutBlocked ||
      checkoutRequiredMissing ||
      submitStatus === "submitting" || isCooldownActive);

  const handlePrimaryAction = () => {
    if (step === "checkout") {
      if (checkoutBlocked || checkoutRequiredMissing || !consent || isCooldownActive) return;
      void submit();
      return;
    }
    setStep(nextStep);
  };

  const handleThreeTargetSelect = (target: {
    sectionId: string;
    compartmentId?: string;
  }) => {
    setActiveAddTarget(null);
    if (target.compartmentId) {
      selectZone(target.sectionId, target.compartmentId);
      return;
    }
    selectSection(target.sectionId);
  };

  const handleThreeAddMenuOpen = (target: {
    sectionId: string;
    compartmentId?: string;
  }) => {
    if (target.compartmentId) {
      selectZone(target.sectionId, target.compartmentId);
    } else {
      selectSection(target.sectionId);
    }
    setActiveAddTarget(target);
  };

  const handleResetConfirm = () => {
    resetProject();
    setActiveAddTarget(null);
    setThreeFailed(false);
    setThreeFailureReason(null);
    setThreeRecoveryAttempt(0);
    setForceReduced3D(false);
    setResetDialogOpen(false);
  };

  useEffect(() => {
    document.documentElement.dataset.constructorMode = "3d-first";
    return () => {
      delete document.documentElement.dataset.constructorMode;
    };
  }, []);

  const threeInput = useMemo(
    () => ({
      furniture: canonicalState.furnitureType,
      widthMm: canonicalState.dimensions.widthMm,
      heightMm: canonicalState.dimensions.heightMm,
      depthMm: canonicalState.dimensions.depthMm,
      sections: canonicalState.sections.length,
      sectionLayout,
      compartmentLayout,
      fillingLayout,
      facadeLayout,
      zoneFacadeLayout,
      compartments,
      shelvesCount,
      drawersCount,
      rodsCount,
      fill: canonicalState.fill,
      material: canonicalState.materials.bodyMaterialId,
      facadeMaterial: canonicalState.materials.facadeMaterialId,
      handleless,
      selectedSectionId: canonicalState.selectedSectionId,
      selectedCompartmentId: canonicalState.selectedZoneId,
      sceneMode: step,
    }),
    [
      canonicalState,
      compartmentLayout,
      compartments,
      facadeLayout,
      fillingLayout,
      handleless,
      rodsCount,
      drawersCount,
      sectionLayout,
      shelvesCount,
      zoneFacadeLayout,
      step,
    ],
  );

  const threePillLabel = useBlueprintFallback
    ? "2D fallback"
    : canRenderThree
      ? "3D готово"
      : webglDiagnostics.status === "checking"
        ? "Проверяем 3D"
        : "2D fallback";

  const blueprintMetrics = useMemo(
    () => getModelMetrics(width, height, depth),
    [width, height, depth],
  );

  const sceneInfo = getSceneInfo({
    width,
    height,
    depth,
    sectionLayout,
    compartmentLayout,
    selectedSectionId,
    selectedCompartmentId,
  });

  return (
    <>
      <ConstructorHeader
        variant="workspace"
        currentStepLabel={stepLabels[step]}
        statusLabel={priceStatusLabel}
        onReset={() => setResetDialogOpen(true)}
      />
      <main
        className="rzm-3d-page"
        data-stage="STAGE06"
        data-size-stage="STAGE08"
        data-fill-stage="STAGE09"
        data-facade-stage="STAGE10"
        data-material-stage="STAGE11"
        data-scene-stage="STAGE12"
        data-validation-stage="STAGE13"
        data-pricing-stage="STAGE14"
        data-checkout-stage="STAGE15"
        data-reset-stage="STAGE16"
        data-a11y-stage="STAGE17"
        data-qa-stage="STAGE18"
        data-legacy-stage="STAGE19"
        data-state-layer="STAGE07"
      >
        <section
          className="rzm-3d-shell rzm-3d-shell--stage05 rzm-3d-shell--stage06 rzm-3d-shell--stage07 rzm-3d-shell--stage08 rzm-3d-shell--stage09 rzm-3d-shell--stage10 rzm-3d-shell--stage11 rzm-3d-shell--stage12 rzm-3d-shell--stage13 rzm-3d-shell--stage14 rzm-3d-shell--stage15 rzm-3d-shell--stage16 rzm-3d-shell--stage17 rzm-3d-shell--stage18 rzm-3d-shell--stage19"
          aria-label="3D-конструктор мебели"
        >
          <ConstructorStagebar
            step={step}
            stepOrder={stepOrder}
            validation={validation}
            runtimeLabel={threePillLabel}
            canRenderThree={canRenderThree}
            onStepChange={setStep}
          />

          <div className="rzm-3d-workspace">
            <aside className="rzm-3d-drawer" aria-label="Настройки проекта">
              <DrawerContent
                step={step}
                furniture={furniture}
                width={width}
                height={height}
                depth={depth}
                sections={sections}
                sectionLayout={sectionLayout}
                selectedSectionId={selectedSectionId}
                selectedCompartmentId={selectedCompartmentId}
                compartmentLayout={compartmentLayout}
                fillingLayout={fillingLayout}
                facadeLayout={facadeLayout}
                zoneFacadeLayout={zoneFacadeLayout}
                activeAddTarget={activeAddTarget}
                validation={validation}
                advancedSizes={advancedSizes}
                advancedFill={advancedFill}
                handleless={handleless}
                deliveryEnabled={deliveryEnabled}
                assemblyEnabled={assemblyEnabled}
                deliveryAddress={deliveryAddress}
                contact={contact}
                errors={errors}
                quote={quote}
                quoteError={quoteError}
                formatPrice={formatPrice}
                material={material}
                facadeMaterial={facadeMaterial}
                selectedMaterial={selectedMaterial}
                selectedFacadeMaterial={selectedFacadeMaterial}
                onFurnitureChange={setFurniture}
                onWidthChange={setWidth}
                onHeightChange={setHeight}
                onDepthChange={setDepth}
                onSectionsChange={setSections}
                onSectionWidthChange={setSectionWidth}
                onEqualizeSections={equalizeSections}
                onSelectSection={selectSection}
                onSelectCompartment={selectCompartment}
                onSetCompartmentFilling={setCompartmentFilling}
                onApplyRandomPreset={applyRandomPresetToSection}
                onApplyAutoFixForIssue={applyAutoFixForIssue}
                onAddShelfToCompartment={addShelfToCompartment}
                onRemoveShelfDivider={removeShelfDivider}
                onRemoveCompartmentElement={removeCompartmentElement}
                onSetSectionFacadeMode={setSectionFacadeMode}
                onSetZoneFacadeMode={setZoneFacadeMode}
                onHandlelessChange={setHandleless}
                onAdvancedSizesChange={setExactModeEnabled}
                onAdvancedFillChange={setExactModeEnabled}
                onCloseAddMenu={() => setActiveAddTarget(null)}
                onMaterialChange={setMaterial}
                onFacadeMaterialChange={setFacadeMaterial}
                onDeliveryEnabledChange={setDeliveryEnabled}
                onAssemblyEnabledChange={setAssemblyEnabled}
                onDeliveryAddressChange={setDeliveryAddress}
                onContactChange={setContact}
              />
              <ConstructorDraftRow
                draftStatus={draftStatus}
                hasStoredDraft={hasStoredDraft}
                onSaveDraft={() => {
                  saveDraft();
                }}
                onRestoreDraft={() => {
                  restoreDraft();
                }}
                onClearDraft={() => {
                  clearDraft();
                }}
              />

              <ConstructorDrawerFooter
                step={step}
                priceLabel={priceLabel}
                quoteStatus={quoteStatus}
                checkoutBlocked={checkoutBlocked}
                checkoutRequiredMissing={checkoutRequiredMissing}
                checkoutSubmitDisabled={checkoutSubmitDisabled}
                submitStatus={submitStatus}
                submitMessage={submitMessage}
                isCooldownActive={isCooldownActive}
                cooldownRemainingMs={cooldownRemainingMs}
                consent={consent}
                errors={errors}
                currentStepIndex={currentStepIndex}
                onConsentChange={setConsent}
                onPrevious={() => setStep(previousStep)}
                onPrimaryAction={handlePrimaryAction}
              />
            </aside>

            <section
              className="rzm-3d-scene-card"
              aria-label="3D-сцена конструктора"
              aria-busy={
                quoteStatus === "calculating" ||
                (canRenderThree && webglDiagnostics.status === "checking")
              }
            >
              <div className="rzm-3d-toolbar">
                <div>
                  <span>Рабочая сцена</span>
                  <strong>
                    {selectedFurniture.label} · {formatMm(width)} ×{" "}
                    {formatMm(height)} × {formatMm(depth)}
                  </strong>
                </div>
                <div
                  className="rzm-3d-view-switch rzm-3d-mode-switch"
                  aria-label="Камера"
                >
                  {(Object.keys(viewLabels) as ConstructorSceneViewMode[]).map(
                    (mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={`rzm-ui-btn rzm-ui-btn--mode ${sceneViewMode === mode ? "is-active" : ""}`}
                        onClick={() => setSceneViewMode(mode)}
                        aria-pressed={sceneViewMode === mode}
                        aria-label={`Камера: ${viewLabels[mode]}`}
                      >
                        {viewLabels[mode]}
                      </button>
                    ),
                  )}
                </div>
                <div
                  className="rzm-3d-render-switch rzm-3d-mode-switch"
                  aria-label="Режим визуализации"
                >
                  <button
                    type="button"
                    className={`rzm-ui-btn rzm-ui-btn--mode ${sceneRenderMode === "three" && !threeFailed ? "is-active" : ""}`}
                    onClick={() => retryThreeScene(forceReduced3D)}
                    aria-pressed={sceneRenderMode === "three" && !threeFailed}
                  >
                    3D
                  </button>
                  <button
                    type="button"
                    className={`rzm-ui-btn rzm-ui-btn--mode ${useBlueprintFallback ? "is-active" : ""}`}
                    onClick={showBlueprintFallback}
                    aria-pressed={useBlueprintFallback}
                  >
                    2D
                  </button>
                </div>
              </div>

              <SceneRuntimeStatus
                webglStatus={webglDiagnostics.status}
                canRenderThree={canRenderThree}
                threeFailed={threeFailed}
                failureReason={threeFailureReason}
                renderMode={activeRuntimeRenderMode}
                quality={threeQuality}
                quoteStatus={quoteStatus}
                priceStatusLabel={priceStatusLabel}
              />

              <div
                className="rzm-3d-viewport"
                data-testid="constructor-3d-viewport"
              >
                <div className="rzm-3d-scene-legend" role="note">
                  Вращайте модель мышкой
                </div>
                <button
                  type="button"
                  className="rzm-3d-random-chip rzm-ui-btn rzm-ui-btn--ghost"
                  title="Применить быстрый пресет к выбранной секции"
                  aria-label="Применить случайный пресет к выбранной секции"
                  onClick={() => applyRandomPresetToSection(selectedSectionId)}
                >
                  Рандомно
                </button>
                {canRenderThree ? (
                  <LazyThreeFurnitureViewer
                    input={threeInput}
                    viewMode={sceneViewMode}
                    quality={threeQuality}
                    recoveryKey={threeRecoveryAttempt}
                    fallback={<ThreeSceneLoading quality={threeQuality} />}
                    onError={handleThreeRuntimeError}
                    onReady={handleThreeReady}
                    onSelectTarget={handleThreeTargetSelect}
                    onOpenAddMenu={handleThreeAddMenuOpen}
                  />
                ) : (
                  <TwoDFallbackScene
                    metrics={blueprintMetrics}
                    input={threeInput}
                    viewMode={sceneViewMode}
                    validation={validation}
                    diagnosticsStatus={webglDiagnostics.status}
                    reason={webglDiagnostics.reason}
                    failureReason={threeFailureReason}
                    onUseReducedModel={() => retryThreeScene(true)}
                    onRetry3D={() => retryThreeScene(false)}
                  />
                )}
              </div>
              <SceneInfoBar info={sceneInfo} />
            </section>
          </div>
        </section>
      </main>
      <ResetProjectDialog
        open={resetDialogOpen}
        onCancel={() => setResetDialogOpen(false)}
        onConfirm={handleResetConfirm}
      />
    </>
  );
}
