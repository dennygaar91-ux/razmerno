import type { MaterialCatalogItem, MaterialKind, MaterialOptionView, MaterialUsage } from "./materialTypes";

export const ldspMaterials = [
  {
    id: "ldsp-egger-h1910-buk-lugovoy-st9",
    kind: "ldsp",
    brand: "Egger",
    code: "H1910 ST9",
    name: "Бук луговой",
    displayName: "Egger H1910 Бук луговой ST9",
    thicknessMm: 16,
    textureUrl: "/decors/ldsp/egger-h1910-buk-lugovoy-st9.png",
    fallbackHex: "#d7b885",
    colorFamily: "wood-light",
    usage: ["body", "facade"],
  },
  {
    id: "ldsp-egger-h3395-dub-korbridzh-naturalnyy-st12",
    kind: "ldsp",
    brand: "Egger",
    code: "H3395 ST12",
    name: "Дуб Корбридж натуральный",
    displayName: "Egger H3395 Дуб Корбридж натуральный ST12",
    thicknessMm: 16,
    textureUrl: "/decors/ldsp/egger-h3395-dub-korbridzh-naturalnyy-st12.png",
    fallbackHex: "#bd8951",
    colorFamily: "wood-warm",
    usage: ["body", "facade"],
  },
  {
    id: "ldsp-egger-h3734-oreh-dizhon-naturalnyy-st9",
    kind: "ldsp",
    brand: "Egger",
    code: "H3734 ST9",
    name: "Орех Дижон натуральный",
    displayName: "Egger H3734 Орех Дижон натуральный ST9",
    thicknessMm: 16,
    textureUrl: "/decors/ldsp/egger-h3734-oreh-dizhon-naturalnyy-st9.png",
    fallbackHex: "#a47045",
    colorFamily: "wood-warm",
    usage: ["body", "facade"],
  },
  {
    id: "ldsp-egger-u708-svetlo-seryy-st9",
    kind: "ldsp",
    brand: "Egger",
    code: "U708 ST9",
    name: "Светло-серый",
    displayName: "Egger U708 Светло-серый ST9",
    thicknessMm: 16,
    textureUrl: "/decors/ldsp/egger-u708-svetlo-seryy-st9.png",
    fallbackHex: "#b9bdc2",
    colorFamily: "gray",
    usage: ["body", "facade"],
  },
  {
    id: "ldsp-egger-u780-seryy-monumentalnyy-st9",
    kind: "ldsp",
    brand: "Egger",
    code: "U780 ST9",
    name: "Серый монументальный",
    displayName: "Egger U780 Серый монументальный ST9",
    thicknessMm: 16,
    textureUrl: "/decors/ldsp/egger-u780-seryy-monumentalnyy-st9.png",
    fallbackHex: "#596171",
    colorFamily: "dark-gray",
    usage: ["body", "facade"],
  },
  {
    id: "ldsp-egger-u961-chernyy-grafit-st7",
    kind: "ldsp",
    brand: "Egger",
    code: "U961 ST7",
    name: "Чёрный графит",
    displayName: "Egger U961 Чёрный графит ST7",
    thicknessMm: 16,
    textureUrl: "/decors/ldsp/egger-u961-chernyy-grafit-st7.png",
    fallbackHex: "#252734",
    colorFamily: "black",
    usage: ["body", "facade"],
  },
  {
    id: "ldsp-egger-w960-belyy-klassicheskiy-sm",
    kind: "ldsp",
    brand: "Egger",
    code: "W960 SM",
    name: "Белый классический",
    displayName: "Egger W960 Белый классический SM",
    thicknessMm: 16,
    textureUrl: "/decors/ldsp/egger-w960-belyy-klassicheskiy-sm.png",
    fallbackHex: "#f4f1ea",
    colorFamily: "white",
    usage: ["body", "facade"],
  },
] as const satisfies readonly MaterialCatalogItem[];

