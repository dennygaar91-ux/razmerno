import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../icons/Icon'
import './ConstructorPage.css'

// ── Данные ──────────────────────────────────────────────────────────
const TABS  = ['Шкаф', 'Тумба', 'Стеллаж', 'Комод']
const DECORS = [
  { label: 'Дуб светлый', bg: '#d4b896', mult: 1.0  },
  { label: 'Белый',       bg: '#fafaf8', mult: 0.9  },
  { label: 'Венге',       bg: '#2c1e12', mult: 1.1  },
  { label: 'Сонома',      bg: '#c9b896', mult: 1.05 },
  { label: 'Антрацит',    bg: '#2a2a2a', mult: 1.15 },
]
const HW_TYPES = [
  { label: 'Hettich',  sub: 'Премиум', mult: 1.0  },
  { label: 'Firmax',   sub: 'Стандарт', mult: 0.85 },
]

function calcPrice(w, h, d, shelves, drawers, bars, matMult, hwMult) {
  const area  = (w*h*2 + w*d*2 + h*d*2) / 1e6
  const fill  = shelves * 600 + drawers * 2200 + bars * 800
  return Math.round(Math.max((area * 4400 + fill) * matMult * hwMult, 9900) / 100) * 100
}
function calcParts(shelves, drawers, bars) {
  return 8 + shelves * 2 + drawers * 3 + bars
}

// ── Stepper helper ──────────────────────────────────────────────────
function Stepper({ value, min, max, onChange, label }) {
  return (
    <div className="cst-stepper-row">
      <span className="cst-stepper-label">{label}</span>
      <div className="cst-stepper">
        <button className="cst-stepper-btn" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
        <span className="cst-stepper-val">{value}</span>
        <button className="cst-stepper-btn" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </div>
    </div>
  )
}

