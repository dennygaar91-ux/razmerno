import Icon from '../../../icons/Icon'
import './Value.css'

const CARDS = [
  {
    icon: 'shield', step: 'Шаг 1', title: 'Проверенный проект',
    desc: 'Размеры, конструкция и совместимость деталей проверяются вручную перед запуском. Если есть риск — перезвоним.',
  },
  {
    icon: 'layers', step: 'Шаг 2', title: 'Готовые детали',
    desc: 'Нарезаны по вашим размерам, прокромлены, с отверстиями под крепёж и уникальной маркировкой на каждой детали.',
  },
  {
    icon: 'package', step: 'Шаг 3', title: 'Комплект к сборке',
    desc: 'Крепёж разложен по подписанным пакетам, фурнитура в комплекте, инструкция написана под вашу конкретную мебель.',
  },
  {
    icon: 'chat', step: 'Всегда рядом', title: 'Поддержка',
    desc: 'Менеджер на связи от замера до доставки. Если что-то не сходится при сборке — поможем или заменим деталь бесплатно.',
  },
]

export default function Value() {
  return (
    <section className="value" id="value">
      <div className="value__glow" />
      <div className="wrap">
        <div className="value__hd rv">
          <span className="kicker">Что вы получите</span>
          <h2 className="h-lg">Не просто детали.<br /><span className="italic">Готовый результат.</span></h2>
          <p className="lead">Вот конкретно что происходит от замера до момента, когда мебель стоит на месте.</p>
        </div>
        <div className="value__grid">
          {CARDS.map((c, i) => (
            <div key={i} className={`vcard rv${i > 0 ? ` d${i}` : ''}`}>
              <div className="vcard__ic"><Icon name={c.icon} size={24} /></div>
              <div className="vcard__n">{c.step}</div>
              <div className="vcard__t">{c.title}</div>
              <p className="vcard__d">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
