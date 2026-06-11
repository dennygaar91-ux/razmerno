import { createContext, useContext, useEffect, useReducer, useMemo, type ReactNode } from "react";
import { MATERIALS, FACADE_STYLES, HARDWARE, type Material, type FacadeStyle, type Hardware } from "./data";
import { calculatePrice as enginePrice, type PriceBreakdown } from "../shared/lib/price";
import limitsConfig from "../config/limits.json";
import { legacyFillingToLayout, summarizeLayoutFilling, addSectionByWidth, addCompartmentByHeight, setCompartmentKind, setCompartmentShelves, setCompartmentDrawers, type LayoutModel, type CompartmentKind } from "./model/compartments";

export type FurnitureType = "wardrobe" | "dresser" | "nightstand";

export interface Filling {
  shelves: number;
  drawers: number;
  hangingRod: boolean;
}

export interface ConfigState {
  type: FurnitureType | null;

  // Размеры (мм)
  width: number;
  height: number;
  depth: number;

  // Секции
  sections: number;

  // Наполнение
  filling: Filling;
  layout: LayoutModel;

  // Материалы
  bodyMaterialId: string;
  facadeMaterialId: string;
  facadeMaterialKind: "ldsp" | "mdf";

  // Стиль фасада
  facadeStyleId: string;

  // Фурнитура
  hardwareId: string;

  // UX
  advancedLayout: boolean;
  selectedCompartmentId: string | null;
  activeStep: number;
  checkoutOpen: boolean;
  checkoutMode: "consultation" | "order";
  /** Подсветка элементов превью при наведении/фокусе контролов */
  highlightedPart: "body" | "sections" | "shelves" | "drawers" | "rod" | "facade" | null;

  // Order
  orderId: string | null;
  lastSubmittedAt: number | null;
}


export function makeCompatibleLayout(state: Pick<ConfigState, "type" | "width" | "height" | "depth" | "sections" | "filling">): LayoutModel {
  return legacyFillingToLayout({
    type: state.type ?? "wardrobe",
    dimensions: { width: state.width, height: state.height, depth: state.depth },
    sectionCount: state.sections,
    filling: state.filling,
  });
}

function withLayout(next: ConfigState): ConfigState {
  return { ...next, selectedCompartmentId: null, layout: makeCompatibleLayout(next) };
}

export const initialState: ConfigState = {
  type: null,
  width: 1800,
  height: 2400,
  depth: 600,
  sections: 2,
  filling: { shelves: 4, drawers: 0, hangingRod: true },
  layout: legacyFillingToLayout({ type: "wardrobe", dimensions: { width: 1800, height: 2400, depth: 600 }, sectionCount: 2, filling: { shelves: 4, drawers: 0, hangingRod: true } }),
  bodyMaterialId: "white-matt",
  facadeMaterialId: "oak-natural",
  facadeMaterialKind: "ldsp",
  facadeStyleId: "no-handle",
  hardwareId: "comfort",
  advancedLayout: false,
  selectedCompartmentId: null,
  activeStep: 0,
  checkoutOpen: false,
  checkoutMode: "order",
  highlightedPart: null,
  orderId: null,
  lastSubmittedAt: null,
};

export type ConfigAction =
  | { type: "SET_TYPE"; payload: FurnitureType }
  | { type: "SET_DIM"; payload: { dim: "width" | "height" | "depth"; value: number } }
  | { type: "SET_SECTIONS"; payload: number }
  | { type: "SET_FILLING"; payload: Partial<Filling> }
  | { type: "APPLY_FILLING_PRESET"; payload: Filling }
  | { type: "SET_LAYOUT"; payload: LayoutModel }
  | { type: "SET_COMPARTMENT_KIND"; payload: { sectionId: string; compartmentId: string; kind: CompartmentKind } }
  | { type: "SET_COMPARTMENT_SHELVES"; payload: { sectionId: string; compartmentId: string; shelves: number } }
  | { type: "SET_COMPARTMENT_DRAWERS"; payload: { sectionId: string; compartmentId: string; drawers: number } }
  | { type: "ADD_SECTION_BY_WIDTH" }
  | { type: "ADD_COMPARTMENT_BY_HEIGHT"; payload: { sectionId: string } }
  | { type: "SET_BODY_MATERIAL"; payload: string }
  | { type: "SET_FACADE_MATERIAL"; payload: string }
  | { type: "SET_FACADE_MATERIAL_KIND"; payload: "ldsp" | "mdf" }
  | { type: "SET_FACADE_STYLE"; payload: string }
  | { type: "SET_HARDWARE"; payload: string }
  | { type: "SET_ADVANCED_LAYOUT"; payload: boolean }
  | { type: "SET_SELECTED_COMPARTMENT"; payload: string | null }
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_HIGHLIGHT"; payload: ConfigState["highlightedPart"] }
  | { type: "OPEN_CHECKOUT"; payload?: "consultation" | "order" }
  | { type: "CLOSE_CHECKOUT" }
  | { type: "SET_ORDER_ID"; payload: string }
  | { type: "CLEAR_ORDER_STATUS" }
  | { type: "RESET" };

