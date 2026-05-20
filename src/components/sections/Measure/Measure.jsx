import Icon from '../../../icons/Icon'
import './Measure.css'
import './MeasureUIKit.css'

const STEPS = [
  { n: '1', t: 'Измерьте ширину',  d: 'В 2–3 точках от стены до стены — сверху, посередине, снизу. Берите минимальное значение.' },
  { n: '2', t: 'Измерьте высоту',  d: 'Слева, справа и по центру. Потолок и пол могут быть не идеально ровными — берите минимум.' },
  { n: '3', t: 'Измерьте глубину', d: 'Учитывайте плинтус, розетки, выступы на стене — лучше сфотографируйте их отдельно.' },
  { n: '?', t: 'Не уверены? Пришлите фото', bonus: true,
    d: 'Перед запуском можно перепроверить размеры, уточнить нюансы и не рисковать комплектом.' },
]

export default function Measure() {
  return (
    <section className="meas" id="measure">
      <div className="wrap">
        <div className="meas__hd rv">
          <span className="kicker">Замер</span>
          <h2 className="h-lg">Три измерения. <span className="italic">В миллиметрах.</span></h2>
          <p className="lead">Здесь не дублируем конструктор. Показываем, как снять размеры места: ширина, высота и глубина с учётом неровностей.</p>
        </div>

        <div className="meas__grid">
          {/* SVG illustration */}
          <div className="meas__illus rv">
            <span className="meas__badge">
              <span className="meas__badge-ic">
                <Icon name="check-ok" size={11} strokeWidth={2.6} />
              </span>
              Мерьте в нескольких точках
            </span>
            <svg viewBox="0 0 720 520" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',maxWidth:500}}>
              <defs>
                <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10z" fill="#0A0A0A"/>
                </marker>
              </defs>
              {/* Room */}
              <rect x="90" y="50" width="540" height="360" rx="8" fill="#FAFAF9" stroke="#0A0A0A" strokeWidth="2"/>
              <path d="M90 410 L40 470 H680 L630 410" fill="#EFEFED" stroke="#0A0A0A" strokeWidth="2"/>
              {/* Width arrow */}
              <line x1="140" y1="108" x2="580" y2="108" stroke="#E8612C" strokeWidth="2.5" markerStart="url(#arr)" markerEnd="url(#arr)"/>
              <rect x="300" y="88" width="120" height="28" rx="6" fill="#E8612C"/>
              <text x="360" y="107" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="14" fontWeight="700">Ширина</text>
              {/* Height arrow */}
              <line x1="118" y1="86" x2="118" y2="382" stroke="#E8612C" strokeWidth="2.5" markerStart="url(#arr)" markerEnd="url(#arr)"/>
              <rect x="17" y="223" width="70" height="25" rx="6" fill="#E8612C" transform="rotate(-90 52 235)"/>
              <text x="52" y="239" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="14" fontWeight="700" transform="rotate(-90 52 239)">Высота</text>
              {/* Depth arrow */}
              <line x1="568" y1="402" x2="628" y2="464" stroke="#E8612C" strokeWidth="2.5" markerStart="url(#arr)" markerEnd="url(#arr)"/>
              <rect x="558" y="434" width="76" height="24" rx="5" fill="#E8612C" transform="rotate(-45 596 446)"/>
              <text x="598" y="440" textAnchor="middle" fill="#fff" fontFamily="monospace" fontSize="12" fontWeight="700" transform="rotate(-45 598 440)">Глубина</text>
              {/* Plinth detail */}
              <rect x="450" y="382" width="42" height="28" rx="3" fill="#fff" stroke="#0A0A0A" strokeWidth="1.5"/>
              <circle cx="471" cy="396" r="4" fill="#0A0A0A"/>
              <text x="490" y="374" fontSize="11" fill="#9E9E9E" fontFamily="sans-serif">розетка</text>
              <line x1="471" y1="375" x2="471" y2="380" stroke="#9E9E9E" strokeWidth="1"/>
            </svg>
          </div>

          {/* Step cards */}
          <div className="meas__cards">
            {STEPS.map((s, i) => (
              <div key={i} className={`mcard${s.bonus ? ' mcard--bonus' : ''} rv${i > 0 ? ` d${i}` : ''}`}>
                <div className="mcard__n">{s.n}</div>
                <div>
                  <div className="mcard__t">{s.t}</div>
                  <div className="mcard__d">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}