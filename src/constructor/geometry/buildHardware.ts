/**
 * Фурнитура: петли, направляющие ящиков, штанга и держатели, полкодержатели, конфирматы.
 *
 * Правила петель по высоте фасада (MVP):
 *  - до 900 мм      → 2 петли
 *  - 901–1600 мм    → 3 петли
 *  - 1601–2200 мм   → 4 петли
 *  - выше 2200 мм   → 5 петель + technologist check
 *
 * Все координаты — MVP-приближения, отмечены requiresTechnologistCheck.
 */
import type {
  DrillingOperation,
  FurnitureProject,
  HardwareItem,
  Panel,
  ProductionModelWarning,
} from "./types";
import { drilling, DRILL_SPEC } from "./drilling";
import { createGeometryBuildContext, type GeometryBuildContext } from "./buildContext";
import { getSectionMetrics } from "./layoutMetrics";
import {
  PLINTH_HEIGHT_MM,
  hingeCountForHeight,
  hingeX,
  isHiddenHandle,
  isPushToOpen,
  oppositeHandleX,
} from "./buildHardwareHelpers";
export { hingeCountForHeight } from "./buildHardwareHelpers";

interface BuildHardwareInput {
  project: FurnitureProject;
  panels: Panel[];
  buildContext?: GeometryBuildContext;
}

interface BuildHardwareOutput {
  hardware: HardwareItem[];
  drilling: DrillingOperation[];
  warnings: ProductionModelWarning[];
}

