import type { OrderPayload } from "../../../shared/lib/order";
import type { ConstructorSnapshot } from "../adapters/constructorPayload";
import type { QuoteState } from "../types";
import {
  createCanonicalConstructorSnapshot,
  type CanonicalConstructorContract,
  type ProductionConfigFingerprint,
} from "./canonicalContract";

export type SystemConsistencyLayer =
  | "snapshot-payload"
  | "quote-payload"
  | "payload-production"
  | "cross-layer";

export type SystemConsistencyIssue = {
  code: string;
  layer: SystemConsistencyLayer;
  message: string;
};

const LOG_PREFIX = "[constructor-system-consistency]";
const EXPECTED_SUBMIT_SOURCE = "constructor-store-adapter";

function pushMismatch(
  issues: SystemConsistencyIssue[],
  layer: SystemConsistencyLayer,
  code: string,
  message: string,
) {
  issues.push({ code, layer, message });
}

function numbersEqual(left: number | undefined, right: number | undefined): boolean {
  return (left ?? 0) === (right ?? 0);
}

function fingerprintsEqual(
  left: ProductionConfigFingerprint,
  right: ProductionConfigFingerprint,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function checkSnapshotPayloadAlignment(
  canonical: CanonicalConstructorContract,
  issues: SystemConsistencyIssue[],
) {
  const { snapshot, payload } = canonical;

  if (payload.productType !== snapshot.productType) {
    pushMismatch(
      issues,
      "snapshot-payload",
      "product_type",
      "payload productType does not match snapshot-derived furniture selection",
    );
  }

  if (
    payload.dimensions.width !== snapshot.dimensions.width ||
    payload.dimensions.height !== snapshot.dimensions.height ||
    payload.dimensions.depth !== snapshot.dimensions.depth
  ) {
    pushMismatch(
      issues,
      "snapshot-payload",
      "dimensions",
      "payload dimensions do not match snapshot projection",
    );
  }

  if (payload.sections !== snapshot.sections) {
    pushMismatch(
      issues,
      "snapshot-payload",
      "sections",
      "payload sections do not match snapshot projection",
    );
  }

  if (
    payload.filling.shelves !== snapshot.filling.shelves ||
    payload.filling.drawers !== snapshot.filling.drawers ||
    payload.filling.hangingRod !== snapshot.filling.hangingRod
  ) {
    pushMismatch(
      issues,
      "snapshot-payload",
      "filling",
      "payload filling does not match snapshot-derived filling layout",
    );
  }

  if (payload.bodyMaterialId !== snapshot.bodyMaterialId) {
    pushMismatch(
      issues,
      "snapshot-payload",
      "body_material",
      "payload body material does not match snapshot selection",
    );
  }

  if (payload.facadeMaterialId !== snapshot.facadeMaterialId) {
    pushMismatch(
      issues,
      "snapshot-payload",
      "facade_material",
      "payload facade material does not match snapshot selection",
    );
  }

  if (payload.facadeKind !== snapshot.facadeKind) {
    pushMismatch(
      issues,
      "snapshot-payload",
      "facade_kind",
      "payload facade kind does not match snapshot facade material",
    );
  }

  if (payload.facadeStyleId !== snapshot.facadeStyleId) {
    pushMismatch(
      issues,
      "snapshot-payload",
      "facade_style",
      "payload facade style does not match snapshot handleless flag",
    );
  }

  if (payload.hardwareId !== snapshot.hardwareId) {
    pushMismatch(
      issues,
      "snapshot-payload",
      "hardware_style",
      "payload hardware style does not match snapshot handleless flag",
    );
  }

  if (JSON.stringify(payload.layout) !== JSON.stringify(snapshot.layout)) {
    pushMismatch(
      issues,
      "snapshot-payload",
      "layout",
      "payload layout does not match snapshot-derived layout model",
    );
  }
}

function checkQuotePayloadAlignment(
  canonical: CanonicalConstructorContract,
  issues: SystemConsistencyIssue[],
) {
  const { quote, payload } = canonical;

  if (!numbersEqual(payload.total, quote.total)) {
    pushMismatch(
      issues,
      "quote-payload",
      "total_price",
      "payload totalPrice does not match quote.total",
    );
  }

  const breakdownPairs = Object.entries(quote.priceBreakdown) as Array<
    [keyof CanonicalConstructorContract["quote"]["priceBreakdown"], number]
  >;

  for (const [field, expected] of breakdownPairs) {
    if (!numbersEqual(payload.priceBreakdown[field], expected)) {
      pushMismatch(
        issues,
        "quote-payload",
        `price_breakdown_${field}`,
        `payload priceBreakdown.${field} does not match quote layer`,
      );
    }
  }

  if (payload.delivery.enabled !== quote.delivery.enabled) {
    pushMismatch(
      issues,
      "quote-payload",
      "delivery_enabled",
      "payload delivery.enabled does not match quote.deliveryQuote.enabled",
    );
  }

  if (!numbersEqual(payload.delivery.price, quote.delivery.price)) {
    pushMismatch(
      issues,
      "quote-payload",
      "delivery_price",
      "payload delivery.price does not match quote.deliveryQuote.price",
    );
  }

  if (payload.assembly.enabled !== quote.assembly.enabled) {
    pushMismatch(
      issues,
      "quote-payload",
      "assembly_enabled",
      "payload assembly.enabled does not match quote.assemblyQuote.enabled",
    );
  }

  if (!numbersEqual(payload.assembly.price, quote.assembly.price)) {
    pushMismatch(
      issues,
      "quote-payload",
      "assembly_price",
      "payload assembly.price does not match quote.assemblyQuote.price",
    );
  }
}

function checkPayloadProductionAlignment(
  canonical: CanonicalConstructorContract,
  issues: SystemConsistencyIssue[],
) {
  const { production } = canonical;

  if (!production.providedFingerprint) {
    return;
  }

  if (
    !fingerprintsEqual(
      production.providedFingerprint,
      production.payloadDerivedFingerprint,
    )
  ) {
    pushMismatch(
      issues,
      "payload-production",
      "production_export_drift",
      "provided productionExport geometry/config does not match payload-derived export",
    );
  }
}

function checkCrossLayerMutations(
  canonical: CanonicalConstructorContract,
  issues: SystemConsistencyIssue[],
) {
  const { snapshot, payload, production } = canonical;

  if (payload.source && payload.source !== EXPECTED_SUBMIT_SOURCE) {
    pushMismatch(
      issues,
      "cross-layer",
      "unexpected_payload_source",
      `unexpected payload source "${payload.source}" during constructor submit`,
    );
  }

  if (production.previewFingerprint) {
    if (
      !fingerprintsEqual(
        production.previewFingerprint,
        production.payloadDerivedFingerprint,
      )
    ) {
      pushMismatch(
        issues,
        "cross-layer",
        "quote_preview_production_drift",
        "quote production preview export drifted from submit payload production config",
      );
    }
  }

  if (production.previewDimensions) {
    if (
      production.previewDimensions.width !== snapshot.dimensions.width ||
      production.previewDimensions.height !== snapshot.dimensions.height ||
      production.previewDimensions.depth !== snapshot.dimensions.depth
    ) {
      pushMismatch(
        issues,
        "cross-layer",
        "preview_snapshot_dimensions",
        "quote production preview dimensions drifted from snapshot projection",
      );
    }
  }
}

export function validateConstructorSystemConsistency(
  canonical: CanonicalConstructorContract,
): SystemConsistencyIssue[] {
  const issues: SystemConsistencyIssue[] = [];

  checkSnapshotPayloadAlignment(canonical, issues);
  checkQuotePayloadAlignment(canonical, issues);
  checkPayloadProductionAlignment(canonical, issues);
  checkCrossLayerMutations(canonical, issues);

  return issues;
}

export function warnConstructorSystemConsistencyInDev(
  snapshot: ConstructorSnapshot,
  quote: QuoteState,
  payload: OrderPayload,
): SystemConsistencyIssue[] {
  if (process.env.NODE_ENV !== "development") {
    return [];
  }

  const canonical = createCanonicalConstructorSnapshot(snapshot, quote, payload);
  const issues = validateConstructorSystemConsistency(canonical);

  for (const issue of issues) {
    console.warn(`${LOG_PREFIX} [${issue.layer}] ${issue.code}: ${issue.message}`);
  }

  return issues;
}

export {
  createCanonicalConstructorSnapshot,
  extractProductionConfigFingerprint,
  type CanonicalConstructorContract,
} from "./canonicalContract";
