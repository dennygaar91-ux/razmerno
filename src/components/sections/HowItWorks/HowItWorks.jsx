import Icon from '../../../icons/Icon'
import './HowItWorks.css'
import './HowItWorksUIKit.css'

const STEPS = [
  {
    icon: 'ruler', num: '01', title: 'Задаёте размеры', tag: 'you', tagLabel: 'Делаете вы',
    desc: 'Ширина, высота и глубина в миллиметрах. Если есть сомнения — отправьте фото места.',
    list: ['обычная рулетка', '5–10 минут', 'учёт плинтуса и розеток'],
  },
  {
    icon: 'factory', num: '02', title: 'Готовим комплект', tag: 'us', tagLabel: 'Делаем мы',
    desc: 'Проверяем конструкцию, нарезаем, кромим и маркируем каждую деталь.',
    list: ['распил и кромление', 'присадка под крепёж', 'маркировка деталей'],
  },
  {
    icon: 'tool', num: '03', title: 'Собираете дома', tag: 'you', tagLabel: 'Делаете вы',
    desc: 'Открываете коробку — там уже всё подписано. Следуете инструкции. Нужна только отвёртка.',
    list: ['без сложных инструментов', 'крепёж отсортирован', 'можно перепроверить'],
  },
]

export default function HowItWorks() {
  return (
    <section className="how" id="how">
      <div className="wrap">
        <div className="how__hd rv">
          <span className="kicker">Как работает</span>
          <h2 className="h-lg">Вы делаете понятные шаги.<br /><span className="italic">Мы берём точность.</span></h2>
          <p className="lead">Клиент замеряет, выбирает и собирает. Сервис проверяет, рассчитывает, режет, сверлит, маркирует и комплектует.</p>
        </div>
        <div className="steps">
          {STEPS.map((s, i) => (
            <article key={i} className={`step rv${i > 0 ? ` d${i}` : ''}`}>
              <div className="step__top">
                <div className="step__icon"><Icon name={s.icon} size={22} /></div>
                <span className="step__n">{s.num}</span>
              </div>
              <div className="step__t">{s.title}</div>
              <p className="step__d">{s.desc}</p>
              <div className="step__list">
                {s.list.map((li, j) => <div key={j} className="step__li">{li}</div>)}
              </div>
              <span className={`step__tag ${s.tag}`}>{s.tagLabel}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}