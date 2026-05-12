import type { CabinetPart, CalculationPrice, CabinetHardware, CabinetConfig } from "../types";
import { getMaterialById } from "../materials";

function round(value: number) {
  return Math.round(value);
}

export function calculatePrice(
  parts: CabinetPart[],
  config: CabinetConfig
): CalculationPrice {
  const materialCost = parts.reduce((sum, part) => {
    const material = getMaterialById(part.materialId);
    const area = (part.size.width * part.size.height) / 1_000_000;
    const unitPrice =
      material.type === "hdf"
        ? 1500
        : material.type === "mdf"
        ? 1800
        : 2200;

    return sum + area * unitPrice;
  }, 0);

  const drawers = config.sections.reduce((sum, section) => {
    const drawerItem = section.items.find((item) => item.type === "drawer");
    return sum + (drawerItem?.count || 0);
  }, 0);

  const shelves = config.sections.reduce((sum, section) => {
    const shelfItem = section.items.find((item) => item.type === "shelf");
    return sum + (shelfItem?.count || 0);
  }, 0);

  const hangerRails = config.sections.reduce((sum, section) => {
    const railItem = section.items.find((item) => item.type === "hanger_rail");
    return sum + (railItem?.count || 0);
  }, 0);

  const showHandles = config.facade.enabled && config.facade.openingType === "with_handles";
  const legsCost = config.options?.hasLegs ? 4 * 180 : 0;
  const handleCost = showHandles ? drawers * 250 : 0;
  const brandMultiplier = config.options?.hardwareBrand === "Firmax" ? 1.08 : 1;

  const hardwareCost =
    (shelves * 4 * 55 + drawers * 2 * 1200 + handleCost + legsCost + hangerRails * 40) * brandMultiplier + 16 * 35;

  const cutting = materialCost * 0.09;
  const edging = materialCost * 0.06;
  const drilling = hardwareCost * 0.08;
  const packaging = 1200;
  const delivery = 1500;

  const subtotal = materialCost + hardwareCost + cutting + edging + drilling + packaging + delivery;
  const vat = subtotal * 0.2;
  const total = subtotal + vat;

  return {
    materials: round(materialCost),
    hardware: round(hardwareCost),
    cutting: round(cutting),
    edging: round(edging),
    drilling: round(drilling),
    packaging: round(packaging),
    delivery: round(delivery),
    vat: round(vat),
    total: round(total)
  };
}
