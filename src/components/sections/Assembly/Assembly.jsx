import './Assembly.css'
import './AssemblyUIKit.css'

const STEPS = [
  { n:'01', t:'Соберите корпус',      d:'Соедините боковины, верх, низ и полки по маркировке. Сначала наживите — не затягивайте сразу.' },
  { n:'02', t:'Добавьте наполнение',  d:'Установите полки, штангу, ящики и направляющие. Всё уже просверлено под нужные отверстия.' },
  { n:'03', t:'Навесьте фасады',      d:'Петли и отверстия подготовлены. Останется проверить открывание и отрегулировать.' },
]

const TIPS = [
  'Собирайте на ровной поверхности',
  'Сначала наживите крепёж',
  'Не затягивайте всё сразу',
  'Сверяйтесь с маркировкой',
]

export default function Assembly() {
  return (
    <section className="asmb" id="assembly">
      <div className="wrap">
        <div className="asmb__hd rv">
          <span className="kicker">Сборка</span>
          <h2 className="h-lg">Собрать проще, <span className="italic">чем кажется.</span></h2>
          <p className="lead">Советы по сборке — часть единого сценария: корпус, наполнение, фасады и спокойная проверка.</p>
        </div>

        <div className="asmb__grid">
          <div className="asmb__photo rv">
            <img
              src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=85"
              alt="Сборка мебели"
              loading="lazy"
            />
            <div className="asmb__photo-text">
              <div className="asmb__photo-title">60–90 минут для простой мебели</div>
              <div className="asmb__photo-sub">Точное время зависит от размера и наполнения, но логика остаётся одной.</div>
            </div>
          </div>

          <div className="asmb__r">
            {STEPS.map((s, i) => (
              <div key={i} className={`astep rv${i > 0 ? ` d${i}` : ''}`}>
                <div className="astep__n">{s.n}</div>
                <div>
                  <div className="astep__t">{s.t}</div>
                  <div className="astep__d">{s.d}</div>
                </div>
              </div>
            ))}
            <div className="atips rv d3">
              <div className="atips__t">Советы, чтобы всё прошло спокойно</div>
              <div className="atips__grid">
                {TIPS.map((tip, i) => (
                  <div key={i} className="atip-pill">{tip}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}