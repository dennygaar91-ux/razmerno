import { Link } from 'react-router-dom'
import Icon from '../icons/Icon'
import { UiButton, UiStatus } from '../components/uikit/RazmernoUIKit'
import './AccountUIKitPage.css'

const orders = [
  ['Шкаф купе', '2000 × 1500 × 600 мм', '№1150 от 26 апр', 'Доставлен'],
  ['Шкаф распашной', '2100 × 1000 × 600 мм', '№1032 от 13 мар', 'Готов'],
  ['Гардеробная', '2100 × 1800 × 500 мм', '№987 от 18 фев', 'Доставлен'],
]

const projects = [
  ['Шкаф в спальню', '2100 × 1200 × 600 мм', 'Обновлён 10 мая 2024', '82 200 ₽'],
  ['Прихожая', '2200 × 900 × 400 мм', 'Обновлён 2 мая 2024', '54 800 ₽'],
  ['Тумба ТВ', '1800 × 420 × 450 мм', 'Черновик', '28 400 ₽'],
]

const menu = [
  ['home', 'Главная'],
  ['orders', 'Заказы'],
  ['projects', 'Проекты'],
  ['person', 'Профиль'],
]

export default function AccountUIKitPage() {
  return (
    <main className="rzm-account rzm-ui">
      <aside className="rzm-account-sidebar">
        <Link to="/" className="rzm-account-logo">Размерно.</Link>
        <nav>{menu.map(([icon, label], index) => <button key={label} className={index === 0 ? 'is-active' : ''}><Icon name={icon} size={17} />{label}</button>)}</nav>
        <Link to="/auth" className="rzm-account-logout"><Icon name="logout" size={17} />Выйти</Link>
      </aside>

      <section className="rzm-account-main">
        <header className="rzm-account-top">
          <div><h1>Мои проекты</h1><p>Здесь вся информация о ваших заказах и сохранённых проектах.</p></div>
          <div className="rzm-account-top__actions"><button><Icon name="bell" size={17} /></button><div className="rzm-account-avatar">ИП</div></div>
        </header>

        <section className="rzm-account-active">
          <div>
            <UiStatus tone="warning">В производстве</UiStatus>
            <h2>Шкаф распашной</h2>
            <p>2100 × 1200 × 600 мм · Заказ №1258 от 12 мая 2024</p>
          </div>
          <div className="rzm-account-progress">
            {['Проверен', 'Производство', 'Отправка', 'Доставлен'].map((step, index) => <span key={step} className={index <= 1 ? 'is-done' : ''}><i>{index <= 1 && <Icon name="check" size={10} strokeWidth={3} />}</i>{step}</span>)}
          </div>
          <div className="rzm-account-active__actions"><Link to="/account/order"><UiButton>Подробнее</UiButton></Link><UiButton variant="secondary">Связаться</UiButton></div>
        </section>

        <section className="rzm-account-toolbar">
          <label><Icon name="target" size={16} /><input placeholder="Поиск проекта или заказа" /></label>
          <Link to="/constructor"><UiButton><Icon name="plus" size={16} />Новый проект</UiButton></Link>
        </section>

        <section className="rzm-account-grid">
          <div>
            <div className="rzm-account-section-head"><h2>Сохранённые проекты</h2><Link to="/constructor">Создать новый</Link></div>
            <div className="rzm-account-projects">
              {projects.map(([title, dims, date, price], index) => <Link key={title} to="/constructor" className="rzm-account-project"><div className={`rzm-account-project__preview is-${index + 1}`} /><div><h3>{title}</h3><p>{dims}</p><span>{date}</span></div><b>{price}</b><Icon name="chevron-right" size={18} /></Link>)}
            </div>
          </div>
          <div>
            <div className="rzm-account-section-head"><h2>История заказов</h2><Link to="/account/order">Все заказы</Link></div>
            <div className="rzm-account-orders">
              {orders.map(([title, dims, date, status], index) => <article key={title}><div className={`rzm-account-order-thumb is-${index + 1}`} /><div><h3>{title}</h3><p>{dims}</p><span>{date}</span></div><UiStatus tone={status === 'Готов' ? 'warning' : 'success'}>{status}</UiStatus></article>)}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
