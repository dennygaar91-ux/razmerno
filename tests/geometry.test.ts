/**
 * Тесты геометрического движка.
 *
 * Запуск: `npm run test:geometry` (требует tsx).
 * Без внешних зависимостей кроме tsx — простые assert'ы, без vitest/jest.
 *
 * Покрытие из спека:
 *  1. Шкаф 1800×2400×600 — все обязательные панели, разумное число фурнитуры
 *  2. Комод 1200×900×450 — есть ящики, нет цоколя
 *  3. Тумба 500×550×400 — одна секция, без штанги
 *  4. Невалидный shelf-gap → error warning
 *  5. Слишком плоский фасад ящика → error warning
 *  6. hingeCount: 900 → 2, 1600 → 3, 2200 → 4, 2400 → 5+check
 */
import assert from "node:assert/strict";
import {
  buildCabinetGeometry,
  fromConfigState,
  hingeCountForHeight,
  type FurnitureProject,
} from "../src/constructor/geometry";
import type { ConfigState } from "../src/configurator/context";

function project(overrides: Partial<FurnitureProject> = {}): FurnitureProject {
  return {
    productType: "wardrobe",
    dimensions: { widthMm: 1800, heightMm: 2400, depthMm: 600 },
    material: {
      bodyMaterialId: "white-matt",
      facadeMaterialId: "white-matt",
      backPanelMaterialId: "white-matt",
      bodyThicknessMm: 16,
      facadeThicknessMm: 18,
      backPanelThicknessMm: 4,
    },
    structure: {
      sectionCount: 2,
      shelves: 4,
      drawers: 0,
      hangingRod: true,
      facadeMode: "hinged",
      openingMode: "handle-soft-close",
      hardwareMode: "base",
    },
    meta: {
      schemaVersion: 3,
      configVersion: "test",
      createdAt: new Date().toISOString(),
    },
    ...overrides,
  };
}

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}
const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (e) {
    results.push({ name, passed: false, error: e instanceof Error ? e.message : String(e) });
  }
}

// ─────────────────────────────────────────────────────────────
// 1. Шкаф 1800×2400×600
// ─────────────────────────────────────────────────────────────
test("Шкаф 1800×2400×600: схема и обязательные роли", () => {
  const pm = buildCabinetGeometry(project());
  assert.equal(pm.schema, "razmerno.production-model.v3");
  assert.equal(pm.units, "mm");
  assert.equal(pm.productType, "wardrobe");

  const roles = pm.panels.map((p) => p.role);
  assert.ok(roles.includes("side-left"), "side-left missing");
  assert.ok(roles.includes("side-right"), "side-right missing");
  assert.ok(roles.includes("top"), "top missing");
  assert.ok(roles.includes("bottom"), "bottom missing");
  assert.ok(roles.includes("back-panel"), "back-panel missing");
  assert.ok(roles.includes("plinth"), "wardrobe should have plinth");
  assert.ok(roles.includes("facade-door"), "facade-door missing");
  assert.ok(roles.includes("shelf"), "shelves missing");
  assert.ok(roles.includes("vertical-partition"), "vertical-partition missing (sectionCount=2)");
});

test("Шкаф: hardware + drilling + штанга + полкодержатели + петли", () => {
  const pm = buildCabinetGeometry(project());
  const types = pm.hardware.map((h) => h.type);
  assert.ok(types.includes("hinge"), "hinges missing");
  assert.ok(types.includes("rod"), "rod missing");
  assert.ok(types.includes("rod-holder"), "rod-holder missing");
  assert.ok(types.includes("confirmat"), "confirmat missing");
  assert.ok(types.includes("shelf-support"), "shelf-support missing");
  assert.ok(pm.drilling.length > 0, "drilling list empty");
});

test("Шкаф: totals — площади > 0, кромка > 0", () => {
  const pm = buildCabinetGeometry(project());
  assert.ok(pm.totals.bodyAreaM2 > 0, "bodyArea must be > 0");
  assert.ok(pm.totals.facadeAreaM2 > 0, "facadeArea must be > 0");
  assert.ok(pm.totals.edgeBandingLengthMm > 0, "edgeBanding length must be > 0");
  assert.ok(pm.totals.panelCount >= 10, `panelCount too low: ${pm.totals.panelCount}`);
});