export function configReducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case "SET_TYPE": {
      const presets: Record<FurnitureType, Partial<ConfigState>> = {
        wardrobe: { width: 1800, height: 2400, depth: 600, sections: 2, filling: { shelves: 4, drawers: 0, hangingRod: true } },
        dresser: { width: 1200, height: 900, depth: 450, sections: 2, filling: { shelves: 1, drawers: 4, hangingRod: false } },
        nightstand: { width: 500, height: 550, depth: 400, sections: 1, filling: { shelves: 1, drawers: 2, hangingRod: false } },
      };
      return withLayout({ ...state, type: action.payload, ...presets[action.payload] });
    }
    case "SET_DIM":
      return withLayout({ ...state, [action.payload.dim]: action.payload.value });
    case "SET_SECTIONS":
      return withLayout({ ...state, sections: action.payload });
    case "SET_FILLING":
      return withLayout({ ...state, filling: { ...state.filling, ...action.payload } });
    case "APPLY_FILLING_PRESET":
      return withLayout({ ...state, filling: action.payload });
    case "SET_LAYOUT": {
      const filling = summarizeLayoutFilling(action.payload);
      return { ...state, layout: action.payload, filling };
    }
    case "SET_COMPARTMENT_KIND": {
      const layout = setCompartmentKind(state.layout, action.payload.sectionId, action.payload.compartmentId, action.payload.kind);
      return { ...state, layout, filling: summarizeLayoutFilling(layout) };
    }
    case "SET_COMPARTMENT_SHELVES": {
      const layout = setCompartmentShelves(state.layout, action.payload.sectionId, action.payload.compartmentId, action.payload.shelves);
      return { ...state, layout, filling: summarizeLayoutFilling(layout) };
    }
    case "SET_COMPARTMENT_DRAWERS": {
      const layout = setCompartmentDrawers(state.layout, action.payload.sectionId, action.payload.compartmentId, action.payload.drawers);
      return { ...state, layout, filling: summarizeLayoutFilling(layout) };
    }
    case "ADD_SECTION_BY_WIDTH": {
      if (state.type === "nightstand") return state;
      const layout = addSectionByWidth(state.layout, { width: state.width, height: state.height, depth: state.depth });
      return { ...state, sections: layout.sections.length, layout, filling: summarizeLayoutFilling(layout), selectedCompartmentId: null };
    }
    case "ADD_COMPARTMENT_BY_HEIGHT": {
      const layout = addCompartmentByHeight(state.layout, action.payload.sectionId, state.height);
      return { ...state, layout, filling: summarizeLayoutFilling(layout), selectedCompartmentId: null };
    }
    case "SET_BODY_MATERIAL":
      return { ...state, bodyMaterialId: action.payload };
    case "SET_FACADE_MATERIAL":
      return { ...state, facadeMaterialId: action.payload };
    case "SET_FACADE_MATERIAL_KIND":
      return { ...state, facadeMaterialKind: action.payload };
    case "SET_FACADE_STYLE":
      return { ...state, facadeStyleId: action.payload };
    case "SET_HARDWARE":
      return { ...state, hardwareId: action.payload };
    case "SET_ADVANCED_LAYOUT":
      return { ...state, advancedLayout: action.payload, selectedCompartmentId: action.payload ? state.selectedCompartmentId : null };
    case "SET_SELECTED_COMPARTMENT":
      return { ...state, selectedCompartmentId: action.payload };
    case "SET_STEP":
      return { ...state, activeStep: action.payload };
    case "SET_HIGHLIGHT":
      return { ...state, highlightedPart: action.payload };
    case "OPEN_CHECKOUT":
      return { ...state, checkoutOpen: true, checkoutMode: action.payload ?? "order" };
    case "CLOSE_CHECKOUT":
      return { ...state, checkoutOpen: false };
    case "SET_ORDER_ID":
      return { ...state, orderId: action.payload, lastSubmittedAt: Date.now() };
    case "CLEAR_ORDER_STATUS":
      return { ...state, orderId: null };
    case "RESET":
      return { ...initialState, layout: makeCompatibleLayout(initialState) };
    default:
      return state;
  }
}

