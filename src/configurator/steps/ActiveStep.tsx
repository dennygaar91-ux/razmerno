import { useConfigBridge } from "../store/useConfigBridge";
import { TypeDimensionsStep } from "./DimensionsStep";
import { FillingStep } from "./FillingStep";
import { MaterialsStep } from "./MaterialsStep";
import { ReviewStep } from "./ReviewStep";

export function ActiveStep() {
  const { state } = useConfigBridge();
  if (!state.type) return null;
  switch (state.activeStep) {
    case 0: return <TypeDimensionsStep />;
    case 1: return <FillingStep />;
    case 2: return <MaterialsStep />;
    case 3: return <ReviewStep />;
    default: return <TypeDimensionsStep />;
  }
}
