import Icon from '../../../icons/Icon'
import './Materials.css'

// ЛДСП — 8 вариантов (замените src на реальные ./materials/ldsp-N.png)
const LDSP = [
  { src:'./materials/ldsp-1.png', label:'Дуб Сан-Ремо', sub:'светлый',     bg:'#d4b896' },
  { src:'./materials/ldsp-2.png', label:'Дуб Сан-Ремо', sub:'натуральный', bg:'#b89870' },
  { src:'./materials/ldsp-3.png', label:'Дуб тёмный',   sub:'под дерево',  bg:'#7d5c3a' },
  { src:'./materials/ldsp-4.png', label:'Венге',         sub:'под дерево',  bg:'#2c1e12' },
  { src:'./materials/ldsp-5.png', label:'Белый',         sub:'однотонный',  bg:'#f5f5f3' },
  { src:'./materials/ldsp-6.png', label:'Серый',         sub:'однотонный',  bg:'#9e9e9a' },
  { src:'./materials/ldsp-7.png', label:'Антрацит',      sub:'однотонный',  bg:'#2a2a2a' },
  { src:'./materials/ldsp-8.png', label:'Сонома',        sub:'под дерево',  bg:'#c9b896' },
]

// МДФ — 8 вариантов (замените src на реальные ./materials/mdf-N.png)
const MDF = [
  { src:'./materials/mdf-1.png', label:'Белый',    sub:'матовый', bg:'#f8f8f6' },
  { src:'./materials/mdf-2.png', label:'Серый',    sub:'матовый', bg:'#9898a0' },
  { src:'./materials/mdf-3.png', label:'Чёрный',   sub:'матовый', bg:'#1a1a1a' },
  { src:'./materials/mdf-4.png', label:'Дуб',      sub:'матовый', bg:'#b89870' },
  { src:'./materials/mdf-5.png', label:'Бетон',    sub:'матовый', bg:'#8a8a88' },
  { src:'./materials/mdf-6.png', label:'Кремовый', sub:'матовый', bg:'#f2e8d8' },
  { src:'./materials/mdf-7.png', label:'Таупе',    sub:'матовый', bg:'#a09080' },
  { src:'./materials/mdf-8.png', label:'Дымчатый', sub:'матовый', bg:'#ddd8d0' },
]

function DecorGrid({ items }) {
  return (
    <div className="decor-grid">
      {items.map((d, i) => (
        <div key={i} className="decor-card">
          <div className="decor-img" style={{ background: d.bg }}>
            <img
              src={d.src}
              alt={d.label}
              onError={(e) => { e.currentTarget.style.opacity = '0' }}
            />
          </div>
          <div className="decor-label">{d.label}</div>
          <div className="decor-sub">{d.sub}</div>
        </div>
      ))}
    </div>
  )
}

// SVG иконки фурнитуры (inline для точности отображения)
const HingeIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="22" width="22" height="20" rx="2"/><rect x="36" y="22" width="22" height="20" rx="2"/>
    <circle cx="32" cy="32" r="5"/><path d="M28 32h8M14 30v4M50 30v4"/>
  </svg>
)
const SlideIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="22" width="52" height="12" rx="3"/><rect x="14" y="26" width="36" height="5" rx="2"/>
    <circle cx="20" cy="28.5" r="1.8"/><circle cx="44" cy="28.5" r="1.8"/><path d="M6 42h52" strokeDasharray="4 4"/>
  </svg>
)

export default function Materials() {
  return (
    <section className="mats" id="materials">
      <div className="wrap">
        <div className="mats__hd rv">
          <span className="kicker">Материалы</span>
          <h2 className="h-lg">Вы выбираете внешний вид. <span className="italic">Основа уже проверена.</span></h2>
          <p className="lead">Корпус из ЛДСП Egger или Kronospan. ПВХ-кромка, петли с доводчиком, направляющие и устойчивое покрытие.</p>
        </div>

        <div className="mats__sep rv"><span className="mats__sep-l">ЛДСП</span><span className="mats__sep-line" /></div>
        <div className="rv d1"><DecorGrid items={LDSP} /></div>

        <div className="mats__sep rv" style={{ marginTop: 40 }}><span className="mats__sep-l">МДФ</span><span className="mats__sep-line" /></div>
        <div className="rv d1"><DecorGrid items={MDF} /></div>

        <div className="mats__sep rv" style={{ marginTop: 48 }}><span className="mats__sep-l">Фурнитура</span><span className="mats__sep-line" /></div>
        <div className="hw-grid">
          <article className="hwcard rv">
            <div className="hwcard__vis"><HingeIcon /></div>
            <div>
              <div className="hwcard__brand">Hettich</div>
              <div className="hwcard__tier hwcard__tier--prem">Премиум</div>
              <p className="hwcard__d">Немецкая фурнитура с доводчиком. Плавный ход, точная регулировка. Для ежедневного использования.</p>
              <div className="hwcard__list">
                <div className="hwcard__li">Петли с мягким закрыванием</div>
                <div className="hwcard__li">Скрытые направляющие Quadro</div>
                <div className="hwcard__li">Гарантия 10 лет</div>
              </div>
            </div>
          </article>
          <article className="hwcard rv d1">
            <div className="hwcard__vis"><SlideIcon /></div>
            <div>
              <div className="hwcard__brand">Firmax</div>
              <div className="hwcard__tier hwcard__tier--std">Стандарт</div>
              <p className="hwcard__d">Оптимальный баланс цены и качества для большинства задач. Надёжная и доступная.</p>
              <div className="hwcard__list">
                <div className="hwcard__li">Петли с регулировкой по 3 осям</div>
                <div className="hwcard__li">Шариковые направляющие</div>
                <div className="hwcard__li">Гарантия 5 лет</div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
