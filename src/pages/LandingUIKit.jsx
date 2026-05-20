import { Link } from 'react-router-dom'
import Icon from '../icons/Icon'
import { UiButton, UiStatus } from '../components/uikit/RazmernoUIKit'
import './LandingUIKitHero.css'
import './LandingUIKitSections.css'

const processSteps = [
  ['Размеры', 'Укажите ширину, высоту и глубину изделия с точностью до миллиметра.'],
  ['Наполнение', 'Добавьте полки, ящики и штанги в понятном редакторе.'],
  ['Дизайн', 'Выберите материал корпуса, фасадов, кромку и фурнитуру.'],
  ['Производство', 'Мы проверим проект, подготовим детали, присадку и комплект фурнитуры.'],
]

const kitItems = [
  ['Детали в размер', 'Корпусные элементы подготовлены под ваш проект.'],
  ['Кромка ABS', 'Кромим нужные стороны и учитываем толщину в деталировке.'],
  ['Присадка', 'Отверстия под крепёж и фурнитуру уже заложены в проект.'],
  ['Фурнитура', 'Петли, направляющие, крепёж и ручки подбираются комплектом.'],
  ['Инструкция', 'Сборка должна быть понятной без сложных чертежей.'],
  ['Проверка технологом', 'Финальную стоимость и конструкцию подтверждаем перед запуском.'],
]

const models = [
  ['Шкаф-купе', 'Плавный ход, скрытый профиль', 'от 42 000 ₽'],
  ['Распашной шкаф', 'Минимализм и строгие линии', 'от 35 000 ₽'],
  ['Тумба под ТВ', 'Подвесная консоль с ящиками', 'от 18 000 ₽'],
]

const faqs = [
  ['Сколько времени занимает производство?', 'Стандартный срок изготовления — около 14 рабочих дней после проверки проекта.'],
  ['Можно ли собрать мебель самостоятельно?', 'Да. Идея Размерно — подготовить комплект деталей, фурнитуры и крепежа так, чтобы сборка была понятной.'],
  ['Цена на сайте финальная?', 'Нет. Конструктор показывает предварительную стоимость. Финальную сумму подтвердит технолог после проверки проекта.'],
]

export default function LandingUIKit() {
  return (
    <main className="rzm-home rzm-ui">
      <header className="rzm-home-nav">
        <Link to="/" className="rzm-home-logo">Размерно.</Link>
        <nav>
          <Link to="/constructor">Конструктор</Link>
          <a href="#process">Как работает</a>
          <a href="#materials">Материалы</a>
          <Link to="/account">Кабинет</Link>
        </nav>
        <div>
          <Link to="/auth">Войти</Link>
          <Link to="/constructor" className="rzm-home-nav__cta">Создать проект</Link>
        </div>
      </header>

      <section className="rzm-home-hero">
        <UiStatus>Новая версия конструктора</UiStatus>
        <h1>Проектируйте мебель. <span>Точно.</span></h1>
        <p>Соберите шкаф под свой размер: задайте габариты, выберите наполнение и материал. Размерно рассчитает предварительную стоимость и подготовит проект к проверке технологом.</p>
        <div className="rzm-home-hero__actions">
          <Link to="/constructor"><UiButton>Открыть конструктор <Icon name="arrow-right" size={16} /></UiButton></Link>
          <a className="rzm-home-link" href="#models">Посмотреть модели</a>
        </div>
      </section>

      <section id="process" className="rzm-home-section">
        <p className="rzm-home-kicker">Процесс создания</p>
        <h2>От идеи до готового изделия за 4 шага</h2>
        <div className="rzm-home-process">
          {processSteps.map(([title, text], index) => (
            <article key={title} className="rzm-home-card">
              <div className="rzm-home-card__icon"><Icon name={index === 0 ? 'ruler' : index === 1 ? 'grid' : index === 2 ? 'palette' : 'box'} size={21} /></div>
              <span>Шаг {String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="models" className="rzm-home-section rzm-home-models-section">
        <div className="rzm-home-section__head">
          <div><p className="rzm-home-kicker">Базовые модели</p><h2>Выберите шаблон для старта</h2></div>
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

      <section className="rzm-home-section rzm-home-kit">
        <div><p className="rzm-home-kicker">Комплект для сборки</p><h2>Что вы получите</h2><p>Не просто картинку шкафа, а подготовленный комплект: детали, кромка, присадка, фурнитура и понятная логика сборки.</p></div>
        <div className="rzm-home-kit__grid">
          {kitItems.map(([title, text]) => <article key={title}><b>{title}</b><span>{text}</span></article>)}
        </div>
      </section>

      <section id="materials" className="rzm-home-section rzm-home-dark">
        <div>
          <p className="rzm-home-kicker">Материалы и фурнитура</p>
          <h2>Без компромиссов в базовых вещах</h2>
          <p>ЛДСП Egger и Kronospan, кромка ABS, петли и направляющие с доводчиками. Мы используем решения, которые подходят для ежедневного использования.</p>
        </div>
        <div className="rzm-home-dark__visual" />
      </section>

      <section className="rzm-home-section rzm-home-faq">
        <h2>Частые вопросы</h2>
        {faqs.map(([q, a], index) => <details key={q} open={index === 0}><summary>{q}<Icon name="chevron-down" size={16} /></summary><p>{a}</p></details>)}
      </section>

      <section className="rzm-home-final">
        <h2>Начните проект</h2>
        <p>Откройте конструктор прямо сейчас. Без регистрации и скачивания программ.</p>
        <Link to="/constructor"><UiButton>Спроектировать шкаф <Icon name="arrow-right" size={18} /></UiButton></Link>
      </section>
    </main>
  )
}
