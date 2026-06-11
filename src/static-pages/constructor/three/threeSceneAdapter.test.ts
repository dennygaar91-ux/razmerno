import assert from "node:assert/strict";
import test from "node:test";
import { buildThreeFurnitureModel } from "./threeSceneAdapter";

test("three adapter: builds base corpus panels and clamps counts", () => {
  const model = buildThreeFurnitureModel({
    furniture: "wardrobe",
    widthMm: 1800,
    heightMm: 2400,
    depthMm: 600,
    sections: 27,
    compartments: 12,
    shelvesCount: 3,
    drawersCount: 0,
    rodsCount: 0,
    fill: "shelves",
    material: "white",
    facadeMaterial: "white",
    handleless: false,
  });

  assert.equal(model.safeSections, 6);
  assert.equal(model.safeCompartments, 5);
  assert.ok(model.panels.some((panel) => panel.kind === "back"));
  assert.ok(model.panels.some((panel) => panel.kind === "divider"));
  assert.ok(model.panels.some((panel) => panel.kind === "shelf"));
});

test("three adapter: drawers and rod create different visual parts", () => {
  const drawers = buildThreeFurnitureModel({
    furniture: "dresser",
    widthMm: 1200,
    heightMm: 900,
    depthMm: 500,
    sections: 2,
    compartments: 4,
    shelvesCount: 0,
    drawersCount: 3,
    rodsCount: 0,
    fill: "drawers",
    material: "oak",
    facadeMaterial: "white",
    handleless: false,
  });

  const rod = buildThreeFurnitureModel({
    furniture: "wardrobe",
    widthMm: 1600,
    heightMm: 2400,
    depthMm: 600,
    sections: 2,
    compartments: 2,
    shelvesCount: 0,
    drawersCount: 0,
    rodsCount: 1,
    fill: "rod",
    material: "graphite",
    facadeMaterial: "graphite",
    handleless: true,
  });

  assert.ok(drawers.panels.some((panel) => panel.kind === "drawer"));
  assert.ok(drawers.panels.some((panel) => panel.kind === "handle"));
  assert.ok(rod.panels.some((panel) => panel.kind === "rod"));
  assert.ok(!rod.panels.some((panel) => panel.id.startsWith("front-handle")));
});

test("three adapter: selected section and compartment create accent selection panels", () => {
  const model = buildThreeFurnitureModel({
    furniture: "wardrobe",
    widthMm: 1800,
    heightMm: 2400,
    depthMm: 600,
    sections: 2,
    sectionLayout: [
      { id: "section-1", widthMm: 900 },
      { id: "section-2", widthMm: 900 },
    ],
    compartmentLayout: {
      "section-1": [
        { id: "section-1-compartment-1", heightMm: 1200 },
        { id: "section-1-compartment-2", heightMm: 1200 },
      ],
      "section-2": [
        { id: "section-2-compartment-1", heightMm: 2400 },
      ],
    },
    fillingLayout: {},
    facadeLayout: { "section-1": "hinged", "section-2": "open" },
    selectedSectionId: "section-1",
    selectedCompartmentId: "section-1-compartment-2",
    compartments: 2,
    shelvesCount: 0,
    drawersCount: 0,
    rodsCount: 0,
    fill: "shelves",
    material: "white",
    facadeMaterial: "white",
    handleless: false,
  });

  const selectionPanels = model.panels.filter((panel) => panel.kind === "selection");
  assert.ok(selectionPanels.length >= 8);
  assert.ok(selectionPanels.every((panel) => panel.material === "accent"));
  assert.ok(selectionPanels.some((panel) => panel.id.includes("section-1")));
  assert.ok(selectionPanels.some((panel) => panel.id.includes("section-1-compartment-2")));
});

test("three adapter N2: realistic preview includes facades, door hardware and drawer guides", () => {
  const model = buildThreeFurnitureModel({
    furniture: "wardrobe",
    widthMm: 1800,
    heightMm: 2400,
    depthMm: 600,
    sections: 2,
    sectionLayout: [
      { id: "section-1", widthMm: 900 },
      { id: "section-2", widthMm: 900 },
    ],
    compartmentLayout: {
      "section-1": [{ id: "section-1-compartment-1", heightMm: 2400 }],
      "section-2": [{ id: "section-2-compartment-1", heightMm: 2400 }],
    },
    fillingLayout: {
      "section-1": {
        "section-1-compartment-1": { shelvesCount: 1, drawersCount: 2, rodsCount: 1 },
      },
      "section-2": {
        "section-2-compartment-1": { shelvesCount: 0, drawersCount: 0, rodsCount: 0 },
      },
    },
    facadeLayout: { "section-1": "hinged", "section-2": "hinged" },
    compartments: 1,
    shelvesCount: 0,
    drawersCount: 0,
    rodsCount: 0,
    fill: "shelves",
    material: "white",
    facadeMaterial: "white",
    handleless: false,
  });

  assert.ok(model.panels.some((panel) => panel.kind === "facade" && panel.rotation));
  assert.ok(model.panels.some((panel) => panel.kind === "hinge"));
  assert.ok(model.panels.some((panel) => panel.kind === "slide"));
  assert.ok(model.panels.some((panel) => panel.kind === "drawerSide"));
  assert.ok(model.panels.some((panel) => panel.kind === "screw"));
  assert.ok(model.panels.filter((panel) => panel.kind === "leg").length >= 4);
});