test("Шкаф: basisExportPlan содержит create-panel и set-edge для каждой панели", () => {
  const pm = buildCabinetGeometry(project());
  const createPanelSteps = pm.basisExportPlan.filter((s) => s.action === "create-panel");
  assert.equal(createPanelSteps.length, pm.panels.length);
  const setEdgeSteps = pm.basisExportPlan.filter((s) => s.action === "set-edge");
  assert.ok(setEdgeSteps.length > 0, "no set-edge steps in plan");
});

// ─────────────────────────────────────────────────────────────
// 2. Комод 1200×900×450
// ─────────────────────────────────────────────────────────────
test("Комод 1200×900×450: ящики есть, цоколя нет", () => {
  const pm = buildCabinetGeometry(
    project({
      productType: "dresser",
      dimensions: { widthMm: 1200, heightMm: 900, depthMm: 450 },
      structure: {
        sectionCount: 1,
        shelves: 0,
        drawers: 4,
        hangingRod: false,
        facadeMode: "drawers",
        openingMode: "handle-soft-close",
        hardwareMode: "comfort",
      },
    }),
  );
  const roles = pm.panels.map((p) => p.role);
  assert.ok(!roles.includes("plinth"), "dresser should NOT have plinth");
  assert.ok(roles.includes("drawer-front"), "drawer-front missing");
  assert.ok(roles.includes("drawer-side"), "drawer-side missing");
  assert.ok(roles.includes("drawer-bottom"), "drawer-bottom missing");
  // 4 ящика → 4 drawer-front
  const drawerFronts = pm.panels.filter((p) => p.role === "drawer-front");
  assert.equal(drawerFronts.length, 4, `expected 4 drawer-front, got ${drawerFronts.length}`);
});

test("Комод: drawer-slide создаётся для ящиков", () => {
  const pm = buildCabinetGeometry(
    project({
      productType: "dresser",
      dimensions: { widthMm: 1200, heightMm: 900, depthMm: 450 },
      structure: {
        sectionCount: 1,
        shelves: 0,
        drawers: 3,
        hangingRod: false,
        facadeMode: "drawers",
        openingMode: "handle-soft-close",
        hardwareMode: "comfort",
      },
    }),
  );
  // В drawers-режиме фасадных дверей нет → нет ни ручек, ни push-to-open от дверей
  const types = pm.hardware.map((h) => h.type);
  assert.ok(types.includes("drawer-slide"), "drawer-slide missing in comfort mode");
});

// ─────────────────────────────────────────────────────────────
// 3. Тумба 500×550×400
// ─────────────────────────────────────────────────────────────
test("Тумба 500×550×400: одна секция, без штанги, без цоколя", () => {
  const pm = buildCabinetGeometry(
    project({
      productType: "nightstand",
      dimensions: { widthMm: 500, heightMm: 550, depthMm: 400 },
      structure: {
        sectionCount: 1,
        shelves: 1,
        drawers: 1,
        hangingRod: false,
        facadeMode: "hinged",
        openingMode: "handle-soft-close",
        hardwareMode: "base",
      },
    }),
  );
  const roles = pm.panels.map((p) => p.role);
  assert.ok(!roles.includes("plinth"), "nightstand should NOT have plinth");
  assert.ok(!roles.includes("vertical-partition"), "single-section: no partitions");
  const rods = pm.hardware.filter((h) => h.type === "rod");
  assert.equal(rods.length, 0, "nightstand should not have rod");
});

// ─────────────────────────────────────────────────────────────
// 4. Невалидный shelf-gap
// ─────────────────────────────────────────────────────────────
test("Слишком много полок в низкой секции → warning tight-shelf-gap", () => {
  const pm = buildCabinetGeometry(
    project({
      dimensions: { widthMm: 1200, heightMm: 1000, depthMm: 500 },
      structure: {
        sectionCount: 1,
        shelves: 6,
        drawers: 0,
        hangingRod: false,
        facadeMode: "hinged",
        openingMode: "handle-soft-close",
        hardwareMode: "base",
      },
    }),
  );
  const codes = pm.warnings.map((w) => w.code);
  assert.ok(codes.includes("tight-shelf-gap"), "expected tight-shelf-gap warning");
});

