import type { ConstructorProductionPreview } from "../adapters/productionPreviewAdapter";
import type { ConstructorProductionSnapshotState } from "../types";
import type { PricingTransparencyNotice } from "../../../pricing/materialPricingTransparency";

function formatPreviewStatus(
  status?: ConstructorProductionPreview["status"] | ConstructorProductionSnapshotState["validationStatus"],
) {
  if (status === "blocked") return "Ошибка";
  if (status === "valid") return "Готово";
  if (status === "ready-for-review") return "Проверка";
  return "Проверка";
}

function formatUpdatedAt(value: string | null) {
  if (!value) return "нет снимка";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "нет снимка";
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function ProductionDebugPreview({
  productionPreview,
  productionSnapshot,
  pricingNotice,
  isLoading,
  error,
}: {
  productionPreview: ConstructorProductionPreview | null;
  productionSnapshot: ConstructorProductionSnapshotState;
  pricingNotice: PricingTransparencyNotice | null;
  isLoading: boolean;
  error: string;
}) {
  const summary = productionSnapshot.summary ?? productionPreview?.summary ?? null;
  const project = productionSnapshot.project ?? productionPreview?.project ?? null;
  const status = productionSnapshot.validationStatus ?? productionPreview?.status ?? null;
  const currentError = productionSnapshot.error || error;
  const panelPricing = productionSnapshot.panelPricing;
  const hardwarePricing = productionSnapshot.hardwarePricing;
  const hardwareDecision = productionSnapshot.hardwareDecision;
  const servicesPricing = productionSnapshot.servicesPricing;
  const servicesDecision = productionSnapshot.servicesDecision;

  return (
    <details className="rzm-production-preview-card" aria-label="Техническая проверка конфигурации">
      <summary className="rzm-production-preview-summary">
        <span>Техническая проверка</span>
        <small>
          {isLoading || productionSnapshot.status === "loading"
            ? "Считаем"
            : currentError
              ? "Ошибка"
              : formatPreviewStatus(status)}
        </small>
      </summary>

      <div className="rzm-production-preview-head">
        <div>
          <span className="rzm-how-chip-title"><span className="rzm-chip-dot" />Debug</span>
          <p className="rzm-step-text">
            Внутренняя сводка production snapshot без персональных данных клиента.
          </p>
        </div>
        <span className={`rzm-production-status rzm-production-status--${status ?? "loading"}`}>
          {isLoading || productionSnapshot.status === "loading"
            ? "Считаем"
            : currentError
              ? "Ошибка"
              : formatPreviewStatus(status)}
        </span>
      </div>

      {currentError ? (
        <p className="rzm-step-text rzm-production-preview-error">{currentError}</p>
      ) : (
        <div className="rzm-production-preview-grid">
          <span><b>{summary?.panels ?? "—"}</b><small>панелей</small></span>
          <span><b>{summary?.hardware ?? "—"}</b><small>фурнитура</small></span>
          <span><b>{summary?.drilling ?? "—"}</b><small>присадка</small></span>
          <span><b>{summary?.basisSteps ?? "—"}</b><small>БАЗИС шаги</small></span>
          <span><b>{summary?.edgeBandingLengthMm ?? "—"}</b><small>кромка, мм</small></span>
          <span><b>{project?.sections ?? "—"}</b><small>секций</small></span>
        </div>
      )}

      <div className="rzm-production-preview-meta">
        <span>
          {productionSnapshot.requiresTechnologistCheck || productionPreview?.requiresTechnologistCheck
            ? "Нужна проверка технолога"
            : "Автопроверка без критичных ошибок"}
        </span>
        <span>Предупреждений: {summary?.warnings ?? 0}</span>
        <span>Ошибок: {summary?.errors ?? 0}</span>
        <span>Обновлено: {formatUpdatedAt(productionSnapshot.updatedAt)}</span>
        <span>Материал корпуса: {project?.materialId ?? "—"}</span>
        <span>Цена: {pricingNotice?.debugLabel ?? "pricing: нет данных"}</span>
        <span>{pricingNotice?.bodySource ?? "Корпус: нет данных"}</span>
        <span>{pricingNotice?.facadeSource ?? "Фасады: нет данных"}</span>
        <span>Панели: {panelPricing ? `${panelPricing.totalAreaM2} м²` : "нет данных"}</span>
        <span>Корпус/фасады/ХДФ: {panelPricing ? `${panelPricing.bodyAreaM2}/${panelPricing.facadeAreaM2}/${panelPricing.backPanelAreaM2} м²` : "—"}</span>
        <span>Материалы по панелям: {panelPricing ? `${panelPricing.estimatedMaterialsWithEdge.toLocaleString("ru-RU")} ₽` : "—"}</span>
        <span>Дельта к текущей смете: {panelPricing?.deltaToCatalogMaterials !== null && panelPricing?.deltaToCatalogMaterials !== undefined ? `${panelPricing.deltaToCatalogMaterials.toLocaleString("ru-RU")} ₽` : "—"}</span>
        <span>Фурнитура по production: {hardwarePricing ? `${hardwarePricing.hardwareEstimate.toLocaleString("ru-RU")} ₽` : "—"}</span>
        <span>Фурнитура позиций: {hardwarePricing ? `${hardwarePricing.pricedHardwareCount}/${hardwarePricing.hardwareCount}` : "—"}</span>
        <span>SKU фурнитуры: {hardwarePricing ? `${hardwarePricing.supplierMatchedHardwareCount}/${hardwarePricing.hardwareCount}` : "—"}</span>
        <span>Подтверждение цен: {hardwarePricing ? `${hardwarePricing.requiresPriceConfirmationCount} поз.` : "—"}</span>
        <span>Дельта фурнитуры: {hardwarePricing?.deltaToCatalogHardware !== null && hardwarePricing?.deltaToCatalogHardware !== undefined ? `${hardwarePricing.deltaToCatalogHardware.toLocaleString("ru-RU")} ₽` : "—"}</span>
        <span>Решение по фурнитуре: {hardwareDecision ? `${hardwareDecision.status} · ${hardwareDecision.recommendedSourceOfTruth}` : "—"}</span>
        <span>Покрытие фурнитуры: {hardwareDecision ? `${hardwareDecision.pricedCoveragePercent}% · SKU ${hardwareDecision.supplierMatchedCoveragePercent}%` : "—"}</span>
        <span>Следующий шаг фурнитуры: {hardwareDecision?.nextAction ?? "—"}</span>
        <span>Услуги по production: {servicesPricing ? `${servicesPricing.servicesEstimate.toLocaleString("ru-RU")} ₽` : "—"}</span>
        <span>Распил/кромление/присадка: {servicesPricing ? `${servicesPricing.cuttingEstimate.toLocaleString("ru-RU")}/${servicesPricing.edgeServiceEstimate.toLocaleString("ru-RU")}/${servicesPricing.drillingEstimate.toLocaleString("ru-RU")} ₽` : "—"}</span>
        <span>Упаковка: {servicesPricing ? `${servicesPricing.packagingEstimate.toLocaleString("ru-RU")} ₽` : "—"}</span>
        <span>Дельта услуг: {servicesPricing?.deltaToCatalogServices !== null && servicesPricing?.deltaToCatalogServices !== undefined ? `${servicesPricing.deltaToCatalogServices.toLocaleString("ru-RU")} ₽` : "—"}</span>
        <span>Решение по услугам: {servicesDecision ? `${servicesDecision.status} · ${servicesDecision.recommendedSourceOfTruth}` : "—"}</span>
        <span>Дельта услуг+production: {servicesDecision?.delta !== null && servicesDecision?.delta !== undefined ? `${servicesDecision.delta.toLocaleString("ru-RU")} ₽ (${servicesDecision.deltaPercent ?? "—"}%)` : "—"}</span>
        <span>Следующий шаг услуг: {servicesDecision?.nextAction ?? "—"}</span>
      </div>
    </details>
  );
}
