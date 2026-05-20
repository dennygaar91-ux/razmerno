import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../icons/Icon'
import './AccountPage.css'
import './AccountUIKit.css'

function Sidebar({ active }) {
  const navigate = useNavigate()
  const items = [
    { icon: 'home',     label: 'Главная',  path: '/account'       },
    { icon: 'orders',   label: 'Заказы',   path: '/account'       },
    { icon: 'projects', label: 'Проекты',  path: '/account'       },
  ]
  return (
    <aside className="sidebar">
      {items.map(it => (
        <div key={it.path + it.label} className={`ni${active === it.label ? ' active' : ''}`} onClick={() => navigate(it.path)}>
          <Icon name={it.icon} size={15} />{it.label}
        </div>
      ))}
      <div className="sbsep" />
      <div className="ni" onClick={() => navigate('/account')}>
        <Icon name="person" size={15} />Профиль
      </div>
      <div style={{ flex: 1 }} />
      <div className="sbsep" />
      <div className="ni ni--ex" onClick={() => navigate('/auth')}>
        <Icon name="logout" size={15} />Выйти
      </div>
    </aside>
  )
}

export default function AccountPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="app-shell">
      {/* Topbar */}
      <header className="topbar">
        <Link to="/" className="tb-logo">Размерно<em>.</em></Link>
        <div className="tb-r">
          <div className="tb-ic">
            <Icon name="bell" size={15} />
            <div className="tb-dot" />
          </div>
          <div className="tb-av">ИП</div>
        </div>
      </header>

      <Sidebar active="Главная" />

      <main className="acc-main">
        <div className="acc-greeting">
          <h1>Здравствуйте, Иван!</h1>
          <p>Здесь вся информация о ваших заказах и проектах</p>
        </div>

        {/* Active order */}
        <div style={{ marginBottom: 28 }}>
          <div className="section-title">Ваш заказ в работе</div>
          <div className="active-order">
            <div className="ao-top">
              <div>
                <div className="ao-name">Шкаф распашной</div>
                <div className="ao-dims">2100 × 1200 × 600 мм</div>
                <div className="ao-num">Заказ №1258 от 12 мая 2024</div>
              </div>
              <span className="badge badge-prod"><span className="bdot" />Производство</span>
            </div>
            {/* Progress */}
            <div className="progress-track">
              {['Замер проверен', 'Производство', 'Готов к отправке', 'Доставлен'].map((step, i) => (
                <div key={i} className={`progress-step${i < 1 ? ' done' : i === 1 ? ' current' : ''}`}>
                  <div className="progress-dot">
                    {i <= 1 && <Icon name="check" size={9} strokeWidth={3} />}
                  </div>
                  <div className="progress-label">{step}</div>
                </div>
              ))}
            </div>
            <div className="ao-actions">
              <Link to="/account/order" className="btn-sm btn-black">Подробнее</Link>
              <button className="btn-sm btn-outline">Связаться с нами</button>
            </div>
          </div>
        </div>

        {/* History + Projects */}
        <div className="two-col">
          <div>
            <div className="section-title">История заказов</div>
            <div className="card-block">
              <div className="card-block-head">
                <div className="card-block-title">Все заказы</div>
                <a className="card-block-link">Смотреть все</a>
              </div>
              {[
                { img:'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200&q=80', name:'Шкаф купе',         dims:'2000×1500×600 мм', num:'№1150 от 26 апр',  status:'done',  statusLabel:'Доставлен' },
                { img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80',    name:'Шкаф распашной',   dims:'2100×1000×600 мм', num:'№1032 от 13 мар',  status:'ready', statusLabel:'Готов' },
                { img:'https://images.unsplash.com/photo-1616627562046-bf0f7d50e6e7?w=200&q=80', name:'Гардеробная',      dims:'2100×1800×500 мм', num:'№987 от 18 фев',   status:'done',  statusLabel:'Доставлен' },
              ].map((o, i) => (
                <div key={i} className="order-row" onClick={() => {}}>
                  <div className="order-thumb"><img src={o.img} alt="" /></div>
                  <div>
                    <div className="order-meta-name">{o.name}</div>
                    <div className="order-meta-dims">{o.dims}</div>
                    <div className="order-meta-date">{o.num}</div>
                  </div>
                  <span className={`status-tag tag-${o.status}`}>{o.statusLabel}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="section-title">Ваши проекты</div>
            <div className="card-block">
              <div className="card-block-head">
                <div className="card-block-title">Сохранённые</div>
                <a className="card-block-link">Смотреть все</a>
              </div>
              {[
                { name:'Шкаф в спальню', dims:'2100×1200×600 мм', date:'Обновлён 10 мая 2024' },
                { name:'Прихожая',       dims:'2200×900×400 мм',  date:'Обновлён 2 мая 2024'  },
              ].map((p, i) => (
                <Link key={i} to="/constructor" className="project-row">
                  <div>
                    <div className="project-name">{p.name}</div>
                    <div className="project-dims">{p.dims}</div>
                    <div className="project-date">{p.date}</div>
                  </div>
                  <Icon name="chevron-right" size={16} style={{ color: 'var(--text-faint)' }} />
                </Link>
              ))}
              <Link to="/constructor" className="new-project">
                <Icon name="plus" size={16} />Новый проект
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}