// ─────────────────────────────────────────────────────────────
// 5. Низкий фасад ящика
// ─────────────────────────────────────────────────────────────
test("Слишком много ящиков → drawer-front-too-low error", () => {
  const pm = buildCabinetGeometry(
    project({
      productType: "dresser",
      dimensions: { widthMm: 800, heightMm: 600, depthMm: 400 },
      structure: {
        sectionCount: 1,
        shelves: 0,
        drawers: 6, // на 600мм высоту 6 ящиков не помещается
        hangingRod: false,
        facadeMode: "drawers",
        openingMode: "handle-soft-close",
        hardwareMode: "base",
      },
    }),
  );
  const codes = pm.warnings.map((w) => w.code);
  assert.ok(
    codes.includes("drawer-front-too-low"),
    `expected drawer-front-too-low, got: ${codes.join(", ")}`,
  );
});

// ─────────────────────────────────────────────────────────────
// 6. Правила петель по высоте
// ─────────────────────────────────────────────────────────────
test("hingeCountForHeight: правила по высоте фасада", () => {
  assert.deepEqual(hingeCountForHeight(800), { count: 2, needsCheck: false });
  assert.deepEqual(hingeCountForHeight(900), { count: 2, needsCheck: false });
  assert.deepEqual(hingeCountForHeight(901), { count: 3, needsCheck: false });
  assert.deepEqual(hingeCountForHeight(1600), { count: 3, needsCheck: false });
  assert.deepEqual(hingeCountForHeight(1601), { count: 4, needsCheck: false });
  assert.deepEqual(hingeCountForHeight(2200), { count: 4, needsCheck: false });
  assert.deepEqual(hingeCountForHeight(2400), { count: 5, needsCheck: true });
});


test("Opening mode: no-handle даёт push-to-open без ручек", () => {
  const pm = buildCabinetGeometry(
    project({
      structure: {
        sectionCount: 1,
        shelves: 2,
        drawers: 0,
        hangingRod: false,
        facadeMode: "hinged",
        openingMode: "push-to-open",
        hardwareMode: "comfort",
      },
    }),
  );
  const types = pm.hardware.map((h) => h.type);
  assert.ok(types.includes("push-to-open"), "push-to-open missing");
  assert.ok(!types.includes("handle"), "handle should not be created for no-handle opening");
});

test("Opening mode: regular/hidden handle не создаёт push-to-open", () => {
  const regular = buildCabinetGeometry(
    project({
      structure: {
        sectionCount: 1,
        shelves: 2,
        drawers: 0,
        hangingRod: false,
        facadeMode: "hinged",
        openingMode: "handle-soft-close",
        hardwareMode: "comfort",
      },
    }),
  );
  const regularTypes = regular.hardware.map((h) => h.type);
  assert.ok(regularTypes.includes("handle"), "regular handle missing");
  assert.ok(!regularTypes.includes("push-to-open"), "push-to-open should not be created for regular handle");

  const hidden = buildCabinetGeometry(
    project({
      structure: {
        sectionCount: 1,
        shelves: 2,
        drawers: 0,
        hangingRod: false,
        facadeMode: "hinged",
        openingMode: "hidden-handle-soft-close",
        hardwareMode: "comfort",
      },
    }),
  );
  const hiddenTypes = hidden.hardware.map((h) => h.type);
  assert.ok(hiddenTypes.includes("handle"), "hidden handle hardware missing");
  assert.ok(!hiddenTypes.includes("push-to-open"), "push-to-open should not be created for hidden handle");
});


test("UI adapter: facadeStyleId управляет openingMode, hardwareId сохраняет выбор клиента", () => {
  const baseState: ConfigState = {
    type: "wardrobe",
    width: 1800,
    height: 2400,
    depth: 600,
    sections: 2,
    filling: { shelves: 4, drawers: 0, hangingRod: true },
    bodyMaterialId: "white-matt",
    facadeMaterialId: "oak-natural",
  facadeMaterialKind: "ldsp",
    facadeStyleId: "no-handle",
    hardwareId: "base",
    activeStep: 0,
    checkoutOpen: false,
    checkoutMode: "order",
    highlightedPart: null,
    orderId: null,
  };

  const noHandle = fromConfigState(baseState, "test");
  assert.equal(noHandle.structure.openingMode, "push-to-open");
  assert.equal(noHandle.structure.hardwareMode, "base");

  const regular = fromConfigState({ ...baseState, facadeStyleId: "regular" }, "test");
  assert.equal(regular.structure.openingMode, "handle-soft-close");
  assert.equal(regular.structure.hardwareMode, "base");

  const hidden = fromConfigState({ ...baseState, facadeStyleId: "hidden-handle" }, "test");
  assert.equal(hidden.structure.openingMode, "hidden-handle-soft-close");
  assert.equal(hidden.structure.hardwareMode, "base");

  const comfort = fromConfigState({ ...baseState, hardwareId: "comfort" }, "test");
  assert.equal(comfort.structure.openingMode, "push-to-open");
  assert.equal(comfort.structure.hardwareMode, "comfort");
});


