/**
 * План будущего экспорта в БАЗИС-Мебельщик.
 *
 * Это НЕ финальный .b3d-export — это промежуточный JSON,
 * который описывает, что технологу/скрипту нужно сделать
 * в БАЗИС, чтобы получить модель из productionModel.
 *
 * Делается по-честному:
 *  - status "ready"      — действие можно автоматизировать прямо сейчас
 *  - status "needs-check"— нужна ручная проверка технологом
 *  - status "future"     — для этого нужна доработка API/скрипта
 */
import type {
  BasisExportPlanStep,
  DrillingOperation,
  HardwareItem,
  Panel,
  ProductionModel,
} from "./types.js";

interface BuildPlanInput {
  panels: Panel[];
  hardware: HardwareItem[];
  drilling: DrillingOperation[];
  productType: ProductionModel["productType"];
}

export function buildBasisExportPlan(input: BuildPlanInput): BasisExportPlanStep[] {
  const steps: BasisExportPlanStep[] = [];
  let order = 1;

  // 1) Создание 3D-документа и системы координат
  steps.push({
    order: order++,
    action: "group-object",
    targetId: "root",
    payload: {
      type: input.productType,
      units: "mm",
      coordinateSystem: "right-handed, origin = front-bottom-left",
    },
    note: "Создаётся 3D-документ изделия. В БАЗИС это «Новый объект».",
    status: "ready",
  });

  // 2) Создание всех панелей
  for (const panel of input.panels) {
    steps.push({
      order: order++,
      action: "create-panel",
      targetId: panel.id,
      payload: {
        name: panel.basis.name,
        article: panel.basis.article,
        designation: panel.basis.designation,
        materialType: panel.materialType,
        materialId: panel.materialId,
        thicknessMm: panel.thicknessMm,
        widthMm: panel.widthMm,
        heightMm: panel.heightMm,
        position: panel.position,
        rotation: panel.rotation,
      },
      note: `Панель «${panel.basis.name}» (${panel.basis.designation}).`,
      status: "ready",
    });

    steps.push({
      order: order++,
      action: "set-face-side",
      targetId: panel.id,
      payload: { faceSide: panel.faceSide },
      note: "Указать лицевую сторону панели.",
      status: "ready",
    });

    steps.push({
      order: order++,
      action: "set-material",
      targetId: panel.id,
      payload: {
        materialId: panel.materialId,
        materialType: panel.materialType,
      },
      note: `Материал: ${panel.materialId}.`,
      status: "ready",
    });

    // Кромка по сторонам
    for (const sideKey of ["front", "back", "left", "right"] as const) {
      const edge = panel.edgeBanding[sideKey];
      if (!edge) continue;
      steps.push({
        order: order++,
        action: "set-edge",
        targetId: panel.id,
        payload: {
          side: edge.side,
          materialId: edge.materialId,
          thicknessMm: edge.thicknessMm,
          lengthMm: edge.lengthMm,
        },
        note: `Кромка ${edge.thicknessMm} мм по стороне ${edge.side}.`,
        status: "ready",
      });
    }

    // Пользовательские свойства
    for (const [key, value] of Object.entries(panel.basis.userProperties)) {
      steps.push({
        order: order++,
        action: "add-user-property",
        targetId: panel.id,
        payload: { key, value },
        note: `Пользовательское свойство: ${key}.`,
        status: "ready",
      });
    }
  }

  // 3) Присадка
  for (const d of input.drilling) {
    steps.push({
      order: order++,
      action: "create-drilling",
      targetId: d.panelId,
      payload: {
        drillingId: d.id,
        purpose: d.purpose,
        xMm: d.xMm,
        yMm: d.yMm,
        zMm: d.zMm,
        diameterMm: d.diameterMm,
        depthMm: d.depthMm,
        through: d.through,
        side: d.side,
      },
      note: `Присадка: ${d.purpose}.`,
      status: d.requiresTechnologistCheck ? "needs-check" : "ready",
    });
  }

  // 4) Установка фурнитуры
  for (const h of input.hardware) {
    steps.push({
      order: order++,
      action: "place-hardware",
      targetId: h.id,
      payload: {
        type: h.type,
        name: h.name,
        vendor: h.vendor,
        position: h.position,
        rotation: h.rotation,
        linkedPanelIds: h.linkedPanelIds,
        drillingRefs: h.drillingRefs,
      },
      note: `${h.name} (${h.type}).`,
      // Фурнитура без drilling в БАЗИС обычно требует ручного подбора фрагмента
      status: h.drillingRefs.length > 0 ? "needs-check" : "future",
    });
  }

  // 5) Финальная группировка
  steps.push({
    order: order++,
    action: "group-object",
    targetId: "root",
    payload: { action: "finalize", panelCount: input.panels.length },
    note: "Сгруппировать всё в изделие и подготовить спецификацию.",
    status: "ready",
  });

  return steps;
}