test("three adapter N3: builds selectable section and zone targets", () => {
  const model = buildThreeFurnitureModel({
    furniture: "wardrobe",
    widthMm: 1800,
    heightMm: 2400,
    depthMm: 600,
    sections: 2,
    sectionLayout: [
      { id: "section-1", widthMm: 900 },
      { id: "section-2", widthMm: 900 },
    ],
    compartmentLayout: {
      "section-1": [
        { id: "section-1-compartment-1", heightMm: 900 },
        { id: "section-1-compartment-2", heightMm: 1500 },
      ],
      "section-2": [{ id: "section-2-compartment-1", heightMm: 2400 }],
    },
    fillingLayout: {},
    facadeLayout: { "section-1": "hinged", "section-2": "hinged" },
    selectedSectionId: "section-1",
    selectedCompartmentId: "section-1-compartment-2",
    compartments: 2,
    shelvesCount: 0,
    drawersCount: 0,
    rodsCount: 0,
    fill: "shelves",
    material: "white",
    facadeMaterial: "white",
    handleless: false,
  });

  const sectionTargets = model.interactionTargets.filter((target) => target.kind === "section");
  const zoneTargets = model.interactionTargets.filter((target) => target.kind === "compartment");

  assert.equal(sectionTargets.length, 2);
  assert.equal(zoneTargets.length, 3);
  assert.ok(zoneTargets.some((target) => target.compartmentId === "section-1-compartment-2" && target.selected));
  assert.ok(zoneTargets.every((target) => target.fullLabel.includes("зона")));
});


test("three adapter N5: zone facade override opens selected zone only", () => {
  const model = buildThreeFurnitureModel({
    furniture: "wardrobe",
    widthMm: 900,
    heightMm: 2400,
    depthMm: 600,
    sections: 1,
    sectionLayout: [{ id: "section-1", widthMm: 900 }],
    compartmentLayout: {
      "section-1": [
        { id: "section-1-compartment-1", heightMm: 800 },
        { id: "section-1-compartment-2", heightMm: 800 },
        { id: "section-1-compartment-3", heightMm: 800 },
      ],
    },
    fillingLayout: {},
    facadeLayout: { "section-1": "hinged" },
    zoneFacadeLayout: {
      "section-1": {
        "section-1-compartment-2": "open",
      },
    },
    compartments: 3,
    shelvesCount: 0,
    drawersCount: 0,
    rodsCount: 0,
    fill: "shelves",
    material: "white",
    facadeMaterial: "white",
    handleless: false,
  });

  const zoneFacades = model.panels.filter((panel) => panel.id.startsWith("facade-zone-section-1"));
  const fullSectionFacades = model.panels.filter((panel) => panel.id.startsWith("facade-section-1-leaf"));

  assert.equal(fullSectionFacades.length, 0);
  assert.equal(zoneFacades.length, 2);
  assert.ok(zoneFacades.some((panel) => panel.id.includes("section-1-compartment-1")));
  assert.ok(!zoneFacades.some((panel) => panel.id.includes("section-1-compartment-2")));
  assert.ok(zoneFacades.some((panel) => panel.id.includes("section-1-compartment-3")));
});

test("three adapter stage12: fill scene ghosts facades and preserves hardware", () => {
  const fillModel = buildThreeFurnitureModel({
    furniture: "wardrobe",
    widthMm: 1200,
    heightMm: 2200,
    depthMm: 600,
    sections: 1,
    sectionLayout: [{ id: "section-1", widthMm: 1200 }],
    compartmentLayout: { "section-1": [{ id: "section-1-compartment-1", heightMm: 2200 }] },
    fillingLayout: { "section-1": { "section-1-compartment-1": { shelvesCount: 1, drawersCount: 1, rodsCount: 1 } } },
    facadeLayout: { "section-1": "hinged" },
    compartments: 1,
    shelvesCount: 0,
    drawersCount: 0,
    rodsCount: 0,
    fill: "shelves",
    material: "white",
    facadeMaterial: "white",
    handleless: false,
    sceneMode: "fill",
  });

  assert.ok(fillModel.panels.some((panel) => panel.kind === "facade" && panel.material === "facadeGhost"));
  assert.ok(fillModel.panels.some((panel) => panel.kind === "slide" && panel.material === "hardwareLight"));
  assert.ok(fillModel.panels.some((panel) => panel.kind === "rod" && panel.material === "hardwareLight"));
});

test("three adapter stage12: materials scene keeps solid facades", () => {
  const materialModel = buildThreeFurnitureModel({
    furniture: "wardrobe",
    widthMm: 1200,
    heightMm: 2200,
    depthMm: 600,
    sections: 1,
    sectionLayout: [{ id: "section-1", widthMm: 1200 }],
    compartmentLayout: { "section-1": [{ id: "section-1-compartment-1", heightMm: 2200 }] },
    fillingLayout: {},
    facadeLayout: { "section-1": "hinged" },
    compartments: 1,
    shelvesCount: 0,
    drawersCount: 0,
    rodsCount: 0,
    fill: "shelves",
    material: "ldsp-egger-h3395-dub-korbridzh-naturalnyy-st12",
    facadeMaterial: "mdf-egger-r010-seryy-grafitovyy-ms",
    handleless: false,
    sceneMode: "materials",
  });

  assert.ok(materialModel.panels.some((panel) => panel.kind === "facade" && panel.material === "facade"));
  assert.ok(!materialModel.panels.some((panel) => panel.kind === "facade" && panel.material === "facadeGhost"));
});
