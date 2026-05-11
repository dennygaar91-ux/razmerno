import { Link } from 'react-router-dom'
import Icon from '../../../icons/Icon'
import './ConstructorTeaser.css'

const FEATS = [
  { t: 'Размеры в мм',       sub: '— точность до 1 мм' },
  { t: 'Просмотр 360°',      sub: '— со всех сторон' },
  { t: 'Цена онлайн',        sub: '— обновляется мгновенно' },
  { t: 'Менеджер проверит',  sub: '— перед запуском в производство' },
]

export default function ConstructorTeaser() {
  return (
    <section className="cstr" id="cstr">
      <div className="wrap">
        <div className="cstr__card">
          <div className="cstr__glow" />
          <div className="cstr__in">

            {/* Copy */}
            <div className="cstr__copy rv">
              <span className="kicker kicker--dk">Конструктор</span>
              <h2 className="h-lg" style={{ marginTop: 18 }}>
                На лендинге — превью.{' '}
                <span className="italic">Сам инструмент отдельно.</span>
              </h2>
              <p className="lead lead--lgt">
                Чтобы не перегружать главную, здесь понятное превью интерфейса.
                Полноценный расчёт, логика и three.js-визуализация — на отдельной странице.
              </p>
              <div className="cstr__feats">
                {FEATS.map((f, i) => (
                  <div key={i} className="cstr__feat">
                    <span className="cstr__feat-ic">
                      <Icon name="check" size={11} strokeWidth={3} />
                    </span>
                    <span className="cstr__feat-t">{f.t} <span>{f.sub}</span></span>
                  </div>
                ))}
              </div>
              <div className="cstr__acts">
                <Link to="/constructor" className="btn btn-cta">
                  Открыть конструктор
                  <Icon name="arrow-right" className="arr" size={14} />
                </Link>
                <a href="#measure" className="btn btn-ol">Сначала понять замер</a>
              </div>
            </div>

            {/* Animated 3D mockup — placeholder for three.js */}
            <div className="cstr__view rv d1">
              <div className="cstr__vgrid" />
              <div className="cstr__vglow" />
              <div className="cstr__vtop">
                <div className="cstr__vtop-l">
                  <span className="cstr__vdot" />
                  <span className="cstr__vtop-s">Шкаф · Дуб светлый · 1870×2140×600</span>
                </div>
                <span className="cstr__vtag">three.js</span>
              </div>
              <div className="cstr__stage">
                <div className="cstr__cab" id="three-viewer" />
                <div className="cstr__dim cstr__dim--w">1870 мм</div>
                <div className="cstr__dim cstr__dim--h">2140 мм</div>
              </div>
              <div className="cstr__vbot">
                <div className="cstr__tile"><div className="cstr__tile-l">Деталей</div><div className="cstr__tile-v">18</div></div>
                <div className="cstr__tile"><div className="cstr__tile-l">Сборка</div><div className="cstr__tile-v">~80 мин</div></div>
                <div className="cstr__tile"><div className="cstr__tile-l">Стоимость</div><div className="cstr__tile-v">28 400 ₽</div></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
