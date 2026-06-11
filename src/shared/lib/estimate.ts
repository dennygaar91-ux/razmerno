import pricingConfig from "../../config/pricing.json";
import { quickEstimateCore } from "./pricing-core";

/**
 * Легкая оценка для лендинга.
 * Не тянет полный прайс-каталог в главный пакет сайта.
 * Точный расчет остается в основном движке стоимости конструктора.
 */
export function quickEstimate(width: number, height: number, depth: number): number {
  return quickEstimateCore(pricingConfig, width, height, depth);
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₽`;
}
