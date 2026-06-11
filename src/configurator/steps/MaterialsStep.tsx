import { useState } from "react";
import { useConfigBridge } from "../store/useConfigBridge";
import { MATERIALS, FACADE_STYLES, HARDWARE } from "../data";
import { trackEvent } from "../../shared/lib/analytics";
import { cn } from "../../utils/cn";
import { StepShell } from "./StepShell";
import { ChoiceButton, FieldLabel, QuietNote, SectionBlock } from "./StepControls";

type AppearanceTab = "body" | "facade" | "handles" | "hardware";

const APPEARANCE_TABS: Array<{ id: AppearanceTab; label: string; hint: string }> = [
  { id: "body", label: "Корпус", hint: "видимые боковины" },
  { id: "facade", label: "Фасады", hint: "лицо мебели" },
  { id: "handles", label: "Ручки", hint: "как открывать" },
  { id: "hardware", label: "Фурнитура", hint: "механизмы" },
];

export function MaterialsStep() {
  const { state, actions, bodyMaterial, facadeMaterial, facadeStyle, hardware } = useConfigBridge();
  const [activeTab, setActiveTab] = useState<AppearanceTab>("body");

  const setHighlight = (h: "body" | "facade" | null) =>
    actions.setHighlight(h);

  const summary = [
    `Корпус: ${bodyMaterial.name}`,
    `Фасады: ${facadeMaterial.name}`,
    `Ручки: ${facadeStyle.name}`,
    `Фурнитура: ${hardware.name}`,
  ];

  return (
    <StepShell
      title="Выберите внешний вид"
      description="Корпус, фасады и ручки. Внутренние технические решения система учтет сама."
      onBack={() => actions.setStep(1)}
      onNext={() => {
        trackEvent("constructor_step_next", { step: 2 });
        actions.setStep(3);
      }}
      nextLabel="Готово"
    >
      <div className="rzm-appearance-summary" aria-label="Текущий внешний вид">
        {summary.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <div className="rzm-appearance-tabs" role="tablist" aria-label="Настройки внешнего вида">
        {APPEARANCE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            data-selected={activeTab === tab.id ? "true" : undefined}
            onClick={() => setActiveTab(tab.id)}
            className="rzm-appearance-tab focus-ring"
          >
            <span>{tab.label}</span>
            <small>{tab.hint}</small>
          </button>
        ))}
      </div>

      {activeTab === "body" && (
        <div
          className="rzm-tab-panel"
          role="tabpanel"
          onMouseEnter={() => setHighlight("body")}
          onMouseLeave={() => setHighlight(null)}
        >
          <FieldLabel label="Корпус" meta="цвет видимых боковин и полок" className="mb-3" />
          <MaterialGrid
            activeId={state.bodyMaterialId}
            onPick={(id) => {
              actions.setBodyMaterial(id);
              trackEvent("material_selected", { kind: "body", id });
            }}
            onFocus={() => setHighlight("body")}
            onBlur={() => setHighlight(null)}
          />
        </div>
      )}

      {activeTab === "facade" && (
        <div
          className="rzm-tab-panel"
          role="tabpanel"
          onMouseEnter={() => setHighlight("facade")}
          onMouseLeave={() => setHighlight(null)}
        >
          <SectionBlock className="mb-3">
            <FieldLabel label="Тип фасада" meta="простая разница" className="mb-2" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "ldsp" as const, title: "ЛДСП", text: "Практичный базовый вариант" },
                { id: "mdf" as const, title: "МДФ", text: "Плотнее и дороже" },
              ].map((item) => {
                const active = state.facadeMaterialKind === item.id;
                return (
                  <ChoiceButton
                    key={item.id}
                    selected={active}
                    title={item.title}
                    description={item.text}
                    onClick={() => {
                      actions.setFacadeMaterialKind(item.id);
                      trackEvent("material_selected", { kind: "facade-kind", id: item.id });
                    }}
                  />
                );
              })}
            </div>
          </SectionBlock>

          <FieldLabel label="Фасад" meta="лицевая часть мебели" className="mb-3" />
          <MaterialGrid
            activeId={state.facadeMaterialId}
            onPick={(id) => {
              actions.setFacadeMaterial(id);
              trackEvent("material_selected", { kind: "facade", id });
            }}
            onFocus={() => setHighlight("facade")}
            onBlur={() => setHighlight(null)}
          />
        </div>
      )}

      {activeTab === "handles" && (
        <div
          className="rzm-tab-panel"
          role="tabpanel"
          onMouseEnter={() => setHighlight("facade")}
          onMouseLeave={() => setHighlight(null)}
        >
          <FieldLabel label="Ручки" meta="как открывать фасады" className="mb-3" />
          <div className="grid grid-cols-1 gap-2">
            {FACADE_STYLES.map((f) => {
              const active = state.facadeStyleId === f.id;
              return (
                <ChoiceButton
                  key={f.id}
                  selected={active}
                  title={f.name}
                  aside={f.priceMultiplier === 1 ? "включено" : `+${Math.round((f.priceMultiplier - 1) * 100)}%`}
                  description={f.description}
                  onClick={() => actions.setFacadeStyle(f.id)}
                  onFocus={() => setHighlight("facade")}
                  onBlur={() => setHighlight(null)}
                />
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "hardware" && (
        <div className="rzm-tab-panel" role="tabpanel">
          <FieldLabel label="Фурнитура" meta="механизмы открывания" className="mb-3" />
          <QuietNote className="mb-3">
            Выберите уровень механизмов. Push-to-open и доводчики подбираются по правилам внутри расчета.
          </QuietNote>
          <div className="grid grid-cols-1 gap-2">
            {HARDWARE.map((h) => {
              const active = state.hardwareId === h.id;
              return (
                <ChoiceButton
                  key={h.id}
                  selected={active}
                  title={h.name}
                  aside={h.recommended ? "рекомендуем" : undefined}
                  description={h.description}
                  onClick={() => actions.setHardware(h.id)}
                />
              );
            })}
          </div>
        </div>
      )}
    </StepShell>
  );
}

function MaterialGrid({
  activeId,
  onPick,
  onFocus,
  onBlur,
}: {
  activeId: string;
  onPick: (id: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {MATERIALS.map((m) => (
        <MaterialSwatch
          key={m.id}
          material={m}
          active={activeId === m.id}
          onClick={() => onPick(m.id)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      ))}
    </div>
  );
}

function MaterialSwatch({
  material,
  active,
  onClick,
  onFocus,
  onBlur,
}: {
  material: (typeof MATERIALS)[number];
  active: boolean;
  onClick: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
      data-selected={active ? "true" : undefined}
      className={cn("rzm-material-swatch focus-ring", active && "is-selected")}
      title={`${material.name}${material.vendor ? ` · ${material.vendor}` : ""}`}
    >
      <div
        className="rzm-material-swatch-chip"
        style={{ background: material.swatch }}
      />
      <div className="rzm-material-swatch-name">
        {material.name}
      </div>
      {material.vendor && (
        <div className="rzm-material-swatch-vendor">{material.vendor}</div>
      )}
      {active && (
        <span className="rzm-selected-mark" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}
