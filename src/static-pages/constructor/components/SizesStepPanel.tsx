import { useId } from "react";
import { furnitureOptions } from "../options";
import {
  CONSTRUCTOR_DIMENSION_LIMITS,
  CONSTRUCTOR_SECTION_RULES,
} from "../rules/projectRules";
import type {
  ConstructorSection,
  ConstructorValidationIssue,
  ConstructorValidationState,
  FurnitureKey,
} from "../types";
import { formatMm } from "./Constructor3DPageMeta";

export function SizesStepPanel({
  furniture,
  width,
  height,
  depth,
  sections,
  sectionLayout,
  advancedSizes,
  validation,
  onFurnitureChange,
  onWidthChange,
  onHeightChange,
  onDepthChange,
  onSectionsChange,
  onSectionWidthChange,
  onEqualizeSections,
  onAdvancedSizesChange,
  onAutoFix,
}: {
  furniture: FurnitureKey;
  width: number;
  height: number;
  depth: number;
  sections: number;
  sectionLayout: ConstructorSection[];
  advancedSizes: boolean;
  validation: ConstructorValidationState;
  onFurnitureChange: (value: FurnitureKey) => void;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
  onDepthChange: (value: number) => void;
  onSectionsChange: (value: number) => void;
  onSectionWidthChange: (sectionId: string, value: number) => void;
  onEqualizeSections: () => void;
  onAdvancedSizesChange: (value: boolean) => void;
  onAutoFix: (issueId?: string | null) => void;
}) {
  const dimensionLimits =
    CONSTRUCTOR_DIMENSION_LIMITS[furniture] ??
    CONSTRUCTOR_DIMENSION_LIMITS.wardrobe;
  const selectedFurnitureOption =
    furnitureOptions.find((item) => item.key === furniture) ??
    furnitureOptions[0];
  const sizeIssues = {
    width: findValidationIssue(validation, "width"),
    height: findValidationIssue(validation, "height"),
    depth: findValidationIssue(validation, "depth"),
  };

  return (
    <div className="rzm-3d-drawer-body rzm-3d-sizes-step--stage08">
      <header className="rzm-3d-step-intro">
        <span>3D-конструктор</span>
        <h1>Размеры</h1>
        <p>
          Сначала выберите тип мебели и задайте габариты. Секции пересчитаются
          сразу, а 3D и 2D используют эти размеры как единый источник данных.
        </p>
      </header>
      <section
        className="rzm-3d-size-block rzm-3d-furniture-type-block"
        aria-labelledby="rzm-stage08-furniture-type-title"
      >
        <header className="rzm-3d-section-header">
          <div>
            <span>Тип мебели</span>
            <h2 id="rzm-stage08-furniture-type-title">Что собираем</h2>
          </div>
          <small>{selectedFurnitureOption.label}</small>
        </header>
        <div className="rzm-3d-type-grid rzm-3d-type-grid--stage08">
          {furnitureOptions.map((item) => {
            const limits = CONSTRUCTOR_DIMENSION_LIMITS[item.key];
            return (
              <button
                key={item.key}
                type="button"
                className={`rzm-3d-type-card ${furniture === item.key ? "is-active" : ""}`}
                onClick={() => onFurnitureChange(item.key)}
                aria-pressed={furniture === item.key}
                aria-label={`Тип мебели: ${item.label}`}
              >
                <strong>{item.label}</strong>
                <span>
                  {formatMm(limits.minWidthMm)}–{formatMm(limits.maxWidthMm)}
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <section
        className="rzm-3d-size-block rzm-3d-dimensions-block"
        aria-labelledby="rzm-q4-total-size-title"
      >
        <header className="rzm-3d-section-header">
          <div>
            <span>Габариты</span>
            <h2 id="rzm-q4-total-size-title">Общий размер мебели</h2>
          </div>
          <small>
            {formatMm(width)} × {formatMm(height)} × {formatMm(depth)}
          </small>
        </header>
        <NumberControl
          label="Ширина"
          value={width}
          min={dimensionLimits.minWidthMm}
          max={dimensionLimits.maxWidthMm}
          step={50}
          issue={sizeIssues.width}
          helperText={`Для типа «${selectedFurnitureOption.label}»: ${formatMm(dimensionLimits.minWidthMm)}–${formatMm(dimensionLimits.maxWidthMm)}`}
          onAutoFix={() => onAutoFix(sizeIssues.width?.id)}
          onChange={onWidthChange}
        />
        <NumberControl
          label="Высота"
          value={height}
          min={dimensionLimits.minHeightMm}
          max={dimensionLimits.maxHeightMm}
          step={50}
          issue={sizeIssues.height}
          helperText={`Для типа «${selectedFurnitureOption.label}»: ${formatMm(dimensionLimits.minHeightMm)}–${formatMm(dimensionLimits.maxHeightMm)}`}
          onAutoFix={() => onAutoFix(sizeIssues.height?.id)}
          onChange={onHeightChange}
        />
        <NumberControl
          label="Глубина"
          value={depth}
          min={dimensionLimits.minDepthMm}
          max={dimensionLimits.maxDepthMm}
          step={50}
          issue={sizeIssues.depth}
          helperText={`Для типа «${selectedFurnitureOption.label}»: ${formatMm(dimensionLimits.minDepthMm)}–${formatMm(dimensionLimits.maxDepthMm)}`}
          onAutoFix={() => onAutoFix(sizeIssues.depth?.id)}
          onChange={onDepthChange}
        />
      </section>

      <SectionWidthSummary
        width={width}
        sections={sections}
        sectionLayout={sectionLayout}
        advancedSizes={advancedSizes}
        validation={validation}
        onSectionsChange={onSectionsChange}
        onSectionWidthChange={onSectionWidthChange}
        onEqualizeSections={onEqualizeSections}
        onAdvancedSizesChange={onAdvancedSizesChange}
        onAutoFix={onAutoFix}
      />
    </div>
  );
}

function SectionWidthSummary({
  width,
  sections,
  sectionLayout,
  advancedSizes,
  validation,
  onSectionsChange,
  onSectionWidthChange,
  onEqualizeSections,
  onAdvancedSizesChange,
  onAutoFix,
}: {
  width: number;
  sections: number;
  sectionLayout: ConstructorSection[];
  advancedSizes: boolean;
  validation: ConstructorValidationState;
  onSectionsChange: (value: number) => void;
  onSectionWidthChange: (sectionId: string, value: number) => void;
  onEqualizeSections: () => void;
  onAdvancedSizesChange: (value: boolean) => void;
  onAutoFix: (issueId?: string | null) => void;
}) {
  const minSectionWidth = CONSTRUCTOR_SECTION_RULES.minWidthMm;
  const sectionIssue = findValidationIssue(validation, "sections");
  const sectionWidths =
    sectionLayout.length === sections
      ? sectionLayout.map((section) => section.widthMm)
      : Array.from({ length: sections }, () =>
          Math.round(width / Math.max(1, sections)),
        );
  const widthSum = sectionWidths.reduce((sum, value) => sum + value, 0);
  const sectionFormula = `${formatMm(width)} = ${sectionWidths
    .map(formatMm)
    .join(" + ")}`;
  const currentMinWidth = Math.min(...sectionWidths);
  const canAddSection =
    width / (sections + 1) >= minSectionWidth && sections < 6;
  const isEven =
    sectionWidths.every((value) => Math.abs(value - sectionWidths[0]) <= 1) &&
    widthSum === width;

  return (
    <section
      className="rzm-3d-size-block rzm-3d-section-widths"
      aria-labelledby="rzm-q4-sections-title"
    >
      <header className="rzm-3d-section-header">
        <div>
          <span>Секции</span>
          <h2 id="rzm-q4-sections-title">Ширина секций</h2>
        </div>
        <button
          type="button"
          className="rzm-ui-btn rzm-ui-btn--ghost rzm-3d-equalize-button"
          onClick={onEqualizeSections}
          disabled={isEven}
          title={
            isEven
              ? "Секции уже распределены равномерно"
              : "Распределить секции равномерно"
          }
          aria-label="Выровнять секции: распределить ширину поровну"
        >
          Выровнять секции
        </button>
      </header>

      <NumberControl
        label="Количество секций"
        value={sections}
        min={1}
        max={6}
        step={1}
        suffix=""
        issue={sectionIssue}
        helperText={`Минимальная ширина секции: ${minSectionWidth} мм`}
        onAutoFix={() => onAutoFix(sectionIssue?.id)}
        canIncreaseOverride={canAddSection}
        increaseDisabledTitle={
          sections >= 6
            ? "Максимум: 6 секций"
            : `Следующая секция станет меньше ${minSectionWidth} мм`
        }
        onChange={onSectionsChange}
      />

      <div
        className="rzm-3d-section-formula"
        role="note"
        aria-label="Сумма ширин секций"
      >
        <strong>{sectionFormula}</strong>
        <small>
          Минимум: {minSectionWidth} мм · самая узкая секция: {" "}
          {formatMm(currentMinWidth)}
          {widthSum !== width ? ` · сумма секций: ${formatMm(widthSum)}` : ""}
        </small>
      </div>

      <label className="rzm-3d-advanced-toggle rzm-3d-advanced-toggle--sizes">
        <input
          type="checkbox"
          checked={advancedSizes}
          onChange={(event) => onAdvancedSizesChange(event.target.checked)}
        />
        <span>Точная ширина секций</span>
      </label>

      {advancedSizes ? (
        <div
          className="rzm-3d-section-width-list"
          aria-label="Точная настройка ширины секций"
        >
          {sectionLayout.map((section, index) => (
            <div className="rzm-3d-section-width-row" key={section.id}>
              <span>Секция {index + 1}</span>
              <NumberControl
                label={`Секция ${index + 1}`}
                value={section.widthMm}
                min={minSectionWidth}
                max={width}
                step={50}
                issue={findValidationIssue(validation, section.id)}
                compact
                onAutoFix={() =>
                  onAutoFix(findValidationIssue(validation, section.id)?.id)
                }
                onChange={(value) => onSectionWidthChange(section.id, value)}
              />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function NumberControl({
  label,
  value,
  min,
  max,
  step,
  suffix = " мм",
  issue,
  helperText,
  compact = false,
  canIncreaseOverride,
  increaseDisabledTitle,
  onAutoFix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  issue?: ConstructorValidationIssue | null;
  helperText?: string;
  compact?: boolean;
  canIncreaseOverride?: boolean;
  increaseDisabledTitle?: string;
  onAutoFix?: () => void;
  onChange: (value: number) => void;
}) {
  const controlId = useId();
  const labelId = `${controlId}-label`;
  const valueId = `${controlId}-value`;
  const helpId = `${controlId}-help`;
  const issueId = `${controlId}-issue`;
  const canDecrease = value > min;
  const canIncrease = (canIncreaseOverride ?? true) && value < max;
  const clampToRange = (next: number) => Math.max(min, Math.min(max, next));
  const nextValue = (delta: number) => clampToRange(value + delta);
  const handleInputChange = (rawValue: string) => {
    const numericValue = Number(rawValue.replace(/\s/g, ""));
    if (!Number.isFinite(numericValue)) return;
    onChange(clampToRange(numericValue));
  };
  const lowerLabel = label.toLowerCase();

  return (
    <div
      className={`rzm-3d-control-group rzm-3d-control-row${compact ? " is-compact" : ""}`}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={issue ? `${helpId} ${issueId}` : helpId}
    >
      <div>
        <span id={labelId}>{label}</span>
        <strong id={valueId} aria-live="polite">
          {value.toLocaleString("ru-RU")}
          {suffix}
        </strong>
        <small id={helpId} className="rzm-3d-control-help">
          {helperText ?? (
            <>
              Диапазон: {min.toLocaleString("ru-RU")}–
              {max.toLocaleString("ru-RU")}
              {suffix}
            </>
          )}
        </small>
      </div>
      <div
        className="rzm-3d-mini-control"
        role="group"
        aria-label={`Изменить ${lowerLabel}`}
      >
        <button
          type="button"
          className="rzm-ui-btn rzm-ui-btn--icon"
          aria-label={`Уменьшить ${lowerLabel}`}
          title={
            canDecrease
              ? `Уменьшить ${lowerLabel}`
              : `Минимум: ${min.toLocaleString("ru-RU")}${suffix}`
          }
          disabled={!canDecrease}
          onClick={() => onChange(nextValue(-step))}
        >
          −
        </button>
        <input
          className="rzm-3d-number-input"
          value={value}
          inputMode="numeric"
          aria-label={`${label}: значение в миллиметрах`}
          onChange={(event) => handleInputChange(event.target.value)}
        />
        <button
          type="button"
          className="rzm-ui-btn rzm-ui-btn--icon"
          aria-label={`Увеличить ${lowerLabel}`}
          title={
            canIncrease
              ? `Увеличить ${lowerLabel}`
              : (increaseDisabledTitle ??
                `Максимум: ${max.toLocaleString("ru-RU")}${suffix}`)
          }
          disabled={!canIncrease}
          onClick={() => onChange(nextValue(step))}
        >
          +
        </button>
      </div>
      {issue ? (
        <small
          id={issueId}
          className={`rzm-3d-inline-issue is-${issue.severity}`}
        >
          <span>{issue.message}</span>
          {onAutoFix ? (
            <button
              type="button"
              className="rzm-ui-btn rzm-ui-btn--secondary rzm-ui-btn--autofix rzm-3d-inline-fix"
              onClick={onAutoFix}
            >
              Исправить
            </button>
          ) : null}
        </small>
      ) : null}
    </div>
  );
}

function findValidationIssue(
  validation: ConstructorValidationState,
  target: string,
): ConstructorValidationIssue | null {
  return validation.issues.find((issue) => issue.targetId === target) ?? null;
}
