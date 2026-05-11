import Icon from '../../../icons/Icon'
import './TrustBar.css'

const ITEMS = [
  { icon: 'clock',  text: <><strong>8–14 дней</strong> от замера до доставки</> },
  { icon: 'target', text: <><strong>Точность ±1 мм</strong> на каждой детали</> },
  { icon: 'shield', text: <><strong>Проверка</strong> перед запуском</> },
  { icon: 'truck',  text: <><strong>Доставка</strong> по всей России</> },
]

export default function TrustBar() {
  return (
    <section className="tbar">
      <div className="wrap">
        <div className="tbar__row">
          {ITEMS.map((it, i) => (
            <div key={i} className="tbar__item">
              <span className="tbar__ic">
                <Icon name={it.icon} size={14} />
              </span>
              <span>{it.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
