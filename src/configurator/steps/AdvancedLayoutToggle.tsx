import { cn } from "../../utils/cn";
import { useConfigBridge } from "../store/useConfigBridge";

export function AdvancedLayoutToggle() {
  const { state, actions } = useConfigBridge();

  return (
    <section className="rzm-r14-precision-toggle" aria-label="Режим точной настройки">
      <div>
        <span>Режим</span>
        <strong>{state.advancedLayout ? "Точная настройка" : "Обычный"}</strong>
      </div>
      <button
        type="button"
        role="switch"
        aria-label="Переключить точную настройку"
        aria-checked={state.advancedLayout}
        onClick={() => actions.setAdvancedLayout(!state.advancedLayout)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors shrink-0 focus-ring",
          state.advancedLayout ? "bg-[var(--rzm-text-main)]" : "bg-[var(--rzm-line-soft)]",
        )}
      >
        <span
          className={cn(
            "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
            state.advancedLayout ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </section>
  );
}
