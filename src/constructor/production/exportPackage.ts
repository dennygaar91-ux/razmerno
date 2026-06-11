import { fromConfigState } from "../geometry";
import type { ConfigState } from "../../configurator/context";
import type { ProductionExportPackage } from "./types";
import { buildProductionExportPackage } from "./orderExportPackage";

export function buildProductionExportFromConfigState(
  state: ConfigState,
  configVersion = "rzm.config.v3",
): ProductionExportPackage {
  const project = fromConfigState(state, configVersion);
  return buildProductionExportPackage(project, "configurator");
}

export { buildProductionExportFromOrder } from "./orderExportPackage";
export type { ProductionExportPackage } from "./types";
