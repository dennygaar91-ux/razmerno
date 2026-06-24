export const PRODUCTION_JSON_V4_SCHEMA = "razmerno.production.v4" as const;

export type ProductionJsonV4Schema = typeof PRODUCTION_JSON_V4_SCHEMA;

export type MaterialKindV4 = "ldsp" | "mdf" | "hdf";

export type TextureDirectionV4 = "vertical" | "horizontal" | "none";

export type GrainAxisV4 = "x" | "y" | "none";

export type MaterialSourceV4 = "seed" | "supabase" | "manual";

export type ProductTypeV4 = "wardrobe" | "dresser" | "nightstand" | "custom";

export type PanelRoleV4 =
  | "side-left"
  | "side-right"
  | "bottom"
  | "top"
  | "vertical-partition"
  | "shelf"
  | "back-panel"
  | "facade-door"
  | "drawer-front"
  | "drawer-side-left"
  | "drawer-side-right"
  | "drawer-back"
  | "drawer-bottom"
  | "plinth";

export type BasisPanelKindV4 = "vertical" | "horizontal" | "frontal";

export type PanelPlaneV4 = "XY" | "XZ" | "YZ";

export type PanelFaceSideV4 = "inner" | "outer" | "top" | "bottom";

export type EdgeBandingSideV4 = "front" | "back" | "left" | "right" | "top" | "bottom";

export type EdgeBandingCoverageV4 = "all-around" | "none";

export type BodyConstructionV4 = "side-panels-on-bottom";

export type TopPanelPlacementV4 = "between-sides";

export type SupportModeV4 =
  | "adjustable-leg-60"
  | "adjustable-leg-100"
  | "metal-spiked-adjustable-support"
  | "no-support-on-bottom";

export type HardwareTypeV4 =
  | "hinge"
  | "concealed-slide"
  | "reinforced-shelf-support"
  | "rod-holder"
  | "handle"
  | "push-to-open"
  | "adjustable-leg"
  | "metal-spiked-adjustable-support"
  | "confirmat";

export type CoordinateSpaceV4 = "world" | "panel-local" | "both";

export type BasisManualPlanStepTypeV4 =
  | "create-panels"
  | "apply-materials"
  | "apply-edge"
  | "technologist-review";

export type BasisManualPlanStepStatusV4 = "manual" | "required";

export type BasisCompatibilityModeV4 = "manual-json";

export type BasisCompatibilityStatusV4 = "manual-json-ready";

export type ReviewStatusV4 = "manual-review-required" | "approved" | "blocked";

export type ValidationSeverityV4 = "error" | "warning";

export interface ProductionV4Meta {
  orderId: string;
  generator: string;
  configVersion: string;
  createdAt?: string;
  source?: "configurator" | "api-order" | "design-example";
}

export interface BasisCompatibilityV4 {
  target: "basis-mebelshchik";
  mode: BasisCompatibilityModeV4;
  status: BasisCompatibilityStatusV4;
  doesNotGenerateB3d: true;
  requiresTechnologist: boolean;
}

export interface CoordinateAxesV4 {
  x: "left-to-right";
  y: "bottom-to-top";
  z: "front-to-back";
}

export interface CoordinateSystemV4 {
  unit: "mm";
  worldOrigin: "front-bottom-left";
  axes: CoordinateAxesV4;
  precisionMm: number;
}

export interface ProductV4 {
  type: ProductTypeV4;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  /** Customer-facing height includes support height when support affects geometry. */
  heightIncludesSupportMm: boolean;
}

export interface LockedMaterialRuleV4 {
  kind: MaterialKindV4;
  thicknessMm: number;
  locked?: boolean;
}

export interface FacadeMaterialRulesV4 {
  ldspThicknessMm: 16;
  mdfThicknessMm: 18;
}

export interface ProductionMaterialRulesV4 {
  body: LockedMaterialRuleV4 & { kind: "ldsp"; thicknessMm: 16 };
  facade: FacadeMaterialRulesV4;
  hdf: { thicknessMm: 3 };
  drawerBottom: { kind: "hdf"; thicknessMm: 3 };
}

