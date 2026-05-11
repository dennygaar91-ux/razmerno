import { useEffect, useState } from 'react'

/**
 * Следит за скроллом и возвращает флаг scrolled (true когда > 12px).
 * Используется в Header для добавления тени при скролле.
 */
export default function useHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return { scrolled }
}
