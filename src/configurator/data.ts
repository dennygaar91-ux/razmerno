import materialsConfig from "../config/materials.json";
import facadeStylesConfig from "../config/facade-styles.json";
import hardwareConfig from "../config/hardware.json";
import furniturePresetsConfig from "../config/furniture-presets.json";
import fillingPresetsConfig from "../config/filling-presets.json";

export interface Material {
  id: string;
  name: string;
  vendor: string;
  collection?: string;
  pricePerLiter: number;
  swatch: string;
  faces: [string, string, string];
  recommended?: boolean;
  tag?: string;
}

export interface FacadeStyle {
  id: string;
  name: string;
  description: string;
  priceMultiplier: number;
  icon: "no-handle" | "hidden-handle" | "regular";
}

export interface Hardware {
  id: string;
  vendor: "Hettich" | "Firmax";
  name: string;
  description: string;
  basePrice: number;
  priceFactor: number;
  features: string[];
  recommended?: boolean;
  /** Уровень для упрощённого UI: базовая или комфорт */
  level: "base" | "comfort";
}

export interface FurniturePreset {
  id: "wardrobe" | "dresser" | "nightstand";
  name: string;
  tagline: string;
  fromPrice: number;
  term: string;
  sizes: string;
}

export interface FillingPreset {
  id: string;
  name: string;
  description: string;
  config: { shelves: number; drawers: number; hangingRod: boolean };
}

export const MATERIALS = materialsConfig as Material[];
export const FACADE_STYLES = facadeStylesConfig as FacadeStyle[];
export const HARDWARE = hardwareConfig as Hardware[];
export const FURNITURE_PRESETS = furniturePresetsConfig as FurniturePreset[];
export const FILLING_PRESETS = fillingPresetsConfig as FillingPreset[];
