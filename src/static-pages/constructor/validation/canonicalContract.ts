import type { OrderRequest } from "../../../../api/_shared/order-types";
import { buildProductionExportFromPayload } from "../../../constructor/production/orderExportPackage";
import type { ProductionExportPackage } from "../../../constructor/production/types";
import type { OrderPayload } from "../../../shared/lib/order";
import {
  buildConstructorFilling,
  buildConstructorLayout,
  getSelectedFacadeMaterial,
  getSelectedFurniture,
  getSelectedMaterial,
  type ConstructorSnapshot,
} from "../adapters/constructorPayload";
import type { QuoteState } from "../types";

export type ProductionConfigFingerprint = {
  productType: string;
  dimensions: {
    widthMm: number;
    heightMm: number;
    depthMm: number;
  };
  material: ProductionExportPackage["project"]["material"];
  structure: {
    sectionCount: number;
    shelves: number;
    drawers: number;
    hangingRod: boolean;
    facadeMode: string;
    openingMode: string;
    hardwareMode: string;
    layout: unknown;
  };
  totals: {
    panelCount: number;
    hardwareCount: number;
    drillingCount: number;
    edgeBandingLengthMm: number;
  };
  validationStatus: ProductionExportPackage["validation"]["status"];
  validationSummary: ProductionExportPackage["validation"]["summary"];
};

export type CanonicalSnapshotLayer = {
  productType: string;
  dimensions: { width: number; height: number; depth: number };
  sections: number;
  filling: { shelves: number; drawers: number; hangingRod: boolean };
  bodyMaterialId: string;
  facadeMaterialId: string;
  facadeKind: "mdf" | "ldsp";
  facadeStyleId: string;
  hardwareId: string;
  layout: unknown;
};

export type CanonicalQuoteLayer = {
  total: number;
  priceBreakdown: {
    body: number;
    facades: number;
    filling: number;
    hardware: number;
    production: number;
    materials: number;
    edgeBanding: number;
    services: number;
    delivery: number;
    assembly: number;
  };
  delivery: { enabled: boolean; price: number };
  assembly: { enabled: boolean; price: number };
};

export type CanonicalPayloadLayer = {
  productType: string;
  dimensions: { width: number; height: number; depth: number };
  sections: number;
  filling: { shelves: number; drawers: number; hangingRod: boolean };
  bodyMaterialId: string;
  facadeMaterialId: string;
  facadeKind: "mdf" | "ldsp" | undefined;
  facadeStyleId: string;
  hardwareId: string;
  layout: unknown;
  source: string;
  total: number;
  priceBreakdown: Record<string, number>;
  delivery: { enabled: boolean; price: number };
  assembly: { enabled: boolean; price: number };
};

export type CanonicalProductionLayer = {
  payloadDerivedFingerprint: ProductionConfigFingerprint;
  providedFingerprint: ProductionConfigFingerprint | null;
  previewFingerprint: ProductionConfigFingerprint | null;
  previewDimensions: { width: number; height: number; depth: number } | null;
};

export type CanonicalConstructorContract = {
  snapshot: CanonicalSnapshotLayer;
  quote: CanonicalQuoteLayer;
  payload: CanonicalPayloadLayer;
  production: CanonicalProductionLayer;
};

export function extractProductionConfigFingerprint(
  productionExport: ProductionExportPackage,
): ProductionConfigFingerprint {
  const { project, productionModel, validation } = productionExport;

  return {
    productType: project.productType,
    dimensions: project.dimensions,
    material: project.material,
    structure: {
      sectionCount: project.structure.sectionCount,
      shelves: project.structure.shelves,
      drawers: project.structure.drawers,
      hangingRod: project.structure.hangingRod,
      facadeMode: project.structure.facadeMode,
      openingMode: project.structure.openingMode,
      hardwareMode: project.structure.hardwareMode,
      layout: project.structure.layout,
    },
    totals: {
      panelCount: productionModel.totals.panelCount,
      hardwareCount: productionModel.totals.hardwareCount,
      drillingCount: productionModel.totals.drillingCount,
      edgeBandingLengthMm: productionModel.totals.edgeBandingLengthMm,
    },
    validationStatus: validation.status,
    validationSummary: validation.summary,
  };
}

