import type { OrderRequest } from "../../../../api/_shared/order-types";
import { buildProductionExportFromOrder } from "../../../constructor/production/orderExportPackage";
import type { ProductionExportPackage } from "../../../constructor/production/types";
import type { ConstructorSnapshot } from "./constructorPayload";
import { buildOrderPayloadFromConstructor } from "./constructorPayload";
import type { QuoteState } from "../types";

export type ConstructorProductionPreview = {
  schema: "razmerno.constructor-production-preview.v1";
  status: ProductionExportPackage["validation"]["status"];
  requiresTechnologistCheck: boolean;
  summary: {
    panels: number;
    hardware: number;
    drilling: number;
    edgeBandingLengthMm: number;
    basisSteps: number;
    warnings: number;
    errors: number;
  };
  project: {
    productType: OrderRequest["productType"];
    dimensions: NonNullable<OrderRequest["dimensions"]>;
    sections: number;
    materialId: string;
    facadeStyleId: string;
  };
  productionExport: ProductionExportPackage;
};

export function buildProductionOrderRequestFromConstructor(
  snapshot: ConstructorSnapshot,
  quote: QuoteState,
): OrderRequest {
  const payload = buildOrderPayloadFromConstructor(snapshot, quote, {
    source: "constructor-production-preview",
  });

  return {
    ...payload,
    customer: {
      // Production preview must not depend on real PII.
      name: "Preview",
      phone: "+7 (999) 000-00-00",
      email: "preview@razmerno.local",
    },
    consent: {
      personalData: true,
      privacyVersion: "preview",
      acceptedAt: "1970-01-01T00:00:00.000Z",
    },
  };
}

export function buildConstructorProductionPreview(
  snapshot: ConstructorSnapshot,
  quote: QuoteState,
): ConstructorProductionPreview {
  const order = buildProductionOrderRequestFromConstructor(snapshot, quote);
  const productionExport = buildProductionExportFromOrder(order, "rzm.constructor.preview.v1");

  return {
    schema: "razmerno.constructor-production-preview.v1",
    status: productionExport.validation.status,
    requiresTechnologistCheck: productionExport.manufacturing.requiresTechnologistCheck,
    summary: {
      panels: productionExport.productionModel.totals.panelCount,
      hardware: productionExport.productionModel.totals.hardwareCount,
      drilling: productionExport.productionModel.totals.drillingCount,
      edgeBandingLengthMm: productionExport.productionModel.totals.edgeBandingLengthMm,
      basisSteps: productionExport.productionModel.basisExportPlan.length,
      warnings: productionExport.validation.warnings.length,
      errors: productionExport.validation.errors.length,
    },
    project: {
      productType: order.productType,
      dimensions: order.dimensions ?? { width: snapshot.width, height: snapshot.height, depth: snapshot.depth },
      sections: order.sections ?? snapshot.sections,
      materialId: order.materials?.bodyId ?? "unknown",
      facadeStyleId: order.style?.facadeStyleId ?? "regular",
    },
    productionExport,
  };
}
