import { cn } from "../../utils/cn";
import { useConfigBridge } from "../store/useConfigBridge";
import { ModuleOption, QuietNote, SectionTitle } from "./StepControls";

export function LayoutPreview() {
  const { state, actions } = useConfigBridge();

  return (
    <div className="mb-4 rzm-module-surface p-3.5">
      <SectionTitle title="Собираем по секциям" meta={`${state.layout.sections.length} секц.`} className="mb-3" />

      {state.advancedLayout && (
        <div className="mb-3 grid grid-cols-1 gap-2">
          <ModuleOption
            onClick={() => actions.addSectionByWidth()}
            disabled={state.type === "nightstand"}
            compact
            className="h-9 justify-center text-center text-[12px] font-medium disabled:opacity-40"
          >
            + Добавить секцию по ширине
          </ModuleOption>
        </div>
      )}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.max(1, state.layout.sections.length)}, minmax(0, 1fr))` }}
      >
        {state.layout.sections.map((section) => (
          <div key={section.id} className="rzm-section-stack rounded-[14px] bg-[rgba(255,255,255,0.34)] p-1.5 min-h-[138px] flex flex-col gap-1.5">
            {state.advancedLayout && (
              <button
                type="button"
                onClick={() => actions.addCompartmentByHeight({ sectionId: section.id })}
                className="h-7 rounded-[10px] bg-white/54 border border-dashed border-[var(--rzm-line-soft)] text-[11px] font-medium text-[var(--rzm-text-main)] hover:border-[var(--color-ink)] focus-ring motion-soft"
              >
                + отсек
              </button>
            )}
            {section.compartments.map((compartment) => (
              <button
                key={compartment.id}
                type="button"
                onClick={() => {
                  if (!state.advancedLayout) return;
                  actions.setSelectedCompartment(compartment.id);
                }}
                className={cn(
                  "rzm-compartment-tile flex-1 min-h-[28px] rounded-[10px] bg-white/68 border px-2 py-1 text-left hover:border-[var(--color-ink)] focus-ring motion-soft",
                  state.selectedCompartmentId === compartment.id ? "border-[var(--color-ink)] shadow-[inset_0_0_0_1px_rgba(17,17,15,0.22)]" : "border-[var(--rzm-line-soft)]/70",
                )}
                title={state.advancedLayout ? "Нажмите, чтобы переключить тип отсека" : "Включите точную настройку"}
              >
                <span className="block text-[10px] font-mono tracking-[0.08em] uppercase text-[var(--rzm-text-muted)]">
                  {Math.round(compartment.heightMm)} мм
                </span>
                <span className="block text-[11px] text-[var(--rzm-text-main)]">
                  {compartment.kind === "empty" && "Пусто"}
                  {compartment.kind === "shelves" && `Полки · ${compartment.shelves}`}
                  {compartment.kind === "drawers" && `Ящики · ${compartment.drawers}`}
                  {compartment.kind === "rod" && "Штанга"}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <QuietNote className="mt-2">
        {state.advancedLayout
          ? "Нажмите на отсек и задайте, что будет внутри: полки, ящики или штанга."
          : "Сейчас это общий вид. Для настройки отдельных отсеков включите точную настройку."}
      </QuietNote>
    </div>
  );
}
