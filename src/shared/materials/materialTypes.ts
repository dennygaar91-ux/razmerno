export type MaterialKind = "ldsp" | "mdf" | "hdf";
export type MaterialBrand = "Egger" | "Kronospan";
export type MaterialUsage = "body" | "facade" | "backPanel";

export type MaterialColorFamily =
  | "white"
  | "cream"
  | "beige"
  | "wood-light"
  | "wood-warm"
  | "gray"
  | "dark-gray"
  | "black"
  | "green"
  | "yellow";

export type MaterialCatalogItem = {
  id: string;
  kind: MaterialKind;
  brand: MaterialBrand;
  code: string;
  name: string;
  displayName: string;
  thicknessMm: number;
  textureUrl: string;
  fallbackHex: string;
  colorFamily: MaterialColorFamily;
  usage: MaterialUsage[];
};

export type MaterialOptionView = MaterialCatalogItem & {
  token: string;
  label: string;
  materialId: string;
  dotClass: string;
};
