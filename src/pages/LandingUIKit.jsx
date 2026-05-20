import { Link } from 'react-router-dom'
import Icon from '../icons/Icon'
import { UiButton, UiStatus } from '../components/uikit/RazmernoUIKit'
import './LandingUIKitHero.css'
import './LandingUIKitSections.css'

const heroProofs = [
  ['Ошибётесь в замере?', 'Проверим до запуска'],
  ['Никогда не собирали?', 'Не нужно опыта'],
  ['Нестандартный размер?', 'Для нас — обычный заказ'],
  ['Маркировка деталей', 'Ведёт шаг за шагом'],
]

const processSteps = [
  ['Размеры', 'Укажите ширину, высоту и глубину в миллиметрах. Конструктор сразу покажет, как меняется изделие.', 'ruler'],
  ['Наполнение', 'Добавьте полки, ящики, штангу и секции под одежду. Не нужно чертить вручную.', 'layers'],
  ['Проверка', 'Перед запуском технолог проверит размеры, конструкцию, фурнитуру и возможные ошибки.', 'shield'],
  ['Комплект', 'Получите детали, кромку, присадку, крепёж и понятную логику сборки.', 'package'],
]

const measureItems = [
  ['Обычная рулетка', 'Достаточно измерить ширину, высоту и глубину места установки.'],
  ['Плинтус и стены', 'Подскажем, где могут быть неровности, выступы и зазоры.'],
  ['Проверка перед запуском', 'Если размер выглядит рискованным, мы уточним его до производства.'],
]

const kitItems = [
  ['Детали в размер', 'Корпусные элементы подготовлены под ваш проект.'],
  ['Кромка ABS', 'Кромим нужные стороны и учитываем толщину в деталировке.'],
  ['Присадка', 'Отверстия под крепёж и фурнитуру уже заложены в проект.'],
  ['Фурнитура', 'Петли, направляющие, крепёж и ручки подбираются комплектом.'],
  ['Маркировка', 'Каждая деталь получает понятное место в сборке.'],
  ['Инструкция', 'Сборка должна быть понятной без опыта мебельщика.'],
]

const models = [
  ['Шкаф-купе', 'Плавный ход, скрытый профиль', 'от 42 000 ₽'],
  ['Распашной шкаф', 'Минимализм и строгие линии', 'от 35 000 ₽'],
  ['Тумба под ТВ', 'Подвесная консоль с ящиками', 'от 18 000 ₽'],
]

const materialItems = [
  ['ЛДСП 16 мм', 'Базовый материал для корпуса: Egger, Kronospan и аналоги под наличие.'],
  ['Кромка ABS', 'Защищает торцы и делает детали аккуратнее в эксплуатации.'],
  ['Фурнитура', 'Петли, направляющие, ручки и крепёж подбираются по правилам проекта.'],
  ['Присадка', 'Отверстия под крепёж и фурнитуру уменьшают риск ошибки при сборке.'],
]

const faqs = [
  ['Сколько времени занимает производство?', 'Стандартный срок изготовления — около 14 рабочих дней после проверки проекта. Для сложных проектов срок может быть увеличен.'],
  ['Можно ли собрать мебель самостоятельно?', 'Да. Идея Размерно — подготовить комплект деталей, фурнитуры и крепежа так, чтобы сборка была понятной даже без опыта.'],
  ['Что если я ошибусь в размере?', 'Мы проверяем проект перед запуском. Если видим риск по размерам, секциям или фурнитуре, уточняем детали до производства.'],
  ['Цена на сайте финальная?', 'Нет. Конструктор показывает предварительную стоимость. Финальную сумму подтвердит технолог после проверки проекта.'],
  ['Нужна ли регистрация, чтобы начать?', 'Нет. Можно открыть конструктор, задать размеры и посмотреть предварительный расчёт без регистрации.'],
]

