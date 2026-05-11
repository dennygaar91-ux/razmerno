import { useState } from 'react'
import './Cases.css'

const FILTERS = ['Все', 'Шкафы', 'Тумбы', 'Стеллажи']

const CASES = [
  { img:'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=900&q=85', size:'1930×2280×580 мм', title:'Шкаф в нишу прихожей',  meta:['Дуб светлый','Москва','8 дней'],      cat:'Шкафы' },
  { img:'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=85', size:'1200×900×450 мм',  title:'ТВ-тумба',             meta:['Белый матовый','Казань','5 дней'],   cat:'Тумбы'  },
  { img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85',    size:'2400×2100×600 мм', title:'Гардеробная в спальне', meta:['Антрацит','Краснодар','12 дней'],    cat:'Шкафы' },
  { img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=900&q=85', size:'1400×820×450 мм',  title:'Комод в нишу',          meta:['Белый матовый','СПб','6 дней'],      cat:'Тумбы'  },
  { img:'https://images.unsplash.com/photo-1594224457860-f88aab10da06?w=900&q=85', size:'800×2000×350 мм',  title:'Книжный стеллаж',       meta:['Сонома','Екатеринбург','7 дней'],    cat:'Стеллажи' },
  { img:'https://images.unsplash.com/photo-1616627562046-bf0f7d50e6e7?w=900&q=85', size:'1100×2000×550 мм', title:'Шкаф двустворчатый',    meta:['Венге','Новосибирск','9 дней'],      cat:'Шкафы' },
]

export default function Cases() {
  const [active, setActive] = useState('Все')
  const filtered = active === 'Все' ? CASES : CASES.filter(c => c.cat === active)

  return (
    <section className="cases" id="cases">
      <div className="wrap">
        <div className="cases__hd rv">
          <span className="kicker">Примеры проектов</span>
          <h2 className="h-lg">Мебель, сделанная<br />под ваш размер.</h2>
          <div className="filter-row">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`filter-btn${active === f ? ' active' : ''}`}
                onClick={() => setActive(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="cards">
          {filtered.map((c, i) => (
            <article key={i} className={`ccard rv${i > 0 ? ` d${Math.min(i,3)}` : ''}`}>
              <div className="ccard__img">
                <span className="ccard__size">{c.size}</span>
                <img src={c.img} alt={c.title} loading="lazy" />
              </div>
              <div className="ccard__body">
                <div className="ccard__t">{c.title}</div>
                <div className="ccard__meta">
                  {c.meta.map((m, j) => <span key={j}>{m}</span>)}
                </div>
                <div className="ccard__cta">Сделать похожий →</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
