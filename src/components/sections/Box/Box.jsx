import Icon from '../../../icons/Icon'
import './Box.css'

const PHOTOS = [
  { big: true,  src:'https://images.unsplash.com/photo-1581873372796-635b67ca2008?w=1200&q=85', cap:'Детали с маркировкой', icon:'package' },
  { big: false, src:'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=700&q=85',  cap:'Крепёж по пакетам',   icon:'bolt' },
  { big: false, src:'https://images.unsplash.com/photo-1586864387789-628af9feed72?w=700&q=85',  cap:'Фурнитура',           icon:'settings' },
  { big: false, src:'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=700&q=85',  cap:'Инструкция',          icon:'doc' },
]

const NOTES = [
  { icon:'tag',     t:'Детали подписаны',   d:'Обозначения совпадают с шагами инструкции.' },
  { icon:'bolt',    t:'Крепёж отсортирован', d:'Петли, конфирматы, саморезы — в подписанных пакетах.' },
  { icon:'tool',    t:'Отверстия готовы',    d:'Не нужно размечать и сверлить с нуля.' },
  { icon:'clock',   t:'60–90 минут',         d:'Среднее время сборки. Нужна только отвёртка.' },
]

export default function Box() {
  return (
    <section className="box">
      <div className="wrap">
        <div className="box__hd rv">
          <span className="kicker">Что внутри коробки</span>
          <h2 className="h-lg">Не мешок деталей. <span className="italic">Готовый комплект.</span></h2>
          <p className="lead">Откроете — сразу поймёте, что делать. Всё подписано, крепёж разложен, инструкция — для вашей мебели.</p>
        </div>

        <div className="box-grid rv d1">
          {PHOTOS.map((p, i) => (
            <div key={i} className={`box-ph${p.big ? ' box-ph--big' : ''}`}>
              <span className="box-ph__cap">
                <span className="box-ph__cap-ic"><Icon name={p.icon} size={11} /></span>
                {p.cap}
              </span>
              <img src={p.src} alt={p.cap} loading="lazy" />
            </div>
          ))}
        </div>

        <div className="box-notes">
          {NOTES.map((n, i) => (
            <div key={i} className={`box-note rv${i > 0 ? ` d${i}` : ''}`}>
              <div className="box-note-ic"><Icon name={n.icon} size={15} /></div>
              <div>
                <div className="box-note-t">{n.t}</div>
                <div className="box-note-d">{n.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
