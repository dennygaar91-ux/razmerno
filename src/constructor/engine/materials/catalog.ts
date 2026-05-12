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
  hdf_white_3: {
    id: "hdf_white_3",
    type: "hdf",
    name: "HDF Белый",
    brand: "Other",
    thickness: 3,
    textureUrl: ""
  },
  mdf_white_18: {
    id: "mdf_white_18",
    type: "mdf",
    name: "MDF Белый",
    brand: "Other",
    thickness: 18,
    textureUrl: ""
  }
};

export function getMaterialById(id: string): CabinetMaterial {
  return materialCatalog[id] || materialCatalog["egger_w980_16"];
}
