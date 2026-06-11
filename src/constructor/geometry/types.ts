/**
 * Geometry types — независимая от UI техническая модель.
 *
 * Эти типы — мост между конструктором (UI state) и productionModel v3,
 * который, в свою очередь, должен быть понятен будущему адаптеру в БАЗИС.
 *
 * Принципы:
 *  - все размеры в миллиметрах
 *  - системa координат: правая (X — ширина, Y — высота, Z — глубина),
 *    origin в левом-нижнем-переднем углу шкафа
 *  - panel.position — позиция нижнего-левого-переднего угла панели
 *  - все panel.rotation в радианах (или 0 если ось не повёрнута)
 *  - basis-поля — для будущей сериализации в .b3d / скрипт БАЗИС
 */

// ─────────────────────────────────────────────────────────────
// Входная модель (UI → geometry engine)
// ─────────────────────────────────────────────────────────────

export type ProductType = "wardrobe" | "dresser" | "nightstand";
export type FacadeMode = "open" | "hinged" | "drawers";
export type HardwareMode = "base" | "comfort";
export type OpeningMode = "push-to-open" | "hidden-handle-soft-close" | "handle-soft-close";

export type GeometryCompartmentKind = "empty" | "shelves" | "drawers" | "rod";

export interface GeometryCompartment {
  id: string;
  kind: GeometryCompartmentKind;
  heightMm: number;
  shelves: number;
  drawers: number;
  hasRod: boolean;
}

export interface GeometrySection {
  id: string;
  widthMm: number;
  facadeMode?: "open" | "hinged";
  compartments: GeometryCompartment[];
}

export interface GeometryLayout {
  sections: GeometrySection[];
}

export interface FurnitureProject {
  productType: ProductType;

  dimensions: {
    widthMm: number;
    heightMm: number;
    depthMm: number;
  };

  material: {
    bodyMaterialId: string;
    facadeMaterialId: string;
    /** ХДФ задняя стенка. Если пусто — наследуется от корпуса. */
    backPanelMaterialId?: string;
    /** ID кромки. Если пусто — подбирается по корпусу. */
    edgeMaterialId?: string;

    bodyThicknessMm: number; // 16
    facadeThicknessMm: number; // 18
    backPanelThicknessMm: number; // 3
  };

  structure: {
    sectionCount: number;
    layout?: GeometryLayout;
    /** Полки на ВСЁ изделие. На MVP делятся между секциями. */
    shelves: number;
    /** Ящики в первой секции (MVP). */
    drawers: number;
    /** Штанга — только wardrobe, в последней секции (MVP). */
    hangingRod: boolean;
    facadeMode: FacadeMode;
    /** Как открываются фасады: без ручек, скрытая ручка или классическая ручка с доводчиками. */
    openingMode: OpeningMode;
    hardwareMode: HardwareMode;
  };

  meta: {
    schemaVersion: 3;
    configVersion: string;
    createdAt: string;
  };
}

// ─────────────────────────────────────────────────────────────
// Production Model v3 — выход geometry engine
// ─────────────────────────────────────────────────────────────

export type PanelRole =
  | "side-left"
  | "side-right"
  | "top"
  | "bottom"
  | "vertical-partition"
  | "shelf"
  | "drawer-front"
  | "drawer-back"
  | "drawer-side"
  | "drawer-bottom"
  | "facade-door"
  | "back-panel"
  | "plinth";

export type MaterialType = "ldsp" | "mdf" | "hdf";

export type FaceSide = "front" | "back" | "left" | "right" | "top" | "bottom";

export type EdgeSide = "front" | "back" | "left" | "right";

export interface EdgeBandingSide {
  side: EdgeSide;
  materialId: string;
  thicknessMm: number;
  lengthMm: number;
}

export type EdgeBanding = Partial<Record<EdgeSide, EdgeBandingSide>>;

export interface Vec3Mm {
  xMm: number;
  yMm: number;
  zMm: number;
}

export interface Vec3Rad {
  x: number;
  y: number;
  z: number;
}

export interface PanelBasisMeta {
  /** В БАЗИС объект имеет тип. Для нас всегда panel. */
  objectType: "panel";
  name: string;
  article: string;
  designation: string;
  includeInDocs: boolean;
  userProperties: Record<string, string | number | boolean>;
}

