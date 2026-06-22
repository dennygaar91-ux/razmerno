import type { ProductionExportPackage } from "./types.js";
import { buildProductionDocumentBundle } from "./productionDocuments.js";

export interface ProductionEmailAttachment {
  filename: string;
  contentType: "application/json" | "text/html";
  content: string;
}

export function buildProductionEmailAttachments(
  pack: ProductionExportPackage,
  orderId: string,
): ProductionEmailAttachment[] {
  const bundle = buildProductionDocumentBundle(pack, orderId);

  return [
    {
      filename: bundle.basisJsonFileName,
      contentType: "application/json",
      content: bundle.basisJson,
    },
    {
      filename: `${orderId}-customer-summary.html`,
      contentType: "text/html",
      content: bundle.customerHtml,
    },
    {
      filename: `${orderId}-assembly-summary.html`,
      contentType: "text/html",
      content: bundle.assemblyHtml,
    },
    {
      filename: `${orderId}-production-summary.html`,
      contentType: "text/html",
      content: bundle.productionSummaryHtml,
    },
  ];
}