// ─────────────────────────────────────────
// Pricing — единый engine (п.11.1 ТЗ)
// ─────────────────────────────────────────
export function calculatePrice(s: ConfigState): PriceBreakdown {
  const bodyMat = MATERIALS.find((m) => m.id === s.bodyMaterialId) ?? MATERIALS[0];
  const facadeMat = MATERIALS.find((m) => m.id === s.facadeMaterialId) ?? MATERIALS[0];
  const facade = FACADE_STYLES.find((f) => f.id === s.facadeStyleId) ?? FACADE_STYLES[0];
  const hw = HARDWARE.find((h) => h.id === s.hardwareId) ?? HARDWARE[0];

  return enginePrice({
    type: s.type ?? "wardrobe",
    dimensions: { width: s.width, height: s.height, depth: s.depth },
    sections: s.sections,
    filling: s.filling,
    bodyPricePerLiter: bodyMat.pricePerLiter,
    facadePricePerLiter: facadeMat.pricePerLiter,
    facadeStyleMultiplier: facade.priceMultiplier,
    hardwareBasePrice: hw.basePrice,
    hardwarePriceFactor: hw.priceFactor,
  });
}

// ─────────────────────────────────────────
// Validation (п.11.3 ТЗ)
// ─────────────────────────────────────────
export interface ValidationMessage {
  kind: "error" | "warn" | "info";
  text: string;
  field?: "width" | "height" | "depth" | "sections" | "filling";
}

export function getLimits(type: FurnitureType | null) {
  return (type ? limitsConfig[type] : limitsConfig.fallback) ?? limitsConfig.fallback;
}

export function validate(s: ConfigState): ValidationMessage[] {
  const out: ValidationMessage[] = [];
  if (!s.type) return out;
  const l = getLimits(s.type);

  if (s.width < l.width.min) out.push({ kind: "error", text: `Меньше ${l.width.min} мм каркас не будет держать форму — поднимите ширину.`, field: "width" });
  else if (s.width > l.width.max) out.push({ kind: "error", text: `Шире ${l.width.max} мм наши станки не возьмут.`, field: "width" });

  if (s.height < l.height.min) out.push({ kind: "error", text: `Ниже ${l.height.min} мм — это уже не корпус. Поднимите высоту.`, field: "height" });
  else if (s.height > l.height.max) out.push({ kind: "warn", text: `Высоковато. Усилитель в спинку добавим бесплатно.`, field: "height" });

  if (s.depth < l.depth.min) out.push({ kind: "error", text: `Меньше ${l.depth.min} мм глубины — внутрь почти ничего не влезет.`, field: "depth" });
  else if (s.depth > l.depth.max) out.push({ kind: "warn", text: `Глубоко. Проверьте, что пройдёт в дверной проём.`, field: "depth" });

  if (s.sections < 1) out.push({ kind: "error", text: "Нужна хотя бы одна секция — иначе собирать нечего.", field: "sections" });
  if (s.type === "nightstand" && s.sections > 1) out.push({ kind: "error", text: "Тумба пока только односекционная.", field: "sections" });
  if (s.type === "dresser" && s.sections > 2) out.push({ kind: "warn", text: "Для комода больше двух секций — нестандартно. Соберём, но проверим вместе.", field: "sections" });
  if (s.type === "wardrobe" && s.sections > 4) out.push({ kind: "warn", text: "Многосекционный шкаф — соберём, но перед резкой ещё раз проверим всё с вами.", field: "sections" });

  const sectionWidth = s.width / Math.max(1, s.sections);
  if (sectionWidth < limitsConfig.rules.minSectionWidth) out.push({ kind: "error", text: `Секция ${Math.round(sectionWidth)} мм — в такую узкую полку не повесить. Минимум ${limitsConfig.rules.minSectionWidth} мм.`, field: "sections" });
  else if (sectionWidth > limitsConfig.rules.maxSectionWidthBeforeWarning) out.push({ kind: "warn", text: `Секция ${Math.round(sectionWidth)} мм — полки на такой длине прогибаются. Добавим усиление.`, field: "sections" });

  if (s.filling.shelves > 0) {
    const usableHeight = Math.max(1, s.height - 32);
    const shelfGap = Math.floor(usableHeight / (s.filling.shelves + 1));
    if (shelfGap < limitsConfig.rules.minShelfGap) out.push({ kind: "error", text: `Между полками всего ${shelfGap} мм — рука не пройдёт. Уберите часть полок или поднимите высоту.`, field: "filling" });
  }

  if (s.filling.drawers > 0) {
    const drawerFacadeHeight = Math.floor((s.height - 64) / s.filling.drawers);
    if (drawerFacadeHeight < limitsConfig.rules.minDrawerFacadeHeight) out.push({ kind: "error", text: `Ящики получаются ${drawerFacadeHeight} мм — слишком плоско. Уменьшите количество.`, field: "filling" });
    if (s.depth < limitsConfig.rules.minDrawerDepthRecommended) out.push({ kind: "warn", text: "Для ящиков лучше глубина от 400 мм — направляющим нужно куда выезжать.", field: "depth" });
  }

  if (s.filling.hangingRod && s.depth < limitsConfig.rules.minRodDepthRecommended) out.push({ kind: "warn", text: "Для штанги нужна глубина от 500 мм — иначе плечики упрутся в стенку.", field: "depth" });
  if (s.filling.hangingRod && s.height < limitsConfig.rules.minRodHeightRecommended) out.push({ kind: "warn", text: "Штанга в низкой мебели — длинная одежда не поместится.", field: "filling" });
  if (s.facadeStyleId === "no-handle" && s.hardwareId === "base") out.push({ kind: "warn", text: "Без ручек удобнее с комфортной фурнитурой — иначе фасад нечем зацепить.", field: "filling" });

  return out;
}

