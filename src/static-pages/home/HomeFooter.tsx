const footerGroups = [
  {
    title: "Разделы",
    links: [
      { label: "Как это работает", href: "/#how" },
      { label: "Замеры", href: "/measurements" },
      { label: "Материалы", href: "/materials" },
      { label: "Сборка", href: "/assembly" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Контакты",
    links: [
      { label: "Telegram @razmerno_meb", href: "https://t.me/razmerno_meb" },
      { label: "Заявка из конструктора", href: "/configurator" },
    ],
  },
  {
    title: "Документы",
    links: [
      { label: "Политика конфиденциальности", href: "#" },
      { label: "Пользовательское соглашение", href: "#" },
      { label: "Обработка персональных данных", href: "#" },
    ],
  },
] as const;

export function HomeFooter() {
  return (
    <footer className="rzm-footer" aria-label="Footer">
      <div className="rzm-footer-shell">
        <div className="rzm-footer-brand">
          <a className="rzm-logo" href="/" aria-label="Размерно — на главную">
            <span className="rzm-logo-image-wrap">
              <img className="rzm-logo-image" src="/assets/razmerno-logo-photo1-transparent.png" alt="" />
            </span>
            <span className="rzm-logo-word">Размерно</span>
          </a>
          <p className="rzm-footer-text">Онлайн-конструктор корпусной мебели под размер. Соберите шкаф, тумбу или комод из понятных модулей и отправьте заявку на проверку.</p>
        </div>
        {footerGroups.map((group) => (
          <nav className="rzm-footer-col" aria-label={group.title} key={group.title}>
            <p className="rzm-footer-col-title">{group.title}</p>
            <div className="rzm-footer-links">
              {group.links.map((link) => (
                <a className="rzm-footer-link" href={link.href} key={link.label}>{link.label}</a>
              ))}
            </div>
          </nav>
        ))}
      </div>
      <div className="rzm-footer-bottom">
        <span>© Размерно</span>
        <span>Онлайн-конструктор мебели под размер</span>
        <span>Юридические данные будут добавлены перед публичным запуском</span>
      </div>
    </footer>
  );
}
