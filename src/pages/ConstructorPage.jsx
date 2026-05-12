import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../icons/Icon";
import Header from "../components/Header/Header";
import { useCabinetStore } from "../store/cabinetStore";
import { CabinetViewer } from "../constructor/Viewer";
import {
  bodyMaterialOptions,
  facadeMaterialOptions,
  hardwareBrandOptions,
  handleOptions
} from "../data/constructorOptions";
import "./ConstructorPage.css";

export default function ConstructorPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("3D");
  const [viewType, setViewType] = useState("front");
  const [panelTab, setPanelTab] = useState("params");
  const [zoom, setZoom] = useState(1);
  const [humanHeight, setHumanHeight] = useState(1750);

  const {
    config,
    result,
    updateDimensions,
    addSection,
    removeSection,
    autoDistributeSections,
    setSectionShelves,
    setSectionDrawers,
    setSectionHangerRails,
    setBodyMaterial,
    setFacadeMaterial,
    setHardwareBrand,
    toggleLegs,
    toggleHandles,
    setHandleVariant
  } = useCabinetStore();

  const sectionCount = config.sections.length;
  const showHandles = config.facade.enabled && config.facade.openingType === "with_handles";

  const totals = useMemo(() => {
    const drawerCount = config.sections.reduce((sum, section) => {
      const drawer = section.items.find((item) => item.type === "drawer");
      return sum + (drawer?.count || 0);
    }, 0);

    const shelfCount = config.sections.reduce((sum, section) => {
      const shelf = section.items.find((item) => item.type === "shelf");
      return sum + (shelf?.count || 0);
    }, 0);

    const hangerCount = config.sections.reduce((sum, section) => {
      const rail = section.items.find((item) => item.type === "hanger_rail");
      return sum + (rail?.count || 0);
    }, 0);

    return {
      drawerCount,
      shelfCount,
      hangerCount
    };
  }, [config.sections]);

  const price = result.price?.total ?? 0;
  const savings = Math.max(0, Math.round(price * 0.12));
  const bodyMaterialName = bodyMaterialOptions.find((item) => item.id === config.materials.bodyMaterialId)?.name || "ЛДСП";
  const facadeMaterialName = facadeMaterialOptions.find((item) => item.id === config.materials.facadeMaterialId)?.name || "МДФ";

  function setSectionCount(count) {
    if (count === sectionCount) return;

    if (count > sectionCount) {
      for (let index = sectionCount; index < count; index += 1) {
        addSection();
      }
    } else {
      const removeIds = config.sections.slice(count).map((section) => section.id);
      removeIds.forEach((sectionId) => removeSection(sectionId));
    }

    autoDistributeSections();
  }

  function distributeCount(type, count) {
    const sections = [...config.sections];
    const base = Math.floor(count / sections.length);
    let remainder = count % sections.length;

    sections.forEach((section) => {
      const value = base + (remainder > 0 ? 1 : 0);
      remainder -= 1;

      if (type === "shelf") {
        setSectionShelves(section.id, value);
      }
      if (type === "drawer") {
        setSectionDrawers(section.id, value);
      }
    });
  }

  function distributeRails(count) {
    let remaining = count;
    config.sections.forEach((section) => {
      const value = remaining > 0 ? 1 : 0;
      setSectionHangerRails(section.id, value);
      remaining -= 1;
    });
  }

  function updateZoom(delta) {
    setZoom((prev) => Math.max(0.7, Math.min(1.5, prev + delta)));
  }

  function updateHumanHeight(delta) {
    setHumanHeight((prev) => Math.max(1600, Math.min(1900, prev + delta)));
  }

  return (
    <>
      <Header />
      <div className="cst-page">
        <div className="cst-header">
          <div className="cst-header-text">
            <span className="cst-header-badge">Шаг 1</span>
            <h1 className="cst-header-title">Конструктор шкафа</h1>
            <p className="cst-header-subtitle">Настройте секции, наполнения и материалы для шкафа в реальном времени.</p>
          </div>
          <div className="cst-header-actions">
            <button type="button" className="cst-button-outline">
              <Icon name="star" size={16} /> Сохранить проект
            </button>
            <button type="button" className="cst-button-primary" onClick={() => navigate("/auth")}>Получить расчет</button>
          </div>
        </div>

        <div className="cst-shell">
        <aside className="cst-sidebar">
          <div className="cst-sidebar-group">
            <button
              type="button"
              className={`cst-tab-btn ${panelTab === "params" ? "active" : ""}`}
              onClick={() => setPanelTab("params")}
            >
              Параметры
            </button>
            <button
              type="button"
              className={`cst-tab-btn ${panelTab === "fill" ? "active" : ""}`}
              onClick={() => setPanelTab("fill")}
            >
              Наполнение
            </button>
            <button
              type="button"
              className={`cst-tab-btn ${panelTab === "materials" ? "active" : ""}`}
              onClick={() => setPanelTab("materials")}
            >
              Материалы
            </button>
          </div>
        </aside>

        <section className="cst-left-panel">
          {panelTab === "params" && (
            <div className="cst-card cst-panel-card">
              <div className="cst-panel-head">
                <div className="cst-small-label">Параметры</div>
                <h2 className="cst-panel-title">Размеры и секции</h2>
              </div>

              <div className="cst-info-grid">
                {[
                  { label: "Высота", key: "height" },
                  { label: "Ширина", key: "width" },
                  { label: "Глубина", key: "depth" }
                ].map((field) => (
                  <label key={field.key} className="cst-field-row">
                    <span>{field.label}, мм</span>
                    <input
                      type="number"
                      min={600}
                      max={2800}
                      value={config.dimensions[field.key]}
                      onChange={(event) => updateDimensions(field.key, Number(event.target.value))}
                    />
                  </label>
                ))}
              </div>
              <div className="cst-hint">Размеры задаются в миллиметрах. Изменения сразу применяются к 3D-просмотру.</div>

              <div className="cst-card-section">
                <div className="cst-card-head">Секции</div>
                <div className="cst-section-controls">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      className={`cst-option-card ${sectionCount === count ? "active" : ""}`}
                      onClick={() => setSectionCount(count)}
                    >
                      {count} секции
                    </button>
                  ))}
                </div>
              </div>
              <div className="cst-hint">Выберите количество секций — ширина автоматически перерассчитывается.</div>
            </div>
          )}

          {panelTab === "fill" && (
            <div className="cst-card cst-panel-card">
              <div className="cst-panel-head">
                <div className="cst-small-label">Наполнение</div>
                <h2 className="cst-panel-title">Полки, ящики и рейлинги</h2>
              </div>

              <div className="cst-control-row">
                <div className="cst-counter-block">
                  <span>Полки</span>
                  <div className="cst-counter">
                    <button type="button" className="cst-counter-button" onClick={() => distributeCount("shelf", Math.max(0, totals.shelfCount - 1))}>−</button>
                    <span className="cst-counter-value">{totals.shelfCount}</span>
                    <button type="button" className="cst-counter-button" onClick={() => distributeCount("shelf", totals.shelfCount + 1)}>+</button>
                  </div>
                </div>
                <div className="cst-counter-block">
                  <span>Ящики</span>
                  <div className="cst-counter">
                    <button type="button" className="cst-counter-button" onClick={() => distributeCount("drawer", Math.max(0, totals.drawerCount - 1))}>−</button>
                    <span className="cst-counter-value">{totals.drawerCount}</span>
                    <button type="button" className="cst-counter-button" onClick={() => distributeCount("drawer", totals.drawerCount + 1)}>+</button>
                  </div>
                </div>
              </div>

              <div className="cst-control-row">
                <div className="cst-counter-block">
                  <span>Рейлинги</span>
                  <div className="cst-counter">
                    <button type="button" className="cst-counter-button" onClick={() => distributeRails(Math.max(0, totals.hangerCount - 1))}>−</button>
                    <span className="cst-counter-value">{totals.hangerCount}</span>
                    <button type="button" className="cst-counter-button" onClick={() => distributeRails(totals.hangerCount + 1)}>+</button>
                  </div>
                </div>
                <div className="cst-toggle-group">
                  <button
                    type="button"
                    className={`cst-toggle-btn ${config.options.hasLegs ? "active" : ""}`}
                    onClick={() => toggleLegs(!config.options.hasLegs)}
                  >
                    Ножки
                  </button>
                  <button
                    type="button"
                    className={`cst-toggle-btn ${showHandles ? "active" : ""}`}
                    onClick={() => toggleHandles(!showHandles)}
                  >
                    Ручки
                  </button>
                </div>
              </div>

              {showHandles ? (
                <div className="cst-card-section">
                  <div className="cst-card-head">Вариант ручки</div>
                  <div className="cst-section-controls">
                    {handleOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`cst-option-card ${config.facade.handleVariant === option.id ? "active" : ""}`}
                        onClick={() => setHandleVariant(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="cst-hint">Ручки появляются только при активной опции фасада.</div>
            </div>
          )}

          {panelTab === "materials" && (
            <div className="cst-card cst-panel-card">
              <div className="cst-panel-head">
                <div className="cst-small-label">Материалы</div>
                <h2 className="cst-panel-title">Выберите отделку</h2>
              </div>

              <div className="cst-card-section">
                <div className="cst-card-head">Корпус</div>
                <div className="cst-section-controls">
                  {bodyMaterialOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`cst-option-card ${config.materials.bodyMaterialId === option.id ? "active" : ""}`}
                      onClick={() => setBodyMaterial(option.id)}
                    >
                      <span className="cst-material-swatch" style={{ background: option.color }} />
                      <div>
                        <div className="cst-material-name">{option.name}</div>
                        <div className="cst-material-sub">{option.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cst-card-section">
                <div className="cst-card-head">Фасад</div>
                <div className="cst-section-controls">
                  {facadeMaterialOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`cst-option-card ${config.materials.facadeMaterialId === option.id ? "active" : ""}`}
                      onClick={() => setFacadeMaterial(option.id)}
                    >
                      <span className="cst-material-swatch" style={{ background: option.color }} />
                      <div>
                        <div className="cst-material-name">{option.name}</div>
                        <div className="cst-material-sub">{option.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cst-card-section">
                <div className="cst-card-head">Фурнитура</div>
                <div className="cst-section-controls">
                  {hardwareBrandOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`cst-option-card ${config.options.hardwareBrand === option.id ? "active" : ""}`}
                      onClick={() => setHardwareBrand(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="cst-hint">Выбор бренда влияет на стоимость фурнитуры и общий расчет.</div>
            </div>
          )}
        </section>

        <main className="cst-view-area">
          <div className="cst-card cst-view-card">
            <div className="cst-view-toolbar">
              <div className="cst-view-pill-group">
                {[
                  { id: "front", label: "СПЕРЕДИ" },
                  { id: "side", label: "СБОКУ" },
                  { id: "top", label: "СВЕРХУ" },
                  { id: "free", label: "Свободно" }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`cst-view-pill ${viewType === option.id ? "active" : ""}`}
                    onClick={() => setViewType(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="cst-view-actions">
                <button type="button" className={`cst-view-mode-btn ${viewMode === "3D" ? "active" : ""}`} onClick={() => setViewMode("3D")}>
                  3D
                </button>
                <button type="button" className={`cst-view-mode-btn ${viewMode === "2D" ? "active" : ""}`} onClick={() => setViewMode("2D")}>
                  2D
                </button>
              </div>
            </div>

            <div className="cst-view-stage">
              <CabinetViewer
                parts={result.parts}
                config={config}
                viewMode={viewMode}
                viewType={viewType}
                zoom={zoom}
                userHeight={humanHeight}
              />
            </div>

            <div className="cst-view-footer">
              <div className="cst-view-hotspot">
                <span>Рост человека</span>
                <div className="cst-counter">
                  <button type="button" className="cst-counter-button" onClick={() => updateHumanHeight(-50)}>−</button>
                  <span className="cst-counter-value">{humanHeight} мм</span>
                  <button type="button" className="cst-counter-button" onClick={() => updateHumanHeight(50)}>+</button>
                </div>
              </div>
              <div className="cst-view-zoom">
                <button type="button" className="cst-counter-button" onClick={() => updateZoom(-0.1)}>
                  −
                </button>
                <span className="cst-zoom-value">{Math.round(zoom * 100)}%</span>
                <button type="button" className="cst-counter-button" onClick={() => updateZoom(0.1)}>
                  <Icon name="plus" size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>

        <aside className="cst-right-panel">
          <div className="cst-card cst-summary-card">
            <div className="cst-summary-label">Итого</div>
            <div className="cst-summary-price">{price.toLocaleString("ru-RU")} ₽</div>
            <div className="cst-summary-save">Экономия до {savings.toLocaleString("ru-RU")} ₽</div>
            <div className="cst-summary-meta">
              <Icon name="clock" size={16} />
              <span>Срок изготовления 10–14 дней</span>
            </div>

            <div className="cst-summary-breakdown">
              <div className="cst-summary-line">
                <span>Корпус: {bodyMaterialName}</span>
                <strong>{config.sections.length} секц.</strong>
              </div>
              <div className="cst-summary-line">
                <span>Фасад: {facadeMaterialName}</span>
                <strong>{config.options.hardwareBrand}</strong>
              </div>
              <div className="cst-summary-line">
                <span>Ящики</span>
                <strong>{totals.drawerCount}</strong>
              </div>
              <div className="cst-summary-line">
                <span>Полки</span>
                <strong>{totals.shelfCount}</strong>
              </div>
              <div className="cst-summary-line">
                <span>Рейлинги</span>
                <strong>{totals.hangerCount}</strong>
              </div>
            </div>
            <div className="cst-hint">В стоимость уже включена доставка, упаковка и НДС.</div>

            <button className="cst-button-primary" type="button">Оформить заказ</button>
          </div>
        </aside>
      </div>
    </div>
    </>
  );
}
