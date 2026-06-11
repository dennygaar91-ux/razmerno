import type { ConfigAction, ConfigState } from "../context";

export type ConfigDispatch = (action: ConfigAction) => void;

export function createConfigActions(dispatch: ConfigDispatch) {
  return {
    setType: (payload: NonNullable<ConfigState["type"]>) => dispatch({ type: "SET_TYPE", payload }),
    setDimension: (dim: "width" | "height" | "depth", value: number) => dispatch({ type: "SET_DIM", payload: { dim, value } }),
    setSections: (payload: number) => dispatch({ type: "SET_SECTIONS", payload }),
    setFilling: (payload: Partial<ConfigState["filling"]>) => dispatch({ type: "SET_FILLING", payload }),
    applyFillingPreset: (payload: ConfigState["filling"]) => dispatch({ type: "APPLY_FILLING_PRESET", payload }),
    setLayout: (payload: ConfigState["layout"]) => dispatch({ type: "SET_LAYOUT", payload }),
    setCompartmentKind: (payload: Extract<ConfigAction, { type: "SET_COMPARTMENT_KIND" }>["payload"]) => dispatch({ type: "SET_COMPARTMENT_KIND", payload }),
    setCompartmentShelves: (payload: Extract<ConfigAction, { type: "SET_COMPARTMENT_SHELVES" }>["payload"]) => dispatch({ type: "SET_COMPARTMENT_SHELVES", payload }),
    setCompartmentDrawers: (payload: Extract<ConfigAction, { type: "SET_COMPARTMENT_DRAWERS" }>["payload"]) => dispatch({ type: "SET_COMPARTMENT_DRAWERS", payload }),
    addSectionByWidth: () => dispatch({ type: "ADD_SECTION_BY_WIDTH" }),
    addCompartmentByHeight: (payload: Extract<ConfigAction, { type: "ADD_COMPARTMENT_BY_HEIGHT" }>["payload"]) => dispatch({ type: "ADD_COMPARTMENT_BY_HEIGHT", payload }),
    setBodyMaterial: (payload: string) => dispatch({ type: "SET_BODY_MATERIAL", payload }),
    setFacadeMaterial: (payload: string) => dispatch({ type: "SET_FACADE_MATERIAL", payload }),
    setFacadeMaterialKind: (payload: ConfigState["facadeMaterialKind"]) => dispatch({ type: "SET_FACADE_MATERIAL_KIND", payload }),
    setFacadeStyle: (payload: string) => dispatch({ type: "SET_FACADE_STYLE", payload }),
    setHardware: (payload: string) => dispatch({ type: "SET_HARDWARE", payload }),
    setAdvancedLayout: (payload: boolean) => dispatch({ type: "SET_ADVANCED_LAYOUT", payload }),
    setSelectedCompartment: (payload: string | null) => dispatch({ type: "SET_SELECTED_COMPARTMENT", payload }),
    setHighlight: (payload: ConfigState["highlightedPart"]) => dispatch({ type: "SET_HIGHLIGHT", payload }),
    setStep: (payload: number) => dispatch({ type: "SET_STEP", payload }),
    openCheckout: (payload: "consultation" | "order" = "order") => dispatch({ type: "OPEN_CHECKOUT", payload }),
    closeCheckout: () => dispatch({ type: "CLOSE_CHECKOUT" }),
    setOrderId: (payload: string) => dispatch({ type: "SET_ORDER_ID", payload }),
    clearOrderStatus: () => dispatch({ type: "CLEAR_ORDER_STATUS" }),
    reset: () => dispatch({ type: "RESET" }),
  };
}
