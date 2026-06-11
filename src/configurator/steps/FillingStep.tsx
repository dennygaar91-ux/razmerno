import { useMemo } from "react";
import type { ValidationMessage } from "../context";
import { useConfigBridge } from "../store/useConfigBridge";
import { FILLING_PRESETS } from "../data";
import { trackEvent } from "../../shared/lib/analytics";
import { FieldMessages, StepShell } from "./StepShell";
import { FieldLabel, ModuleOption, QuietNote, SoftSwitch } from "./StepControls";
import { AdvancedLayoutToggle } from "./AdvancedLayoutToggle";
import { CompartmentCountControl } from "./CompartmentCountControl";
import { CounterRow } from "./CounterRow";
import { LayoutPreview } from "./LayoutPreview";
import { SelectedCompartmentEditor } from "./SelectedCompartmentEditor";

function pickMainMessage(messages: ValidationMessage[]) {
  return messages.find((m) => m.kind === "error") ?? messages[0];
}

export function FillingStep() {
  const { state, actions, validation } = useConfigBridge();
  const sectionWidth = Math.round(state.width / Math.max(1, state.sections));
  const maxSections = state.type === "nightstand" ? 1 : state.type === "dresser" ? 2 : 4;
  const { shelves, drawers, hangingRod } = state.filling;

  const sectionMessages = validation.filter((v) => v.field === "sections");
  const fillingMessages = validation.filter((v) => v.field === "filling");
  const rodMessages = validation.filter((v) => v.field === "depth" && hangingRod);
  const visibleMessages = [...sectionMessages, ...fillingMessages, ...rodMessages];
  const mainMessage = pickMainMessage(visibleMessages);

  const selected = useMemo(() => {
    for (const section of state.layout.sections) {
      const compartment = section.compartments.find((item) => item.id === state.selectedCompartmentId);
      if (compartment) return { section, compartment };
    }
    const firstSection = state.layout.sections[0];
    return firstSection ? { section: firstSection, compartment: firstSection.compartments[0] } : null;
  }, [state.layout.sections, state.selectedCompartmentId]);

  const selectedSection = selected?.section ?? state.layout.sections[0];
  const selectedCompartment = selected?.compartment ?? selectedSection?.compartments[0];

  const setHighlight = (h: "sections" | "shelves" | "drawers" | "rod" | null) =>
    actions.setHighlight(h);

  const selectSection = (sectionId: string) => {
    const section = state.layout.sections.find((item) => item.id === sectionId);
    actions.setSelectedCompartment(section?.compartments[0]?.id ?? null);
    setHighlight("sections");
  };

  return (
    <StepShell
      title="Наполнение"
      onBack={() => actions.setStep(0)}
      onNext={() => {
        trackEvent("constructor_step_next", { step: 1 });
        actions.setStep(2);
      }}
      nextLabel="Далее"
    >
      <div className="rzm-r14-filling-flow">
        <div className="rzm-r14-current-target" aria-label="Сейчас настраивается">
          <span>Сейчас</span>
          <strong>
            {selectedSection && selectedCompartment
              ? `Секция ${state.layout.sections.indexOf(selectedSection) + 1} · отсек ${selectedSection.compartments.indexOf(selectedCompartment) + 1}`
              : "Общая раскладка"}
          </strong>
          <small>{shelves} полки · {drawers} ящики · {hangingRod ? "штанга" : "без штанги"}</small>
        </div>

        <AdvancedLayoutToggle />

        {state.advancedLayout && state.type === "wardrobe" && (
          <section className="rzm-r14-card" aria-label="Готовые варианты наполнения">
            <FieldLabel label="Быстрый старт" className="mb-2" />
            <div className="grid grid-cols-1 gap-2">
              {FILLING_PRESETS.map((preset) => {
                const match =
                  preset.config.shelves === shelves &&
                  preset.config.drawers === drawers &&
                  preset.config.hangingRod === hangingRod;
                return (
                  <ModuleOption
                    key={preset.id}
                    selected={match}
                    onClick={() => {
                      actions.applyFillingPreset(preset.config);
                      trackEvent("filling_changed", { preset: preset.id });
                    }}
                    compact
                    className="text-left"
                  >
                    <span className="font-medium text-[13px]">{preset.name}</span>
                  </ModuleOption>
                );
              })}
            </div>
          </section>
        )}

        <section className="rzm-r14-card" aria-label="Секции и отсеки">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <FieldLabel label="Секция" />
            <span className="control-meta">≈ {sectionWidth} мм</span>
          </div>

          <div
            className="grid gap-1.5 mb-3"
            style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(maxSections, state.layout.sections.length))}, minmax(0, 1fr))` }}
            onMouseEnter={() => setHighlight("sections")}
            onMouseLeave={() => setHighlight(null)}
          >
            {state.layout.sections.map((section, index) => (
              <ModuleOption
                key={section.id}
                selected={selectedSection?.id === section.id}
                compact
                onClick={() => selectSection(section.id)}
                onFocus={() => setHighlight("sections")}
                onBlur={() => setHighlight(null)}
                className="h-9 text-[12px] font-semibold"
              >
                {index + 1}
              </ModuleOption>
            ))}
          </div>

          {selectedSection && (
            <>
              <FieldLabel label="Отсек" className="mb-2" />
              <div className="grid grid-cols-3 gap-1.5">
                {selectedSection.compartments.map((compartment, index) => (
                  <ModuleOption
                    key={compartment.id}
                    selected={selectedCompartment?.id === compartment.id}
                    compact
                    onClick={() => actions.setSelectedCompartment(compartment.id)}
                    className="h-9 text-[12px] font-semibold"
                  >
                    {index + 1}
                  </ModuleOption>
                ))}
              </div>
            </>
          )}

          <FieldMessages messages={sectionMessages.slice(0, 1)} />
        </section>

        <section className="rzm-r14-card" aria-label="Добавить наполнение">
          <FieldLabel label="Добавить" className="mb-2" />
          <div className="rzm-r14-counter-list">
            <CounterRow
              label="Полки"
              value={shelves}
              min={0}
              max={12}
              onChange={(v) => actions.setFilling({ shelves: v })}
              onHighlight={() => setHighlight("shelves")}
              onHighlightEnd={() => setHighlight(null)}
            />

            <CounterRow
              label="Ящики"
              value={drawers}
              min={0}
              max={6}
              onChange={(v) => actions.setFilling({ drawers: v })}
              onHighlight={() => setHighlight("drawers")}
              onHighlightEnd={() => setHighlight(null)}
            />
          </div>

          {state.type !== "nightstand" && state.type !== "dresser" && (
            <div
              className="rzm-r14-switch-row"
              onMouseEnter={() => setHighlight("rod")}
              onMouseLeave={() => setHighlight(null)}
            >
              <div>
                <strong>Штанга</strong>
                <span>{hangingRod ? "включена" : "не нужна"}</span>
              </div>
              <SoftSwitch
                checked={hangingRod}
                label="Включить штангу для одежды"
                onClick={() => actions.setFilling({ hangingRod: !hangingRod })}
                onFocus={() => setHighlight("rod")}
                onBlur={() => setHighlight(null)}
              />
            </div>
          )}
        </section>

        <section className="rzm-r14-card" aria-label="Фасады и ручки">
          <FieldLabel label="Фасады" className="mb-2" />
          <div className="grid grid-cols-2 gap-2 mb-3">
            <ModuleOption selected compact className="h-9 text-[12px] font-semibold">
              Распашные
            </ModuleOption>
            <ModuleOption compact className="h-9 text-[12px] font-semibold opacity-80">
              Открытые
            </ModuleOption>
          </div>

          <div className="rzm-r14-switch-row is-flat">
            <div>
              <strong>Ручки</strong>
              <span>{state.facadeStyleId === "no-handle" ? "без ручек" : "с ручками"}</span>
            </div>
            <SoftSwitch
              checked={state.facadeStyleId !== "no-handle"}
              label="Переключить ручки"
              onClick={() => actions.setFacadeStyle(state.facadeStyleId === "no-handle" ? "regular" : "no-handle")}
            />
          </div>
        </section>

        {state.advancedLayout && (
          <section className="rzm-r14-card rzm-r14-advanced-card" aria-label="Точная настройка">
            <CompartmentCountControl />
            <LayoutPreview />
            <SelectedCompartmentEditor />
          </section>
        )}

        {mainMessage && (
          <section className="rzm-r14-primary-issue" data-kind={mainMessage.kind} aria-label="Главная ошибка">
            <strong>{mainMessage.kind === "error" ? "Нужно исправить" : "Проверьте"}</strong>
            <span>{mainMessage.text}</span>
            {visibleMessages.length > 1 && state.advancedLayout && (
              <small>Ещё сообщений: {visibleMessages.length - 1}</small>
            )}
          </section>
        )}

        {state.advancedLayout && visibleMessages.length > 1 && (
          <FieldMessages messages={visibleMessages.slice(1)} />
        )}

        {!state.advancedLayout && (
          <QuietNote className="rzm-r14-muted-note">
            Точные размеры секций и отсеков доступны в режиме точной настройки.
          </QuietNote>
        )}
      </div>
    </StepShell>
  );
}