export interface ProductionEdgeBandingRulesV4 {
  bodyThicknessMm: 1;
  facadeThicknessMm: 2;
  bodyCoverage: EdgeBandingCoverageV4;
  facadeCoverage: EdgeBandingCoverageV4;
  hdfCoverage: "none";
}

export interface PairedFacadePolicyV4 {
  centerGapMm: 3;
  sideGapMm: number;
}

export interface ProductionRulesV4 {
  materials: ProductionMaterialRulesV4;
  edgeBanding: ProductionEdgeBandingRulesV4;
  facadeGapMm: number;
  shelfFrontInsetMm: number;
  bodyConstruction: BodyConstructionV4;
  topPanelPlacement: TopPanelPlacementV4;
  pairedFacadePolicy: PairedFacadePolicyV4;
  textureDirectionPolicy: "longest-panel-side";
  hdfTextureDirection: "none";
}

export interface MaterialV4 {
  id: string;
  kind: MaterialKindV4;
  producer?: string;
  article?: string;
  decorName: string;
  thicknessMm: number;
  sheetWidthMm?: number;
  sheetHeightMm?: number;
  unit?: "m2";
  textureDirection: TextureDirectionV4;
  grainAxis?: GrainAxisV4;
  grainLocked?: boolean;
  source?: MaterialSourceV4;
}

export interface PanelDimensionsV4 {
  widthMm: number;
  heightMm: number;
  thicknessMm: number;
}

export interface PanelPositionV4 {
  xMm: number;
  yMm: number;
  zMm: number;
}

export interface PanelOrientationV4 {
  basisPanelKind: BasisPanelKindV4;
  plane: PanelPlaneV4;
  normalAxis?: "X" | "Y" | "Z";
}

export interface FacadeGapsV4 {
  topMm: number;
  rightMm: number;
  bottomMm: number;
  leftMm: number;
}

export interface PanelReviewV4 {
  requiresTechnologistCheck: boolean;
  visibleToClient: false;
}

export interface PanelV4 {
  id: string;
  objectType: "panel";
  basisObjectType: "panel";
  role: PanelRoleV4;
  name: string;
  article?: string;
  materialRef: string;
  materialKind: MaterialKindV4;
  thicknessMm: number;
  dimensions: PanelDimensionsV4;
  position?: PanelPositionV4;
  orientation: PanelOrientationV4;
  faceSide?: PanelFaceSideV4;
  textureDirection: TextureDirectionV4;
  frontInsetMm?: number;
  facadeGaps?: FacadeGapsV4;
  pairedFacadeCenterGapMm?: number;
  includeInDocumentation: boolean;
  edgeBandingRefs?: string[];
  grooveRefs?: string[];
  hardwareRefs?: string[];
  drillingRefs?: string[];
  review?: PanelReviewV4;
}

export interface AssemblyContactV4 {
  id?: string;
  panelId: string;
  restsOnPanelId: string;
  contactType: "vertical-panel-on-horizontal-panel";
  fasteningDirection: "from-bottom" | "from-side";
  requiresFasteners?: boolean;
}

export interface AssemblyV4 {
  id: string;
  objectType: "assembly";
  basisObjectType: "composite-object";
  role: "body" | "section" | "drawer" | "facade-block";
  children: string[];
  contacts: AssemblyContactV4[];
}

export interface EdgeBandingV4 {
  id: string;
  objectType: "edgeBanding";
  panelId: string;
  side: EdgeBandingSideV4;
  materialRef?: string;
  thicknessMm: number;
  lengthMm: number;
  visible: boolean;
  trimAllowanceMm?: number;
  cutAllowanceMm?: number;
  basisOperation?: "apply-edge";
}

export interface GrooveV4 {
  id: string;
  objectType: "groove";
  panelId: string;
  purpose: "back-panel-insert" | "drawer-bottom-insert";
  side: string;
  widthMm: number;
  depthMm: number;
  offsetFromBackMm?: number;
  offsetMm?: number;
  startMm?: number;
  endMm?: number;
  requiresTechnologistCheck: true;
}

