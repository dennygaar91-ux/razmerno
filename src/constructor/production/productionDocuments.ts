import type { ProductionExportPackage } from "./types.js";
import { buildBasisJsonScript } from "./basisJson.js";

export interface ProductionDocumentBundle {
  schema: "razmerno.production-documents.v1";
  customerHtml: string;
  assemblyHtml: string;
  productionSummaryHtml: string;
  basisJsonFileName: string;
  basisJson: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderList(items: string[]): string {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export function buildProductionDocumentBundle(pack: ProductionExportPackage, orderId = "order"): ProductionDocumentBundle {
  const basisJson = JSON.stringify(buildBasisJsonScript(pack), null, 2);
  const dimensions = pack.project.dimensions;
  const validationWarnings = pack.validation.warnings.slice(0, 8);
  const assemblySteps = [
    "Разложите детали по маркировке.",
    "Соберите корпус на конфирматы и шканты.",
    "Установите полки и внутреннее наполнение.",
    "Закрепите фасады и проверьте зазоры.",
    "Проверьте диагонали и устойчивость изделия.",
  ];

  const customerHtml = `
    <section>
      <h1>Размерно — смета и комплект</h1>
      <p>Изделие: ${escapeHtml(pack.project.productType)}</p>
      <p>Размеры: ${dimensions.widthMm} × ${dimensions.heightMm} × ${dimensions.depthMm} мм</p>
      <p>Панелей: ${pack.productionModel.totals.panelCount}</p>
      <p>Фурнитуры: ${pack.productionModel.totals.hardwareCount}</p>
    </section>
  `;

  const assemblyHtml = `
    <section>
      <h1>Красивая схема сборки</h1>
      <p>Это foundation для будущей визуальной инструкции. Сейчас здесь хранится структурированный порядок сборки.</p>
      ${renderList(assemblySteps)}
    </section>
  `;

  const productionSummaryHtml = `
    <section>
      <h1>Production summary</h1>
      <p>Status: ${escapeHtml(pack.review.status)}</p>
      <p>Factory profile: ${escapeHtml(pack.factoryProfile.id)}</p>
      <p>Basis status: ${escapeHtml(pack.basis.status)}</p>
      <p>Warnings: ${pack.validation.warnings.length}</p>
      ${validationWarnings.length > 0 ? renderList(validationWarnings) : "<p>Нет предупреждений.</p>"}
    </section>
  `;

  return {
    schema: "razmerno.production-documents.v1",
    customerHtml,
    assemblyHtml,
    productionSummaryHtml,
    basisJsonFileName: `${orderId}-basis.json`,
    basisJson,
  };
}
