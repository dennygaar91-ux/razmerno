import type { ProductionExportPackage } from "./types.js";

export interface BasisJsonPanel {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  thicknessMm: number;
  materialId: string;
  role: string;
}

export interface BasisJsonOperation {
  id: string;
  type: "drilling" | "edge-banding" | "hardware";
  panelId?: string;
  payload: Record<string, unknown>;
}

export interface BasisJsonScript {
  schema: "razmerno.basis-json.v1";
  sourceOrder: {
    configVersion: string;
    createdAt: string;
  };
  project: {
    productType: string;
    widthMm: number;
    heightMm: number;
    depthMm: number;
  };
  panels: BasisJsonPanel[];
  operations: BasisJsonOperation[];
  manualPlan: ProductionExportPackage["basis"]["plan"];
  review: ProductionExportPackage["review"];
}

export function buildBasisJsonScript(pack: ProductionExportPackage): BasisJsonScript {
  return {
    schema: "razmerno.basis-json.v1",
    sourceOrder: {
      configVersion: pack.meta.configVersion,
      createdAt: new Date().toISOString(),
    },
    project: {
      productType: pack.project.productType,
      widthMm: pack.project.dimensions.widthMm,
      heightMm: pack.project.dimensions.heightMm,
      depthMm: pack.project.dimensions.depthMm,
    },
    panels: pack.productionModel.panels.map((panel) => ({
      id: panel.id,
      name: panel.name,
      widthMm: panel.widthMm,
      heightMm: panel.heightMm,
      thicknessMm: panel.thicknessMm,
      materialId: panel.materialId,
      role: panel.role,
    })),
    operations: [
      ...pack.productionModel.drilling.map((item) => ({
        id: item.id,
        type: "drilling" as const,
        panelId: item.panelId,
        payload: item as unknown as Record<string, unknown>,
      })),
      ...pack.productionModel.edgeBanding.map((item, index) => ({
        id: `edge-${index + 1}-${item.panelId}-${item.side}`,
        type: "edge-banding" as const,
        panelId: item.panelId,
        payload: item as unknown as Record<string, unknown>,
      })),
      ...pack.productionModel.hardware.map((item) => ({
        id: item.id,
        type: "hardware" as const,
        payload: item as unknown as Record<string, unknown>,
      })),
    ],
    manualPlan: pack.basis.plan,
    review: pack.review,
  };
}

export function serializeBasisJson(pack: ProductionExportPackage): string {
  return JSON.stringify(buildBasisJsonScript(pack), null, 2);
}