export function buildHardware(input: BuildHardwareInput): BuildHardwareOutput {
  const { project, panels } = input;
  const buildContext = input.buildContext ?? createGeometryBuildContext();
  const hardware: HardwareItem[] = [];
  const allDrilling: DrillingOperation[] = [];
  const warnings: ProductionModelWarning[] = [];

  const vendor = project.structure.hardwareMode === "comfort" ? "Hettich" : "Firmax";
  const hasPlinth = project.productType === "wardrobe";
  const plinthH = hasPlinth ? PLINTH_HEIGHT_MM : 0;

  // ─── Конфирматы корпуса ───
  // На MVP — фиксируем боковины к крышке и дну на 2 конфирмата с каждой стороны
  const sideLeft = panels.find((p) => p.role === "side-left");
  const sideRight = panels.find((p) => p.role === "side-right");
  const top = panels.find((p) => p.role === "top");
  const bottom = panels.find((p) => p.role === "bottom");
  if (sideLeft && sideRight && top && bottom) {
    [sideLeft.id, sideRight.id].forEach((sideId) => {
      [bottom, top].forEach((horiz) => {
        const horizMidZ = horiz.position.zMm + horiz.heightMm / 2;
        const d = drilling({
          panelId: sideId,
          purpose: "confirmat",
          xMm: sideId === sideLeft.id ? project.material.bodyThicknessMm / 2 : project.dimensions.widthMm - project.material.bodyThicknessMm / 2,
          yMm: horiz === bottom ? plinthH + project.material.bodyThicknessMm / 2 : project.dimensions.heightMm - project.material.bodyThicknessMm / 2,
          zMm: horizMidZ,
          ...DRILL_SPEC.confirmat,
          side: sideId === sideLeft.id ? "right" : "left",
        }, buildContext);
        allDrilling.push(d);
        hardware.push({
          id: buildContext.nextHardwareId("conf"),
          type: "confirmat",
          name: "Конфирмат 7×50",
          vendor: "Firmax",
          position: { xMm: d.xMm, yMm: d.yMm, zMm: d.zMm },
          rotation: { x: 0, y: 0, z: 0 },
          linkedPanelIds: [sideId, horiz.id],
          drillingRefs: [d.id],
          visibleInViewer: false,
          includeInDocs: true,
        });
      });
    });
  }

  // ─── Петли на распашных фасадах ───
  const doors = panels.filter((p) => p.role === "facade-door");
  for (const door of doors) {
    const { count: hingeCount, needsCheck } = hingeCountForHeight(door.heightMm);
    if (needsCheck) {
      warnings.push({
        code: "many-hinges",
        severity: "warn",
        message: `Фасад ${door.name}: ${hingeCount} петель — нужно подтверждение технолога.`,
        panelId: door.id,
      });
    }
    // Распределим петли равномерно по высоте, отступ от краёв 100 мм
    const yMin = door.position.yMm + 100;
    const yMax = door.position.yMm + door.heightMm - 100;
    for (let i = 0; i < hingeCount; i++) {
      const yMm =
        hingeCount === 1 ? door.position.yMm + door.heightMm / 2 : yMin + ((yMax - yMin) * i) / (hingeCount - 1);
      // Чашка петли на фасаде (отверстие 35 мм)
      const cupDrill = drilling({
        panelId: door.id,
        purpose: "hinge-cup",
        xMm: hingeX(door), // 22 мм от петельного края фасада
        yMm,
        zMm: door.position.zMm + door.thicknessMm,
        ...DRILL_SPEC.hingeCup,
        side: "back",
      }, buildContext);
      allDrilling.push(cupDrill);

      hardware.push({
        id: buildContext.nextHardwareId("hin"),
        type: "hinge",
        name: vendor === "Hettich" ? "Петля Hettich Sensys 110°" : "Петля Firmax 110°",
        vendor,
        position: { xMm: hingeX(door), yMm, zMm: door.position.zMm },
        rotation: { x: 0, y: 0, z: 0 },
        linkedPanelIds: [door.id],
        drillingRefs: [cupDrill.id],
        visibleInViewer: false,
        includeInDocs: true,
      });
    }

    // Ручка / push-to-open. Источник правды — facadeStyleId → openingMode.
    if (isPushToOpen(project)) {
      hardware.push({
        id: buildContext.nextHardwareId("p2o"),
        type: "push-to-open",
        name: "Push-to-open механизм",
        vendor,
        position: {
          xMm: oppositeHandleX(door),
          yMm: door.position.yMm + door.heightMm / 2,
          zMm: door.position.zMm,
        },
        rotation: { x: 0, y: 0, z: 0 },
        linkedPanelIds: [door.id],
        drillingRefs: [],
        visibleInViewer: false,
        includeInDocs: true,
      });
    } else if (isHiddenHandle(project)) {
      hardware.push({
        id: buildContext.nextHardwareId("gola"),
        type: "handle",
        name: "Скрытая ручка-профиль",
        vendor,
        position: {
          xMm: door.position.xMm + door.widthMm / 2,
          yMm: door.position.yMm + door.heightMm - 40,
          zMm: door.position.zMm + door.thicknessMm,
        },
        rotation: { x: 0, y: 0, z: 0 },
        linkedPanelIds: [door.id],
        drillingRefs: [],
        visibleInViewer: true,
        includeInDocs: true,
      });
    } else {
      // Классическая ручка-скоба, посередине высоты, у противоположного петлям края
      const handleDrill = drilling({
        panelId: door.id,
        purpose: "handle",
        xMm: oppositeHandleX(door),
        yMm: door.position.yMm + door.heightMm / 2,
        zMm: door.position.zMm + door.thicknessMm,
        ...DRILL_SPEC.handle,
        side: "front",
      }, buildContext);
      allDrilling.push(handleDrill);
      hardware.push({
        id: buildContext.nextHardwareId("hnd"),
        type: "handle",
        name: "Ручка-скоба матовая",
        vendor,
        position: { xMm: handleDrill.xMm, yMm: handleDrill.yMm, zMm: handleDrill.zMm },
        rotation: { x: 0, y: 0, z: 0 },
        linkedPanelIds: [door.id],
        drillingRefs: [handleDrill.id],
        visibleInViewer: true,
        includeInDocs: true,
      });
    }
  }

  // ─── Направляющие ящиков ───
  const drawerFronts = panels.filter((p) => p.role === "drawer-front");
  for (const front of drawerFronts) {
    // Пара направляющих к боковинам корпуса
    const slideDrills: string[] = [];
    for (let side = 0; side < 2; side++) {
      const sideId = side === 0 ? sideLeft?.id : sideRight?.id;
      if (!sideId) continue;
      const slideDrill = drilling({
        panelId: sideId,
        purpose: "drawer-slide",
        xMm: side === 0 ? project.material.bodyThicknessMm / 2 : project.dimensions.widthMm - project.material.bodyThicknessMm / 2,
        yMm: front.position.yMm + front.heightMm / 2,
        zMm: project.dimensions.depthMm / 2,
        ...DRILL_SPEC.drawerSlide,
        side: side === 0 ? "right" : "left",
      });
      allDrilling.push(slideDrill);
      slideDrills.push(slideDrill.id);
    }
    hardware.push({
      id: buildContext.nextHardwareId("slide"),
      type: "drawer-slide",
      name: vendor === "Hettich" ? "Hettich KA5732 шариковая полного выдвижения" : "Firmax SP роликовая",
      vendor,
      position: { xMm: front.position.xMm, yMm: front.position.yMm + front.heightMm / 2, zMm: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      linkedPanelIds: [
        sideLeft?.id ?? "",
        sideRight?.id ?? "",
        front.id,
      ].filter(Boolean),
      drillingRefs: slideDrills,
      visibleInViewer: false,
      includeInDocs: true,
    });

    // Ручка фасада ящика / скрытая ручка / push-to-open по openingMode.
    if (isPushToOpen(project)) {
      hardware.push({
        id: buildContext.nextHardwareId("p2o"),
        type: "push-to-open",
        name: "Push-to-open толкатель ящика",
        vendor,
        position: {
          xMm: front.position.xMm + front.widthMm / 2,
          yMm: front.position.yMm + front.heightMm / 2,
          zMm: front.position.zMm,
        },
        rotation: { x: 0, y: 0, z: 0 },
        linkedPanelIds: [front.id],
        drillingRefs: [],
        visibleInViewer: false,
        includeInDocs: true,
      });
    } else if (isHiddenHandle(project)) {
      hardware.push({
        id: buildContext.nextHardwareId("gola"),
        type: "handle",
        name: "Скрытая ручка-профиль для ящика",
        vendor,
        position: {
          xMm: front.position.xMm + front.widthMm / 2,
          yMm: front.position.yMm + front.heightMm - 24,
          zMm: front.position.zMm + front.thicknessMm,
        },
        rotation: { x: 0, y: 0, z: 0 },
        linkedPanelIds: [front.id],
        drillingRefs: [],
        visibleInViewer: true,
        includeInDocs: true,
      });
    } else {
      const handleDrill = drilling({
        panelId: front.id,
        purpose: "handle",
        xMm: front.position.xMm + front.widthMm / 2,
        yMm: front.position.yMm + front.heightMm / 2,
        zMm: front.position.zMm + front.thicknessMm,
        ...DRILL_SPEC.handle,
        side: "front",
      }, buildContext);
      allDrilling.push(handleDrill);
      hardware.push({
        id: buildContext.nextHardwareId("hnd"),
        type: "handle",
        name: "Ручка-скоба матовая",
        vendor,
        position: { xMm: handleDrill.xMm, yMm: handleDrill.yMm, zMm: handleDrill.zMm },
        rotation: { x: 0, y: 0, z: 0 },
        linkedPanelIds: [front.id],
        drillingRefs: [handleDrill.id],
        visibleInViewer: true,
        includeInDocs: true,
      });
    }
  }

  // ─── Штанга + держатели ───
  if (project.structure.hangingRod && project.productType === "wardrobe") {
    const T = project.material.bodyThicknessMm;
    const sectionMetrics = getSectionMetrics(project);
    const fallbackMetric = sectionMetrics[sectionMetrics.length - 1] ?? {
      sectionIndex: 0,
      xStartMm: T,
      innerWidthMm: Math.max(0, project.dimensions.widthMm - T * 2),
    };

    const rodTargets = project.structure.layout?.sections?.length
      ? project.structure.layout.sections.flatMap((section, sectionIndex) => {
          const metric = sectionMetrics[sectionIndex] ?? fallbackMetric;
          let compartmentY = plinthH + T;
          const targets = section.compartments
            .map((compartment, compartmentIndex) => {
              const yStart = compartmentY;
              compartmentY += compartment.heightMm;
              if (!(compartment.kind === "rod" || compartment.hasRod)) return null;
              return {
                sectionIndex,
                compartmentIndex,
                sectionXStart: metric.xStartMm,
                sectionInnerW: metric.innerWidthMm,
                yStart,
                heightMm: compartment.heightMm,
              };
            })
            .filter(Boolean) as Array<{
              sectionIndex: number;
              compartmentIndex: number;
              sectionXStart: number;
              sectionInnerW: number;
              yStart: number;
              heightMm: number;
            }>;
          return targets;
        })
      : [
          {
            sectionIndex: fallbackMetric.sectionIndex,
            compartmentIndex: 0,
            sectionXStart: fallbackMetric.xStartMm,
            sectionInnerW: fallbackMetric.innerWidthMm,
            yStart: plinthH + T,
            heightMm: project.dimensions.heightMm - plinthH - T * 2,
          },
        ];

    for (const target of rodTargets) {
      const rodY = target.yStart + Math.max(0, target.heightMm - 250);
      const rodZ = project.dimensions.depthMm / 2;
      const rodLen = target.sectionInnerW - 20;

      hardware.push({
        id: buildContext.nextHardwareId("rod"),
        type: "rod",
        name: `Штанга для одежды Ø25 мм C${target.sectionIndex + 1}.${target.compartmentIndex + 1}`,
        vendor: "Firmax",
        position: { xMm: target.sectionXStart + 10, yMm: rodY, zMm: rodZ },
        rotation: { x: 0, y: 0, z: 0 },
        linkedPanelIds: [],
        drillingRefs: [],
        visibleInViewer: true,
        includeInDocs: true,
      });

      if (sideLeft && sideRight) {
        for (let i = 0; i < 2; i++) {
          const xMm = i === 0 ? target.sectionXStart + 5 : target.sectionXStart + 5 + rodLen;
          const drill = drilling({
            panelId: i === 0 ? sideLeft.id : sideRight.id,
            purpose: "rod-holder",
            xMm,
            yMm: rodY,
            zMm: rodZ,
            ...DRILL_SPEC.rodHolder,
            side: i === 0 ? "right" : "left",
          }, buildContext);
          allDrilling.push(drill);
          hardware.push({
            id: buildContext.nextHardwareId("rh"),
            type: "rod-holder",
            name: `Держатель штанги C${target.sectionIndex + 1}.${target.compartmentIndex + 1}`,
            vendor: "Firmax",
            position: { xMm, yMm: rodY, zMm: rodZ },
            rotation: { x: 0, y: 0, z: 0 },
            linkedPanelIds: [i === 0 ? sideLeft.id : sideRight.id],
            drillingRefs: [drill.id],
            visibleInViewer: false,
            includeInDocs: true,
          });
        }
      }
    }
  }

  // ─── Полкодержатели ───
  const shelves = panels.filter((p) => p.role === "shelf");
  if (sideLeft && sideRight) {
    for (const shelf of shelves) {
      for (let i = 0; i < 2; i++) {
        const sideId = i === 0 ? sideLeft.id : sideRight.id;
        const xMm = i === 0 ? project.material.bodyThicknessMm / 2 : project.dimensions.widthMm - project.material.bodyThicknessMm / 2;
        const drill = drilling({
          panelId: sideId,
          purpose: "shelf-support",
          xMm,
          yMm: shelf.position.yMm + project.material.bodyThicknessMm / 2,
          zMm: 60, // 60 мм от переднего края
          ...DRILL_SPEC.shelfSupport,
          side: i === 0 ? "right" : "left",
        });
        allDrilling.push(drill);
        hardware.push({
          id: buildContext.nextHardwareId("ss"),
          type: "shelf-support",
          name: "Полкодержатель Ø5",
          vendor: "Firmax",
          position: { xMm: drill.xMm, yMm: drill.yMm, zMm: drill.zMm },
          rotation: { x: 0, y: 0, z: 0 },
          linkedPanelIds: [sideId, shelf.id],
          drillingRefs: [drill.id],
          visibleInViewer: false,
          includeInDocs: true,
        });
      }
    }
  }

  return { hardware, drilling: allDrilling, warnings };
}