test("Граничный фасад ящика: drawerH 200 мм всё равно ошибка, потому что фасад 194 мм", () => {
  const pm = buildCabinetGeometry(
    project({
      productType: "dresser",
      dimensions: { widthMm: 800, heightMm: 420, depthMm: 400 },
      structure: {
        sectionCount: 1,
        shelves: 0,
        drawers: 1,
        hangingRod: false,
        facadeMode: "drawers",
        openingMode: "handle-soft-close",
        hardwareMode: "comfort",
      },
    }),
  );
  const drawerFront = pm.panels.find((p) => p.role === "drawer-front");
  assert.ok(drawerFront, "drawer-front missing");
  assert.equal(Math.round(drawerFront.heightMm), 194);
  assert.ok(pm.warnings.some((w) => w.code === "drawer-front-too-low"), "expected drawer-front-too-low for actual 194mm facade");
});


test("Парные фасады: левая створка с петлями слева, правая — справа", () => {
  const pm = buildCabinetGeometry(
    project({
      dimensions: { widthMm: 1800, heightMm: 2400, depthMm: 600 },
      structure: {
        sectionCount: 1,
        shelves: 2,
        drawers: 0,
        hangingRod: false,
        facadeMode: "hinged",
        openingMode: "handle-soft-close",
        hardwareMode: "comfort",
      },
    }),
  );

  const doors = pm.panels.filter((p) => p.role === "facade-door").sort((a, b) => a.position.xMm - b.position.xMm);
  assert.equal(doors.length, 2, `expected paired doors, got ${doors.length}`);
  assert.equal(doors[0].basis.userProperties.hingeSide, "left");
  assert.equal(doors[1].basis.userProperties.hingeSide, "right");

  const leftCup = pm.drilling.find((d) => d.panelId === doors[0].id && d.purpose === "hinge-cup");
  const rightCup = pm.drilling.find((d) => d.panelId === doors[1].id && d.purpose === "hinge-cup");
  assert.ok(leftCup, "left hinge cup missing");
  assert.ok(rightCup, "right hinge cup missing");
  assert.equal(Math.round(leftCup.xMm - doors[0].position.xMm), 22);
  assert.equal(Math.round(doors[1].position.xMm + doors[1].widthMm - rightCup.xMm), 22);
});


test("Ручки на парных фасадах ставятся у противоположного петлям края", () => {
  const pm = buildCabinetGeometry(
    project({
      dimensions: { widthMm: 1800, heightMm: 2400, depthMm: 600 },
      structure: {
        sectionCount: 1,
        shelves: 2,
        drawers: 0,
        hangingRod: false,
        facadeMode: "hinged",
        openingMode: "handle-soft-close",
        hardwareMode: "comfort",
      },
    }),
  );

  const doors = pm.panels.filter((p) => p.role === "facade-door").sort((a, b) => a.position.xMm - b.position.xMm);
  assert.equal(doors.length, 2, `expected paired doors, got ${doors.length}`);

  const leftHandle = pm.hardware.find((h) => h.type === "handle" && h.linkedPanelIds.includes(doors[0].id));
  const rightHandle = pm.hardware.find((h) => h.type === "handle" && h.linkedPanelIds.includes(doors[1].id));
  assert.ok(leftHandle, "left handle missing");
  assert.ok(rightHandle, "right handle missing");

  assert.equal(Math.round(doors[0].position.xMm + doors[0].widthMm - leftHandle.position.xMm), 30);
  assert.equal(Math.round(rightHandle.position.xMm - doors[1].position.xMm), 30);
});

