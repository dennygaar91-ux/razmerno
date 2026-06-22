/**
 * Валидация productionModel.
 * Проверяет, что модель внутренне непротиворечива.
 */
import type {
  DrillingOperation,
  HardwareItem,
  Panel,
  PanelRole,
  ProductionModelWarning,
} from "./types.js";

const REQUIRED_ROLES: PanelRole[] = ["side-left", "side-right", "top", "bottom", "back-panel"];

export function validateProductionModel(input: {
  panels: Panel[];
  hardware: HardwareItem[];
  drilling: DrillingOperation[];
}): ProductionModelWarning[] {
  const warnings: ProductionModelWarning[] = [];
  const ids = new Set(input.panels.map((p) => p.id));

  // 1) Все обязательные роли есть
  for (const role of REQUIRED_ROLES) {
    if (!input.panels.some((p) => p.role === role)) {
      warnings.push({
        code: "missing-required-panel",
        severity: "error",
        message: `Отсутствует обязательная панель: ${role}.`,
      });
    }
  }

  // 2) Размеры положительные
  for (const p of input.panels) {
    if (p.widthMm <= 0 || p.heightMm <= 0 || p.thicknessMm <= 0) {
      warnings.push({
        code: "invalid-panel-dimensions",
        severity: "error",
        message: `Панель ${p.name} имеет некорректные размеры (W=${p.widthMm}, H=${p.heightMm}, T=${p.thicknessMm}).`,
        panelId: p.id,
      });
    }
  }

  // 3) Кромка должна иметь корректные длины
  for (const p of input.panels) {
    for (const sideKey of ["front", "back", "left", "right"] as const) {
      const edge = p.edgeBanding[sideKey];
      if (!edge) continue;
      if (edge.lengthMm <= 0) {
        warnings.push({
          code: "invalid-edge-length",
          severity: "warn",
          message: `Кромка панели ${p.name} (${sideKey}) имеет длину ${edge.lengthMm}.`,
          panelId: p.id,
        });
      }
    }
  }

  // 4) Drilling ссылается на существующую панель
  for (const d of input.drilling) {
    if (!ids.has(d.panelId)) {
      warnings.push({
        code: "orphan-drilling",
        severity: "error",
        message: `Drilling ${d.id} ссылается на несуществующую панель ${d.panelId}.`,
      });
    }
  }

  // 5) Hardware ссылается на существующие панели
  for (const h of input.hardware) {
    for (const linkedId of h.linkedPanelIds) {
      if (linkedId && !ids.has(linkedId)) {
        warnings.push({
          code: "orphan-hardware-link",
          severity: "warn",
          message: `${h.name} ссылается на несуществующую панель ${linkedId}.`,
        });
      }
    }
  }

  // 6) Простой overlap-чек: две панели в одной горизонтали с пересекающимися bbox?
  // Для MVP — проверяем только видимые корпусные элементы
  const visibleStruct = input.panels.filter(
    (p) =>
      p.visible &&
      (p.role === "side-left" ||
        p.role === "side-right" ||
        p.role === "top" ||
        p.role === "bottom" ||
        p.role === "vertical-partition"),
  );
  for (let i = 0; i < visibleStruct.length; i++) {
    for (let j = i + 1; j < visibleStruct.length; j++) {
      if (panelsOverlapInVolume(visibleStruct[i], visibleStruct[j])) {
        warnings.push({
          code: "panel-overlap",
          severity: "warn",
          message: `Возможное пересечение объёма панелей: ${visibleStruct[i].name} ↔ ${visibleStruct[j].name}.`,
        });
      }
    }
  }

  return warnings;
}

function panelsOverlapInVolume(a: Panel, b: Panel): boolean {
  // Грубое сравнение AABB на основе position + размеров.
  // На MVP считаем bbox = position .. position+(dx,dy,dz), где dx=width, dy=height, dz=thickness.
  // Учитываем, что для повёрнутых панелей оси перепутаны — поэтому считаем «эффективные» dim'ы.
  const ax1 = a.position.xMm,
    ax2 = a.position.xMm + effDimX(a),
    ay1 = a.position.yMm,
    ay2 = a.position.yMm + effDimY(a),
    az1 = a.position.zMm,
    az2 = a.position.zMm + effDimZ(a);
  const bx1 = b.position.xMm,
    bx2 = b.position.xMm + effDimX(b),
    by1 = b.position.yMm,
    by2 = b.position.yMm + effDimY(b),
    bz1 = b.position.zMm,
    bz2 = b.position.zMm + effDimZ(b);

  // Расходящиеся по любой оси — не пересекаются
  if (ax2 - 0.5 <= bx1 || bx2 - 0.5 <= ax1) return false;
  if (ay2 - 0.5 <= by1 || by2 - 0.5 <= ay1) return false;
  if (az2 - 0.5 <= bz1 || bz2 - 0.5 <= az1) return false;
  return true;
}

function effDimX(p: Panel): number {
  // Если панель повёрнута на 90° вокруг Y — её widthMm идёт вдоль Z, а толщина — вдоль X
  if (Math.abs(p.rotation.y - Math.PI / 2) < 1e-3) return p.thicknessMm;
  return p.widthMm;
}
function effDimY(p: Panel): number {
  if (Math.abs(p.rotation.x - Math.PI / 2) < 1e-3) return p.thicknessMm;
  return p.heightMm;
}
function effDimZ(p: Panel): number {
  if (Math.abs(p.rotation.y - Math.PI / 2) < 1e-3) return p.widthMm;
  if (Math.abs(p.rotation.x - Math.PI / 2) < 1e-3) return p.heightMm;
  return p.thicknessMm;
}