export default function LandingUIKit() {
  return (
    <main className="rzm-home rzm-ui">
      <header className="rzm-home-nav">
        <Link to="/" className="rzm-home-logo">Размерно<span>.</span></Link>
        <nav>
          <a href="#process">Как работает</a>
          <a href="#measure">Замер</a>
          <a href="#assembly">Сборка</a>
          <Link to="/constructor">Конструктор</Link>
          <a href="#materials">Материалы</a>
          <a href="#faq">Вопросы</a>
        </nav>
        <div>
          <Link to="/auth" className="rzm-home-icon-link"><Icon name="person" size={17} /></Link>
          <Link to="/constructor" className="rzm-home-nav__cta">Конструктор <Icon name="arrow-right" size={15} /></Link>
        </div>
      </header>

      <section className="rzm-home-hero rzm-home-hero--emotional">
        <div className="rzm-home-hero__copy">
          <UiStatus>Онлайн-конструктор · размеры в мм</UiStatus>
          <h1>Мебель под ваш размер. <span>Без страха ошибиться.</span></h1>
          <p>Задайте размеры в миллиметрах. Мы проверим, нарежем, прокромим, просверлим и промаркируем каждую деталь. Вам останется только собрать.</p>
          <div className="rzm-home-hero__actions">
            <Link to="/constructor"><UiButton>Открыть конструктор <Icon name="arrow-right" size={16} /></UiButton></Link>
            <a className="rzm-home-link" href="#process">Как это работает</a>
          </div>
          <div className="rzm-home-proof-list">
            {heroProofs.map(([title, text]) => <article key={title}><Icon name="check" size={15} /><b>{title}</b><span>{text}</span></article>)}
          </div>
        </div>
        <div className="rzm-home-hero__visual">
          <div className="rzm-home-hero-room" />
          <div className="rzm-home-hero-card"><UiStatus tone="success">Безошибочный комплект</UiStatus><h3>Собрать самому — не значит делать всё самому.</h3><p>Детали нарезаны, отверстия готовы, крепёж отсортирован. Вам остаётся собрать по инструкции.</p><div><span>Ширина<br /><b>1870 мм</b></span><span>Высота<br /><b>2140 мм</b></span><span>Глубина<br /><b>600 мм</b></span></div></div>
        </div>
      </section>

      <section id="process" className="rzm-home-section">
        <p className="rzm-home-kicker">Как работает</p>
        <h2>От размера до готового комплекта — без чертежей и сложных программ</h2>
        <div className="rzm-home-process">
          {processSteps.map(([title, text, icon], index) => (
            <article key={title} className="rzm-home-card">
              <div className="rzm-home-card__icon"><Icon name={icon} size={21} /></div>
              <span>Шаг {String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="measure" className="rzm-home-section rzm-home-measure">
        <div><p className="rzm-home-kicker">Замер</p><h2>Не нужно быть замерщиком</h2><p>Главный страх — ошибиться на пару миллиметров и получить детали, которые не встанут на место. Поэтому мы делаем сценарий замера простым и проверяем проект перед запуском.</p></div>
        <div className="rzm-home-measure__cards">{measureItems.map(([title, text]) => <article key={title}><Icon name="target" size={20} /><b>{title}</b><span>{text}</span></article>)}</div>
      </section>

      <section id="models" className="rzm-home-section rzm-home-models-section">
        <div className="rzm-home-section__head">
          <div><p className="rzm-home-kicker">Базовые модели</p><h2>Начните с простого изделия</h2></div>
          <Link to="/constructor">Смотреть все <Icon name="arrow-right" size={16} /></Link>
        </div>
        <div className="rzm-home-models">
          {models.map(([title, text, price], index) => (
            <article key={title} className="rzm-home-model">
              <div className={`rzm-home-model__visual is-${index + 1}`}><span>Настроить</span></div>
              <div><h3>{title}</h3><p>{text}</p></div>
              <b>{price}</b>
            </article>
          ))}
        </div>
      </section>

      <section id="assembly" className="rzm-home-section rzm-home-kit">
        <div><p className="rzm-home-kicker">Сборка</p><h2>Понятно, как конструктор</h2><p>Размерно не просто считает шкаф. Мы готовим комплект так, чтобы человеку без опыта было понятно, какая деталь куда ставится и чем крепится.</p></div>
        <div className="rzm-home-kit__grid">
          {kitItems.map(([title, text]) => <article key={title}><b>{title}</b><span>{text}</span></article>)}
        </div>
      </section>

      <section className="rzm-home-section rzm-home-constructor-teaser">
        <div className="rzm-home-teaser-card">
          <div><p className="rzm-home-kicker">Конструктор</p><h2>Введите размеры — и сразу увидите расчёт</h2><p>Выберите ширину, высоту, глубину, секции, полки, ящики и материал. Конструктор покажет предварительную стоимость, а технолог проверит проект перед производством.</p><Link to="/constructor"><UiButton>Перейти в конструктор <Icon name="arrow-right" size={16} /></UiButton></Link></div>
          <div className="rzm-home-teaser-ui"><div className="rzm-home-teaser-wardrobe"><i /><i /><i /></div><div className="rzm-home-teaser-price"><span>Предварительно</span><b>82 200 ₽</b><small>Оплата сейчас не списывается</small></div></div>
        </div>
      </section>

      <section id="materials" className="rzm-home-section rzm-home-dark">
        <div>
          <p className="rzm-home-kicker">Материалы</p>
          <h2>Качество в тех местах, где это важно каждый день</h2>
          <p>Корпус, кромка, направляющие, крепёж и присадка влияют на то, насколько спокойно мебель будет собираться и служить. Поэтому базовые решения подбираются не «на глаз», а по правилам проекта.</p>
          <div className="rzm-home-dark__facts">{materialItems.map(([title, text]) => <article key={title}><b>{title}</b><span>{text}</span></article>)}</div>
        </div>
        <div className="rzm-home-dark__visual" />
      </section>

      <section id="faq" className="rzm-home-section rzm-home-faq">
        <h2>Частые вопросы</h2>
        {faqs.map(([q, a], index) => <details key={q} open={index === 0}><summary>{q}<Icon name="chevron-down" size={16} /></summary><p>{a}</p></details>)}
      </section>

      <section className="rzm-home-final">
        <h2>Начните проект</h2>
        <p>Откройте конструктор прямо сейчас. Без регистрации и скачивания программ.</p>
        <Link to="/constructor"><UiButton>Спроектировать шкаф <Icon name="arrow-right" size={18} /></UiButton></Link>
      </section>

      <footer className="rzm-home-footer">
        <Link to="/" className="rzm-home-logo">Размерно<span>.</span></Link>
        <p>Онлайн-конструктор корпусной мебели для самостоятельной сборки. Размеры, детали, кромка, присадка и фурнитура — в одном понятном сценарии.</p>
        <nav><Link to="/constructor">Конструктор</Link><a href="#measure">Замер</a><a href="#assembly">Сборка</a><a href="#materials">Материалы</a><Link to="/account">Кабинет</Link></nav>
      </footer>
    </main>
  )
}
