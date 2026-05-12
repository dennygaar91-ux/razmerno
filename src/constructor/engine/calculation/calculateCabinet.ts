import type {
  CabinetConfig,
  CabinetPart,
  CabinetHardware,
  CalculationResult
} from "../types";
import { calculatePrice } from "../pricing";

const BODY_THICKNESS = 16;
const BACK_PANEL_THICKNESS = 3;
const SHELF_DEPTH_PADDING = 20;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function createEdgeMap(edgeId: string) {
  return {
    top: edgeId,
    bottom: edgeId,
    left: edgeId,
    right: edgeId
  };
}

export function calculateCabinet(
  config: CabinetConfig
): CalculationResult {
  const parts: CabinetPart[] = [];
  const cabinetWidth = config.dimensions.width;
  const cabinetHeight = config.dimensions.height;
  const cabinetDepth = config.dimensions.depth;
  const bodyMaterialId = config.materials.bodyMaterialId;
  const backPanelMaterialId = config.materials.backPanelMaterialId || "hdf_white_3";
  const bodyEdgeId = "ABS_0_8";
  const innerWidth = cabinetWidth - BODY_THICKNESS * 2;
  const innerHeight = cabinetHeight - BODY_THICKNESS * 2;
  const shelfDepth = Math.max(100, cabinetDepth - SHELF_DEPTH_PADDING);

  parts.push({
    id: "left-side",
    name: "Left side panel",
    materialId: bodyMaterialId,
    size: {
      width: BODY_THICKNESS,
      height: cabinetHeight,
      thickness: cabinetDepth
    },
    edge: createEdgeMap(bodyEdgeId),
    position: {
      x: 0,
      y: 0,
      z: 0
    }
  });

  parts.push({
    id: "right-side",
    name: "Right side panel",
    materialId: bodyMaterialId,
    size: {
      width: BODY_THICKNESS,
      height: cabinetHeight,
      thickness: cabinetDepth
    },
    edge: createEdgeMap(bodyEdgeId),
    position: {
      x: cabinetWidth - BODY_THICKNESS,
      y: 0,
      z: 0
    }
  });

  parts.push({
    id: "bottom",
    name: "Bottom panel",
    materialId: bodyMaterialId,
    size: {
      width: innerWidth,
      height: BODY_THICKNESS,
      thickness: cabinetDepth
    },
    edge: createEdgeMap(bodyEdgeId),
    position: {
      x: BODY_THICKNESS,
      y: 0,
      z: 0
    }
  });

  parts.push({
    id: "top",
    name: "Top panel",
    materialId: bodyMaterialId,
    size: {
      width: innerWidth,
      height: BODY_THICKNESS,
      thickness: cabinetDepth
    },
    edge: createEdgeMap(bodyEdgeId),
    position: {
      x: BODY_THICKNESS,
      y: cabinetHeight - BODY_THICKNESS,
      z: 0
    }
  });

  parts.push({
    id: "back-panel",
    name: "Back panel",
    materialId: backPanelMaterialId,
    size: {
      width: cabinetWidth,
      height: cabinetHeight,
      thickness: BACK_PANEL_THICKNESS
    },
    edge: {},
    position: {
      x: 0,
      y: 0,
      z: cabinetDepth - BACK_PANEL_THICKNESS
    }
  });

  let currentX = BODY_THICKNESS;
  config.sections.forEach((section, sectionIndex) => {
    const sectionLeft = currentX;
    const sectionWidth = section.width;

    const shelfItem = section.items.find((item) => item.type === "shelf");
    if (shelfItem?.count) {
      const shelfCount = shelfItem.count;
      const spacing = innerHeight / (shelfCount + 1);

      for (let index = 0; index < shelfCount; index += 1) {
        parts.push({
          id: `shelf-${sectionIndex + 1}-${index + 1}`,
          name: `Shelf ${sectionIndex + 1}-${index + 1}`,
          materialId: bodyMaterialId,
          size: {
            width: sectionWidth,
            height: BODY_THICKNESS,
            thickness: shelfDepth
          },
          edge: createEdgeMap(bodyEdgeId),
          position: {
            x: sectionLeft,
            y: round(BODY_THICKNESS + spacing * (index + 1)),
            z: 0
          }
        });
      }
    }

    const drawerItem = section.items.find((item) => item.type === "drawer");
    if (drawerItem?.count) {
      const count = drawerItem.count;
      const drawerHeight = drawerItem.height || 200;
      let drawerOffsetY = BODY_THICKNESS;

      for (let index = 0; index < count; index += 1) {
        parts.push({
          id: `drawer-front-${sectionIndex + 1}-${index + 1}`,
          name: `Drawer front ${sectionIndex + 1}-${index + 1}`,
          materialId: config.materials.facadeMaterialId || bodyMaterialId,
          size: {
            width: sectionWidth,
            height: drawerHeight,
            thickness: BODY_THICKNESS
          },
          edge: createEdgeMap("ABS_2"),
          position: {
            x: sectionLeft,
            y: round(drawerOffsetY),
            z: 0
          }
        });

        parts.push({
          id: `drawer-cabinet-${sectionIndex + 1}-${index + 1}`,
          name: `Drawer box ${sectionIndex + 1}-${index + 1}`,
          materialId: bodyMaterialId,
          size: {
            width: Math.max(0, sectionWidth - BODY_THICKNESS * 2),
            height: Math.max(0, drawerHeight - BODY_THICKNESS),
            thickness: Math.max(0, cabinetDepth - 100)
          },
          edge: createEdgeMap(bodyEdgeId),
          position: {
            x: sectionLeft + BODY_THICKNESS,
            y: round(drawerOffsetY + BODY_THICKNESS),
            z: 0
          }
        });

        drawerOffsetY += drawerHeight;
      }
    }

    const railItem = section.items.find((item) => item.type === "hanger_rail");
    if (railItem?.count) {
      const railCount = railItem.count;
      const railHeight = 10;
      const railDepth = 24;
      const baseY = cabinetHeight - BODY_THICKNESS - 120;

      for (let index = 0; index < railCount; index += 1) {
        parts.push({
          id: `hanger-rail-${sectionIndex + 1}-${index + 1}`,
          name: `Hanger rail ${sectionIndex + 1}-${index + 1}`,
          materialId: backPanelMaterialId,
          size: {
            width: sectionWidth - 32,
            height: railHeight,
            thickness: railDepth
          },
          edge: createEdgeMap(bodyEdgeId),
          position: {
            x: sectionLeft + 16,
            y: round(baseY - index * 40),
            z: 0
          }
        });
      }
    }

    currentX += sectionWidth;
    if (sectionIndex < config.sections.length - 1) {
      parts.push({
        id: `divider-${sectionIndex + 1}`,
        name: `Divider ${sectionIndex + 1}`,
        materialId: bodyMaterialId,
        size: {
          width: BODY_THICKNESS,
          height: innerHeight,
          thickness: cabinetDepth
        },
        edge: createEdgeMap(bodyEdgeId),
        position: {
          x: round(currentX),
          y: BODY_THICKNESS,
          z: 0
        }
      });
      currentX += BODY_THICKNESS;
    }
  });

  const totalShelves = config.sections.reduce((sum, section) => {
    const shelfItem = section.items.find((item) => item.type === "shelf");
    return sum + (shelfItem?.count || 0);
  }, 0);

  const totalDrawers = config.sections.reduce((sum, section) => {
    const drawerItem = section.items.find((item) => item.type === "drawer");
    return sum + (drawerItem?.count || 0);
  }, 0);

  const hardware: CabinetHardware[] = [];
  if (totalShelves > 0) {
    hardware.push({
      id: "shelf-supports",
      type: "shelf_support",
      name: "Shelf supports",
      brand: "MDM",
      quantity: totalShelves * 4
    });
  }

  if (totalDrawers > 0) {
    hardware.push({
      id: "drawer-slides",
      type: "drawer_slide",
      name: "Drawer slides",
      brand: config.options.hardwareBrand,
      quantity: totalDrawers * 2
    });
  }

  if (config.facade.enabled && config.facade.openingType === "with_handles") {
    hardware.push({
      id: "handles",
      type: "handle",
      name: `Ручки ${config.facade.handleVariant || "стандарт"}`,
      brand: config.options.hardwareBrand,
      quantity: totalDrawers
    });
  }

  if (config.options.hasLegs) {
    hardware.push({
      id: "legs",
      type: "leg",
      name: "Ножки",
      brand: config.options.hardwareBrand,
      quantity: 4
    });
  }

  const price = calculatePrice(parts, config);

  return {
    config,
    parts,
    hardware,
    holes: [],
    validation: [],
    price
  };
}
