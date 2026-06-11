import type { ThreePanel } from "./threeTypes";
import { panel, pushPanel } from "./threeScenePrimitives";

export function addDoorHardware(input: {
  panels: ThreePanel[];
  sectionId: string;
  leafId: string;
  leafCenterX: number;
  hingeX: number;
  handleX: number;
  height: number;
  depth: number;
  handleless: boolean;
  rotationY: number;
}) {
  const hingeZ = input.depth / 2 + 0.05;
  const hingeLevels = [0.24, 0.5, 0.76];
  hingeLevels.forEach((level, index) => {
    pushPanel(input.panels, panel({
      id: `hinge-${input.sectionId}-${input.leafId}-${index}`,
      kind: "hinge",
      position: [input.hingeX, input.height * level, hingeZ],
      rotation: [Math.PI / 2, 0, 0],
      size: [0.038, 0.038, 0.018],
      material: "hardwareLight",
    }));
  });

  if (!input.handleless) {
    pushPanel(input.panels, panel({
      id: `facade-handle-${input.sectionId}-${input.leafId}`,
      kind: "handle",
      position: [input.handleX, input.height * 0.52, input.depth / 2 + 0.07],
      rotation: [0, 0, 0],
      size: [0.026, Math.max(0.18, input.height * 0.17), 0.018],
      material: "hardware",
    }));
  }
}

export function addScrewCaps(input: {
  panels: ThreePanel[];
  idPrefix: string;
  xLeft: number;
  xRight: number;
  y: number;
  z: number;
}) {
  [input.xLeft, input.xRight].forEach((x, index) => {
    pushPanel(input.panels, panel({
      id: `screw-${input.idPrefix}-${index}`,
      kind: "screw",
      position: [x, input.y, input.z],
      size: [0.026, 0.026, 0.008],
      material: "hardware",
    }));
  });
}

export function addFacadeForSection(input: {
  panels: ThreePanel[];
  sectionId: string;
  sectionWidth: number;
  sectionStart: number;
  height: number;
  depth: number;
  thickness: number;
  handleless: boolean;
}) {
  const visibleHeight = input.height - input.thickness * 3.1;
  const sectionCenter = input.sectionStart + input.sectionWidth / 2;
  const doubleLeaf = input.sectionWidth >= 0.72;
  const leafCount = doubleLeaf ? 2 : 1;
  const leafGap = 0.012;
  const leafWidth = Math.max(input.thickness, (input.sectionWidth - input.thickness * 1.45 - leafGap * (leafCount - 1)) / leafCount);

  for (let leaf = 0; leaf < leafCount; leaf += 1) {
    const isLeft = leaf === 0;
    const offset = leafCount === 1 ? 0 : (isLeft ? -1 : 1) * (leafWidth / 2 + leafGap / 2);
    const leafCenterX = sectionCenter + offset;
    const rotationY = leafCount === 1 ? -0.08 : isLeft ? 0.14 : -0.14;
    const hingeX = leafCount === 1
      ? input.sectionStart + input.thickness * 1.15
      : isLeft
        ? input.sectionStart + input.thickness * 1.15
        : input.sectionStart + input.sectionWidth - input.thickness * 1.15;
    const handleX = leafCount === 1
      ? leafCenterX + leafWidth * 0.34
      : leafCenterX + (isLeft ? leafWidth * 0.32 : -leafWidth * 0.32);

    pushPanel(input.panels, panel({
      id: `facade-${input.sectionId}-leaf-${leaf + 1}`,
      kind: "facade",
      position: [leafCenterX, input.height / 2, input.depth / 2 + 0.022],
      rotation: [0, rotationY, 0],
      size: [leafWidth, visibleHeight, input.thickness * 0.72],
      material: "facade",
    }));

    addDoorHardware({
      panels: input.panels,
      sectionId: input.sectionId,
      leafId: `leaf-${leaf + 1}`,
      leafCenterX,
      hingeX,
      handleX,
      height: input.height,
      depth: input.depth,
      handleless: input.handleless,
      rotationY,
    });
  }
}

