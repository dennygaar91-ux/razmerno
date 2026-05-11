import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../../icons/Icon'
import useHeader from '../../hooks/useHeader'
import './Header.css'

const CITIES = [
  { name: 'Москва', available: true },
  { name: 'Санкт-Петербург', available: false },
  { name: 'Краснодар', available: false },
  { name: 'Казань', available: false },
]

const NAV_LINKS = [
  { href: '/#how',       label: 'Как работает' },
  { href: '/#measure',   label: 'Замер'        },
  { href: '/#assembly',  label: 'Сборка'       },
  { href: '/constructor',label: 'Конструктор'  },
  { href: '/#materials', label: 'Материалы'    },
  { href: '/#faq',       label: 'Вопросы'      },
]

export default function Header() {
  const { scrolled } = useHeader()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [city, setCity]         = useState('Москва')
  const cityRef = useRef(null)
  const location = useLocation()

  // Закрыть city-dropdown при клике вне
  useEffect(() => {
    function handle(e) {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCityOpen(false)
      }
    }
    document.addEventListener('click', handle)
    return () => document.removeEventListener('click', handle)
  }, [])

  // Закрыть мобильное меню при переходе
  useEffect(() => { setMenuOpen(false) }, [location])

  // Блокировка скролла при открытом мобильном меню
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  function handleCityClick(c) {
    if (!c.available) return
    setCity(c.name)
    setCityOpen(false)
  }

  return (
    <>
      <header className={`hdr${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap hdr__in">
          <Link to="/" className="logo">Размерно<em>.</em></Link>

          {/* Desktop nav */}
          <nav className="dnav">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>

          {/* City selector */}
          <div className={`city-wrap${cityOpen ? ' open' : ''}`} ref={cityRef}>
            <button
              className="city-btn"
              onClick={(e) => { e.stopPropagation(); setCityOpen(v => !v) }}
            >
              <Icon name="pin" size={13} />
              <span>{city}</span>
              <Icon name="chevron-down" className="city-chev" size={11} />
            </button>
            <div className="city-drop">
              {CITIES.map(c => (
                <div
                  key={c.name}
                  className={`city-opt${c.name === city ? ' active' : ''}`}
                  onClick={() => handleCityClick(c)}
                >
                  {c.name}
                  {!c.available && <span className="city-soon">скоро</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="hdr__r">
            <Link to="/auth" className="profile-ic" aria-label="Личный кабинет">
              <Icon name="person" size={16} />
            </Link>
            <Link to="/constructor" className="btn btn-cta btn-sm">
              Рассчитать мебель
              <Icon name="arrow-right" className="arr" size={14} />
            </Link>
            <button
              className={`burger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Меню"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className={`mnav${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(l => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
        ))}
        <div className="mnav__foot">
          <Link to="/auth"        className="btn btn-pr" onClick={() => setMenuOpen(false)}>Личный кабинет</Link>
          <Link to="/constructor" className="btn btn-cta" onClick={() => setMenuOpen(false)}>
            Рассчитать мебель
          </Link>
        </div>
      </div>
    </>
  )
}