test("Push-to-open на парных фасадах ставится у противоположного петлям края и без ручек", () => {
  const pm = buildCabinetGeometry(
    project({
      dimensions: { widthMm: 1800, heightMm: 2400, depthMm: 600 },
      structure: {
        sectionCount: 1,
        shelves: 2,
        drawers: 0,
        hangingRod: false,
        facadeMode: "hinged",
        openingMode: "push-to-open",
        hardwareMode: "comfort",
      },
    }),
  );

  const doors = pm.panels.filter((p) => p.role === "facade-door").sort((a, b) => a.position.xMm - b.position.xMm);
  assert.equal(doors.length, 2, `expected paired doors, got ${doors.length}`);

  const leftP2o = pm.hardware.find((h) => h.type === "push-to-open" && h.linkedPanelIds.includes(doors[0].id));
  const rightP2o = pm.hardware.find((h) => h.type === "push-to-open" && h.linkedPanelIds.includes(doors[1].id));
  assert.ok(leftP2o, "left push-to-open missing");
  assert.ok(rightP2o, "right push-to-open missing");

  assert.equal(Math.round(doors[0].position.xMm + doors[0].widthMm - leftP2o.position.xMm), 30);
  assert.equal(Math.round(rightP2o.position.xMm - doors[1].position.xMm), 30);

  const handleHardware = pm.hardware.filter((h) => h.type === "handle" && h.linkedPanelIds.some((id) => doors.some((d) => d.id === id)));
  assert.equal(handleHardware.length, 0, "no-handle mode must not create handle hardware for doors");
});

test("Ящики без ручек получают push-to-open толкатели без ручек", () => {
  const pm = buildCabinetGeometry(
    project({
      productType: "dresser",
      dimensions: { widthMm: 1200, heightMm: 900, depthMm: 450 },
      structure: {
        sectionCount: 1,
        shelves: 0,
        drawers: 3,
        hangingRod: false,
        facadeMode: "drawers",
        openingMode: "push-to-open",
        hardwareMode: "comfort",
      },
    }),
  );

  const drawerFronts = pm.panels.filter((p) => p.role === "drawer-front");
  const drawerP2o = pm.hardware.filter((h) => h.type === "push-to-open" && h.name.includes("ящика"));
  const drawerHandles = pm.hardware.filter((h) => h.type === "handle" && h.linkedPanelIds.some((id) => drawerFronts.some((front) => front.id === id)));

  assert.equal(drawerP2o.length, drawerFronts.length);
  assert.equal(drawerHandles.length, 0, "push-to-open drawers must not create handle hardware");
});


test("ProductionModel: все drillingRefs ссылаются на существующие drilling", () => {
  const pm = buildCabinetGeometry(project());
  const drillingIds = new Set(pm.drilling.map((d) => d.id));
  for (const item of pm.hardware) {
    for (const ref of item.drillingRefs) {
      assert.ok(drillingIds.has(ref), `hardware ${item.id} references missing drilling ${ref}`);
    }
  }
});

test("ProductionModel: все linkedPanelIds ссылаются на существующие панели", () => {
  const pm = buildCabinetGeometry(project());
  const panelIds = new Set(pm.panels.map((p) => p.id));
  for (const item of pm.hardware) {
    for (const panelId of item.linkedPanelIds) {
      assert.ok(panelIds.has(panelId), `hardware ${item.id} references missing panel ${panelId}`);
    }
  }
});

test("ProductionModel: все размеры панелей положительные", () => {
  const pm = buildCabinetGeometry(project());
  for (const panel of pm.panels) {
    assert.ok(panel.widthMm > 0, `${panel.id} width must be > 0`);
    assert.ok(panel.heightMm > 0, `${panel.id} height must be > 0`);
    assert.ok(panel.depthMm > 0, `${panel.id} depth must be > 0`);
    assert.ok(panel.thicknessMm > 0, `${panel.id} thickness must be > 0`);
  }
});

test("ProductionModel: open facadeMode не создаёт фасадные двери", () => {
  const pm = buildCabinetGeometry(
    project({
      structure: {
        sectionCount: 2,
        shelves: 4,
        drawers: 0,
        hangingRod: true,
        facadeMode: "open",
        openingMode: "handle-soft-close",
        hardwareMode: "comfort",
      },
    }),
  );
  assert.equal(pm.panels.filter((p) => p.role === "facade-door").length, 0);
  assert.equal(pm.hardware.filter((h) => h.type === "hinge").length, 0);
});

