import type { CompartmentKind } from "../model/compartments";
import { useConfigBridge } from "../store/useConfigBridge";
import { MiniCounter } from "./MiniCounter";
import { ModuleOption, QuietNote, SectionBlock, SectionTitle } from "./StepControls";

export function SelectedCompartmentEditor() {
  const { state, actions } = useConfigBridge();
  const selected = state.layout.sections
    .flatMap((section) => section.compartments.map((compartment) => ({ section, compartment })))
    .find(({ compartment }) => compartment.id === state.selectedCompartmentId);

  if (!selected) {
    return (
      <QuietNote className="mb-4 border-dashed bg-white/70">
        Выберите отсек на схеме выше, чтобы задать его наполнение.
      </QuietNote>
    );
  }

  const options: Array<{ kind: CompartmentKind; label: string; hint: string }> = [
    { kind: "empty", label: "Пусто", hint: "Оставить отсек свободным" },
    { kind: "shelves", label: "Полки", hint: "Для вещей, коробок, белья" },
    { kind: "drawers", label: "Ящики", hint: "Доступны в любой секции" },
    { kind: "rod", label: "Штанга", hint: "Высота отсека станет 1200 мм" },
  ];

  return (
    <SectionBlock className="mb-4 bg-white p-3.5">
      <SectionTitle title="Наполнение выбранного отсека" meta={`${Math.round(selected.compartment.heightMm)} мм`} className="mb-3" />
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const active = selected.compartment.kind === option.kind;
          return (
            <ModuleOption
              key={option.kind}
              onClick={() => actions.setCompartmentKind({ sectionId: selected.section.id, compartmentId: selected.compartment.id, kind: option.kind })}
              selected={active}
              className="text-left p-3"
            >
              <span className="block text-[13px] font-medium text-[var(--rzm-text-main)]">{option.label}</span>
              <span className="block mt-0.5 text-[11.5px] leading-snug text-[var(--rzm-text-muted)]">{option.hint}</span>
            </ModuleOption>
          );
        })}
      </div>

      {selected.compartment.kind === "shelves" && (
        <div className="mt-3">
          <MiniCounter
            label="Полок в отсеке"
            value={selected.compartment.shelves}
            min={1}
            max={8}
            onChange={(value) => actions.setCompartmentShelves({ sectionId: selected.section.id, compartmentId: selected.compartment.id, shelves: value })}
          />
        </div>
      )}

      {selected.compartment.kind === "drawers" && (
        <div className="mt-3">
          <MiniCounter
            label="Ящиков в отсеке"
            value={selected.compartment.drawers}
            min={1}
            max={6}
            onChange={(value) => actions.setCompartmentDrawers({ sectionId: selected.section.id, compartmentId: selected.compartment.id, drawers: value })}
          />
        </div>
      )}
    </SectionBlock>
  );
}
