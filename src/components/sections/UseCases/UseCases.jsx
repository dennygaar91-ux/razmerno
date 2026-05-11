import './UseCases.css'

const CASES = [
  { img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=85', name: 'Ниша',       desc: 'Шкаф точно по ширине проёма или стены.' },
  { img: 'https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=800&q=85', name: 'Прихожая',  desc: 'Хранение обуви, верхней одежды и мелочей.' },
  { img: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&q=85', name: 'Спальня',   desc: 'Шкаф с полками, штангой и ящиками.' },
  { img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=85', name: 'ТВ-зона',   desc: 'Тумба под технику точно в нужный размер.' },
  { img: 'https://images.unsplash.com/photo-1594224457860-f88aab10da06?w=800&q=85', name: 'Кладовая',  desc: 'Стеллажи под конкретную глубину и высоту.' },
]

export default function UseCases() {
  return (
    <section className="usecases">
      <div className="wrap">
        <div className="usecases__hd rv">
          <span className="kicker">Сценарии использования</span>
          <h2 className="h-lg">Кому подходит</h2>
          <p className="lead">Если у вас нестандартное место — это не проблема. Для нас нестандартный размер это просто другое число.</p>
        </div>
        <div className="uc-track">
          {CASES.map((c, i) => (
            <article key={i} className={`uc-card rv${i > 0 ? ` d${i}` : ''}`}>
              <div className="uc-img">
                <img src={c.img} alt={c.name} loading="lazy" />
              </div>
              <div className="uc-body">
                <div className="uc-name">{c.name}</div>
                <div className="uc-desc">{c.desc}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
