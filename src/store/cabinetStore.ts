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

export type CabinetStoreState = {
  config: CabinetConfig;
  validation: ValidationMessage[];
  result: CalculationResult;
  updateDimensions: (key: keyof CabinetConfig["dimensions"], value: number) => void;
  updateSectionWidth: (sectionId: string, width: number) => void;
  setSectionShelves: (sectionId: string, count: number) => void;
  setSectionDrawers: (sectionId: string, count: number) => void;
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

  setSectionShelves: (sectionId, count) => {
    set((state) => {
      const nextConfig: CabinetConfig = {
        ...state.config,
        sections: state.config.sections.map((section) => {
          if (section.id !== sectionId) {
            return section;
          }

          const items = section.items.filter(
            (item) => item.type !== "shelf"
          );

          if (count > 0) {
            items.push({
              id: `section_${sectionId}_shelves`,
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

          const items = section.items.filter(
            (item) => item.type !== "drawer"
          );

          if (count > 0) {
            items.push({
              id: `section_${sectionId}_drawers`,
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
