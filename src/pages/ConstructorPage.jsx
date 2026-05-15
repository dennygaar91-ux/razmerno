import './ConstructorPage.css'

export default function ConstructorPage() {
  return (

  <div className="constructor-page">
    <header className="header">
      <a href="#" className="logo" aria-label="Размерно — на главную">
        <span className="logo__title">РАЗМЕРНО</span>
        <span className="logo__subtitle">мебель по вашим размерам</span>
      </a>

      <nav className="top-nav" aria-label="Основная навигация">
        <a href="#">Главная</a>
        <a href="#" className="active" aria-current="page">Конструктор</a>
        <a href="#">Материалы</a>
        <a href="#">О нас</a>
        <a href="#">Как это работает</a>
        <a href="#">Контакты</a>
      </nav>

      <div className="header-actions">
        <button className="icon-button" type="button" aria-label="Избранное">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.8 4.7c-1.8-1.8-4.7-1.7-6.5.1L12 7.1 9.7 4.8C7.9 3 5 2.9 3.2 4.7c-1.9 1.9-1.9 5 0 6.9l8.1 8.1c.4.4 1 .4 1.4 0l8.1-8.1c1.9-1.9 1.9-5 0-6.9Z"/>
          </svg>
        </button>

        <button className="login-button" type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0"/>
          </svg>
          Войти
        </button>

        <button className="primary-header-button" type="button">Получить расчет</button>
      </div>
    </header>

    <main className="constructor-layout">
      <aside className="side-rail" aria-label="Разделы конструктора">
        <button className="side-rail__top" type="button" aria-label="Текущий шаг">
          <span>①</span>
        </button>

        <nav className="side-menu" aria-label="Меню конструктора">
          <button className="side-item active" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 3h12v18H6V3Zm4 0v18M14 3v18M6 10h12"/>
            </svg>
            <span>Конструктор</span>
          </button>

          <button className="side-item" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 4h8l2 6v10H6V10l2-6Zm1 6h6M9 14h6"/>
            </svg>
            <span>Материалы</span>
          </button>

          <button className="side-item" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 3h10v18H7V3Zm3 4h4M10 11h4M10 15h4"/>
            </svg>
            <span>Проекты</span>
          </button>

          <button className="side-item" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.8 4.7c-1.8-1.8-4.7-1.7-6.5.1L12 7.1 9.7 4.8C7.9 3 5 2.9 3.2 4.7c-1.9 1.9-1.9 5 0 6.9l8.1 8.1c.4.4 1 .4 1.4 0l8.1-8.1c1.9-1.9 1.9-5 0-6.9Z"/>
            </svg>
            <span>Избранное</span>
          </button>
        </nav>

        <button className="help-item" type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9.8 9a2.3 2.3 0 1 1 3.7 1.8c-.9.7-1.5 1.3-1.5 2.4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
          <span>Помощь</span>
        </button>
      </aside>

      <section className="config-panel">
        <div className="panel-header">
          <h1>Конструктор шкафа</h1>
          <p>Шаг 2 из 4 — Секции</p>
        </div>

        <div className="steps" aria-label="Этапы настройки шкафа">
          <div className="step done"><span>✓</span><em></em><p>Размеры</p></div>
          <div className="step current"><span>2</span><em></em><p>Секции</p></div>
          <div className="step"><span>3</span><em></em><p>Наполнение</p></div>
          <div className="step"><span>4</span><p>Материалы</p></div>
        </div>

        <div className="form-block">
          <h2>Параметры шкафа</h2>
          <label className="input-row">
            <span>Высота, мм</span>
            <input value="2400" inputMode="numeric" readOnly />
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v16H4V5Zm4-2v4M16 3v4M4 10h16M8 14h2M14 14h2M8 18h2M14 18h2"/></svg>
          </label>
          <label className="input-row">
            <span>Ширина, мм</span>
            <input value="1800" inputMode="numeric" readOnly />
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v16H4V5Zm4-2v4M16 3v4M4 10h16M8 14h2M14 14h2M8 18h2M14 18h2"/></svg>
          </label>
          <label className="input-row">
            <span>Глубина, мм</span>
            <input value="600" inputMode="numeric" readOnly />
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v16H4V5Zm4-2v4M16 3v4M4 10h16M8 14h2M14 14h2M8 18h2M14 18h2"/></svg>
          </label>
        </div>

        <div className="form-block">
          <h2>Конфигурация</h2>
          <div className="configuration-grid">
            <button className="config-card" type="button"><span className="schema schema-1"></span></button>
            <button className="config-card selected" type="button" aria-pressed="true"><span className="schema schema-2"></span></button>
            <button className="config-card" type="button"><span className="schema schema-3"></span></button>
          </div>
        </div>

        <div className="form-block">
          <h2>Количество секций</h2>
          <div className="segmented">
            <button type="button">2 секции</button>
            <button className="active" type="button">3 секции</button>
            <button type="button">4 секции</button>
          </div>
        </div>

        <div className="form-block">
          <h2>Тип шкафа</h2>
          <div className="segmented segmented--wide">
            <button className="active" type="button">Корпусный</button>
            <button type="button">Встроенный</button>
          </div>
        </div>

        <button className="next-button" type="button">
          <span>Далее: наполнение</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
      </section>

      <section className="viewer-panel" aria-label="Предпросмотр шкафа">
        <div className="view-tabs">
          <button type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5V21H5v-8h5v8"/></svg><span>Вид<br/>спереди</span></button>
          <button type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v9m8-4.5-8 4.5m-8-4.5 8 4.5"/></svg><span>Вид<br/>сбоку</span></button>
          <button type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4-8 4-8-4 8-4Zm8 8-8 4-8-4m16 4-8 4-8-4"/></svg><span>Вид<br/>сверху</span></button>
        </div>

        <div className="history-controls">
          <button type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7 4 12l5 5M5 12h10a5 5 0 0 1 5 5"/></svg></button>
          <button className="disabled" type="button" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 7 5 5-5 5M19 12H9a5 5 0 0 0-5 5"/></svg></button>
        </div>

        <div className="viewer-scene">
          <div className="size-label size-label--height">2400 мм</div>
          <div className="size-label size-label--width">1800 мм</div>
          <div className="wardrobe-mockup">
            <div className="wardrobe">
              <div className="wardrobe-top"></div>
              <div className="wardrobe-section section-left">
                <div className="shelf shelf-1"></div><div className="shelf shelf-2"></div><div className="shelf shelf-3"></div>
                <div className="drawer drawer-1"></div><div className="drawer drawer-2"></div>
              </div>
              <div className="wardrobe-section section-middle"><div className="top-shelf"></div><div className="rail"></div></div>
              <div className="wardrobe-section section-right"><div className="top-shelf"></div><div className="rail"></div></div>
            </div>
          </div>
        </div>

        <div className="viewer-bottom-controls">
          <div className="toggle-3d"><button className="active" type="button">3D</button><button type="button">2D</button></div>
          <div className="zoom-controls"><button type="button">−</button><button type="button" aria-label="На весь экран"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/></svg></button><button type="button">+</button></div>
        </div>
      </section>

      <aside className="summary-column">
        <section className="summary-card price-card">
          <p className="card-title">Итоговая стоимость</p>
          <strong>24 350 ₽</strong>
          <p className="saving"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6c-5.5.2-10.2 2-13 5-2.4 2.5-3 5.5-3 8 3.2 0 6.2-.6 8.7-3C15.7 13 17.6 9.4 20 6Z"/></svg>Экономия: 3 650 ₽</p>
          <div className="divider"></div>
          <div className="deadline"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v16H4V5Zm4-2v4M16 3v4M4 10h16"/></svg><span>Срок изготовления</span><b>10–14 дней</b></div>
          <button className="summary-main-button" type="button">Получить расчет</button>
          <button className="summary-secondary-button" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7c-1.8-1.8-4.7-1.7-6.5.1L12 7.1 9.7 4.8C7.9 3 5 2.9 3.2 4.7c-1.9 1.9-1.9 5 0 6.9l8.1 8.1c.4.4 1 .4 1.4 0l8.1-8.1c1.9-1.9 1.9-5 0-6.9Z"/></svg>Сохранить проект</button>
        </section>

        <section className="summary-card material-card">
          <h3>Материалы</h3>
          <div className="material-row"><div className="texture texture-wood"></div><div><p>ЛДСП Дуб Сонома</p><span>16 мм</span></div><svg className="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></div>
          <div className="material-row"><div className="texture texture-edge"></div><div><p>Кромка</p><span>ПВХ 2 мм</span></div></div>
        </section>

        <section className="summary-card size-card">
          <h3>Размеры шкафа</h3>
          <dl>
            <div><dt>Высота</dt><dd>2400 мм</dd></div>
            <div><dt>Ширина</dt><dd>1800 мм</dd></div>
            <div><dt>Глубина</dt><dd>600 мм</dd></div>
          </dl>
        </section>

        <section className="summary-card collapse-card">
          <div><h3>Секции</h3><p>3 секции</p></div>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>
        </section>
      </aside>
    </main>

    <footer className="bottom-benefits">
      <div className="benefit">
        <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11h10v9H7v-9Zm2-4h6l2 4H7l2-4Zm3 8h.01"/></svg></span>
        <p>Доставка по Москве</p>
        <small>внутри МКАД от 6000 ₽</small>
      </div>
      <div className="benefit">
        <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 21h10V8l-5-5-5 5v13Zm5-18v6h5M9 14h6"/></svg></span>
        <p>Гарантия 18 месяцев</p>
        <small>на комплект мебели</small>
      </div>
      <div className="benefit">
        <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 8 8-4M12 11 4 7m8 4v10"/></svg></span>
        <p>Комплект для сборки</p>
        <small>детали, кромка, фурнитура</small>
      </div>
      <div className="benefit">
        <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7c-1.8-1.8-4.7-1.7-6.5.1L12 7.1 9.7 4.8C7.9 3 5 2.9 3.2 4.7c-1.9 1.9-1.9 5 0 6.9l8.1 8.1c.4.4 1 .4 1.4 0l8.1-8.1c1.9-1.9 1.9-5 0-6.9Z"/></svg></span>
        <p>Сборка по желанию</p>
        <small>+10% к стоимости заказа</small>
      </div>
    </footer>

    <button className="chat-button" type="button" aria-label="Чат">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v7A3.5 3.5 0 0 1 16.5 16H9l-5 4v-4.5A3.5 3.5 0 0 1 4 12V5.5Z"/>
      </svg>
    </button>
  </div>

  )
}
