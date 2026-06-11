import {
  HARDWARE_SUPPLIER_CATALOG,
  type HardwareSupplierCatalog,
  type HardwareSupplierCatalogItem,
} from "./hardwareSupplierCatalog";

export type HardwareSupplierPriceImportRow = {
  sku: string;
  unitPrice: number;
  currency?: "RUB";
  supplierName?: string;
  effectiveFrom?: string;
  sourceDocument?: string;
  note?: string;
};

export type HardwareSupplierPriceImportRowResult = {
  sku: string;
  status: "applied" | "skipped";
  reason: string;
  previousUnitPrice?: number;
  nextUnitPrice?: number;
};

export type HardwareSupplierPriceImportReport = {
  schema: "razmerno.hardware-supplier-price-import.v1";
  totalRows: number;
  appliedRows: number;
  skippedRows: number;
  confirmedSkuCount: number;
  requiresConfirmationSkuCount: number;
  sourceDocument: string | null;
  rows: HardwareSupplierPriceImportRowResult[];
  warnings: string[];
  errors: string[];
};

function normalizeSku(value: string): string {
  return value.trim().toLowerCase();
}

function isValidPrice(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function appendNote(item: HardwareSupplierCatalogItem, row: HardwareSupplierPriceImportRow): string {
  const parts = [
    item.notes,
    `Цена подтверждена импортом прайса${row.effectiveFrom ? ` от ${row.effectiveFrom}` : ""}.`,
  ];
  if (row.sourceDocument) parts.push(`Источник: ${row.sourceDocument}.`);
  if (row.note) parts.push(row.note);
  return parts.filter(Boolean).join(" ");
}

export function applyHardwareSupplierPriceImport(input: {
  rows: HardwareSupplierPriceImportRow[];
  catalog?: HardwareSupplierCatalog;
  sourceDocument?: string;
}): { catalog: HardwareSupplierCatalogItem[]; report: HardwareSupplierPriceImportReport } {
  const baseCatalog = [...(input.catalog ?? HARDWARE_SUPPLIER_CATALOG)];
  const catalogBySku = new Map(baseCatalog.map((item) => [normalizeSku(item.sku), item]));
  const importedBySku = new Map<string, HardwareSupplierPriceImportRow>();
  const rowResults: HardwareSupplierPriceImportRowResult[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  for (const row of input.rows) {
    const sku = normalizeSku(row.sku);
    if (!sku) {
      errors.push("Строка прайса без SKU пропущена.");
      rowResults.push({ sku: row.sku, status: "skipped", reason: "missing-sku" });
      continue;
    }
    if (row.currency && row.currency !== "RUB") {
      errors.push(`${row.sku}: поддерживается только RUB.`);
      rowResults.push({ sku: row.sku, status: "skipped", reason: "unsupported-currency" });
      continue;
    }
    if (!isValidPrice(row.unitPrice)) {
      errors.push(`${row.sku}: цена должна быть больше 0.`);
      rowResults.push({ sku: row.sku, status: "skipped", reason: "invalid-price" });
      continue;
    }
    if (!catalogBySku.has(sku)) {
      errors.push(`${row.sku}: SKU не найден в foundation-каталоге фурнитуры.`);
      rowResults.push({ sku: row.sku, status: "skipped", reason: "unknown-sku" });
      continue;
    }
    if (importedBySku.has(sku)) {
      warnings.push(`${row.sku}: найден дубль SKU, применена последняя строка.`);
    }
    importedBySku.set(sku, row);
  }

  const nextCatalog = baseCatalog.map((item) => {
    const row = importedBySku.get(normalizeSku(item.sku));
    if (!row) return item;
    rowResults.push({
      sku: item.sku,
      status: "applied",
      reason: "confirmed-supplier-price",
      previousUnitPrice: item.unitPrice,
      nextUnitPrice: Math.round(row.unitPrice),
    });
    return {
      ...item,
      name: row.supplierName ? `${item.name} · ${row.supplierName}` : item.name,
      unitPrice: Math.round(row.unitPrice),
      priceSource: "supplier-price-list" as const,
      status: "confirmed" as const,
      requiresPriceConfirmation: false,
      notes: appendNote(item, { ...row, sourceDocument: row.sourceDocument ?? input.sourceDocument }),
    } satisfies HardwareSupplierCatalogItem;
  });

  const confirmedSkuCount = nextCatalog.filter((item) => item.status === "confirmed").length;
  const requiresConfirmationSkuCount = nextCatalog.filter((item) => item.requiresPriceConfirmation).length;
  const appliedRows = rowResults.filter((row) => row.status === "applied").length;
  const skippedRows = rowResults.filter((row) => row.status === "skipped").length;

  return {
    catalog: nextCatalog,
    report: {
      schema: "razmerno.hardware-supplier-price-import.v1",
      totalRows: input.rows.length,
      appliedRows,
      skippedRows,
      confirmedSkuCount,
      requiresConfirmationSkuCount,
      sourceDocument: input.sourceDocument ?? input.rows.find((row) => row.sourceDocument)?.sourceDocument ?? null,
      rows: rowResults.sort((a, b) => a.sku.localeCompare(b.sku)),
      warnings: warnings.sort(),
      errors: errors.sort(),
    },
  };
}

export function buildHardwareSupplierPriceImportTemplate(
  catalog: HardwareSupplierCatalog = HARDWARE_SUPPLIER_CATALOG,
): HardwareSupplierPriceImportRow[] {
  return catalog.map((item) => ({
    sku: item.sku,
    unitPrice: item.unitPrice,
    currency: "RUB" as const,
    supplierName: item.vendor,
    note: item.requiresPriceConfirmation ? "Требуется заменить foundation estimate на реальный прайс поставщика." : "Цена подтверждена.",
  }));
}
