import { create } from "zustand";
import type {
  CabinetConfig,
  CabinetHardware,
  CalculationResult,
  ValidationMessage
} from "../constructor/engine/types";
import { defaultCabinetConfig } from "../constructor/engine/config";
import { calculateCabinet } from "../constructor/engine/calculation";
import { validateCabinet } from "../constructor/engine/validation";
import { MIN_SECTION_WIDTH } from "../constructor/engine/validation/validation.constants";

const initialResult = calculateCabinet(defaultCabinetConfig);
const initialValidation = validateCabinet(defaultCabinetConfig);

function createState(config: CabinetConfig) {
  return {
    config,
    validation: validateCabinet(config),
    result: calculateCabinet(config)
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export type CabinetStoreState = {
  config: CabinetConfig;
  validation: ValidationMessage[];
  result: CalculationResult;
  updateDimensions: (key: keyof CabinetConfig["dimensions"], value: number) => void;
  updateSectionWidth: (sectionId: string, width: number) => void;
  resizeSectionPair: (leftSectionId: string, rightSectionId: string, delta: number) => void;
  setSectionShelves: (sectionId: string, count: number) => void;
  setSectionDrawers: (sectionId: string, count: number) => void;
  setSectionHangerRails: (sectionId: string, count: number) => void;
  setBodyMaterial: (materialId: string) => void;
  setFacadeMaterial: (materialId: string) => void;
  setHardwareBrand: (brand: "Hettich" | "Firmax") => void;
  toggleLegs: (enabled: boolean) => void;
  toggleHandles: (enabled: boolean) => void;
  setHandleVariant: (variant: string) => void;
  addSection: () => void;
  removeSection: (sectionId: string) => void;
  autoDistributeSections: () => void;
  resetConfig: () => void;
};

export const useCabinetStore = create<CabinetStoreState>((set, get) => ({
  config: defaultCabinetConfig,
  validation: initialValidation,
  result: initialResult,

  updateDimensions: (key, value) => {
    set((state) => {
      const nextConfig: CabinetConfig = {
        ...state.config,
        dimensions: {
          ...state.config.dimensions,
          [key]: value
        }
      };

      return createState(nextConfig);
    });
  },

  updateSectionWidth: (sectionId, width) => {
    set((state) => {
      const nextConfig: CabinetConfig = {
        ...state.config,
        sections: state.config.sections.map((section) =>
          section.id === sectionId ? { ...section, width } : section
        )
      };

      return createState(nextConfig);
    });
  },

  resizeSectionPair: (leftSectionId, rightSectionId, delta) => {
    set((state) => {
      const leftSection = state.config.sections.find((section) => section.id === leftSectionId);
      const rightSection = state.config.sections.find((section) => section.id === rightSectionId);

      if (!leftSection || !rightSection) {
        return { ...state };
      }

      const pairWidth = leftSection.width + rightSection.width;
      const maxLeftWidth = pairWidth - MIN_SECTION_WIDTH;
      const nextLeftWidth = clamp(leftSection.width + delta, MIN_SECTION_WIDTH, maxLeftWidth);
      const nextRightWidth = pairWidth - nextLeftWidth;

      const nextConfig: CabinetConfig = {
        ...state.config,
        sections: state.config.sections.map((section) => {
          if (section.id === leftSectionId) {
            return { ...section, width: Math.round(nextLeftWidth * 10) / 10 };
          }

          if (section.id === rightSectionId) {
            return { ...section, width: Math.round(nextRightWidth * 10) / 10 };
          }

          return section;
        })
      };

      return createState(nextConfig);
    });
  },

  setSectionShelves: (sectionId, count) => {
    set((state) => {
      const nextConfig: CabinetConfig = {
        ...state.config,
        sections: state.config.sections.map((section) => {
          if (section.id !== sectionId) {
            return section;
          }

          const items = section.items.filter((item) => item.type !== "shelf");

          if (count > 0) {
            items.push({
              id: `section_${section.id}_shelves`,
              type: "shelf",
              count
            });
          }

          return {
            ...section,
            items
          };
        })
      };

      return createState(nextConfig);
    });
  },

  setSectionDrawers: (sectionId, count) => {
    set((state) => {
      const nextConfig: CabinetConfig = {
        ...state.config,
        sections: state.config.sections.map((section) => {
          if (section.id !== sectionId) {
            return section;
          }

          const items = section.items.filter((item) => item.type !== "drawer");

          if (count > 0) {
            items.push({
              id: `section_${section.id}_drawers`,
              type: "drawer",
              count,
              height: 200
            });
          }

          return {
            ...section,
            items
          };
        })
      };

      return createState(nextConfig);
    });
  },

  setSectionHangerRails: (sectionId, count) => {
    set((state) => {
      const nextConfig: CabinetConfig = {
        ...state.config,
        sections: state.config.sections.map((section) => {
          if (section.id !== sectionId) {
            return section;
          }

          const items = section.items.filter((item) => item.type !== "hanger_rail");

          if (count > 0) {
            items.push({
              id: `section_${section.id}_hanger_rails`,
              type: "hanger_rail",
              count
            });
          }

          return {
            ...section,
            items
          };
        })
      };

      return createState(nextConfig);
    });
  },

  setBodyMaterial: (materialId) => {
    set((state) => {
      const nextConfig: CabinetConfig = {
        ...state.config,
        materials: {
          ...state.config.materials,
          bodyMaterialId: materialId
        }
      };

      return createState(nextConfig);
    });
  },

  setFacadeMaterial: (materialId) => {
    set((state) => {
      const nextConfig: CabinetConfig = {
        ...state.config,
        materials: {
          ...state.config.materials,
          facadeMaterialId: materialId
        },
        facade: {
          ...state.config.facade,
          materialId: materialId
        }
      };

      return createState(nextConfig);
    });
  },

  setHardwareBrand: (brand) => {
    set((state) => {
      const nextConfig: CabinetConfig = {
        ...state.config,
        options: {
          ...state.config.options,
          hardwareBrand: brand
        }
      };

      return createState(nextConfig);
    });
  },

  toggleLegs: (enabled) => {
    set((state) => {
      const nextConfig: CabinetConfig = {
        ...state.config,
        options: {
          ...state.config.options,
          hasLegs: enabled
        }
      };

      return createState(nextConfig);
    });
  },

  toggleHandles: (enabled) => {
    set((state) => {
      const nextConfig: CabinetConfig = {
        ...state.config,
        facade: {
          ...state.config.facade,
          enabled,
          openingType: enabled
            ? state.config.facade.openingType === "handleless"
              ? "with_handles"
              : state.config.facade.openingType
            : "handleless"
        }
      };

      return createState(nextConfig);
    });
  },

  setHandleVariant: (variant) => {
    set((state) => {
      const nextConfig: CabinetConfig = {
        ...state.config,
        facade: {
          ...state.config.facade,
          handleVariant: variant,
          enabled: true,
          openingType: "with_handles"
        }
      };

      return createState(nextConfig);
    });
  },

  addSection: () => {
    set((state) => {
      const innerWidth = state.config.dimensions.width - 2 * 16;
      const sectionCount = state.config.sections.length + 1;
      const width = Math.max(
        MIN_SECTION_WIDTH,
        Math.round((innerWidth / sectionCount) * 10) / 10
      );

      const nextConfig: CabinetConfig = {
        ...state.config,
        sections: [
          ...state.config.sections,
          {
            id: `section_${Date.now()}`,
            width,
            items: []
          }
        ]
      };

      return createState(nextConfig);
    });
  },

  removeSection: (sectionId) => {
    set((state) => {
      const nextSections = state.config.sections.filter(
        (section) => section.id !== sectionId
      );

      if (nextSections.length === 0) {
        return { ...state };
      }

      const nextConfig: CabinetConfig = {
        ...state.config,
        sections: nextSections
      };

      return createState(nextConfig);
    });
  },

  autoDistributeSections: () => {
    set((state) => {
      const innerWidth = state.config.dimensions.width - 2 * 16;
      const sectionCount = state.config.sections.length;
      const width = Math.max(
        MIN_SECTION_WIDTH,
        Math.round((innerWidth / sectionCount) * 10) / 10
      );

      const nextConfig: CabinetConfig = {
        ...state.config,
        sections: state.config.sections.map((section) => ({
          ...section,
          width
        }))
      };

      return createState(nextConfig);
    });
  },

  resetConfig: () => createState(defaultCabinetConfig)
}));