export const mdfMaterials = [
  {
    id: "mdf-egger-r006-belyy-kremovyy-ms",
    kind: "mdf",
    brand: "Egger",
    code: "R006 MS",
    name: "Белый кремовый",
    displayName: "Egger R006 Белый кремовый MS",
    thicknessMm: 18,
    textureUrl: "/decors/mdf/egger-r006-belyy-kremovyy-ms.png",
    fallbackHex: "#eee9dd",
    colorFamily: "cream",
    usage: ["facade"],
  },
  {
    id: "mdf-egger-r009-teplyy-seryy-ms",
    kind: "mdf",
    brand: "Egger",
    code: "R009 MS",
    name: "Тёплый серый",
    displayName: "Egger R009 Тёплый серый MS",
    thicknessMm: 18,
    textureUrl: "/decors/mdf/egger-r009-teplyy-seryy-ms.png",
    fallbackHex: "#b3aba1",
    colorFamily: "gray",
    usage: ["facade"],
  },
  {
    id: "mdf-egger-r010-seryy-grafitovyy-ms",
    kind: "mdf",
    brand: "Egger",
    code: "R010 MS",
    name: "Серый графитовый",
    displayName: "Egger R010 Серый графитовый MS",
    thicknessMm: 18,
    textureUrl: "/decors/mdf/egger-r010-seryy-grafitovyy-ms.png",
    fallbackHex: "#50535d",
    colorFamily: "dark-gray",
    usage: ["facade"],
  },
  {
    id: "mdf-egger-r011-myagkiy-fistashkovyy-ms",
    kind: "mdf",
    brand: "Egger",
    code: "R011 MS",
    name: "Мягкий фисташковый",
    displayName: "Egger R011 Мягкий фисташковый MS",
    thicknessMm: 18,
    textureUrl: "/decors/mdf/egger-r011-myagkiy-fistashkovyy-ms.png",
    fallbackHex: "#aeb7a3",
    colorFamily: "green",
    usage: ["facade"],
  },
  {
    id: "mdf-egger-r016-zelenyy-kiparis-ms",
    kind: "mdf",
    brand: "Egger",
    code: "R016 MS",
    name: "Зелёный кипарис",
    displayName: "Egger R016 Зелёный кипарис MS",
    thicknessMm: 18,
    textureUrl: "/decors/mdf/egger-r016-zelenyy-kiparis-ms.png",
    fallbackHex: "#53665b",
    colorFamily: "green",
    usage: ["facade"],
  },
  {
    id: "mdf-egger-r019-zheltyy-yantarnyy-ms",
    kind: "mdf",
    brand: "Egger",
    code: "R019 MS",
    name: "Жёлтый янтарный",
    displayName: "Egger R019 Жёлтый янтарный MS",
    thicknessMm: 18,
    textureUrl: "/decors/mdf/egger-r019-zheltyy-yantarnyy-ms.png",
    fallbackHex: "#c79d45",
    colorFamily: "yellow",
    usage: ["facade"],
  },
] as const satisfies readonly MaterialCatalogItem[];

export const hdfMaterials = [
  {
    id: "hdf-kronospan-0522-bezhevyy",
    kind: "hdf",
    brand: "Kronospan",
    code: "0522",
    name: "Бежевый",
    displayName: "Kronospan 0522 Бежевый",
    thicknessMm: 3,
    textureUrl: "/decors/hdf/kronospan-0522-bezhevyy.jpg",
    fallbackHex: "#d3c2a9",
    colorFamily: "beige",
    usage: ["backPanel"],
  },
  {
    id: "hdf-kronospan-k101-belyy-fasadnyy",
    kind: "hdf",
    brand: "Kronospan",
    code: "K101",
    name: "Белый фасадный",
    displayName: "Kronospan K101 Белый фасадный",
    thicknessMm: 3,
    textureUrl: "/decors/hdf/kronospan-k101-belyy-fasadnyy.jpg",
    fallbackHex: "#efeee8",
    colorFamily: "white",
    usage: ["backPanel"],
  },
  {
    id: "hdf-kronospan-k164-antratsit",
    kind: "hdf",
    brand: "Kronospan",
    code: "K164",
    name: "Антрацит",
    displayName: "Kronospan K164 Антрацит",
    thicknessMm: 3,
    textureUrl: "/decors/hdf/kronospan-k164-antratsit.jpg",
    fallbackHex: "#3d4248",
    colorFamily: "dark-gray",
    usage: ["backPanel"],
  },
  {
    id: "hdf-kronospan-k190-chernyy",
    kind: "hdf",
    brand: "Kronospan",
    code: "K190",
    name: "Чёрный",
    displayName: "Kronospan K190 Чёрный",
    thicknessMm: 3,
    textureUrl: "/decors/hdf/kronospan-k190-chernyy.jpg",
    fallbackHex: "#1f2128",
    colorFamily: "black",
    usage: ["backPanel"],
  },
  {
    id: "hdf-kronospan-k535-dub-barokko-zolotoy",
    kind: "hdf",
    brand: "Kronospan",
    code: "K535",
    name: "Дуб Барокко золотой",
    displayName: "Kronospan K535 Дуб Барокко золотой",
    thicknessMm: 3,
    textureUrl: "/decors/hdf/kronospan-k535-dub-barokko-zolotoy.jpg",
    fallbackHex: "#b98243",
    colorFamily: "wood-warm",
    usage: ["backPanel"],
  },
  {
    id: "hdf-kronospan-k536-dub-barokko-yantarnyy",
    kind: "hdf",
    brand: "Kronospan",
    code: "K536",
    name: "Дуб Барокко янтарный",
    displayName: "Kronospan K536 Дуб Барокко янтарный",
    thicknessMm: 3,
    textureUrl: "/decors/hdf/kronospan-k536-dub-barokko-yantarnyy.jpg",
    fallbackHex: "#9d6a3a",
    colorFamily: "wood-warm",
    usage: ["backPanel"],
  },
] as const satisfies readonly MaterialCatalogItem[];

