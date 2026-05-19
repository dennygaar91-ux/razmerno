const ONBOARDING_STEPS = [
  {
    title: '1. Укажите размеры',
    text: 'Введите высоту, ширину, глубину и количество секций. Это основа для цены и деталировки.',
  },
  {
    title: '2. Соберите наполнение',
    text: 'Выберите активную секцию и добавьте полки, ящики или штангу. Viewer сразу покажет изменения.',
  },
  {
    title: '3. Выберите материалы',
    text: 'Подберите декор, кромку, открывание и фурнитуру. Цена пересчитается автоматически.',
  },
]

export default function ConstructorOnboarding({ open, onStart, onClose }) {
  if (!open) return null

  return (
    <section className="rp-onboarding" role="dialog" aria-modal="true" aria-label="Как работает конструктор">
      <button className="rp-onboarding__overlay" type="button" aria-label="Закрыть подсказку" onClick={onClose} />
      <div className="rp-onboarding__panel">
        <div className="rp-onboarding__head">
          <span>Размерно · быстрый старт</span>
          <button type="button" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="rp-onboarding__hero">
          <p>Сборка шкафа за 3 шага</p>
          <h2>Начните с простого шкафа, а сложные детали система проверит по ходу настройки</h2>
          <span>Для первого MVP важно не перегружать пользователя: сначала размеры, потом секции, затем материалы и заявка.</span>
        </div>

        <div className="rp-onboarding__steps">
          {ONBOARDING_STEPS.map((step) => (
            <article key={step.title}>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="rp-onboarding__note">
          <b>Важно</b>
          <p>Цена предварительная. Перед оплатой технолог проверит конструкцию, материалы, фурнитуру и возможность производства.</p>
        </div>

        <div className="rp-onboarding__actions">
          <button type="button" onClick={onClose}>Посмотреть интерфейс</button>
          <button type="button" className="is-primary" onClick={onStart}>Начать с размеров</button>
        </div>
      </div>
    </section>
  )
}
