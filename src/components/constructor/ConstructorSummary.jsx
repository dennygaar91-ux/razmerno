export default function ConstructorSummary() {
  return (
    <aside className="rp-ctor-summary">
      <section className="rp-ctor-card rp-ctor-price">
        <p>Итоговая стоимость</p>
        <strong>24 350 ₽</strong>
        <em>Экономия: 3 650 ₽</em>
        <div><span>Срок изготовления</span><b>10–14 дней</b></div>
        <button type="button">Получить расчет</button>
        <button type="button">♡ Сохранить проект</button>
      </section>

      <section className="rp-ctor-card rp-ctor-materials">
        <h3>Материалы</h3>
        <div><i className="rp-ctor-texture" /><p>ЛДСП Дуб Сонома<span>16 мм</span></p><b>›</b></div>
        <div><i className="rp-ctor-texture rp-ctor-texture--edge" /><p>Кромка<span>ПВХ 2 мм</span></p></div>
      </section>

      <section className="rp-ctor-card rp-ctor-sizes">
        <h3>Размеры шкафа</h3>
        <dl>
          <div><dt>Высота</dt><dd>2400 мм</dd></div>
          <div><dt>Ширина</dt><dd>1800 мм</dd></div>
          <div><dt>Глубина</dt><dd>600 мм</dd></div>
        </dl>
      </section>

      <section className="rp-ctor-card rp-ctor-collapse">
        <div><h3>Секции</h3><p>3 секции</p></div>
        <span>⌄</span>
      </section>
    </aside>
  )
}