function buildSnapshotLayer(snapshot: ConstructorSnapshot): CanonicalSnapshotLayer {
  const expectedFurniture = getSelectedFurniture(snapshot);
  const expectedMaterial = getSelectedMaterial(snapshot);
  const expectedFacadeMaterial = getSelectedFacadeMaterial(snapshot);

  return {
    productType: expectedFurniture.productType,
    dimensions: {
      width: snapshot.width,
      height: snapshot.height,
      depth: snapshot.depth,
    },
    sections: snapshot.sections,
    filling: buildConstructorFilling(snapshot),
    bodyMaterialId: expectedMaterial.materialId,
    facadeMaterialId: expectedFacadeMaterial.materialId,
    facadeKind: expectedFacadeMaterial.kind === "mdf" ? "mdf" : "ldsp",
    facadeStyleId: snapshot.handleless ? "no-handle" : "regular",
    hardwareId: snapshot.handleless ? "comfort" : "base",
    layout: buildConstructorLayout(snapshot),
  };
}

function buildQuoteLayer(quote: QuoteState): CanonicalQuoteLayer {
  return {
    total: quote.total,
    priceBreakdown: {
      body: quote.price.body,
      facades: quote.price.facades,
      filling: quote.price.filling,
      hardware: quote.price.hardware,
      production: quote.price.production,
      materials: quote.price.materials,
      edgeBanding: quote.price.edgeBanding,
      services: quote.price.services,
      delivery: quote.deliveryQuote.price,
      assembly: quote.assemblyQuote.price,
    },
    delivery: {
      enabled: quote.deliveryQuote.enabled,
      price: quote.deliveryQuote.price,
    },
    assembly: {
      enabled: quote.assemblyQuote.enabled,
      price: quote.assemblyQuote.price,
    },
  };
}

function buildPayloadLayer(payload: OrderPayload): CanonicalPayloadLayer {
  return {
    productType: payload.productType,
    dimensions: {
      width: payload.dimensions.width,
      height: payload.dimensions.height,
      depth: payload.dimensions.depth,
    },
    sections: payload.sections,
    filling: payload.filling,
    bodyMaterialId: payload.materials.bodyId,
    facadeMaterialId: payload.materials.facadeId,
    facadeKind: payload.materials.facadeKind,
    facadeStyleId: payload.style.facadeStyleId,
    hardwareId: payload.style.hardwareId,
    layout: payload.layout ?? null,
    source: payload.source ?? "",
    total: payload.totalPrice,
    priceBreakdown: payload.priceBreakdown ?? {},
    delivery: {
      enabled: payload.delivery?.enabled ?? false,
      price: payload.delivery?.price ?? 0,
    },
    assembly: {
      enabled: payload.assembly?.enabled ?? false,
      price: payload.assembly?.price ?? 0,
    },
  };
}

function buildProductionLayer(
  payload: OrderPayload,
  quote: QuoteState,
  productionExport?: ProductionExportPackage | null,
): CanonicalProductionLayer {
  const payloadDerivedExport = buildProductionExportFromPayload(
    payload as OrderRequest,
    payload.configVersion ?? "rzm.order.v1",
  );
  const preview = quote.productionPreview;

  return {
    payloadDerivedFingerprint: extractProductionConfigFingerprint(payloadDerivedExport),
    providedFingerprint: productionExport
      ? extractProductionConfigFingerprint(productionExport)
      : null,
    previewFingerprint: preview?.productionExport
      ? extractProductionConfigFingerprint(preview.productionExport)
      : null,
    previewDimensions: preview?.project.dimensions ?? null,
  };
}

export function createCanonicalConstructorSnapshot(
  snapshot: ConstructorSnapshot,
  quote: QuoteState,
  payload: OrderPayload,
  productionExport?: ProductionExportPackage | null,
): CanonicalConstructorContract {
  return {
    snapshot: buildSnapshotLayer(snapshot),
    quote: buildQuoteLayer(quote),
    payload: buildPayloadLayer(payload),
    production: buildProductionLayer(payload, quote, productionExport),
  };
}
