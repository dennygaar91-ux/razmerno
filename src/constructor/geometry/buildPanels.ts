/**
 * Построение панелей корпуса:
 *   - дно (bottom)
 *   - крышка (top)
 *   - левая/правая боковины (side-left, side-right)
 *   - вертикальные перегородки (vertical-partition)
 *   - полки (shelf)
 *   - плинтус-цоколь (plinth) — только для wardrobe, MVP
 *
 * Система координат: origin = передний-нижний-левый угол шкафа.
 * X — ширина (вправо), Y — высота (вверх), Z — глубина (назад, от наблюдателя).
 * position у панели — координата её нижнего-левого-переднего угла.
 */
import type { FurnitureProject, Panel, ProductionModelWarning } from "./types";
import { createGeometryBuildContext, type GeometryBuildContext } from "./buildContext";
import { bodyEdgeAll, bodyEdgeFront } from "./edgeBanding";
import { getSectionMetrics } from "./layoutMetrics";

const PLINTH_HEIGHT_MM = 100; // высота цоколя у шкафа (MVP)


interface MakePanelInput {
  role: Panel["role"];
  name: string;
  materialId: string;
  thicknessMm: number;
  widthMm: number;
  heightMm: number;
  position: Panel["position"];
  rotation?: Panel["rotation"];
  faceSide?: Panel["faceSide"];
  edgeBanding: Panel["edgeBanding"];
  article: string;
}

function createPanel(input: MakePanelInput, buildContext: GeometryBuildContext): Panel {
  return {
    id: buildContext.nextPanelId(input.role.replace(/-/g, "").slice(0, 4)),
    name: input.name,
    role: input.role,
    materialType: "ldsp",
    materialId: input.materialId,
    thicknessMm: input.thicknessMm,
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    depthMm: input.thicknessMm,
    position: input.position,
    rotation: input.rotation ?? { x: 0, y: 0, z: 0 },
    faceSide: input.faceSide ?? "front",
    edgeBanding: input.edgeBanding,
    visible: true,
    selectable: true,
    basis: {
      objectType: "panel",
      name: input.name,
      article: input.article,
      designation: input.role,
      includeInDocs: true,
      userProperties: {
        roleRu: roleRu(input.role),
      },
    },
  };
}

function roleRu(role: Panel["role"]): string {
  const map: Record<Panel["role"], string> = {
    "side-left": "Боковина левая",
    "side-right": "Боковина правая",
    top: "Крышка",
    bottom: "Дно",
    "vertical-partition": "Перегородка",
    shelf: "Полка",
    "drawer-front": "Фасад ящика",
    "drawer-back": "Задняя стенка ящика",
    "drawer-side": "Боковина ящика",
    "drawer-bottom": "Дно ящика",
    "facade-door": "Фасад двери",
    "back-panel": "Задняя стенка",
    plinth: "Цоколь",
  };
  return map[role] ?? role;
}

/**
 * Строит каркас (боковины, верх, низ, перегородки) и полки.
 * Возвращает массив панелей + предупреждения.
 */
