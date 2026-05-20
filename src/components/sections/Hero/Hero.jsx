import { Link } from 'react-router-dom'
import Icon from '../../../icons/Icon'
import './Hero.css'
import './HeroUIKit.css'

const CHIPS = [
  { text: <><strong>Ошибётесь в замере?</strong> Проверим до запуска</> },
  { text: <><strong>Никогда не собирали?</strong> Не нужно никакого опыта</> },
  { text: <><strong>Нестандартный размер?</strong> Для нас — обычный заказ</> },
  { text: <><strong>Маркировка ведёт</strong> шаг за шагом</> },
]

export default function Hero() {
  return (
    <section className="hero" id="top">

      {/* Left — copy */}
      <div className="hero__l wrap" style={{ paddingRight: '64px' }}>
        <div className="rv">
          <span className="kicker">Онлайн-конструктор · размеры в мм</span>
        </div>
        <h1 className="hero__title rv d1">
          Мебель под ваш размер.<br />
          <span className="italic">Без страха ошибиться.</span>
        </h1>
        <p className="hero__lead rv d2">
          Задайте размеры в миллиметрах. Мы проверим, нарежем, прокромим,
          просверлим и промаркируем каждую деталь. Вам останется только собрать.
        </p>
        <div className="hero__acts rv d2">
          <Link to="/constructor" className="btn btn-cta">
            Открыть конструктор
            <Icon name="arrow-right" className="arr" size={14} />
          </Link>
          <a href="#how" className="btn btn-o">Как это работает</a>
        </div>
        <div className="fchips rv d3">
          {CHIPS.map((c, i) => (
            <div key={i} className="fchip">
              <span className="fchip-ic">
                <Icon name="check" size={13} strokeWidth={3} />
              </span>
              <span>{c.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — full-height photo */}
      <div className="hero__r rv d1">
        <img
          src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1800&q=88"
          alt="Светлый интерьер с мебелью по размеру"
          loading="eager"
        />
        <div className="hero__live" style={{ left: 28, bottom: 'calc(36px + 190px + 16px)' }}>
          <span className="ldot" />
          Готовим комплект
        </div>
        <div className="hero__float">
          <div className="hero__float-t">Собрать самому — не значит делать всё самому.</div>
          <div className="hero__float-d">
            Детали нарезаны, отверстия готовы, крепёж отсортирован. Вам остаётся собрать по инструкции.
          </div>
          <div className="hero__float-dims">
            <div className="hdim"><div className="hdim-l">Ширина</div><div className="hdim-v">1870 <small style={{fontSize:10,fontWeight:500,opacity:.6}}>мм</small></div></div>
            <div className="hdim"><div className="hdim-l">Высота</div><div className="hdim-v">2140 <small style={{fontSize:10,fontWeight:500,opacity:.6}}>мм</small></div></div>
            <div className="hdim"><div className="hdim-l">Глубина</div><div className="hdim-v">600 <small style={{fontSize:10,fontWeight:500,opacity:.6}}>мм</small></div></div>
          </div>
        </div>
      </div>

    </section>
  )
}