export interface Panel {
  id: string;
  /** Человеческое имя для документации/спецификации. */
  name: string;
  role: PanelRole;
  materialType: MaterialType;
  materialId: string;
  thicknessMm: number;
  /** Размер по локальной оси X (большой размер плоской панели). */
  widthMm: number;
  /** Размер по локальной оси Y (второй размер плоской панели). */
  heightMm: number;
  /** Размер по локальной оси Z (= thicknessMm для плоских панелей). */
  depthMm: number;
  /** Положение в мировой системе координат (нижний-левый-передний угол панели). */
  position: Vec3Mm;
  /** Поворот в радианах. Для большинства плоских деталей — нули. */
  rotation: Vec3Rad;
  /** Какая сторона панели лицевая. Важно для текстуры/кромки/декора. */
  faceSide: FaceSide;
  edgeBanding: EdgeBanding;
  visible: boolean;
  selectable: boolean;
  basis: PanelBasisMeta;
}

export type HardwareType =
  | "hinge"
  | "drawer-slide"
  | "handle"
  | "push-to-open"
  | "rod"
  | "rod-holder"
  | "shelf-support"
  | "confirmat"
  | "eccentric"
  | "screw"
  | "leg";

export interface HardwareItem {
  id: string;
  type: HardwareType;
  name: string;
  vendor: string;
  position: Vec3Mm;
  rotation: Vec3Rad;
  /** К каким панелям прикручен. */
  linkedPanelIds: string[];
  /** Ссылки на drilling[]. */
  drillingRefs: string[];
  visibleInViewer: boolean;
  includeInDocs: boolean;
}

export type DrillingPurpose =
  | "hinge-cup"
  | "hinge-screw"
  | "drawer-slide"
  | "shelf-support"
  | "confirmat"
  | "eccentric"
  | "handle"
  | "rod-holder"
  | "back-panel-fix";

export interface DrillingOperation {
  id: string;
  panelId: string;
  purpose: DrillingPurpose;
  /** Координаты центра отверстия в мировых координатах. */
  xMm: number;
  yMm: number;
  zMm: number;
  diameterMm: number;
  depthMm: number;
  through: boolean;
  side: FaceSide;
  /** MVP: проставляется true, пока технолог не проверит. */
  requiresTechnologistCheck: boolean;
}

export interface EdgeBandingTotal {
  panelId: string;
  side: EdgeSide;
  materialId: string;
  thicknessMm: number;
  widthMm: number;
  lengthMm: number;
}

export type BasisExportAction =
  | "create-panel"
  | "set-material"
  | "set-edge"
  | "set-face-side"
  | "create-drilling"
  | "place-hardware"
  | "add-user-property"
  | "group-object";

export type BasisExportStatus = "ready" | "needs-check" | "future";

export interface BasisExportPlanStep {
  order: number;
  action: BasisExportAction;
  targetId: string;
  payload: Record<string, unknown>;
  note: string;
  status: BasisExportStatus;
}

export interface ProductionModelTotals {
  panelCount: number;
  drillingCount: number;
  hardwareCount: number;
  edgeBandingLengthMm: number;
  bodyAreaM2: number;
  facadeAreaM2: number;
  backPanelAreaM2: number;
  materialAreaM2: Partial<Record<MaterialType, number>>;
}

export interface ProductionModelWarning {
  code: string;
  severity: "info" | "warn" | "error";
  message: string;
  panelId?: string;
}

export interface ProductionModel {
  schema: "razmerno.production-model.v3";
  units: "mm";
  coordinateSystem: {
    origin: "front-bottom-left";
    axes: "right-handed: X=width, Y=height, Z=depth";
  };
  productType: ProductType;
  dimensions: { widthMm: number; heightMm: number; depthMm: number };

  panels: Panel[];
  hardware: HardwareItem[];
  drilling: DrillingOperation[];
  edgeBanding: EdgeBandingTotal[];

  totals: ProductionModelTotals;
  basisExportPlan: BasisExportPlanStep[];
  warnings: ProductionModelWarning[];

  meta: {
    schemaVersion: 3;
    configVersion: string;
    builtAt: string;
  };
}
