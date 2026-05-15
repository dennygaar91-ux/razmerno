import { useState } from 'react'
import ConstructorConfig from '../components/constructor/ConstructorConfig'
import ConstructorViewer from '../components/constructor/ConstructorViewer'
import ConstructorSummary from '../components/constructor/ConstructorSummary'
import CheckoutDrawer from '../components/constructor/CheckoutDrawer'
import Icon from '../icons/Icon'
import './ConstructorPage.css'
import './ConstructorWizard.css'
import './ConstructorReference.css'

const flowSteps = [
  ['1', 'Размеры', 'Укажите габариты и секции', true],
  ['2', 'Наполнение', 'Выберите полки, ящики и штанги', false],
  ['3', 'Материалы', 'Подберите декоры и фурнитуру', false],
]

export default function ConstructorPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  return (
    <main className="rp-ctor-page rp-ctor-page--reference">
      <section className="rp-ctor-hero">
        <div>
          <p className="rp-ctor-kicker">онлайн-конструктор</p>
          <h1>Соберите шкаф под свой размер</h1>
          <p className="rp-ctor-lead">Задайте габариты, выберите наполнение и материалы. Цена рассчитывается сразу, а мы подготовим комплект для сборки и доставим к вам.</p>
          <div className="rp-ctor-badges">
            <span>3 шага</span>
            <span>цена сразу</span>
            <span>комплект для сборки</span>
          </div>
        </div>

        <div className="rp-ctor-actions">
          <button type="button"><Icon name="download" size={16} />Загрузить</button>
          <button type="button"><Icon name="x" size={16} />Очистить</button>
          <button type="button"><Icon name="file-check" size={16} />Сохранить</button>
          <button className="is-primary" type="button" onClick={() => setCheckoutOpen(true)}><Icon name="orders" size={17} />В корзину</button>
        </div>
      </section>

      <section className="rp-ctor-flow" aria-label="Этапы конструктора">
        {flowSteps.map(([num, title, text, active]) => (
          <div className={active ? 'is-active' : ''} key={title}>
            <span>{num}</span>
            <p>{title}<small>{text}</small></p>
          </div>
        ))}
      </section>

      <section className="rp-ctor-shell rp-ctor-shell--no-rail" aria-label="Конструктор шкафа">
        <ConstructorConfig onCheckout={() => setCheckoutOpen(true)} />
        <ConstructorViewer />
        <ConstructorSummary onCheckout={() => setCheckoutOpen(true)} />
      </section>

      <CheckoutDrawer open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </main>
  )
}
