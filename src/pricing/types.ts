export type PriceItemType =
  | "board"
  | "edge"
  | "panel"
  | "worktop"
  | "service";

export interface RawPriceItem {
  itemType: PriceItemType;
  producer?: string;
  brand?: string;
  collection?: string;
  article?: string;
  name: string;
  decorName?: string;
  texture?: string;
  category?: string;
  thicknessMm?: number;
  widthMm?: number;
  lengthMm?: number;
  unit: string;
  sourcePrice: number;
  markupMultiplier: number;
  retailPrice: number;
  availabilityStatus?: string;
  sourceSheet: string;
  sourceRow: number;
  sourceNote?: string;
}
