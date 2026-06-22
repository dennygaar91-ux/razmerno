/**
 * Drilling operations.
 * Все координаты на MVP — приближённые, требуют проверки технологом.
 */
import type { DrillingOperation, DrillingPurpose, FaceSide } from "./types.js";
import { createGeometryBuildContext, type GeometryBuildContext } from "./buildContext.js";


interface DrillArgs {
  panelId: string;
  purpose: DrillingPurpose;
  xMm: number;
  yMm: number;
  zMm: number;
  diameterMm: number;
  depthMm: number;
  through?: boolean;
  side: FaceSide;
  requiresTechnologistCheck?: boolean;
}

export function drilling(args: DrillArgs, buildContext: GeometryBuildContext = createGeometryBuildContext()): DrillingOperation {
  return {
    id: buildContext.nextDrillId(),
    panelId: args.panelId,
    purpose: args.purpose,
    xMm: args.xMm,
    yMm: args.yMm,
    zMm: args.zMm,
    diameterMm: args.diameterMm,
    depthMm: args.depthMm,
    through: args.through ?? false,
    side: args.side,
    requiresTechnologistCheck: args.requiresTechnologistCheck ?? true,
  };
}

/**
 * Стандартные параметры присадки.
 */
export const DRILL_SPEC = {
  /** Конфирмат под прикручивание боковин к крышке/дну. */
  confirmat: { diameterMm: 7, depthMm: 50, through: false },
  /** Эксцентрик/минификс для коэцентриков. */
  eccentric: { diameterMm: 15, depthMm: 13, through: false },
  /** Под полкодержатель — 5 мм глухое 12 мм. */
  shelfSupport: { diameterMm: 5, depthMm: 12, through: false },
  /** Под чашку петли — 35 мм глухое 13 мм. */
  hingeCup: { diameterMm: 35, depthMm: 13, through: false },
  /** Под винт-крепление петли — 3 мм. */
  hingeScrew: { diameterMm: 3, depthMm: 12, through: false },
  /** Под направляющую ящика — 4 мм. */
  drawerSlide: { diameterMm: 4, depthMm: 12, through: false },
  /** Под штангодержатель. */
  rodHolder: { diameterMm: 4, depthMm: 12, through: false },
  /** Сквозное под ручку. */
  handle: { diameterMm: 5, depthMm: 18, through: true },
} as const;
