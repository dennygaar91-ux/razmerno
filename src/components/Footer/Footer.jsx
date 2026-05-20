import { Link } from 'react-router-dom'
import './Footer.css'
import './FooterUIKit.css'

export default function Footer() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft__g">
          <div>
            <div className="ft__logo">Размерно<em>.</em></div>
            <p className="ft__d">Онлайн-конструктор корпусной мебели под ваши размеры. Готовый комплект к самостоятельной сборке.</p>
          </div>
          <div className="ft__col">
            <div className="ft__ct">Продукт</div>
            <Link to="/constructor">Конструктор</Link>
            <a href="/#how">Как работает</a>
            <a href="/#materials">Материалы</a>
          </div>
          <div className="ft__col">
            <div className="ft__ct">Помощь</div>
            <a href="/#measure">Замер</a>
            <a href="/#assembly">Сборка</a>
            <a href="/#faq">Вопросы</a>
          </div>
          <div className="ft__col">
            <div className="ft__ct">Контакты</div>
            <a href="tel:+79852924745">+7 985 292 47 45</a>
            <a href="mailto:mail@razmerno.ru">mail@razmerno.ru</a>
            <Link to="/auth">Личный кабинет</Link>
          </div>
        </div>
        <div className="ft__b">
          <div className="ft__cp">© 2026 Размерно. Все права защищены.</div>
          <div className="ft__lk">
            <a href="#">Конфиденциальность</a>
            <a href="#">Оферта</a>
          </div>
        </div>
      </div>
    </footer>
  )
}