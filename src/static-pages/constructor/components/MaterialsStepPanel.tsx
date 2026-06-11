import { useState } from "react";
import {
  facadeOptions,
  materialOptions,
} from "../options";
import { getBackPanelMaterialForBody } from "../../../shared/materials/materialMapping";
import type {
  ConstructorValidationState,
  MaterialOption,
  MaterialToken,
  StepKey,
} from "../types";

type ValidationAssistProps = {
  validation: ConstructorValidationState;
  onAutoFix: (issueId?: string | null) => void;
  step: StepKey;
};

type MaterialsStepPanelProps = {
  material: string;
  facadeMaterial: string;
  selectedMaterial: MaterialOption;
  selectedFacadeMaterial: MaterialOption;
  validation: ConstructorValidationState;
  onMaterialChange: (value: any) => void;
  onFacadeMaterialChange: (value: any) => void;
  onAutoFix: (issueId?: string | null) => void;
  ValidationAssist: (props: ValidationAssistProps) => JSX.Element;
  StepIntro: (props: { title: string; text: string }) => JSX.Element;
};

export function MaterialsStepPanel({
  material,
  facadeMaterial,
  selectedMaterial,
  selectedFacadeMaterial,
  validation,
  onMaterialChange,
  onFacadeMaterialChange,
  onAutoFix,
  ValidationAssist,
  StepIntro,
}: MaterialsStepPanelProps) {
  return (
    <div className="rzm-3d-drawer-body rzm-3d-materials-polish rzm-3d-materials-polish--stage11">
      <StepIntro
        title="Материалы"
        text="Выберите декор корпуса и фасадов. 3D-модель сразу применяет выбранную текстуру."
      />
      <MaterialSelectionSummary
        bodyMaterial={selectedMaterial}
        facadeMaterial={selectedFacadeMaterial}
      />
      <MaterialPicker
        title="Корпус"
        variant="body"
        value={material}
        options={materialOptions}
        onChange={onMaterialChange}
      />
      <MaterialPicker
        title="Фасады"
        variant="facade"
        value={facadeMaterial}
        options={facadeOptions}
        onChange={onFacadeMaterialChange}
      />
      <BackPanelMaterialPreview material={material as MaterialToken} />
      <ValidationAssist
        validation={validation}
        onAutoFix={onAutoFix}
        step="materials"
      />
    </div>
  );
}

function MaterialSelectionSummary({
  bodyMaterial,
  facadeMaterial,
}: {
  bodyMaterial: MaterialOption;
  facadeMaterial: MaterialOption;
}) {
  return (
    <section
      className="rzm-3d-material-summary"
      aria-label="Выбранные материалы"
    >
      <MaterialSummaryItem label="Корпус" option={bodyMaterial} />
      <MaterialSummaryItem label="Фасады" option={facadeMaterial} />
    </section>
  );
}

function MaterialSummaryItem({
  label,
  option,
}: {
  label: string;
  option: MaterialOption;
}) {
  return (
    <div className="rzm-3d-material-summary-item">
      <span
        className="rzm-3d-material-swatch"
        style={getMaterialSwatchStyle(option)}
        aria-hidden="true"
      />
      <div>
        <span>{label}</span>
        <strong>{option.label}</strong>
        <small>
          {option.brand} {option.code} · {option.kind.toUpperCase()}{" "}
          {option.thicknessMm} мм
        </small>
      </div>
    </div>
  );
}

function getMaterialSwatchStyle(
  option: Pick<MaterialOption, "textureUrl" | "fallbackHex">,
) {
  return {
    backgroundColor: option.fallbackHex,
    backgroundImage: `linear-gradient(135deg, rgba(255,255,255,.16), rgba(42,44,65,.08)), url(${option.textureUrl})`,
  };
}