test("ProductionModel: configVersion сохраняется в meta", () => {
  const pm = buildCabinetGeometry(project({ meta: { schemaVersion: 3, configVersion: "cfg-123", createdAt: "2026-05-25T00:00:00.000Z" } }));
  assert.equal(pm.meta.configVersion, "cfg-123");
});

test("ProductionModel: basisExportPlan create-drilling соответствует drilling count", () => {
  const pm = buildCabinetGeometry(project());
  const drillingSteps = pm.basisExportPlan.filter((step) => step.action === "create-drilling");
  assert.equal(drillingSteps.length, pm.drilling.length);
});


test("Extreme dimensions: минимальный шкаф строится без отрицательных размеров", () => {
  const pm = buildCabinetGeometry(
    project({
      dimensions: { widthMm: 800, heightMm: 1800, depthMm: 400 },
      structure: {
        sectionCount: 1,
        shelves: 2,
        drawers: 0,
        hangingRod: false,
        facadeMode: "hinged",
        openingMode: "handle-soft-close",
        hardwareMode: "base",
      },
    }),
  );

  assert.ok(pm.panels.length > 0);
  assert.ok(pm.panels.every((p) => p.widthMm > 0 && p.heightMm > 0 && p.depthMm > 0));
  assert.ok(!pm.warnings.some((w) => w.severity === "error"), "minimum wardrobe should not produce geometry errors");
});

test("Extreme dimensions: максимальный шкаф строится и сохраняет totals", () => {
  const pm = buildCabinetGeometry(
    project({
      dimensions: { widthMm: 3200, heightMm: 2700, depthMm: 700 },
      structure: {
        sectionCount: 4,
        shelves: 8,
        drawers: 0,
        hangingRod: true,
        facadeMode: "hinged",
        openingMode: "hidden-handle-soft-close",
        hardwareMode: "comfort",
      },
    }),
  );

  assert.ok(pm.totals.panelCount > 0);
  assert.ok(pm.totals.bodyAreaM2 > 0);
  assert.ok(pm.totals.edgeBandingLengthMm > 0);
  assert.ok(pm.hardware.some((h) => h.type === "rod"));
});

test("Extreme dimensions: узкие секции дают warning/error tight section", () => {
  const pm = buildCabinetGeometry(
    project({
      dimensions: { widthMm: 800, heightMm: 2200, depthMm: 500 },
      structure: {
        sectionCount: 4,
        shelves: 4,
        drawers: 0,
        hangingRod: false,
        facadeMode: "open",
        openingMode: "handle-soft-close",
        hardwareMode: "base",
      },
    }),
  );

  assert.ok(pm.warnings.some((w) => w.code === "narrow-section"), "expected narrow-section warning");
});

test("Extreme dimensions: штанга при малой глубине всё равно создаёт rod hardware в MVP", () => {
  const pm = buildCabinetGeometry(
    project({
      dimensions: { widthMm: 1200, heightMm: 2100, depthMm: 400 },
      structure: {
        sectionCount: 2,
        shelves: 2,
        drawers: 0,
        hangingRod: true,
        facadeMode: "hinged",
        openingMode: "handle-soft-close",
        hardwareMode: "base",
      },
    }),
  );

  assert.ok(pm.hardware.some((h) => h.type === "rod"), "expected hanger rod hardware");
  assert.ok(pm.drilling.some((d) => d.purpose === "rod-holder"), "expected rod-holder drilling");
});

test("Extreme dimensions: слишком много полок даёт tight-shelf-gap", () => {
  const pm = buildCabinetGeometry(
    project({
      dimensions: { widthMm: 1000, heightMm: 1800, depthMm: 500 },
      structure: {
        sectionCount: 1,
        shelves: 12,
        drawers: 0,
        hangingRod: false,
        facadeMode: "open",
        openingMode: "handle-soft-close",
        hardwareMode: "base",
      },
    }),
  );

  assert.ok(pm.warnings.some((w) => w.code === "tight-shelf-gap"), "expected tight-shelf-gap warning");
});

// ─────────────────────────────────────────────────────────────
// Результаты
// ─────────────────────────────────────────────────────────────
console.log("");
console.log("Geometry tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) {
    console.log(`      ${r.error}`);
  }
}
const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