export function hasErrors(messages: ValidationMessage[]) {
  return messages.some((m) => m.kind === "error");
}


export type StepStatus = "ok" | "warning" | "error";

export function validationStepIndex(message: ValidationMessage): number {
  if (message.field === "width" || message.field === "height" || message.field === "depth") return 0;
  if (message.field === "sections" || message.field === "filling") return 1;
  return 0;
}

export function getStepStatuses(messages: ValidationMessage[]): StepStatus[] {
  return STEPS.map((_, index) => {
    const stepMessages = messages.filter((message) => validationStepIndex(message) === index);
    if (stepMessages.some((message) => message.kind === "error")) return "error";
    if (stepMessages.some((message) => message.kind === "warn")) return "warning";
    return "ok";
  });
}

export function firstErrorStep(messages: ValidationMessage[]): number {
  const first = messages.find((message) => message.kind === "error");
  return first ? validationStepIndex(first) : 0;
}

// ─────────────────────────────────────────
// Context
// ─────────────────────────────────────────
interface ConfigContextValue {
  state: ConfigState;
  dispatch: React.Dispatch<ConfigAction>;
  price: PriceBreakdown;
  validation: ValidationMessage[];
  bodyMaterial: Material;
  facadeMaterial: Material;
  facadeStyle: FacadeStyle;
  hardware: Hardware;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [state, baseDispatch] = useReducer(configReducer, initialState);

  const dispatch = (action: ConfigAction) => {
    baseDispatch(action);
    void import("./store/configStoreBridge").then(({ dispatchToConfigStore }) => {
      dispatchToConfigStore(action);
    });
  };

  useEffect(() => {
    void import("./store/configStoreBridge").then(({ mirrorConfigStateToStore }) => {
      mirrorConfigStateToStore(state);
    });
  }, [state]);

  const price = useMemo(() => calculatePrice(state), [state]);
  const validation = useMemo(() => validate(state), [state]);
  const bodyMaterial = MATERIALS.find((m) => m.id === state.bodyMaterialId) ?? MATERIALS[0];
  const facadeMaterial = MATERIALS.find((m) => m.id === state.facadeMaterialId) ?? MATERIALS[0];
  const facadeStyle = FACADE_STYLES.find((f) => f.id === state.facadeStyleId) ?? FACADE_STYLES[0];
  const hardware = HARDWARE.find((h) => h.id === state.hardwareId) ?? HARDWARE[0];

  const value = useMemo<ConfigContextValue>(
    () => ({ state, dispatch, price, validation, bodyMaterial, facadeMaterial, facadeStyle, hardware }),
    [state, price, validation, bodyMaterial, facadeMaterial, facadeStyle, hardware],
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used inside ConfigProvider");
  return ctx;
}

// 4 шага — ассемблинг-нарратив (Tone-pass 2026-05-24)
export const STEPS = [
  { id: "dimensions", label: "Габариты", short: "Габариты" },
  { id: "filling", label: "Что внутри", short: "Внутри" },
  { id: "materials", label: "Как выглядит", short: "Внешний вид" },
  { id: "review", label: "Готово", short: "Готово" },
] as const;