function MaterialPicker({
  title,
  variant,
  value,
  options,
  onChange,
}: {
  title: string;
  variant: "body" | "facade";
  value: string;
  options: MaterialOption[];
  onChange: (value: any) => void;
}) {
  const [facadeKind, setFacadeKind] = useState<"all" | "ldsp" | "mdf">("all");
  const activeOption =
    options.find(
      (option) => value === option.materialId || value === option.token,
    ) ?? options[0];
  const [previewToken, setPreviewToken] = useState(activeOption?.token ?? "");
  const visibleOptions =
    variant === "facade" && facadeKind !== "all"
      ? options.filter((option) => option.kind === facadeKind)
      : options;
  const previewOption =
    options.find((option) => option.token === previewToken) ??
    activeOption ??
    visibleOptions[0];
  const activeLabel = activeOption
    ? `${activeOption.label} · ${activeOption.brand} ${activeOption.code}`
    : "Материал не выбран";

  return (
    <section
      className="rzm-3d-material-picker"
      aria-labelledby={`rzm-material-${variant}-title`}
    >
      <div className="rzm-3d-material-heading">
        <div>
          <span className="rzm-3d-material-kicker">
            {variant === "body" ? "Корпус" : "Фасады"}
          </span>
          <h2 id={`rzm-material-${variant}-title`}>{title}</h2>
          <p>{variant === "body" ? "ЛДСП 16 мм" : "ЛДСП или МДФ-фасады"}</p>
        </div>
        {variant === "facade" ? (
          <div
            className="rzm-3d-material-tabs"
            aria-label="Фильтр материалов фасадов"
          >
            {(["all", "ldsp", "mdf"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                className={facadeKind === kind ? "is-active" : ""}
                aria-pressed={facadeKind === kind}
                onClick={() => setFacadeKind(kind)}
              >
                {kind === "all" ? "Все" : kind.toUpperCase()}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rzm-3d-material-current" aria-live="polite">
        <span>Выбрано</span>
        <strong>{activeLabel}</strong>
      </div>

      {previewOption ? (
        <div
          className="rzm-3d-material-zoom-preview"
          data-material-zoom="STAGE11"
          style={getMaterialSwatchStyle(previewOption)}
          aria-label={`Крупное превью ${previewOption.displayName}`}
        >
          <div className="rzm-3d-material-zoom-card">
            <span>Крупное превью</span>
            <strong>{previewOption.label}</strong>
            <small>
              {previewOption.brand} · {previewOption.code} ·{" "}
              {previewOption.kind.toUpperCase()} {previewOption.thicknessMm} мм
            </small>
            <button
              type="button"
              className="rzm-ui-btn rzm-ui-btn--primary rzm-3d-material-zoom-apply"
              onClick={() => onChange(previewOption.materialId)}
            >
              Выбрать этот декор
            </button>
          </div>
        </div>
      ) : null}

      <div
        className="rzm-3d-material-list"
        role="list"
        aria-label={`Материалы: ${title}`}
      >
        {visibleOptions.map((option) => {
          const active = value === option.materialId || value === option.token;
          return (
            <button
              key={option.token}
              type="button"
              className={active ? "is-active" : ""}
              onClick={() => {
                setPreviewToken(option.token);
                onChange(option.materialId);
              }}
              title={option.displayName}
              aria-label={`${active ? "Выбран материал" : "Выбрать материал"} ${option.displayName}`}
              aria-pressed={active}
              role="listitem"
            >
              <span
                className="rzm-3d-material-swatch"
                style={getMaterialSwatchStyle(option)}
                aria-hidden="true"
              />
              <span className="rzm-3d-material-copy">
                <strong>{option.label}</strong>
                <small>
                  {option.brand} {option.code} · {option.kind.toUpperCase()}{" "}
                  {option.thicknessMm} мм
                </small>
              </span>
              <em aria-hidden="true">{active ? "✓" : ""}</em>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BackPanelMaterialPreview({ material }: { material: MaterialToken }) {
  const backPanel = getBackPanelMaterialForBody(material);
  return (
    <section className="rzm-3d-back-panel-preview">
      <span
        className="rzm-3d-material-swatch"
        style={getMaterialSwatchStyle(backPanel)}
      />
      <div>
        <strong>Задняя стенка</strong>
        <small>
          {backPanel.name} · HDF {backPanel.thicknessMm} мм · автоматически
        </small>
      </div>
    </section>
  );
}
