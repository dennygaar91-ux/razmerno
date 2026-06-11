type ConstructorHeaderVariant = "landing" | "workspace";

type ConstructorHeaderProps = {
  variant?: ConstructorHeaderVariant;
  currentStepLabel?: string;
  statusLabel?: string;
  onReset?: () => void;
};

export function ConstructorHeader({
  variant = "landing",
  currentStepLabel,
  statusLabel,
  onReset,
}: ConstructorHeaderProps) {
  if (variant === "workspace") {
    return (
      <div className="rzm-constructor-shell-header-wrap">
        <header className="rzm-constructor-shell-header" aria-label="Рабочая панель конструктора">
          <a className="rzm-logo rzm-constructor-shell-logo" href="/" aria-label="Размерно — на главную">
            <span className="rzm-logo-image-wrap">
              <img className="rzm-logo-image" src="/assets/razmerno-logo-photo1-transparent.png" alt="" />
            </span>
            <span className="rzm-logo-word">Размерно</span>
          </a>

          <div className="rzm-constructor-shell-status" aria-live="polite">
            <span>Конструктор</span>
            <strong>{currentStepLabel ?? "Проект"}</strong>
            {statusLabel ? <small>{statusLabel}</small> : null}
          </div>

          <div className="rzm-constructor-shell-actions" aria-label="Действия конструктора">
            {onReset ? (
              <button
                type="button"
                className="rzm-ui-btn rzm-ui-btn--ghost rzm-ui-btn--reset rzm-constructor-shell-reset"
                onClick={onReset}
                aria-haspopup="dialog"
              >
                Сбросить
              </button>
            ) : null}
            <a className="rzm-ui-btn rzm-ui-btn--secondary rzm-ui-btn--exit rzm-constructor-shell-exit" href="/">
              Выйти на сайт
            </a>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="rzm-header-shell rzm-constructor-header-shell">
      <header className="rzm-header">
        <a className="rzm-logo" href="/" aria-label="Размерно — на главную">
          <span className="rzm-logo-image-wrap">
            <img className="rzm-logo-image" src="/assets/razmerno-logo-photo1-transparent.png" alt="" />
          </span>
          <span className="rzm-logo-word">Размерно</span>
        </a>

        <nav className="rzm-nav" aria-label="Основная навигация">
          <a className="rzm-nav-link" href="/#how"><span>Как это работает</span></a>
          <a className="rzm-nav-link" href="/measurements"><span>Замеры</span></a>
          <a className="rzm-nav-link" href="/materials"><span>Материалы</span></a>
          <a className="rzm-nav-link" href="/assembly"><span>Сборка</span></a>
          <a className="rzm-nav-link" href="/#faq"><span>FAQ</span></a>
        </nav>

        <div className="rzm-action">
          <a className="rzm-cta" href="/configurator">Собрать шкаф</a>
        </div>
      </header>
    </div>
  );
}
