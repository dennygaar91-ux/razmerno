import { fromConfigState } from "../geometry/index.js";
import type { ConfigState } from "../../configurator/context.js";
import type { ProductionExportPackage } from "./types.js";
import { buildProductionExportPackage } from "./orderExportPackage.js";

export function buildProductionExportFromConfigState(
  state: ConfigState,
  configVersion = "rzm.config.v3",
): ProductionExportPackage {
  const project = fromConfigState(state, configVersion);
  return buildProductionExportPackage(project, "configurator");
}

export { buildProductionExportFromOrder } from "./orderExportPackage.js";
export { buildProductionExportFromPayload } from "./orderExportPackage.js";
export type { ProductionExportPackage } from "./types.js";
