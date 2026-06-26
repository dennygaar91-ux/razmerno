import type { AdminOrderRow, AdminProductionDetail } from "./types";

export type AdminOrderDetailSummary = {
  orderId: string;
  createdAt: string;
  status: string;
  managerEmailStatus: string;
  customerEmailStatus: string;
  customerNameMasked: string;
  phoneMasked: string;
  emailMasked: string;
  productType: string;
  dimensionsSummary: string;
  materialsSummary: string;
  totalPrice: string;
  pricingLabel: string;
  pricingSource: string;
  deliverySummary: string;
  assemblySummary: string;
  productionReviewStatus: string;
  basisStatus: string;
  validationErrorsCount: number;
  validationWarningsCount: number;
};

const DIMENSIONS_PATTERN = /(\d+)\s*[\u00D7x]\s*(\d+)\s*[\u00D7x]\s*(\d+)/u;
const MATERIALS_NOT_AVAILABLE = "not available in current admin payload";
const PRICING_NOT_VERIFIED = "pricing source not verified";
const BASIS_NOT_VERIFIED = "not verified";
const BASIS_MANUAL_REVIEW = "manual review required";

export function maskEmail(value: string | null | undefined): string {
  const clean = value?.trim();
  if (!clean || !clean.includes("@")) {
    return "email скрыт";
  }
  const [local, domain] = clean.split("@");
  if (!local || !domain) {
    return "email скрыт";
  }
  return `${local.slice(0, 1)}***@${domain}`;
}

export function maskPhone(value: string | null | undefined): string {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (digits.length < 4) {
    return "+7 *** ***-**-**";
  }
  return `+7 *** ***-${digits.slice(-2).padStart(2, "*")}`;
}

export function maskCustomerName(value: string | null | undefined): string {
  const clean = value?.trim();
  if (!clean) {
    return "Клиент";
  }
  if (clean.length <= 2) {
    return `${clean[0] ?? "*"}*`;
  }
  return `${clean.slice(0, 1)}${"•".repeat(Math.min(clean.length - 1, 6))}`;
}

function parseProductType(product: string): string {
  if (product.startsWith("Комод")) return "Комод";
  if (product.startsWith("Тумба")) return "Тумба";
  if (product.startsWith("Шкаф")) return "Шкаф";
  return product.split(" ")[0] ?? "Изделие";
}

function parseDimensionsSummary(product: string, dimensions?: AdminOrderRow["dimensions"]): string {
  if (dimensions?.widthMm && dimensions.heightMm && dimensions.depthMm) {
    return `${dimensions.widthMm}×${dimensions.heightMm}×${dimensions.depthMm} мм`;
  }

  const match = product.match(DIMENSIONS_PATTERN);
  if (match) {
    return `${match[1]}×${match[2]}×${match[3]} мм`;
  }

  return "не указано";
}

export function summarizeProductionInspection(detail: AdminProductionDetail | null | undefined): {
  productionReviewStatus: string;
  basisStatus: string;
  validationErrorsCount: number;
  validationWarningsCount: number;
} {
  const production = detail?.productionExport;
  if (!production) {
    return {
      productionReviewStatus: "—",
      basisStatus: BASIS_NOT_VERIFIED,
      validationErrorsCount: 0,
      validationWarningsCount: 0,
    };
  }

  const validationErrors = production.validation?.errors?.length ?? 0;
  const validationWarnings = production.validation?.warnings?.length ?? 0;
  const autoRejects = production.rules?.autoRejects?.length ?? 0;
  const autoWarnings = production.rules?.autoWarnings?.length ?? 0;

  return {
    productionReviewStatus: production.review?.status ?? "requires-review",
    basisStatus: BASIS_MANUAL_REVIEW,
    validationErrorsCount: validationErrors + autoRejects,
    validationWarningsCount: validationWarnings + autoWarnings,
  };
}

export function summarizeOrderForAdmin(
  order: AdminOrderRow,
  productionDetail?: AdminProductionDetail | null,
): AdminOrderDetailSummary {
  const production = summarizeProductionInspection(productionDetail);

  return {
    orderId: order.id,
    createdAt: order.createdAt,
    status: order.status,
    managerEmailStatus: order.managerEmail,
    customerEmailStatus: order.customerEmail,
    customerNameMasked: maskCustomerName(order.customer),
    phoneMasked: maskPhone(order.phone),
    emailMasked: maskEmail(order.email),
    productType: order.productType ?? parseProductType(order.product),
    dimensionsSummary: parseDimensionsSummary(order.product, order.dimensions),
    materialsSummary: order.materialsSummary ?? MATERIALS_NOT_AVAILABLE,
    totalPrice: order.total,
    pricingLabel: order.pricingLabel ?? "demo / not verified",
    pricingSource: order.pricingSource ?? PRICING_NOT_VERIFIED,
    deliverySummary: order.delivery,
    assemblySummary: order.assembly,
    ...production,
  };
}

export function summaryContainsRawPii(summary: AdminOrderDetailSummary, raw: { email?: string; phone?: string }): boolean {
  const serialized = JSON.stringify(summary);
  if (raw.email && raw.email.length > 3 && serialized.includes(raw.email)) {
    return true;
  }
  if (raw.phone) {
    const digits = raw.phone.replace(/\D/g, "");
    if (digits.length >= 6 && serialized.includes(digits)) {
      return true;
    }
  }
  return false;
}
