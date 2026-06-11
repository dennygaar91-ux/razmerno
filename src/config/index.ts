import manifest from "./manifest.json";
import materials from "./materials.json";
import facadeStyles from "./facade-styles.json";
import hardware from "./hardware.json";
import furniturePresets from "./furniture-presets.json";
import fillingPresets from "./filling-presets.json";
import limits from "./limits.json";
import pricing from "./pricing.json";

export const CONFIG_SNAPSHOT = {
  manifest,
  materials,
  facadeStyles,
  hardware,
  furniturePresets,
  fillingPresets,
  limits,
  pricing,
} as const;

export type ConfigSnapshot = typeof CONFIG_SNAPSHOT;
