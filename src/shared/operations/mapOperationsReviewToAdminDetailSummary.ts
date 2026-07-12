import type { AdminOrderDetailSummary } from "../../admin/orderSummary";
import { formatOperationsDate } from "./formatOperations";
import type { OperationsOrderReview } from "./reviewTypes";

export function mapOperationsReviewToAdminDetailSummary(review: OperationsOrderReview): AdminOrderDetailSummary {
  return {
    orderId: review.orderId,
    createdAt: formatOperationsDate(review.createdAt),
    status: review.status,
    managerEmailStatus: review.managerEmailStatus,
    customerEmailStatus: review.customerEmailStatus,
    customerNameMasked: review.customerNameMasked,
    phoneMasked: review.phoneMasked,
    emailMasked: review.emailMasked,
    productType: review.productType,
    dimensionsSummary: review.dimensionsSummary,
    materialsSummary: review.materialsSummary,
    totalPrice: review.totalPriceLabel,
    pricingLabel: review.pricingLabel,
    pricingSource: review.pricingSource,
    pricingSnapshotSummary: review.pricingSnapshotSummary,
    priceBreakdownSummary: review.priceBreakdownSummary,
    deliverySummary: review.deliverySummary,
    assemblySummary: review.assemblySummary,
    assemblyBasePriceSummary: review.assemblyBasePriceSummary,
    productionReviewStatus: review.productionReviewStatus,
    basisStatus: review.basisStatus,
    validationErrorsCount: review.validationErrorsCount,
    validationWarningsCount: review.validationWarningsCount,
  };
}