export interface HardwareV4 {
  id: string;
  objectType: "hardware";
  basisObjectType: "furniture-component";
  type: HardwareTypeV4;
  supplier?: string;
  series?: string;
  model?: string;
  sku?: string | null;
  article?: string | null;
  side?: "left" | "right";
  doorType?: "overlay" | "half-overlay" | "inset";
  facadePanelId?: string;
  mountingPanelId?: string;
  targetAssemblyId?: string;
  mountingTemplateId?: string | null;
  openingAngleDeg?: number;
  cupDiameterMm?: number;
  minCupDepthMm?: number;
  drillingRefs?: string[];
  requiresTechnologistCheck: boolean;
}

export interface DrillingCoordinatesV4 {
  xMm: number;
  yMm: number;
  zMm: number;
}

export interface DrillingV4 {
  id: string;
  objectType: "drilling";
  panelId: string;
  purpose: string;
  side: string;
  coordinateSpace: CoordinateSpaceV4;
  world: DrillingCoordinatesV4 | null;
  local: DrillingCoordinatesV4 | null;
  diameterMm?: number;
  depthMm?: number;
  templateRef?: string | null;
  hardwareRef?: string;
  requiresTechnologistCheck: boolean;
}

export interface SupportV4 {
  id: string;
  objectType: "support";
  mode: SupportModeV4;
  heightMm: number;
  hardwareRequired: boolean;
  affectsBodyGeometry: boolean;
  requiresTechnologistCheck?: boolean;
  mountingPanelId?: string;
}

export interface BasisManualPlanStepV4 {
  id: string;
  type: BasisManualPlanStepTypeV4;
  status: BasisManualPlanStepStatusV4;
  description?: string;
}

export interface ValidationIssueV4 {
  code: string;
  severity: ValidationSeverityV4;
  message: string;
  visibleToClient: boolean;
  requiresTechnologistCheck?: boolean;
  path?: string;
}

export interface ValidationV4 {
  errors: ValidationIssueV4[];
  warnings: ValidationIssueV4[];
}

export interface ReviewV4 {
  visibleToClient: false;
  requiresTechnologistCheck: boolean;
  status: ReviewStatusV4;
}

export interface RevisionV4 {
  id: string;
  createdAt: string;
  label: string;
  status: ReviewStatusV4;
}

export interface AssemblyPolicySnapshotV4 {
  bodyConstruction: BodyConstructionV4;
  topPanelPlacement: TopPanelPlacementV4;
  supportMode: SupportModeV4;
  supportHeightMm: number;
  customerHeightMm: number;
  carcassHeightMm: number;
  heightIncludesSupportMm: boolean;
  shelfFrontInsetMm: number;
  facadeGapMm: number;
  pairedFacadeCenterGapMm: number;
  facadeOpening?: {
    openingWidthMm: number;
    openingHeightMm: number;
    doorWidthMm: number;
    doorHeightMm: number;
    sideGapMm: number;
    centerGapMm: number;
  };
}

export interface ProductionJsonV4 {
  schema: ProductionJsonV4Schema;
  meta: ProductionV4Meta;
  basisCompatibility: BasisCompatibilityV4;
  coordinateSystem: CoordinateSystemV4;
  product: ProductV4;
  rules: ProductionRulesV4;
  materials: MaterialV4[];
  panels: PanelV4[];
  assemblies: AssemblyV4[];
  edgeBanding: EdgeBandingV4[];
  grooves: GrooveV4[];
  hardware: HardwareV4[];
  drilling: DrillingV4[];
  supports: SupportV4[];
  basisManualPlan: BasisManualPlanStepV4[];
  validation: ValidationV4;
  review: ReviewV4;
  revisions: RevisionV4[];
  assemblyPolicySnapshot?: AssemblyPolicySnapshotV4;
}

export interface ProductionJsonV4ValidationIssue {
  code: string;
  message: string;
  path?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ProductionJsonV4ValidationIssue[];
}