export function buildShellAndShelves(
  p: FurnitureProject,
  buildContext: GeometryBuildContext = createGeometryBuildContext(),
): { panels: Panel[]; warnings: ProductionModelWarning[] } {
  const makePanel = (input: MakePanelInput) => createPanel(input, buildContext);
  const panels: Panel[] = [];
  const warnings: ProductionModelWarning[] = [];

  const W = p.dimensions.widthMm;
  const H = p.dimensions.heightMm;
  const D = p.dimensions.depthMm;
  const T = p.material.bodyThicknessMm;
  const matId = p.material.bodyMaterialId;

  const hasPlinth = p.productType === "wardrobe";
  const plinthH = hasPlinth ? PLINTH_HEIGHT_MM : 0;

  // ─── Боковины — высокие вертикальные панели ───
  // Боковина: лицевая площадь = H × D, толщина T, направлена вдоль оси Y
  // Левая занимает x ∈ [0, T], y ∈ [plinthH, H], z ∈ [0, D]
  panels.push(
    makePanel({
      role: "side-left",
      name: "Боковина левая",
      materialId: matId,
      thicknessMm: T,
      widthMm: D, // вдоль глубины
      heightMm: H - plinthH, // вдоль высоты
      position: { xMm: 0, yMm: plinthH, zMm: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 }, // лежит вдоль Z
      faceSide: "right", // лицевая сторона смотрит внутрь шкафа
      edgeBanding: bodyEdgeFront(matId, D), // только переднее ребро
      article: "BD-SIDE-L",
    }),
  );
  panels.push(
    makePanel({
      role: "side-right",
      name: "Боковина правая",
      materialId: matId,
      thicknessMm: T,
      widthMm: D,
      heightMm: H - plinthH,
      position: { xMm: W - T, yMm: plinthH, zMm: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      faceSide: "left",
      edgeBanding: bodyEdgeFront(matId, D),
      article: "BD-SIDE-R",
    }),
  );

  // ─── Дно ───
  // Лежит горизонтально между боковинами, плоскость = X × Z
  panels.push(
    makePanel({
      role: "bottom",
      name: "Дно",
      materialId: matId,
      thicknessMm: T,
      widthMm: W - T * 2, // между боковинами
      heightMm: D,
      position: { xMm: T, yMm: plinthH, zMm: 0 },
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      faceSide: "top",
      edgeBanding: bodyEdgeFront(matId, W - T * 2),
      article: "BD-BOTTOM",
    }),
  );

  // ─── Крышка ───
  panels.push(
    makePanel({
      role: "top",
      name: "Крышка",
      materialId: matId,
      thicknessMm: T,
      widthMm: W - T * 2,
      heightMm: D,
      position: { xMm: T, yMm: H - T, zMm: 0 },
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      faceSide: "top",
      edgeBanding: bodyEdgeFront(matId, W - T * 2),
      article: "BD-TOP",
    }),
  );

  // ─── Цоколь у шкафа ───
  if (hasPlinth) {
    panels.push(
      makePanel({
        role: "plinth",
        name: "Цоколь",
        materialId: matId,
        thicknessMm: T,
        widthMm: W,
        heightMm: plinthH,
        position: { xMm: 0, yMm: 0, zMm: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        faceSide: "front",
        edgeBanding: bodyEdgeAll(matId, W, plinthH),
        article: "BD-PLINTH",
      }),
    );
  }

  // ─── Перегородки между секциями ───
  const sectionMetrics = getSectionMetrics(p);
  const sectionCount = sectionMetrics.length;
  if (sectionCount > 1) {
    for (const metric of sectionMetrics) {
      if (metric.innerWidthMm < 200) {
        warnings.push({
          code: "narrow-section",
          severity: "warn",
          message: `Внутренняя ширина секции ${metric.sectionIndex + 1} — ${Math.round(metric.innerWidthMm)} мм. Проверить раскладку.`,
        });
      }
    }

    for (let i = 1; i < sectionMetrics.length; i++) {
      const xMm = sectionMetrics[i].xStartMm - T;
      panels.push(
        makePanel({
          role: "vertical-partition",
          name: `Перегородка ${i}`,
          materialId: matId,
          thicknessMm: T,
          widthMm: D,
          heightMm: H - plinthH - T * 2, // между дном и крышкой
          position: { xMm, yMm: plinthH + T, zMm: 0 },
          rotation: { x: 0, y: Math.PI / 2, z: 0 },
          faceSide: "right",
          edgeBanding: bodyEdgeFront(matId, D),
          article: `BD-PART-${i}`,
        }),
      );
    }
  }

  // ─── Полки в секциях/отсеках ───
  const shelfDepth = D - 20; // задняя стенка отнимает ~20 мм
  const usableInnerH = H - plinthH - T * 2; // между дном и крышкой

  if (p.structure.layout?.sections?.length) {
    for (let s = 0; s < p.structure.layout.sections.length; s++) {
      const layoutSection = p.structure.layout.sections[s];
      const metric = sectionMetrics[s];
      const sectionXStart = metric?.xStartMm ?? T;
      const sectionInnerW = metric?.innerWidthMm ?? 0;
      let compartmentY = plinthH + T;

      for (let c = 0; c < layoutSection.compartments.length; c++) {
        const compartment = layoutSection.compartments[c];
        const compartmentH = Math.max(0, compartment.heightMm);
        const shelvesInCompartment = compartment.kind === "shelves" ? compartment.shelves : 0;

        if (shelvesInCompartment > 0) {
          const minGap = compartmentH / (shelvesInCompartment + 1);
          if (minGap < 300) {
            warnings.push({
              code: "tight-shelf-gap",
              severity: "warn",
              message: `Секция ${s + 1}, отсек ${c + 1}: между полками получается ${Math.round(minGap)} мм (рекомендуется ≥ 300 мм).`,
            });
          }

          for (let i = 0; i < shelvesInCompartment; i++) {
            const yMm = compartmentY + ((i + 1) * compartmentH) / (shelvesInCompartment + 1);
            panels.push(
              makePanel({
                role: "shelf",
                name: `Полка C${s + 1}.${c + 1}-${i + 1}`,
                materialId: matId,
                thicknessMm: T,
                widthMm: sectionInnerW,
                heightMm: shelfDepth,
                position: { xMm: sectionXStart, yMm, zMm: 0 },
                rotation: { x: Math.PI / 2, y: 0, z: 0 },
                faceSide: "top",
                edgeBanding: bodyEdgeFront(matId, sectionInnerW),
                article: `IN-SHELF-${s + 1}-${c + 1}-${i + 1}`,
              }),
            );
          }
        }

        compartmentY += compartmentH;
      }
    }
  } else {
    // Legacy fallback: полки делятся между секциями поровну.
    const shelvesTotal = p.structure.shelves;
    if (shelvesTotal > 0 && sectionCount > 0) {
      const shelvesPerSection = Math.floor(shelvesTotal / sectionCount);
      const remainder = shelvesTotal - shelvesPerSection * sectionCount;

      for (let s = 0; s < sectionCount; s++) {
        const shelvesInSection = shelvesPerSection + (s < remainder ? 1 : 0);
        if (shelvesInSection === 0) continue;

        const drawersHere = s === 0 ? p.structure.drawers : 0;
        const drawerZoneH =
          drawersHere > 0 ? Math.min(usableInnerH * 0.55, drawersHere * 200) : 0;

        const shelfZoneStart = plinthH + T + drawerZoneH + (drawersHere > 0 ? 30 : 0);
        const shelfZoneEnd = plinthH + T + usableInnerH;
        const shelfZoneH = shelfZoneEnd - shelfZoneStart;

        const minGap = shelfZoneH / (shelvesInSection + 1);
        if (minGap < 300) {
          warnings.push({
            code: "tight-shelf-gap",
            severity: "warn",
            message: `Секция ${s + 1}: между полками получается ${Math.round(minGap)} мм (рекомендуется ≥ 300 мм).`,
          });
        }

        const metric = sectionMetrics[s];
        const sectionXStart = metric?.xStartMm ?? T;
        const sectionInnerW = metric?.innerWidthMm ?? 0;
        for (let i = 0; i < shelvesInSection; i++) {
          const yMm = shelfZoneStart + ((i + 1) * shelfZoneH) / (shelvesInSection + 1);
          panels.push(
            makePanel({
              role: "shelf",
              name: `Полка C${s + 1}-${i + 1}`,
              materialId: matId,
              thicknessMm: T,
              widthMm: sectionInnerW,
              heightMm: shelfDepth,
              position: { xMm: sectionXStart, yMm, zMm: 0 },
              rotation: { x: Math.PI / 2, y: 0, z: 0 },
              faceSide: "top",
              edgeBanding: bodyEdgeFront(matId, sectionInnerW),
              article: `IN-SHELF-${s + 1}-${i + 1}`,
            }),
          );
        }
      }
    }
  }

  return { panels, warnings };
}
