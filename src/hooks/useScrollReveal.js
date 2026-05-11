import { useEffect } from 'react'

/**
 * Подключает IntersectionObserver для всех элементов с классом .rv.
 * При появлении во вьюпорте добавляет класс .vis → CSS-анимация.
 *
 * Использование: вызовите один раз на уровне страницы.
 *   import useScrollReveal from '../hooks/useScrollReveal'
 *   export default function Landing() {
 *     useScrollReveal()
 *     ...
 *   }
 */
export default function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vis')
            obs.unobserve(entry.target) // один раз — и готово
          }
        })
      },
      { threshold: 0.1 }
    )

    // Небольшая задержка, чтобы DOM успел отрисоваться
    const timeout = setTimeout(() => {
      document.querySelectorAll('.rv').forEach((el) => obs.observe(el))
    }, 50)

    return () => {
      clearTimeout(timeout)
      obs.disconnect()
    }
  }, [])
}
