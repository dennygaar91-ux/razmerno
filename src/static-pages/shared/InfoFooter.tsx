export function InfoFooter() {
  return (
    <footer className="rzm-info-footer">
      <div className="rzm-info-footer-grid">
        <div>
          <a className="rzm-logo" href="/" aria-label="Размерно — на главную">
            <span className="rzm-logo-image-wrap">
              <img className="rzm-logo-image" src="/assets/razmerno-logo-photo1-transparent.png" alt="" />
            </span>
            <span className="rzm-logo-word">Размерно</span>
          </a>
          <p className="rzm-step-text">Онлайн-конструктор корпусной мебели под размер. Спокойный путь от замера до заявки.</p>
        </div>
        <div>
          <p className="rzm-info-footer-title">Разделы</p>
          <a href="/#how">Как это работает</a>
          <a href="/measurements">Замеры</a>
          <a href="/materials">Материалы</a>
          <a href="/assembly">Сборка</a>
        </div>
        <div>
          <p className="rzm-info-footer-title">Контакт</p>
          <a href="https://t.me/razmerno_meb">Telegram @razmerno_meb</a>
          <a href="/configurator">Заявка из конструктора</a>
        </div>
      </div>
    </footer>
  );
}
