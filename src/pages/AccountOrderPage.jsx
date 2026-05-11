import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../icons/Icon'
import './AccountOrderPage.css'

const PHOTOS = [
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=85',
  'https://images.unsplash.com/photo-1616627562046-bf0f7d50e6e7?w=1200&q=85',
  'https://images.unsplash.com/photo-1581873372796-635b67ca2008?w=1200&q=85',
]

const STATUS_STEPS = [
  { label: 'Замер проверен',    sub: '12 мая',   state: 'done'    },
  { label: 'Производство',      sub: 'В работе', state: 'current' },
  { label: 'Готов к отправке',  sub: '',         state: ''        },
  { label: 'Доставлен',         sub: '',         state: ''        },
]

function Sidebar() {
  const navigate = useNavigate()
  return (
    <aside className="sidebar">
      <div className="ni" onClick={() => navigate('/account')}><Icon name="home" size={15} />Главная</div>
      <div className="ni active"><Icon name="orders" size={15} />Заказы</div>
      <div className="ni" onClick={() => navigate('/account')}><Icon name="projects" size={15} />Проекты</div>
      <div className="sbsep" />
      <div className="ni" onClick={() => navigate('/account')}><Icon name="person" size={15} />Профиль</div>
      <div style={{ flex: 1 }} />
      <div className="sbsep" />
      <div className="ni ni--ex" onClick={() => navigate('/auth')}><Icon name="logout" size={15} />Выйти</div>
    </aside>
  )
}

export default function AccountOrderPage() {
  const [activePhoto, setActivePhoto] = useState(0)
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="tb-logo">Размерно<em>.</em></Link>
        <div className="tb-r">
          <div className="tb-ic"><Icon name="bell" size={15} /><div className="tb-dot" /></div>
          <div className="tb-av">ИП</div>
        </div>
      </header>

      <Sidebar />

      <main className="ord-main">
        {/* Page header */}
        <div className="ord-ph">
          <Link to="/account" className="ord-back">
            <Icon name="arrow-left" size={13} />Назад
          </Link>
          <div>
            <div className="ord-title">
              Заказ №1258&nbsp;&nbsp;
              <span className="badge badge-prod"><span className="bdot" />Производство</span>
            </div>
            <div className="ord-date">от 12 мая 2024</div>
          </div>
        </div>

        <div className="ord-grid">

          {/* LEFT */}
          <div>
            {/* Photo */}
            <div className="ocard">
              <img
                className="ord-photo"
                src={PHOTOS[activePhoto]}
                alt="Шкаф"
              />
              <div className="ord-gallery">
                {PHOTOS.map((p, i) => (
                  <div
                    key={i}
                    className={`ord-thumb${activePhoto === i ? ' active' : ''}`}
                    onClick={() => setActivePhoto(i)}
                  >
                    <img src={p.replace('w=1200', 'w=200')} alt="" />
                  </div>
                ))}
              </div>
            </div>

            {/* Spec */}
            <div className="ocard">
              <div className="ocard-head">
                <div className="ocard-ht">Шкаф распашной</div>
                <div className="ocard-hsub">2100 × 1200 × 600 мм</div>
              </div>
              <div className="orows">
                {[
                  ['Цвет',      'Дуб светлый'    ],
                  ['Ручки',     'Врезные'         ],
                  ['Фурнитура', 'Hettich Premium' ],
                  ['Полки',     '3 штуки'         ],
                  ['Ящики',     '2 штуки'         ],
                ].map(([l, v]) => (
                  <div key={l} className="orow">
                    <span className="orow-l">{l}</span>
                    <span className="orow-v">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="ocard">
              <div className="ocard-head">
                <div className="ocard-ht">Статус</div>
                <span className="badge badge-prod"><span className="bdot" />Производство</span>
              </div>
              <div className="osteps">
                {STATUS_STEPS.map((s, i) => (
                  <div key={i} className={`ostep${s.state ? ` ostep--${s.state}` : ''}`}>
                    <div className="ostep-dot">
                      {(s.state === 'done' || s.state === 'current') &&
                        <Icon name="check" size={9} strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="ostep-name">{s.label}</div>
                      {s.sub && <div className="ostep-sub">{s.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="ord-dl-btn">
              <Icon name="download" size={13} />
              Скачать инструкцию
            </button>
          </div>

          {/* RIGHT */}
          <div>
            {/* Composition */}
            <div className="ocard">
              <div className="ocard-head"><div className="ocard-ht">Состав заказа</div></div>
              <table className="comp-tbl">
                <thead>
                  <tr><th>Материал</th><th></th><th style={{textAlign:'right'}}>Кол-во</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Корпус',    'ЛДСП Дуб светлый',                     '8 дет.'  ],
                    ['Фасады',    'ЛДСП Дуб светлый',                     '3 дет.'  ],
                    ['Фурнитура', 'Петли Hettich, направляющие Firmax',    '1 компл.'],
                    ['Доп.',      'Штанга, полкодержатели',                '1 компл.'],
                  ].map(([l, v, q]) => (
                    <tr key={l}>
                      <td className="td-l">{l}</td>
                      <td className="td-v">{v}</td>
                      <td className="td-q">{q}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Delivery */}
            <div className="ocard">
              <div className="ocard-head"><div className="ocard-ht">Доставка</div></div>
              <div className="orows">
                {[
                  ['Получатель', 'Иван Петров'                          ],
                  ['Телефон',    '+7 (999) 123-45-67'                   ],
                  ['Email',      'ivan.petrov@mail.ru'                  ],
                  ['Адрес',      'Москва, ул. Лесная, д. 12, кв. 45'   ],
                  ['Оплата',     'Предоплата онлайн'                    ],
                ].map(([l, v]) => (
                  <div key={l} className="orow">
                    <span className="orow-l">{l}</span>
                    <span className="orow-v">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