export function addFacadeForZone(input: {
  panels: ThreePanel[];
  sectionId: string;
  compartmentId: string;
  zoneIndex: number;
  sectionWidth: number;
  sectionStart: number;
  zoneYStart: number;
  zoneHeight: number;
  depth: number;
  thickness: number;
  handleless: boolean;
}) {
  const sectionCenter = input.sectionStart + input.sectionWidth / 2;
  const visibleHeight = Math.max(input.thickness * 2.2, input.zoneHeight - input.thickness * 1.15);
  const leafWidth = Math.max(input.thickness, input.sectionWidth - input.thickness * 1.7);
  const leafCenterY = input.zoneYStart + input.zoneHeight / 2;
  const rotationY = -0.045;

  pushPanel(input.panels, panel({
    id: `facade-zone-${input.sectionId}-${input.compartmentId}`,
    kind: "facade",
    position: [sectionCenter, leafCenterY, input.depth / 2 + 0.026],
    rotation: [0, rotationY, 0],
    size: [leafWidth, visibleHeight, input.thickness * 0.68],
    material: "facade",
  }));

  const hingeX = input.sectionStart + input.thickness * 1.18;
  const handleX = sectionCenter + leafWidth * 0.36;
  const hardwareHeight = Math.max(input.thickness * 4, visibleHeight);
  const hingeLevels = visibleHeight < 0.78 ? [0.5] : [0.24, 0.76];
  hingeLevels.forEach((level, index) => {
    pushPanel(input.panels, panel({
      id: `hinge-zone-${input.sectionId}-${input.compartmentId}-${index}`,
      kind: "hinge",
      position: [hingeX, leafCenterY - visibleHeight / 2 + visibleHeight * level, input.depth / 2 + 0.052],
      rotation: [Math.PI / 2, 0, 0],
      size: [0.034, 0.034, 0.014],
      material: "hardwareLight",
    }));
  });

  if (!input.handleless) {
    pushPanel(input.panels, panel({
      id: `facade-zone-handle-${input.sectionId}-${input.compartmentId}`,
      kind: "handle",
      position: [handleX, leafCenterY, input.depth / 2 + 0.068],
      size: [0.022, Math.max(0.12, hardwareHeight * 0.18), 0.016],
      material: "hardware",
    }));
  }
}

export function addDrawer(input: {
  panels: ThreePanel[];
  idPrefix: string;
  x: number;
  y: number;
  width: number;
  drawerHeight: number;
  depth: number;
  thickness: number;
  handleless: boolean;
}) {
  const usableWidth = Math.max(input.thickness, input.width - input.thickness * 1.8);
  pushPanel(input.panels, panel({
    id: `drawer-front-${input.idPrefix}`,
    kind: "drawer",
    position: [input.x, input.y, input.depth / 2 + 0.014],
    size: [usableWidth, input.drawerHeight * 0.74, input.thickness * 0.75],
    material: "facade",
  }));
  pushPanel(input.panels, panel({
    id: `drawer-box-left-${input.idPrefix}`,
    kind: "drawerSide",
    position: [input.x - usableWidth / 2 + input.thickness * 0.35, input.y, 0.02],
    size: [input.thickness * 0.5, input.drawerHeight * 0.66, input.depth * 0.72],
    material: "body",
  }));
  pushPanel(input.panels, panel({
    id: `drawer-box-right-${input.idPrefix}`,
    kind: "drawerSide",
    position: [input.x + usableWidth / 2 - input.thickness * 0.35, input.y, 0.02],
    size: [input.thickness * 0.5, input.drawerHeight * 0.66, input.depth * 0.72],
    material: "body",
  }));
  pushPanel(input.panels, panel({
    id: `drawer-slide-left-${input.idPrefix}`,
    kind: "slide",
    position: [input.x - usableWidth / 2 + input.thickness * 0.8, input.y, 0.02],
    size: [0.018, 0.018, input.depth * 0.58],
    material: "hardwareLight",
  }));
  pushPanel(input.panels, panel({
    id: `drawer-slide-right-${input.idPrefix}`,
    kind: "slide",
    position: [input.x + usableWidth / 2 - input.thickness * 0.8, input.y, 0.02],
    size: [0.018, 0.018, input.depth * 0.58],
    material: "hardwareLight",
  }));

  if (!input.handleless) {
    pushPanel(input.panels, panel({
      id: `drawer-handle-${input.idPrefix}`,
      kind: "handle",
      position: [input.x, input.y, input.depth / 2 + 0.046],
      size: [Math.max(0.08, input.width * 0.36), 0.018, 0.018],
      material: "hardware",
    }));
  }
}

export function addRod(input: {
  panels: ThreePanel[];
  id: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  thickness: number;
}) {
  pushPanel(input.panels, panel({
    id: input.id,
    kind: "rod",
    position: [input.x, input.y, input.depth * 0.09],
    size: [Math.max(0.08, input.width - input.thickness * 2.5), 0.028, 0.028],
    material: "hardwareLight",
  }));
  pushPanel(input.panels, panel({
    id: `${input.id}-left-bracket`,
    kind: "hinge",
    position: [input.x - input.width / 2 + input.thickness * 1.2, input.y, input.depth * 0.09],
    rotation: [Math.PI / 2, 0, 0],
    size: [0.044, 0.044, 0.012],
    material: "hardwareLight",
  }));
  pushPanel(input.panels, panel({
    id: `${input.id}-right-bracket`,
    kind: "hinge",
    position: [input.x + input.width / 2 - input.thickness * 1.2, input.y, input.depth * 0.09],
    rotation: [Math.PI / 2, 0, 0],
    size: [0.044, 0.044, 0.012],
    material: "hardwareLight",
  }));
}

