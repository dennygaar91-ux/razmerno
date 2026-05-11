import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../../icons/Icon'
import './FinalCta.css'

function calcPrice(w, h, d) {
  const area = (w * h * 2 + w * d * 2 + h * d * 2) / 1e6
  return Math.round(Math.max(area * 4450 + 6500, 9900) / 100) * 100
}

export default function FinalCta() {
  const [w, setW] = useState(1870)
  const [h, setH] = useState(2140)
  const [d, setD] = useState(600)

  const price = calcPrice(
    Math.max(400, Math.min(2600, w || 1870)),
    Math.max(600, Math.min(2800, h || 2140)),
    Math.max(200, Math.min(900,  d || 600))
  )

  return (
    <section className="fcta">
      <div className="wrap">
        <div className="fcta__in">
          <div className="fcta__g1" />

          {/* Copy */}
          <div className="fcta__copy rv">
            <span className="kicker kicker--dk">Начните с трёх цифр</span>
            <h2 className="fcta__t">
              Начните с размеров.<br />
              <span className="italic">Остальное подготовим мы.</span>
            </h2>
            <p className="fcta__sub">
              Введите ширину, высоту и глубину. Вы увидите предварительную стоимость
              и сможете сохранить проект или уточнить детали до запуска.
            </p>
            <div className="fcta__acts">
              <Link to="/constructor" className="btn btn-cta">
                Открыть конструктор
                <Icon name="arrow-right" className="arr" size={14} />
              </Link>
              <a href="tel:+79852924745" className="btn btn-ol">Получить консультацию</a>
            </div>
            <div className="fcta__note">
              Проверка размеров · Производство после подтверждения · Готовый комплект
            </div>
          </div>

          {/* Mini calc */}
          <div className="mini-calc rv d1">
            <div className="mini-calc__title">Узнайте стоимость</div>
            <div className="mini-calc__fields">
              <div className="mini-calc__field">
                <label>Ширина, мм</label>
                <input type="number" value={w} min={400} max={2600} onChange={e => setW(+e.target.value)} />
              </div>
              <div className="mini-calc__field">
                <label>Высота, мм</label>
                <input type="number" value={h} min={600} max={2800} onChange={e => setH(+e.target.value)} />
              </div>
              <div className="mini-calc__field">
                <label>Глубина, мм</label>
                <input type="number" value={d} min={200} max={900}  onChange={e => setD(+e.target.value)} />
              </div>
            </div>
            <div className="mini-calc__result">
              <span className="mini-calc__result-l">Предварительно</span>
              <span className="mini-calc__result-v">≈ {price.toLocaleString('ru-RU')} ₽</span>
            </div>
            <Link to="/constructor" className="btn btn-cta" style={{ width: '100%', minHeight: 46 }}>
              Рассчитать подробно
              <Icon name="arrow-right" className="arr" size={14} />
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
