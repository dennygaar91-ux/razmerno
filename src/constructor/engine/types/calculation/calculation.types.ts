import type { CabinetConfig } from "../cabinet";
import type { CabinetPart } from "../part";
import type { CabinetHardware } from "../hardware";
import type { CabinetHole } from "../hole";
import type { ValidationMessage } from "./validation.types";

export type CalculationPrice = {
  materials: number;
  hardware: number;
  cutting: number;
  edging: number;
  drilling: number;
  packaging: number;
  delivery: number;
  vat: number;
  total: number;
};

export type CalculationResult = {
  config: CabinetConfig;
  parts: CabinetPart[];
  hardware: CabinetHardware[];
  holes: CabinetHole[];
  validation: ValidationMessage[];
  price?: CalculationPrice;
};
