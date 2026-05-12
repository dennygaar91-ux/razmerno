import type { CabinetMaterial } from "../../types/material";

export const materialCatalog: Record<string, CabinetMaterial> = {
  egger_w980_16: {
    id: "egger_w980_16",
    type: "ldsp",
    name: "Egger W980",
    brand: "Egger",
    thickness: 16,
    textureUrl: ""
  },
  kronospan_oak_16: {
    id: "kronospan_oak_16",
    type: "ldsp",
    name: "Kronospan Oak",
    brand: "Kronospan",
    thickness: 16,
    textureUrl: ""
  },
  white_ldsp_16: {
    id: "white_ldsp_16",
    type: "ldsp",
    name: "Белый глянец",
    brand: "Other",
    thickness: 16,
    textureUrl: ""
  },
  anthracite_ldsp_16: {
    id: "anthracite_ldsp_16",
    type: "ldsp",
    name: "Антрацит",
    brand: "Other",
    thickness: 16,
    textureUrl: ""
  },
  mdf_white_18: {
    id: "mdf_white_18",
    type: "mdf",
    name: "МДФ Белый",
    brand: "Other",
    thickness: 18,
    textureUrl: ""
  },
  mdf_graphite_18: {
    id: "mdf_graphite_18",
    type: "mdf",
    name: "МДФ Графит",
    brand: "Other",
    thickness: 18,
    textureUrl: ""
  },
  mdf_beige_18: {
    id: "mdf_beige_18",
    type: "mdf",
    name: "МДФ Кашемир",
    brand: "Other",
    thickness: 18,
    textureUrl: ""
  },
  mdf_olive_18: {
    id: "mdf_olive_18",
    type: "mdf",
    name: "МДФ Олива",
    brand: "Other",
    thickness: 18,
    textureUrl: ""
  },
  hdf_white_3: {
    id: "hdf_white_3",
    type: "hdf",
    name: "HDF Белый",
    brand: "Other",
    thickness: 3,
    textureUrl: ""
  }
};

export function getMaterialById(id: string): CabinetMaterial {
  return materialCatalog[id] || materialCatalog["egger_w980_16"];
}
