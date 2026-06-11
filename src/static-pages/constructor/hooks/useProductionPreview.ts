import { useEffect, useState } from "react";
import type { ConstructorProductionPreview } from "../adapters/productionPreviewAdapter";
import { buildProductionSnapshotReadyState } from "../adapters/productionSnapshotSync";
import { useConstructorStore } from "../store/constructorStore";
import {
  selectClearProductionSnapshot,
  selectProductionSnapshot,
  selectSetProductionSnapshotError,
  selectSetProductionSnapshotReady,
} from "../store/constructorSelectors";
import type { QuoteState } from "../types";

export function useProductionPreview(quote: QuoteState | null) {
  const [preview, setPreview] = useState<ConstructorProductionPreview | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const productionSnapshot = useConstructorStore(selectProductionSnapshot);
  const setProductionSnapshotReady = useConstructorStore(
    selectSetProductionSnapshotReady,
  );
  const setProductionSnapshotError = useConstructorStore(
    selectSetProductionSnapshotError,
  );
  const clearProductionSnapshot = useConstructorStore(selectClearProductionSnapshot);

  useEffect(() => {
    if (!quote) {
      setPreview(null);
      setPreviewError("");
      setIsPreviewLoading(false);
      clearProductionSnapshot();
      return;
    }

    if (!quote.productionPreview) {
      const message = "Техническая проверка ожидает production preview от расчёта цены";
      setPreview(null);
      setPreviewError(message);
      setIsPreviewLoading(false);
      setProductionSnapshotError(message);
      return;
    }

    setPreview(quote.productionPreview);
    setPreviewError("");
    setIsPreviewLoading(false);
    setProductionSnapshotReady(buildProductionSnapshotReadyState({
      preview: quote.productionPreview,
      panelPricing: quote.productionPanelPricing ?? null,
      hardwarePricing: quote.productionHardwarePricing ?? null,
      hardwareDecision: quote.productionHardwareDecision ?? null,
      servicesPricing: quote.productionServicesPricing ?? null,
      servicesDecision: quote.productionServicesDecision ?? null,
    }));
  }, [
    clearProductionSnapshot,
    setProductionSnapshotError,
    setProductionSnapshotReady,
    quote,
  ]);

  return {
    preview,
    productionSnapshot,
    isPreviewLoading,
    previewError,
  };
}
