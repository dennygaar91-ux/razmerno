import { HeaderAuthControls } from "../../shared/auth/HeaderAuthControls";

type SiteHeaderActivePage = "home" | "measurements" | "materials" | "assembly";

const navItems: Array<{
  key: SiteHeaderActivePage | "faq";
  label: string;
  href: string;
}> = [
  { key: "home", label: "Как это работает", href: "/#how" },
  { key: "measurements", label: "Замеры", href: "/measurements" },
  { key: "materials", label: "Материалы", href: "/materials" },
  { key: "assembly", label: "Сборка", href: "/assembly" },
  { key: "faq", label: "FAQ", href: "/#faq" },
];

export function SiteHeader({ activePage }: { activePage: SiteHeaderActivePage }) {
  return (
    <div className="rzm-header-shell">
      <input className="rzm-menu-toggle" id="rzm-menu-toggle" type="checkbox" />
      <header className="rzm-header" aria-label="Главная навигация">
        <a className="rzm-logo" href="/" aria-label="Размерно — на главную">
          <span className="rzm-logo-image-wrap">
            <img className="rzm-logo-image" src="/assets/razmerno-logo-photo1-transparent.png" alt="" />
          </span>
          <span className="rzm-logo-word">Размерно</span>
        </a>

        <nav className="rzm-nav" aria-label="Разделы сайта">
          {navItems.map((item) => (
            <a
              key={item.key}
              className={`rzm-nav-link ${item.key === activePage ? "is-active" : ""}`.trim()}
              href={activePage === "home" && item.key === "home" ? "#how" : activePage === "home" && item.key === "faq" ? "#faq" : item.href}
            >
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="rzm-action">
          <HeaderAuthControls />
          <a className="rzm-cta" href="/configurator">Открыть конструктор</a>
          <label className="rzm-burger" htmlFor="rzm-menu-toggle" aria-label="Открыть меню">
            <span className="rzm-burger-lines"><span></span></span>
          </label>
        </div>
      </header>

      <div className="rzm-mobile-panel">
        <nav className="rzm-mobile-nav" aria-label="Мобильная навигация">
          {navItems.map((item) => (
            <a
              key={item.key}
              className={item.key === activePage ? "is-active" : ""}
              href={activePage === "home" && item.key === "home" ? "#how" : activePage === "home" && item.key === "faq" ? "#faq" : item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a className="rzm-cta rzm-mobile-cta" href="/configurator">Открыть конструктор</a>
      </div>
    </div>
  );
}
