import Header from '../components/Header/Header'
import Icon from '../icons/Icon'
import './ConstructorPage.css'

const dimensions = [
  ['Высота, мм', '2400'],
  ['Ширина, мм', '1800'],
  ['Глубина, мм', '600'],
]

const steps = [
  ['✓', 'Размеры', 'done'],
  ['2', 'Секции', 'active'],
  ['3', 'Наполнение', ''],
  ['4', 'Материалы', ''],
]

const benefits = [
  ['box', 'Комплект для сборки', 'детали, кромка, фурнитура'],
  ['truck', 'Доставка по Москве', 'внутри МКАД от 6000 ₽'],
  ['shield', 'Гарантия 18 месяцев', 'на комплект мебели'],
  ['tool', 'Сборка по желанию', '+10% к стоимости заказа'],
]

function MiniSchema({ variant }) {
  return (
    <span className={`rp-ctor-schema rp-ctor-schema--${variant}`}>
      <i />
      {variant !== 'one' && <i />}
      {variant === 'three' && <i />}
    </span>
  )
}

function WardrobeMockup() {
  return (
    <div className="rp-ctor-wardrobe" aria-hidden="true">
      <div className="rp-ctor-top" />
      <div className="rp-ctor-col rp-ctor-col--shelves">
        <span /><span /><span />
        <b /><b />
      </div>
      <div className="rp-ctor-col"><em /><strong /></div>
      <div className="rp-ctor-col"><em /><strong /></div>
    </div>
  )
}

export default function ConstructorPage() {
  return (
    <>
      <Header />
      <main className="rp-ctor-page">
        <section className="rp-ctor-shell" aria-label="Конструктор шкафа">
          <aside className="rp-ctor-rail">
            <button className="rp-ctor-rail-step" type="button">①</button>
            <nav className="rp-ctor-rail-nav" aria-label="Разделы конструктора">
              <button className="is-active" type="button"><Icon name="layout" size={22} /><span>Конструктор</span></button>
              <button type="button"><Icon name="layers" size={22} /><span>Материалы</span></button>
              <button type="button"><Icon name="file" size={22} /><span>Проекты</span></button>
              <button type="button"><Icon name="heart" size={22} /><span>Избранное</span></button>
            </nav>
            <button className="rp-ctor-help" type="button"><Icon name="help" size={22} /><span>Помощь</span></button>
          </aside>

          <aside className="rp-ctor-card rp-ctor-config">
            <div className="rp-ctor-title">
              <h1>Конструктор шкафа</h1>
              <p>Шаг 2 из 4 — Секции</p>
            </div>

            <div className="rp-ctor-steps">
              {steps.map(([num, label, state]) => (
                <div className={`rp-ctor-step ${state ? `is-${state}` : ''}`} key={label}>
                  <span>{num}</span>
                  <small>{label}</small>
                </div>
              ))}
            </div>

            <div className="rp-ctor-block">
              <h2>Параметры шкафа</h2>
              {dimensions.map(([label, value]) => (
                <label className="rp-ctor-field" key={label}>
                  <span>{label}</span>
                  <input value={value} inputMode="numeric" readOnly />
                </label>
              ))}
            </div>

            <div className="rp-ctor-block">
              <h2>Конфигурация</h2>
              <div className="rp-ctor-schemas">
                <button type="button"><MiniSchema variant="one" /></button>
                <button className="is-active" type="button"><MiniSchema variant="two" /></button>
                <button type="button"><MiniSchema variant="three" /></button>
              </div>
            </div>

            <div className="rp-ctor-block">
              <h2>Количество секций</h2>
              <div className="rp-ctor-segment rp-ctor-segment--three">
                <button type="button">2 секции</button>
                <button className="is-active" type="button">3 секции</button>
                <button type="button">4 секции</button>
              </div>
            </div>

            <div className="rp-ctor-block">
              <h2>Тип шкафа</h2>
              <div className="rp-ctor-segment">
                <button className="is-active" type="button">Корпусный</button>
                <button type="button">Встроенный</button>
              </div>
            </div>

            <button className="rp-ctor-next" type="button">Далее: наполнение <Icon name="arrow-right" size={15} /></button>
          </aside>

          <section className="rp-ctor-card rp-ctor-viewer">
            <div className="rp-ctor-views">
              <button type="button"><Icon name="home" size={23} /><span>Вид<br />спереди</span></button>
              <button type="button"><Icon name="cube" size={23} /><span>Вид<br />сбоку</span></button>
              <button type="button"><Icon name="layers" size={23} /><span>Вид<br />сверху</span></button>
            </div>

            <div className="rp-ctor-history">
              <button type="button">←</button>
              <button type="button" disabled>→</button>
            </div>

            <div className="rp-ctor-scene">
              <span className="rp-ctor-size rp-ctor-size--h">2400 мм</span>
              <WardrobeMockup />
              <span className="rp-ctor-size rp-ctor-size--w">1800 мм</span>
            </div>

            <div className="rp-ctor-view-controls">
              <div className="rp-ctor-mode"><button className="is-active" type="button">3D</button><button type="button">2D</button></div>
              <div className="rp-ctor-zoom"><button type="button">−</button><button type="button">⌖</button><button type="button">+</button></div>
            </div>
          </section>

          <aside className="rp-ctor-summary">
            <section className="rp-ctor-card rp-ctor-price">
              <p>Итоговая стоимость</p>
              <strong>24 350 ₽</strong>
              <em>Экономия: 3 650 ₽</em>
              <div><span>Срок изготовления</span><b>10–14 дней</b></div>
              <button type="button">Получить расчет</button>
              <button type="button">♡ Сохранить проект</button>
            </section>

            <section className="rp-ctor-card rp-ctor-materials">
              <h3>Материалы</h3>
              <div><i className="rp-ctor-texture" /><p>ЛДСП Дуб Сонома<span>16 мм</span></p><b>›</b></div>
              <div><i className="rp-ctor-texture rp-ctor-texture--edge" /><p>Кромка<span>ПВХ 2 мм</span></p></div>
            </section>

            <section className="rp-ctor-card rp-ctor-sizes">
              <h3>Размеры шкафа</h3>
              <dl><div><dt>Высота</dt><dd>2400 мм</dd></div><div><dt>Ширина</dt><dd>1800 мм</dd></div><div><dt>Глубина</dt><dd>600 мм</dd></div></dl>
            </section>

            <section className="rp-ctor-card rp-ctor-collapse"><div><h3>Секции</h3><p>3 секции</p></div><span>⌄</span></section>
          </aside>
        </section>

        <section className="rp-ctor-benefits">
          {benefits.map(([icon, title, text]) => (
            <div className="rp-ctor-benefit" key={title}>
              <span><Icon name={icon} size={17} /></span>
              <p>{title}<small>{text}</small></p>
            </div>
          ))}
        </section>
      </main>
    </>
  )
}