export const materialCatalog = [...ldspMaterials, ...mdfMaterials, ...hdfMaterials] as const;

export type MaterialId = (typeof materialCatalog)[number]["id"];

export const legacyMaterialAliases = {
  white: "ldsp-egger-w960-belyy-klassicheskiy-sm",
  lightwood: "ldsp-egger-h1910-buk-lugovoy-st9",
  oak: "ldsp-egger-h3395-dub-korbridzh-naturalnyy-st12",
  sand: "ldsp-egger-h3734-oreh-dizhon-naturalnyy-st9",
  graphite: "ldsp-egger-u780-seryy-monumentalnyy-st9",
  black: "ldsp-egger-u961-chernyy-grafit-st7",
  gray: "ldsp-egger-u708-svetlo-seryy-st9",
} as const;

export type LegacyMaterialToken = keyof typeof legacyMaterialAliases;
export type MaterialToken = MaterialId | LegacyMaterialToken;

export function resolveMaterialId(value: string | undefined | null): MaterialId {
  const fallback = "ldsp-egger-w960-belyy-klassicheskiy-sm" as MaterialId;
  if (!value) return fallback;
  if (value in legacyMaterialAliases) return legacyMaterialAliases[value as LegacyMaterialToken] as MaterialId;
  const match = materialCatalog.find((material) => material.id === value);
  return (match?.id ?? fallback) as MaterialId;
}

export function getMaterialById(value: string | undefined | null): MaterialCatalogItem | undefined {
  const id = resolveMaterialId(value);
  return materialCatalog.find((material) => material.id === id);
}

export function getRequiredMaterial(value: string | undefined | null): MaterialCatalogItem {
  return getMaterialById(value) ?? ldspMaterials[6];
}

export function getMaterialsByKind(kind: MaterialKind): MaterialCatalogItem[] {
  return materialCatalog.filter((material) => material.kind === kind);
}

export function getMaterialsByUsage(usage: MaterialUsage): MaterialCatalogItem[] {
  return materialCatalog.filter((material) => (material.usage as readonly MaterialUsage[]).includes(usage));
}

export const bodyMaterials = getMaterialsByUsage("body");
export const facadeMaterials = getMaterialsByUsage("facade");
export const backPanelMaterials = getMaterialsByUsage("backPanel");

export function isBodyMaterial(value: string | undefined | null): boolean {
  const material = getMaterialById(value);
  if (!material) return false;
  return (material.usage as readonly MaterialUsage[]).includes("body") && material.kind === "ldsp";
}

export function isFacadeMaterial(value: string | undefined | null): boolean {
  const material = getMaterialById(value);
  if (!material) return false;
  return (material.usage as readonly MaterialUsage[]).includes("facade") && (material.kind === "ldsp" || material.kind === "mdf");
}

export function toMaterialOption(material: MaterialCatalogItem): MaterialOptionView {
  return {
    ...material,
    token: material.id,
    label: material.name,
    materialId: material.id,
    dotClass: `rzm-constructor-material-dot--${material.kind}`,
  };
}

export const bodyMaterialOptions = bodyMaterials.map(toMaterialOption);
export const facadeMaterialOptions = facadeMaterials.map(toMaterialOption);
