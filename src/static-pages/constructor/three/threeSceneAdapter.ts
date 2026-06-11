import type {
  ThreeFurnitureInput,
  ThreeFurnitureSceneModel,
  ThreePanel,
} from "./threeTypes";
import {
  addDrawer,
  addFacadeForSection,
  addFacadeForZone,
  addRod,
  addScrewCaps,
} from "./threeSceneHardware";
import {
  createCompartmentItems,
  createSections,
  getSectionId,
} from "./threeSceneLayout";
import {
  clampCount,
  meters,
  panel,
  pushPanel,
} from "./threeScenePrimitives";
import { createInteractionTargets } from "./threeSceneTargets";

export function buildThreeFurnitureModel(
  input: ThreeFurnitureInput,
): ThreeFurnitureSceneModel {
  const width = meters(input.widthMm);
  const height = meters(input.heightMm);
  const depth = meters(input.depthMm);
  const thickness = 0.036;
  const backThickness = 0.016;
  const safeSections = clampCount(input.sections, 1, 6);
  const safeCompartments = clampCount(input.compartments, 1, 5);
  const shelvesCount = Math.max(0, Math.floor(input.shelvesCount || 0));
  const drawersCount = Math.max(0, Math.floor(input.drawersCount || 0));
  const rodsCount = Math.max(0, Math.floor(input.rodsCount || 0));
  const sceneMode = input.sceneMode ?? "fill";
  const { sectionWidths, sectionStarts } = createSections({
    width,
    safeSections,
    sectionLayout: input.sectionLayout,
  });
  const panels: ThreePanel[] = [];

  pushPanel(panels, panel({
    id: "left-side",
    kind: "side",
    position: [-width / 2 + thickness / 2, height / 2, 0],
    size: [thickness, height, depth],
    material: "body",
  }));
  pushPanel(panels, panel({
    id: "right-side",
    kind: "side",
    position: [width / 2 - thickness / 2, height / 2, 0],
    size: [thickness, height, depth],
    material: "body",
  }));
  pushPanel(panels, panel({
    id: "top",
    kind: "top",
    position: [0, height - thickness / 2, 0],
    size: [width, thickness, depth],
    material: "body",
  }));
  pushPanel(panels, panel({
    id: "bottom",
    kind: "bottom",
    position: [0, thickness / 2, 0],
    size: [width, thickness, depth],
    material: "body",
  }));
  pushPanel(panels, panel({
    id: "back",
    kind: "back",
    position: [0, height / 2, -depth / 2 + backThickness / 2],
    size: [width, height, backThickness],
    material: "back",
  }));
  pushPanel(panels, panel({
    id: "front-plinth",
    kind: "plinth",
    position: [0, thickness * 1.35, depth / 2 - thickness * 0.55],
    size: [Math.max(thickness, width - thickness * 1.8), thickness * 1.5, thickness * 0.8],
    material: "body",
  }));

  for (let index = 1; index < safeSections; index += 1) {
    const x = sectionStarts[index];
    pushPanel(panels, panel({
      id: `divider-${index}`,
      kind: "divider",
      position: [x, height / 2, 0],
      size: [thickness, height - thickness * 2, depth - thickness],
      material: "body",
    }));
  }

  const explicitFillingItems = createCompartmentItems({
    modelInput: input,
    sectionWidths,
    sectionStarts,
    safeSections,
    width,
    height,
    thickness,
  });

  for (let section = 0; section < safeSections; section += 1) {
    const sectionId = getSectionId(input, section);
    const compartmentLayout = input.compartmentLayout?.[sectionId] ?? [];
    if (compartmentLayout.length <= 1) continue;

    const totalHeightMm = Math.max(1, compartmentLayout.reduce((sum, compartment) => sum + compartment.heightMm, 0));
    let offsetMm = 0;
    const sectionWidth = sectionWidths[section] ?? width / safeSections;
    const x = (sectionStarts[section] ?? -width / 2) + sectionWidth / 2;
    for (let compartment = 0; compartment < compartmentLayout.length - 1; compartment += 1) {
      offsetMm += compartmentLayout[compartment]?.heightMm ?? 0;
      const y = thickness + (height - thickness * 2) * (offsetMm / totalHeightMm);
      pushPanel(panels, panel({
        id: `zone-divider-${sectionId}-${compartment + 1}`,
        kind: "shelf",
        position: [x, y, 0],
        size: [Math.max(thickness, sectionWidth - thickness * 1.4), thickness * 0.72, depth - thickness * 1.8],
        material: "body",
      }));
      addScrewCaps({
        panels,
        idPrefix: `zone-divider-${sectionId}-${compartment + 1}`,
        xLeft: x - sectionWidth / 2 + thickness * 1.25,
        xRight: x + sectionWidth / 2 - thickness * 1.25,
        y,
        z: depth / 2 - thickness * 0.9,
      });
    }
  }

  const hasExplicitFilling = explicitFillingItems.some(
    (item) =>
      (item.filling?.shelvesCount ?? 0) > 0 ||
      (item.filling?.drawersCount ?? 0) > 0 ||
      (item.filling?.rodsCount ?? 0) > 0,
  );

  if (hasExplicitFilling) {
    for (const item of explicitFillingItems) {
      const shelves = Math.max(0, Math.floor(item.filling?.shelvesCount ?? 0));
      const drawers = Math.max(0, Math.floor(item.filling?.drawersCount ?? 0));
      const rods = Math.max(0, Math.floor(item.filling?.rodsCount ?? 0));

      for (let shelfIndex = 0; shelfIndex < shelves; shelfIndex += 1) {
        const y = item.yStart + (item.height / (shelves + 1)) * (shelfIndex + 1);
        pushPanel(panels, panel({
          id: `shelf-${item.sectionId}-${item.compartmentId}-${shelfIndex}`,
          kind: "shelf",
          position: [item.x, y, 0],
          size: [Math.max(thickness, item.width - thickness * 1.4), thickness * 0.82, depth - thickness * 1.8],
          material: "body",
        }));
        addScrewCaps({
          panels,
          idPrefix: `shelf-${item.sectionId}-${item.compartmentId}-${shelfIndex}`,
          xLeft: item.x - item.width / 2 + thickness * 1.25,
          xRight: item.x + item.width / 2 - thickness * 1.25,
          y,
          z: depth / 2 - thickness * 0.9,
        });
      }

      for (let drawer = 0; drawer < Math.min(5, drawers); drawer += 1) {
        const drawerHeight = Math.min(item.height / Math.max(2, drawers + 1), 0.32);
        const y = item.yStart + drawerHeight * (drawer + 0.8);
        addDrawer({
          panels,
          idPrefix: `${item.sectionId}-${item.compartmentId}-${drawer}`,
          x: item.x,
          y,
          width: item.width,
          drawerHeight,
          depth,
          thickness,
          handleless: input.handleless,
        });
      }

      for (let rod = 0; rod < Math.min(2, rods); rod += 1) {
        const y = item.yStart + item.height * (rod === 0 ? 0.66 : 0.48);
        addRod({ panels, id: `rod-${item.sectionId}-${item.compartmentId}-${rod}`, x: item.x, y, width: item.width, depth, thickness });
      }
    }
  } else {
    const shelfLevels = shelvesCount > 0 ? Math.min(shelvesCount, safeCompartments + 1) : 0;
    for (let level = 1; level <= shelfLevels; level += 1) {
      const y = thickness + ((height - thickness * 2) / (shelfLevels + 1)) * level;
      for (let section = 0; section < safeSections; section += 1) {
        const sectionWidth = sectionWidths[section] ?? width / safeSections;
        const x = (sectionStarts[section] ?? -width / 2) + sectionWidth / 2;
        pushPanel(panels, panel({
          id: `shelf-${section}-${level}`,
          kind: "shelf",
          position: [x, y, 0],
          size: [Math.max(thickness, sectionWidth - thickness * 1.4), thickness * 0.82, depth - thickness * 1.8],
          material: "body",
        }));
        addScrewCaps({
          panels,
          idPrefix: `shelf-${section}-${level}`,
          xLeft: x - sectionWidth / 2 + thickness * 1.25,
          xRight: x + sectionWidth / 2 - thickness * 1.25,
          y,
          z: depth / 2 - thickness * 0.9,
        });
      }
    }

    const drawerCount = Math.min(5, drawersCount);
    if (drawerCount > 0) {
      const drawerHeight = Math.min((height - thickness * 4) / Math.max(2, drawerCount + 1), 0.32);
      for (let section = 0; section < safeSections; section += 1) {
        const sectionWidth = sectionWidths[section] ?? width / safeSections;
        const x = (sectionStarts[section] ?? -width / 2) + sectionWidth / 2;
        for (let drawer = 0; drawer < drawerCount; drawer += 1) {
          const y = thickness + drawerHeight * (drawer + 0.8);
          addDrawer({
            panels,
            idPrefix: `${section}-${drawer}`,
            x,
            y,
            width: sectionWidth,
            drawerHeight,
            depth,
            thickness,
            handleless: input.handleless,
          });
        }
      }
    }

    if (rodsCount > 0) {
      const rodRows = Math.min(2, rodsCount);
      for (let row = 0; row < rodRows; row += 1) {
        for (let section = 0; section < safeSections; section += 1) {
          const sectionWidth = sectionWidths[section] ?? width / safeSections;
          const x = (sectionStarts[section] ?? -width / 2) + sectionWidth / 2;
          const y = height * (row === 0 ? 0.66 : 0.48);
          addRod({ panels, id: `rod-${section}-${row}`, x, y, width: sectionWidth, depth, thickness });
        }
      }
    }
  }

  for (let section = 0; section < safeSections; section += 1) {
    const sectionId = getSectionId(input, section);
    const sectionFacadeMode = input.facadeLayout?.[sectionId] ?? "hinged";
    if (sectionFacadeMode === "open") continue;

    const zoneOverrides = input.zoneFacadeLayout?.[sectionId] ?? {};
    const sectionCompartments = explicitFillingItems.filter((item) => item.sectionId === sectionId);
    const hasOpenZoneOverride = sectionCompartments.some((item) => zoneOverrides[item.compartmentId] === "open");

    if (!hasOpenZoneOverride || sectionCompartments.length <= 1) {
      addFacadeForSection({
        panels,
        sectionId,
        sectionWidth: sectionWidths[section] ?? width / safeSections,
        sectionStart: sectionStarts[section] ?? -width / 2,
        height,
        depth,
        thickness,
        handleless: input.handleless,
      });
      continue;
    }

    sectionCompartments.forEach((item, zoneIndex) => {
      if (zoneOverrides[item.compartmentId] === "open") return;
      addFacadeForZone({
        panels,
        sectionId,
        compartmentId: item.compartmentId,
        zoneIndex,
        sectionWidth: sectionWidths[section] ?? width / safeSections,
        sectionStart: sectionStarts[section] ?? -width / 2,
        zoneYStart: item.yStart,
        zoneHeight: item.height,
        depth,
        thickness,
        handleless: input.handleless,
      });
    });
  }

  const selectedSectionIndex = input.selectedSectionId
    ? input.sectionLayout?.findIndex((section) => section.id === input.selectedSectionId) ?? -1
    : -1;
  if (selectedSectionIndex >= 0) {
    const selectedWidth = sectionWidths[selectedSectionIndex] ?? width / safeSections;
    const selectedStart = sectionStarts[selectedSectionIndex] ?? -width / 2;
    const x = selectedStart + selectedWidth / 2;
    const frameZ = depth / 2 + 0.09;
    const frameThickness = 0.016;

    pushPanel(panels, panel({
      id: `selection-section-top-${input.selectedSectionId}`,
      kind: "selection",
      position: [x, height - thickness * 1.9, frameZ],
      size: [Math.max(frameThickness, selectedWidth - thickness * 1.2), frameThickness, frameThickness],
      material: "accent",
    }));
    pushPanel(panels, panel({
      id: `selection-section-bottom-${input.selectedSectionId}`,
      kind: "selection",
      position: [x, thickness * 1.9, frameZ],
      size: [Math.max(frameThickness, selectedWidth - thickness * 1.2), frameThickness, frameThickness],
      material: "accent",
    }));
    pushPanel(panels, panel({
      id: `selection-section-left-${input.selectedSectionId}`,
      kind: "selection",
      position: [selectedStart + frameThickness, height / 2, frameZ],
      size: [frameThickness, Math.max(frameThickness, height - thickness * 3.4), frameThickness],
      material: "accent",
    }));
    pushPanel(panels, panel({
      id: `selection-section-right-${input.selectedSectionId}`,
      kind: "selection",
      position: [selectedStart + selectedWidth - frameThickness, height / 2, frameZ],
      size: [frameThickness, Math.max(frameThickness, height - thickness * 3.4), frameThickness],
      material: "accent",
    }));
  }

  const selectedCompartmentItem = input.selectedCompartmentId
    ? explicitFillingItems.find((item) => item.compartmentId === input.selectedCompartmentId)
    : null;
  if (selectedCompartmentItem) {
    const frameZ = depth / 2 + 0.11;
    const frameThickness = 0.014;
    const x = selectedCompartmentItem.x;
    const sectionWidth = selectedCompartmentItem.width;
    const yCenter = selectedCompartmentItem.yStart + selectedCompartmentItem.height / 2;
    const yTop = selectedCompartmentItem.yStart + selectedCompartmentItem.height - frameThickness;
    const yBottom = selectedCompartmentItem.yStart + frameThickness;
    const xLeft = x - sectionWidth / 2 + thickness * 1.05;
    const xRight = x + sectionWidth / 2 - thickness * 1.05;

    pushPanel(panels, panel({
      id: `selection-compartment-top-${input.selectedCompartmentId}`,
      kind: "selection",
      position: [x, yTop, frameZ],
      size: [Math.max(frameThickness, sectionWidth - thickness * 2.2), frameThickness, frameThickness],
      material: "accent",
    }));
    pushPanel(panels, panel({
      id: `selection-compartment-bottom-${input.selectedCompartmentId}`,
      kind: "selection",
      position: [x, yBottom, frameZ],
      size: [Math.max(frameThickness, sectionWidth - thickness * 2.2), frameThickness, frameThickness],
      material: "accent",
    }));
    pushPanel(panels, panel({
      id: `selection-compartment-left-${input.selectedCompartmentId}`,
      kind: "selection",
      position: [xLeft, yCenter, frameZ],
      size: [frameThickness, Math.max(frameThickness, selectedCompartmentItem.height - frameThickness * 2), frameThickness],
      material: "accent",
    }));
    pushPanel(panels, panel({
      id: `selection-compartment-right-${input.selectedCompartmentId}`,
      kind: "selection",
      position: [xRight, yCenter, frameZ],
      size: [frameThickness, Math.max(frameThickness, selectedCompartmentItem.height - frameThickness * 2), frameThickness],
      material: "accent",
    }));
  }


  if (sceneMode === "fill") {
    panels.forEach((item) => {
      if (item.kind === "facade") item.material = "facadeGhost";
    });
  }

  const interactionTargets = createInteractionTargets({
    modelInput: input,
    explicitFillingItems,
    sectionWidths,
    sectionStarts,
    safeSections,
    width,
    height,
    depth,
    thickness,
  });

  const legY = -0.035;
  const legX = [-width / 2 + 0.14, width / 2 - 0.14];
  const legZ = [-depth / 2 + 0.12, depth / 2 - 0.12];
  for (const x of legX) {
    for (const z of legZ) {
      pushPanel(panels, panel({
        id: `leg-${x}-${z}`,
        kind: "leg",
        position: [x, legY, z],
        size: [0.07, 0.07, 0.07],
        material: "hardware",
      }));
    }
  }

  return {
    dimensions: [width, height, depth],
    panels,
    safeSections,
    safeCompartments,
    interactionTargets,
  };
}
