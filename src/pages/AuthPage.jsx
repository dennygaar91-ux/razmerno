import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../icons/Icon'
import './AuthPage.css'

export default function AuthPage() {
  const [params]  = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login')
  const [showPwd, setShowPwd] = useState(false)
  const navigate  = useNavigate()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  function handleSubmit(e) {
    e.preventDefault()
    navigate('/account')
  }

  return (
    <div className="auth-page">

      {/* Left: hero panel */}
      <div className="auth-hero">
        <img
          className="auth-hero-img"
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=85"
          alt=""
        />
        <div className="auth-hero-overlay" />
        <div className="auth-hero-c">
          <Link to="/" className="auth-logo">Размерно<em>.</em></Link>
          <div className="auth-hero-text">
            <h2 className="auth-hero-title">
              {mode === 'login' ? 'Ваши проекты\nуже ждут вас' : 'Создайте аккаунт\nи сохраняйте\nсвои проекты'}
            </h2>
            <p className="auth-hero-sub">
              {mode === 'login'
                ? 'Войдите, чтобы продолжить работу или посмотреть заказ'
                : 'Это займёт всего пару минут'}
            </p>
          </div>
          <div className="auth-feats">
            {[
              { icon: 'ruler',    text: 'Собирайте мебель под свои размеры' },
              { icon: 'check-ok', text: 'Следите за статусом заказа'        },
              { icon: 'doc',      text: 'Храните проекты и повторяйте заказы'},
            ].map((f, i) => (
              <div key={i} className="auth-feat">
                <div className="auth-feat-ic"><Icon name={f.icon} size={14} /></div>
                <div className="auth-feat-t">{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="auth-form-panel">
        <Link to="/" className="auth-back">
          <Icon name="arrow-left" size={16} />
          На главную
        </Link>

        {mode === 'login' ? (
          <form onSubmit={handleSubmit}>
            <h1 className="auth-form-title">Вход в личный кабинет</h1>
            <p className="auth-form-sub">Нет аккаунта?{' '}
              <button type="button" className="auth-link" onClick={() => setMode('register')}>Зарегистрироваться</button>
            </p>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="Введите ваш email" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="pwd">Пароль</label>
              <div className="pwd-wrap">
                <input id="pwd" type={showPwd ? 'text' : 'password'} placeholder="Введите пароль" autoComplete="current-password" required />
                <button type="button" className="pwd-eye" onClick={() => setShowPwd(v => !v)}>
                  <Icon name="camera" size={18} />
                </button>
              </div>
            </div>
            <div className="check-row">
              <label className="check-item"><input type="checkbox" /><span>Запомнить меня</span></label>
              <a href="#" className="forgot">Забыли пароль?</a>
            </div>
            <button type="submit" className="auth-submit">Войти</button>
            <div className="auth-div">или</div>
            <button type="button" className="auth-oauth">
              <Icon name="message" size={18} />
              Продолжить с Telegram
            </button>
            <div className="auth-switch">
              Нет аккаунта?{' '}
              <button type="button" className="auth-link" onClick={() => setMode('register')}>Зарегистрироваться</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 className="auth-form-title">Создайте аккаунт</h1>
            <p className="auth-form-sub">Это займёт всего пару минут</p>
            <div className="field-row">
              <div className="field"><label htmlFor="name">Имя</label><input id="name" type="text" placeholder="Введите имя" autoComplete="given-name" required /></div>
              <div className="field"><label htmlFor="surname">Фамилия</label><input id="surname" type="text" placeholder="Введите фамилию" autoComplete="family-name" required /></div>
            </div>
            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" placeholder="Введите email" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="phone">Телефон</label>
              <input id="phone" type="tel" placeholder="+7 (___) ___-__-__" autoComplete="tel" />
            </div>
            <div className="field">
              <label htmlFor="reg-pwd">Пароль</label>
              <div className="pwd-wrap">
                <input id="reg-pwd" type={showPwd ? 'text' : 'password'} placeholder="Минимум 6 символов" autoComplete="new-password" required />
                <button type="button" className="pwd-eye" onClick={() => setShowPwd(v => !v)}>
                  <Icon name="camera" size={18} />
                </button>
              </div>
              <span className="field-hint">Минимум 6 символов</span>
            </div>
            <button type="submit" className="auth-submit" style={{ marginTop: 4 }}>Создать аккаунт</button>
            <div className="auth-div">или</div>
            <button type="button" className="auth-oauth">
              <Icon name="message" size={18} />
              Продолжить с Telegram
            </button>
            <div className="auth-switch">
              Уже есть аккаунт?{' '}
              <button type="button" className="auth-link" onClick={() => setMode('login')}>Войти</button>
            </div>
          </form>
        )}
      </div>

    </div>
  )
}
