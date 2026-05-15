export default function ConstructorSummary({ onCheckout }) {
  return (
    <aside className="rp-ctor-summary">
      <section className="rp-ctor-card rp-ctor-price">
        <p>Предварительная стоимость</p>
        <strong>24 350 ₽</strong>
        <em>Экономия: 3 650 ₽ относительно заказа в салоне</em>
        <div><span>Срок изготовления</span><b>10–14 дней</b></div>
        <button type="button" onClick={onCheckout}>Оформить проект</button>
        <button type="button">♡ Сохранить проект</button>
      </section>

      <section className="rp-ctor-card rp-ctor-estimate">
        <h3>Что входит</h3>
        <ul>
          <li><span>ЛДСП 16 мм</span><b>включено</b></li>
          <li><span>Кромка ПВХ 2 мм</span><b>включено</b></li>
          <li><span>Распил и кромление</span><b>включено</b></li>
          <li><span>Фурнитура и крепёж</span><b>включено</b></li>
          <li><span>Доставка по Москве</span><b>от 6000 ₽</b></li>
        </ul>
      </section>

      <section className="rp-ctor-card rp-ctor-materials">
        <h3>Материалы</h3>
        <div><i className="rp-ctor-texture" /><p>ЛДСП Дуб Сонома<span>16 мм</span></p><b>›</b></div>
        <div><i className="rp-ctor-texture rp-ctor-texture--edge" /><p>Кромка<span>ПВХ 2 мм</span></p></div>
      </section>

      <section className="rp-ctor-card rp-ctor-sizes">
        <h3>Сводка проекта</h3>
        <dl>
          <div><dt>Размеры</dt><dd>2400 × 1800 × 600 мм</dd></div>
          <div><dt>Секции</dt><dd>3 секции</dd></div>
          <div><dt>Тип</dt><dd>Корпусный</dd></div>
        </dl>
      </section>
    </aside>
  )
}
