import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../icons/Icon';
import { useCabinetStore } from '../store/cabinetStore';
import { CabinetViewer } from '../constructor/Viewer';
import './ConstructorPage.css';

export default function ConstructorPage() {
  const navigate = useNavigate();
  const [cabinetType, setCabinetType] = useState('Корпусный');
  const {
    config,
    result,
    updateDimensions,
    addSection,
    removeSection,
    autoDistributeSections
  } = useCabinetStore();

  const price = result.price?.total ?? 0;
  const priceFormatted = price.toLocaleString('ru-RU');
  const savings = Math.max(0, Math.round(price * 0.13));
  const sectionCount = config.sections.length;

  const stats = useMemo(() => {
    const drawerCount = config.sections.reduce((sum, section) => {
      const drawer = section.items.find((item) => item.type === 'drawer');
      return sum + (drawer?.count || 0);
    }, 0);

    const shelfCount = config.sections.reduce((sum, section) => {
      const shelf = section.items.find((item) => item.type === 'shelf');
      return sum + (shelf?.count || 0);
    }, 0);

    return {
      drawerCount,
      shelfCount
    };
  }, [config.sections]);

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

  return (
    <div className="cst-page">
      <header className="cst-topbar">
        <div className="cst-topbar-left">
          <div className="cst-topbar-title">Конструктор шкафа</div>
          <div className="cst-topbar-text">Создайте шкаф по своим размерам и сохраните проект</div>
        </div>
        <div className="cst-topbar-right">
          <button type="button" className="cst-top-btn">
            <Icon name="settings" size={18} /> Настройки
          </button>
        </div>
      </header>

      <div className="cst-shell">
        <aside className="cst-sidebar">
          <div className="cst-sidebar-group">
            <button className="cst-nav-item active" type="button">
              <Icon name="cube" size={18} />
            </button>
            <button className="cst-nav-item" type="button">
              <Icon name="layers" size={18} />
            </button>
            <button className="cst-nav-item" type="button">
              <Icon name="projects" size={18} />
            </button>
            <button className="cst-nav-item" type="button">
              <Icon name="star" size={18} />
            </button>
          </div>
          <button className="cst-nav-help" type="button">
            <Icon name="message" size={18} />
          </button>
        </aside>

        <section className="cst-left-panel">
          <div className="cst-card cst-panel-card">
            <div className="cst-panel-head">
              <div className="cst-small-label">Конструктор шкафа</div>
              <h1 className="cst-panel-title">Шаг 2 из 4 — Секции</h1>
            </div>
            <div className="cst-stepper-row">
              {['1', '2', '3', '4'].map((step) => (
                <div
                  key={step}
                  className={`cst-stepper-item ${step === '2' ? 'active' : step === '1' ? 'completed' : ''}`}
                >
                  {step}
                </div>
              ))}
            </div>

            <div className="cst-form-group">
              <div className="cst-form-title">Параметры шкафа</div>
              {[
                { label: 'Высота, мм', key: 'height', min: 600, max: 2800 },
                { label: 'Ширина, мм', key: 'width', min: 400, max: 2600 },
                { label: 'Глубина, мм', key: 'depth', min: 300, max: 900 }
              ].map((field) => (
                <label key={field.key} className="cst-field-row">
                  <span>{field.label}</span>
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    value={config.dimensions[field.key]}
                    onChange={(event) => updateDimensions(field.key, Number(event.target.value))}
                  />
                </label>
              ))}
            </div>

            <div className="cst-form-group">
              <div className="cst-form-title">Конфигурация</div>
              <div className="cst-layout-grid">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={`cst-layout-btn ${sectionCount === count ? 'active' : ''}`}
                    onClick={() => setSectionCount(count)}
                  >
                    <span>{count} секции</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="cst-form-group">
              <div className="cst-form-title">Тип шкафа</div>
              <div className="cst-toggle-group">
                {['Корпусный', 'Встроенный'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`cst-toggle-btn ${cabinetType === type ? 'active' : ''}`}
                    onClick={() => setCabinetType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button className="cst-button-primary" type="button" onClick={() => navigate('/auth')}>
              Далее: Наполнение
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </section>

        <main className="cst-view-area">
          <div className="cst-card cst-view-card">
            <div className="cst-view-toolbar">
              <div className="cst-view-pill-group">
                <button className="cst-view-pill active" type="button">
                  <Icon name="camera" size={16} /> Вид спереди
                </button>
                <button className="cst-view-pill" type="button">
                  <Icon name="layers" size={16} /> Вид сбоку
                </button>
                <button className="cst-view-pill" type="button">
                  <Icon name="package" size={16} /> Вид сверху
                </button>
              </div>
              <div className="cst-view-actions">
                <button type="button" className="cst-icon-action soft">
                  <Icon name="arrow-left" size={18} />
                </button>
                <button type="button" className="cst-icon-action soft">
                  <Icon name="arrow-right" size={18} />
                </button>
              </div>
            </div>

            <div className="cst-view-stage">
              <div className="cst-view-edge" />
              <div className="cst-view-edge cst-view-edge--second" />
              <CabinetViewer parts={result.parts} />
            </div>

            <div className="cst-view-footer">
              <div className="cst-view-mode">
                <button type="button" className="cst-view-mode-btn active">3D</button>
                <button type="button" className="cst-view-mode-btn">2D</button>
              </div>
              <div className="cst-view-zoom">
                <button type="button" className="cst-icon-action">−</button>
                <button type="button" className="cst-icon-action">+</button>
              </div>
            </div>
          </div>
        </main>

        <aside className="cst-right-panel">
          <div className="cst-card cst-summary-card">
            <div className="cst-summary-label">Итоговая стоимость</div>
            <div className="cst-summary-price">{priceFormatted} ₽</div>
            <div className="cst-summary-save">Экономия: {savings.toLocaleString('ru-RU')} ₽</div>
            <div className="cst-summary-meta">
              <Icon name="clock" size={16} />
              <span>Срок изготовления 10–14 дней</span>
            </div>
            <button className="cst-button-quote" type="button">Получить расчет</button>
            <button className="cst-button-outline" type="button">
              <Icon name="star" size={16} /> Сохранить проект
            </button>
          </div>

          <div className="cst-card cst-material-card">
            <div className="cst-card-head">Материалы</div>
            <div className="cst-material-row">
              <div className="cst-material-swatch" />
              <div>
                <div className="cst-material-name">ЛДСП Дуб Сонома</div>
                <div className="cst-material-sub">16 мм</div>
              </div>
            </div>
            <div className="cst-material-row">
              <div className="cst-material-swatch cst-material-swatch--edge" />
              <div>
                <div className="cst-material-name">Кромка</div>
                <div className="cst-material-sub">ПВХ 2 мм</div>
              </div>
            </div>
          </div>

          <div className="cst-card cst-info-card">
            <div className="cst-card-head">Размеры шкафа</div>
            <div className="cst-info-row"><span>Высота</span><strong>{config.dimensions.height} мм</strong></div>
            <div className="cst-info-row"><span>Ширина</span><strong>{config.dimensions.width} мм</strong></div>
            <div className="cst-info-row"><span>Глубина</span><strong>{config.dimensions.depth} мм</strong></div>
          </div>

          <div className="cst-card cst-info-card">
            <div className="cst-card-head">Секции</div>
            <div className="cst-info-row"><span>Количество</span><strong>{sectionCount}</strong></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
