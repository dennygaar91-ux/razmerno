import type { ConstructorSection, ConstructorValidationIssue } from "../types";
import {
  getMaxSectionsByWidth,
  CONSTRUCTOR_SECTION_LIMITS,
} from "../store/constructorStore";
import { DimensionField, MiniControl } from "./shared";

export function SizesStep({
  width,
  height,
  depth,
  sections,
  sectionLayout,
  selectedSectionId,
  focusedValidationIssue,
  advancedSizes,
  onSectionsChange,
  onSectionWidthChange,
  onEqualizeSections,
  onSelectSection,
  onWidthChange,
  onHeightChange,
  onDepthChange,
}: {
  width: number;
  height: number;
  depth: number;
  sections: number;
  sectionLayout: ConstructorSection[];
  selectedSectionId: string | null;
  focusedValidationIssue: ConstructorValidationIssue | null;
  advancedSizes: boolean;
  onSectionsChange: (value: number) => void;
  onSectionWidthChange: (sectionId: string, widthMm: number) => void;
  onEqualizeSections: () => void;
  onSelectSection: (sectionId: string) => void;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
  onDepthChange: (value: number) => void;
}) {
  const maxSections = getMaxSectionsByWidth(width);
  const sectionWidth = Math.floor(width / Math.max(1, sections));
  const focusedTargetId = focusedValidationIssue?.targetId;
  const isSectionsFocused =
    focusedValidationIssue?.targetType === "sections" ||
    focusedValidationIssue?.targetType === "section";

  return (
    <div className="rzm-constructor-step-panel is-active">
      <section className="rzm-constructor-card rzm-step-card--single rzm-step-card--quiet">
        <header className="rzm-step-mode-head rzm-step-mode-head--compact">
          <h2 className="rzm-constructor-card-title">Размеры</h2>
        </header>
        <div className="rzm-constructor-field-grid rzm-constructor-field-grid--compact">
          <div className={`rzm-dimension-field-shell ${focusedTargetId === "width" ? "is-focused has-error" : ""}`}>
            <DimensionField
              label="Ширина"
              value={width}
              onMinus={() => onWidthChange(Math.max(0, width - 50))}
              onPlus={() => onWidthChange(width + 50)}
              onChange={onWidthChange}
            />
          </div>
          <div className={`rzm-dimension-field-shell ${focusedTargetId === "height" ? "is-focused has-error" : ""}`}>
            <DimensionField
              label="Высота"
              value={height}
              onMinus={() => onHeightChange(Math.max(0, height - 50))}
              onPlus={() => onHeightChange(height + 50)}
              onChange={onHeightChange}
            />
          </div>
          <div className={`rzm-dimension-field-shell ${focusedTargetId === "depth" ? "is-focused has-error" : ""}`}>
            <DimensionField
              label="Глубина"
              value={depth}
              onMinus={() => onDepthChange(Math.max(0, depth - 50))}
              onPlus={() => onDepthChange(depth + 50)}
              onChange={onDepthChange}
            />
          </div>
        </div>


        <div className={`rzm-section-control-card ${isSectionsFocused ? "is-focused has-error" : ""}`}>
          <MiniControl
            label="Секции"
            value={sections}
            onMinus={() =>
              onSectionsChange(
                Math.max(CONSTRUCTOR_SECTION_LIMITS.min, sections - 1),
              )
            }
            onPlus={() => onSectionsChange(Math.min(maxSections, sections + 1))}
          />
          <p className="rzm-step-text rzm-step-text--micro">Мин. секция 200 мм · сейчас ≈ {sectionWidth} мм</p>
        </div>

        {advancedSizes && (
          <div
            className="rzm-section-width-editor rzm-precision-editor"
            aria-label="Точная настройка ширины секций"
          >
            <div className="rzm-section-width-editor-head">
              <div>
                <strong>Ширина секций</strong>
              </div>
              <button
                className="rzm-section-width-equalize"
                type="button"
                onClick={onEqualizeSections}
              >
                Выровнять
              </button>
            </div>

            <div className="rzm-precision-summary-grid" aria-label="Краткая сводка секций">
              <span>{sectionLayout.length} секции</span>
              <span>мин. {CONSTRUCTOR_SECTION_LIMITS.minWidthMm} мм</span>
              <span>сумма {width} мм</span>
            </div>

            <div className="rzm-section-width-list">
              {sectionLayout.map((section, index) => {
                const isActive = section.id === selectedSectionId;
                return (
                  <label
                    key={section.id}
                    className={`rzm-section-width-row ${isActive ? "is-active" : ""} ${focusedTargetId === section.id ? "is-focused has-error" : ""}`}
                    onFocus={() => onSelectSection(section.id)}
                  >
                    <span className="rzm-section-width-index">
                      Секция {index + 1}
                    </span>
                    <input
                      className="rzm-section-width-input"
                      value={section.widthMm}
                      inputMode="numeric"
                      onFocus={() => onSelectSection(section.id)}
                      onChange={(event) =>
                        onSectionWidthChange(
                          section.id,
                          Number(event.target.value || 0),
                        )
                      }
                    />
                    <span className="rzm-section-width-unit">мм</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
