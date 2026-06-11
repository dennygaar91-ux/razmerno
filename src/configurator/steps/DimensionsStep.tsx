import { getLimits, hasErrors } from "../context";
import { useConfigBridge } from "../store/useConfigBridge";
import { trackEvent } from "../../shared/lib/analytics";
import { HelpTooltip } from "../../shared/ui/HelpTooltip";
import { AssemblyCue, FieldMessages, StepShell } from "./StepShell";
import { FieldLabel, ModuleOption, QuietNote, RoundControlButton } from "./StepControls";

const DIMENSION_HELP: Record<"width" | "height" | "depth", string> = {
  width: "Ширина — размер изделия слева направо. Если сомневаетесь, оставьте запас 20–30 мм от стен.",
  height: "Высота — размер от пола до верха изделия. Для потолка оставьте монтажный зазор.",
  depth: "Глубина — насколько шкаф выступает от стены. Для штанги обычно комфортнее от 550 мм.",
};

export function TypeDimensionsStep() {
  const { state, actions, validation } = useConfigBridge();
  const limits = getLimits(state.type);

  const dims: Array<{ key: "width" | "height" | "depth"; label: string }> = [
    { key: "width", label: "Ширина" },
    { key: "height", label: "Высота" },
    { key: "depth", label: "Глубина" },
  ];

  const setHighlight = (h: "body" | null) =>
    actions.setHighlight(h);

  return (
    <StepShell
      title="Укажите размеры места"
      description="Введите основные размеры. Секции и наполнение можно настроить дальше."
      onNext={() => {
        trackEvent("constructor_step_next", { step: 0 });
        actions.setStep(1);
      }}
      nextLabel="Что внутри →"
      nextDisabled={hasErrors(validation)}
    >
      <AssemblyCue
        items={[
          { label: "Каркас", value: `${state.width} × ${state.height} мм`, active: true },
          { label: "Глубина", value: `${state.depth} мм` },
          { label: "Дальше", value: "секции и наполнение" },
        ]}
      />

      <div
        className="space-y-3 md:space-y-3.5"
        onMouseEnter={() => setHighlight("body")}
        onMouseLeave={() => setHighlight(null)}
      >
        {dims.map((d) => {
          const limit = limits[d.key];
          const val = state[d.key];
          const out = val < limit.min || val > limit.max;
          const fieldMessages = validation.filter((v) => v.field === d.key);

          return (
            <div key={d.key}>
              <div className="flex items-baseline justify-between mb-2">
                <FieldLabel label={`${d.label}, мм`}>
                  <HelpTooltip
                    label={`Что значит ${d.label.toLowerCase()}`}
                    tooltip={DIMENSION_HELP[d.key]}
                  />
                </FieldLabel>
                <span className="control-meta">
                  {limit.min}–{limit.max}
                </span>
              </div>

              <div
                data-invalid={out ? "true" : undefined}
                className="control-field flex items-center gap-1 px-1.5 rzm-touch-target"
              >
                <RoundControlButton
                  onClick={() => {
                    const v = Math.max(limit.min, val - 10);
                    actions.setDimension(d.key, v);
                    trackEvent("dimensions_changed", { dim: d.key, value: v });
                  }}
                  aria-label={`Уменьшить ${d.label.toLowerCase()}`}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </RoundControlButton>
                <input
                  type="number"
                  inputMode="numeric"
                  value={val}
                  min={limit.min}
                  max={limit.max}
                  onChange={(e) => {
                    const v = parseInt(e.target.value || "0", 10) || 0;
                    actions.setDimension(d.key, v);
                  }}
                  onBlur={() => trackEvent("dimensions_changed", { dim: d.key, value: val })}
                  className="flex-1 bg-transparent outline-none text-center tabular-nums text-[17px] font-semibold text-[var(--rzm-text-main)]"
                  aria-label={`${d.label} в мм`}
                  aria-invalid={out}
                />
                <RoundControlButton
                  onClick={() => {
                    const v = Math.min(limit.max, val + 10);
                    actions.setDimension(d.key, v);
                    trackEvent("dimensions_changed", { dim: d.key, value: v });
                  }}
                  aria-label={`Увеличить ${d.label.toLowerCase()}`}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </RoundControlButton>
              </div>

              {/* Inline-валидация */}
              <FieldMessages messages={fieldMessages} />
            </div>
          );
        })}
      </div>

      <QuietNote className="mt-3">
        Если мебель в нишу, оставьте монтажный запас 20–30 мм.
      </QuietNote>

      {/* Width presets (п.6.5 ТЗ) */}
      {state.type === "wardrobe" && (
        <div className="mt-5 md:mt-6">
          <FieldLabel label="Быстрые размеры" className="mb-2" />
          <div className="flex gap-2">
            {[
              { label: "Узкий", w: 1200 },
              { label: "Стандарт", w: 1800 },
              { label: "Широкий", w: 2400 },
            ].map((preset) => (
              <ModuleOption
                key={preset.w}
                selected={state.width === preset.w}
                compact
                onClick={() => actions.setDimension("width", preset.w)}
                className="flex-1 text-[12px] font-medium"
              >
                {preset.label}
              </ModuleOption>
            ))}
          </div>
        </div>
      )}
    </StepShell>
  );
}

// ─────────────────────────────────────────
// ШАГ 2 — Наполнение
// ─────────────────────────────────────────
