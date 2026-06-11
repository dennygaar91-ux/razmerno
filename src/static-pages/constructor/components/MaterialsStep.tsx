import { useMemo, useState } from "react";
import { facadeOptions, materialOptions } from "../options";
import type { ConstructorValidationIssue, MaterialOption, MaterialToken } from "../types";
import { getBackPanelMaterialForBody } from "../../../shared/materials/materialMapping";

function getMaterialUiName(material: Pick<MaterialOption, "name">) {
  return material.name
    .replace(/\s+натуральный$/i, "")
    .replace(/\s+монументальный$/i, " монумент")
    .replace(/\s+классический$/i, " классик")
    .trim();
}

function getMaterialMeta(material: Pick<MaterialOption, "brand" | "code" | "kind" | "thicknessMm">) {
  return `${material.brand} ${material.code} · ${material.kind.toUpperCase()} ${material.thicknessMm} мм`;
}

function MaterialSurface({ material }: { material: MaterialOption }) {
  return (
    <span
      className="rzm-r16-material-chip rzm-r26-material-swatch"
      aria-hidden="true"
      style={{
        backgroundColor: material.fallbackHex,
        backgroundImage: `url(${material.textureUrl})`,
      }}
    />
  );
}

function MaterialSelectedSummary({ title, material }: { title: string; material: MaterialOption }) {
  return (
    <div className="rzm-r26-selected-material" title={material.displayName}>
      <MaterialSurface material={material} />
      <span>
        <small>{title}</small>
        <strong>{getMaterialUiName(material)}</strong>
        <em>{material.kind.toUpperCase()} {material.thicknessMm} мм</em>
      </span>
    </div>
  );
}

function MaterialSwatchGrid({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: MaterialToken;
  options: MaterialOption[];
  onChange: (value: MaterialToken) => void;
  ariaLabel: string;
}) {
  return (
    <div className="rzm-r16-material-list rzm-r26-material-list" role="listbox" aria-label={ariaLabel}>
      {options.map((option) => {
        const isActive = value === option.token || value === option.materialId;
        return (
          <button
            key={option.materialId}
            className={`rzm-r16-material-option rzm-r26-material-option ${isActive ? "is-active" : ""}`}
            type="button"
            role="option"
            aria-selected={isActive}
            onClick={() => onChange(option.token as MaterialToken)}
            title={option.displayName}
          >
            <MaterialSurface material={option} />
            <span className="rzm-r16-material-copy rzm-r26-material-copy">
              <strong>{getMaterialUiName(option)}</strong>
              <small>{getMaterialMeta(option)}</small>
            </span>
            <span className="rzm-r16-material-spec rzm-r26-material-check" aria-hidden="true">
              {isActive ? "✓" : `${option.thicknessMm} мм`}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function MaterialsStep({
  bodyValue,
  facadeValue,
  focusedValidationIssue,
  onBodyChange,
  onFacadeChange,
}: {
  bodyValue: MaterialToken;
  facadeValue: MaterialToken;
  focusedValidationIssue: ConstructorValidationIssue | null;
  onBodyChange: (value: MaterialToken) => void;
  onFacadeChange: (value: MaterialToken) => void;
}) {
  const [facadeKind, setFacadeKind] = useState<"ldsp" | "mdf">(() => {
    const selected = facadeOptions.find((option) => option.token === facadeValue || option.materialId === facadeValue);
    return selected?.kind === "mdf" ? "mdf" : "ldsp";
  });
  const backPanel = getBackPanelMaterialForBody(bodyValue);
  const selectedBody = materialOptions.find((option) => option.token === bodyValue || option.materialId === bodyValue) ?? materialOptions[0];
  const selectedFacade = facadeOptions.find((option) => option.token === facadeValue || option.materialId === facadeValue) ?? facadeOptions[0];
  const facadeKindOptions = useMemo(
    () => facadeOptions.filter((option) => option.kind === facadeKind),
    [facadeKind],
  );

  function handleFacadeKindChange(kind: "ldsp" | "mdf") {
    setFacadeKind(kind);
    const current = facadeOptions.find((option) => option.token === facadeValue || option.materialId === facadeValue);
    if (current?.kind !== kind) {
      const next = facadeOptions.find((option) => option.kind === kind);
      if (next) onFacadeChange(next.token as MaterialToken);
    }
  }

  return (
    <div className="rzm-constructor-step-panel is-active rzm-r16-materials-step rzm-r26-materials-step">
      <section className="rzm-constructor-card rzm-r16-materials-card rzm-r26-materials-card">
        <header className="rzm-r16-step-head rzm-r26-step-head">
          <span>Внешний вид</span>
          <h2>Материалы</h2>
        </header>

        <div className="rzm-r16-current-materials rzm-r26-current-materials" aria-label="Текущий выбор материалов">
          <MaterialSelectedSummary title="Корпус" material={selectedBody} />
          <MaterialSelectedSummary title="Фасады" material={selectedFacade} />
        </div>

        <section className="rzm-r16-material-section rzm-r26-material-section">
          <div className="rzm-r16-material-section-head rzm-r26-material-section-head">
            <h3>Корпус</h3>
            <span>ЛДСП 16 мм</span>
          </div>
          <MaterialSwatchGrid
            value={bodyValue}
            options={materialOptions}
            onChange={onBodyChange}
            ariaLabel="Декор корпуса"
          />
        </section>

        <section className="rzm-r16-material-section rzm-r26-material-section">
          <div className="rzm-r16-material-section-head rzm-r26-material-section-head">
            <h3>Фасады</h3>
            <div className="rzm-r16-material-kind-tabs rzm-r26-material-kind-tabs" aria-label="Тип фасада">
              <button
                className={facadeKind === "ldsp" ? "is-active" : ""}
                type="button"
                onClick={() => handleFacadeKindChange("ldsp")}
                aria-pressed={facadeKind === "ldsp"}
              >
                ЛДСП
              </button>
              <button
                className={facadeKind === "mdf" ? "is-active" : ""}
                type="button"
                onClick={() => handleFacadeKindChange("mdf")}
                aria-pressed={facadeKind === "mdf"}
              >
                МДФ
              </button>
            </div>
          </div>
          <MaterialSwatchGrid
            value={facadeValue}
            options={facadeKindOptions}
            onChange={onFacadeChange}
            ariaLabel="Декор фасадов"
          />
        </section>

        {focusedValidationIssue?.stepId === "materials" && (
          <section className={`rzm-step-fix-card rzm-step-fix-card--${focusedValidationIssue.severity} rzm-r16-material-issue rzm-r26-material-issue`}>
            <strong>{focusedValidationIssue.title}</strong>
            <span>{focusedValidationIssue.fixHint}</span>
          </section>
        )}

        <section className="rzm-r16-back-panel rzm-r26-back-panel" aria-label="Задняя стенка">
          <div>
            <span>Задняя стенка</span>
            <strong>ХДФ 3 мм · подобрана автоматически</strong>
          </div>
          <small title={backPanel.displayName}>{getMaterialUiName(backPanel)}</small>
        </section>
      </section>
    </div>
  );
}