export default function ConstructorPage() {
  const navigate = useNavigate()

  const [tab,     setTab]     = useState(0)
  const [w,       setW]       = useState(1870)
  const [h,       setH]       = useState(2140)
  const [d,       setD]       = useState(600)
  const [shelves, setShelves] = useState(3)
  const [drawers, setDrawers] = useState(2)
  const [bars,    setBars]    = useState(1)
  const [decor,   setDecor]   = useState(0)
  const [hw,      setHw]      = useState(0)

  const price  = calcPrice(w, h, d, shelves, drawers, bars, DECORS[decor].mult, HW_TYPES[hw].mult)
  const parts  = calcParts(shelves, drawers, bars)

  return (
    <div className="cst-app">

      {/* Header */}
      <header className="cst-hdr">
        <button className="cst-back" onClick={() => navigate(-1)}>
          <Icon name="arrow-left" size={14} />Назад
        </button>
        <Link to="/" className="cst-logo">Размерно<em>.</em></Link>

        <nav className="cst-tabs">
          {TABS.map((t, i) => (
            <button key={t} className={`cst-tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </nav>

        <div className="cst-hdr-r">
          <div className="cst-price-wrap">
            <div className="cst-price">{price.toLocaleString('ru-RU')} ₽</div>
            <div className="cst-price-sub">предв. стоимость</div>
          </div>
          <button className="btn btn-cta btn-sm" onClick={() => navigate('/auth')}>
            Оформить заказ
          </button>
        </div>
      </header>

      {/* Left panel */}
      <aside className="cst-left">
        <div className="cst-panel">

          {/* Dimensions */}
          <div className="cst-section">
            <div className="cst-section-title">Размеры в мм</div>
            {[
              { label:'Ширина', value:w, set:setW, min:400,  max:2600 },
              { label:'Высота', value:h, set:setH, min:600,  max:2800 },
              { label:'Глубина',value:d, set:setD, min:200,  max:900  },
            ].map(dim => (
              <div key={dim.label} className="cst-dim">
                <div className="cst-dim-label">
                  <span>{dim.label}</span>
                  <span className="cst-dim-val">{dim.value} <span className="cst-dim-mm">мм</span></span>
                </div>
                <input
                  type="range"
                  className="cst-slider"
                  min={dim.min} max={dim.max}
                  step={10}
                  value={dim.value}
                  onChange={e => dim.set(+e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Napolnenie */}
          <div className="cst-section">
            <div className="cst-section-title">Наполнение</div>
            <Stepper label="Полки"  value={shelves} min={0} max={8} onChange={setShelves} />
            <Stepper label="Ящики"  value={drawers} min={0} max={6} onChange={setDrawers} />
            <Stepper label="Штанга" value={bars}    min={0} max={3} onChange={setBars}    />
            <div style={{marginTop:14,display:'flex',flexDirection:'column',gap:8}}>
              {[
                { label:'Ручки',       id:'handles' },
                { label:'Ножки',       id:'legs'    },
                { label:'Доводчики',   id:'dampers' },
              ].map(tog => (
                <div key={tog.id} className="cst-toggle-row">
                  <span className="cst-toggle-label">{tog.label}</span>
                  <ToggleSwitch defaultOn={tog.id !== 'legs'} />
                </div>
              ))}
            </div>
          </div>

          {/* Decors */}
          <div className="cst-section">
            <div className="cst-section-title">Декор</div>
            <div className="cst-mat-grid">
              {DECORS.map((dc, i) => (
                <div key={i} onClick={() => setDecor(i)}>
                  <div
                    className={`cst-sw${decor === i ? ' active' : ''}`}
                    style={{ background: dc.bg }}
                  />
                  <div className="cst-sw-name">{dc.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hardware */}
          <div className="cst-section">
            <div className="cst-section-title">Фурнитура</div>
            <div className="cst-hw-grid">
              {HW_TYPES.map((t, i) => (
                <button
                  key={i}
                  className={`cst-hw-btn${hw === i ? ' active' : ''}`}
                  onClick={() => setHw(i)}
                >
                  {t.label}<br /><small>{t.sub}</small>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Summary */}
        <div className="cst-summary">
          <div className="cst-summary-row"><span>Деталей</span><strong>{parts}</strong></div>
          <div className="cst-summary-row"><span>Время сборки</span><strong>~80 мин</strong></div>
          <div className="cst-summary-row"><span>Срок производства</span><strong>8–12 дней</strong></div>
          <div className="cst-summary-price">
            <span className="cst-summary-pl">Предв. стоимость</span>
            <span className="cst-summary-pv">{price.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      </aside>

      {/* Center — 3D Viewport (three.js placeholder) */}
      <div className="cst-view">
        <div className="cst-view-grid" />
        <div className="cst-view-glow" />

        {/* Top bar */}
        <div className="cst-view-top">
          <div className="cst-view-top-l">
            <span className="cst-live-dot" />
            <span className="cst-view-status">Визуализация · {TABS[tab]} · {DECORS[decor].label}</span>
          </div>
          <span className="cst-view-tag">three.js</span>
        </div>

        {/* Cabinet wireframe */}
        <div className="cst-stage">
          <div className="cst-cab" />
          <div className="cst-dim-tag cst-dim-w">{w} мм</div>
          <div className="cst-dim-tag cst-dim-h">{h} мм</div>
        </div>

        {/* Bottom stats */}
        <div className="cst-view-bot">
          <div className="cst-stat"><div className="cst-stat-l">Ширина</div><div className="cst-stat-v">{w} мм</div></div>
          <div className="cst-stat"><div className="cst-stat-l">Высота</div><div className="cst-stat-v">{h} мм</div></div>
          <div className="cst-stat"><div className="cst-stat-l">Глубина</div><div className="cst-stat-v">{d} мм</div></div>
          <div className="cst-stat"><div className="cst-stat-l">Деталей</div><div className="cst-stat-v">{parts}</div></div>
        </div>

        {/* View controls */}
        <div className="cst-controls">
          {[
            { icon:'rotate', title:'Повернуть' },
            { icon:'zap',    title:'Сброс'     },
            { icon:'expand', title:'Весь экран'},
          ].map(ctrl => (
            <div key={ctrl.icon} className="cst-ctrl" title={ctrl.title}>
              <Icon name={ctrl.icon} size={16} />
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <aside className="cst-right">
        <div className="cst-right-body">
          <div className="cst-section-title" style={{marginBottom:12}}>Ваша мебель</div>
          <div className="cst-spec-name">{TABS[tab]} распашной</div>
          <div className="cst-spec-dims">{w} × {h} × {d} мм</div>

          <div className="cst-spec-rows">
            {[
              ['Декор',     DECORS[decor].label],
              ['Фурнитура', HW_TYPES[hw].label + ' ' + HW_TYPES[hw].sub],
              ['Полки',     shelves + ' шт'],
              ['Ящики',     drawers + ' шт'],
              ['Деталей',   parts + ' шт'],
            ].map(([l, v]) => (
              <div key={l} className="cst-spec-row">
                <span className="cst-spec-l">{l}</span>
                <span className="cst-spec-v">{v}</span>
              </div>
            ))}
          </div>

          <div className="cst-includes">
            <div className="cst-includes-title">Что включено</div>
            {[
              { t:'Детали с маркировкой', d:'Подписаны, нарезаны, с кромкой' },
              { t:'Отверстия готовы',     d:'Под крепёж и фурнитуру'         },
              { t:'Крепёж по пакетам',    d:'Шурупы, конфирматы, петли'      },
              { t:'Инструкция',           d:'Для вашей конкретной сборки'     },
              { t:'Проверка до запуска',  d:'Менеджер уточнит размеры'        },
            ].map((it, i) => (
              <div key={i} className="cst-include-item">
                <div className="cst-include-dot" />
                <div>
                  <div className="cst-include-t">{it.t}</div>
                  <div className="cst-include-d">{it.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cst-right-cta">
          <div className="cst-cta-price">{price.toLocaleString('ru-RU')} ₽</div>
          <div className="cst-cta-note">Предварительная стоимость</div>
          <button className="btn btn-cta" style={{width:'100%',marginBottom:10,minHeight:48}} onClick={() => navigate('/auth')}>
            Оформить заказ
            <Icon name="arrow-right" className="arr" size={14} />
          </button>
          <button className="btn btn-soft btn-sm" style={{width:'100%',justifyContent:'center'}}>
            Сохранить проект
          </button>
        </div>
      </aside>

    </div>
  )
}

// ── Toggle switch (internal) ─────────────────────────────────────────
function ToggleSwitch({ defaultOn }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className={`cst-toggle${on ? ' on' : ''}`} onClick={() => setOn(v => !v)} />
  )
}
