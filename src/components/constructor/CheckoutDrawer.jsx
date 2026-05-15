function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU').format(value)
}

export default function CheckoutDrawer({ open, project, summary, onClose }) {
  if (!open) return null

  return (
    <div className="rp-checkout" role="dialog" aria-modal="true" aria-label="Оформление заказа">
      <button className="rp-checkout__overlay" type="button" aria-label="Закрыть оформление" onClick={onClose} />

      <aside className="rp-checkout__panel">
        <div className="rp-checkout__head">
          <div>
            <p>Оформление</p>
            <h2>Проверьте проект и оставьте данные</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="rp-checkout__body">
          <section className="rp-checkout__card rp-checkout__total">
            <span>К оплате после подтверждения</span>
            <strong>{formatPrice(project.price)} ₽</strong>
            <p>Финальная стоимость будет подтверждена после проверки проекта технологом.</p>
          </section>

          <section className="rp-checkout__card">
            <h3>Состав заказа</h3>
            <dl className="rp-checkout__summary">
              <div><dt>Изделие</dt><dd>Шкаф корпусный</dd></div>
              <div><dt>Размеры</dt><dd>{project.dimensions.height} × {project.dimensions.width} × {project.dimensions.depth} мм</dd></div>
              <div><dt>Материал</dt><dd>{project.material.body}, {project.material.thickness}</dd></div>
              <div><dt>Наполнение</dt><dd>{summary.shelves} полок, {summary.drawers} ящика, {summary.rails} штанга</dd></div>
              <div><dt>Срок</dt><dd>10–14 дней</dd></div>
              <div><dt>Доставка</dt><dd>от 6000 ₽ по Москве</dd></div>
            </dl>
          </section>

          <section className="rp-checkout__card">
            <h3>Ваши данные</h3>
            <div className="rp-checkout__fields">
              <label><span>Имя</span><input placeholder="Например, Денис" /></label>
              <label><span>Телефон</span><input placeholder="+7 999 000-00-00" inputMode="tel" /></label>
              <label><span>Город / адрес доставки</span><input placeholder="Москва, район или адрес" /></label>
              <label><span>Комментарий</span><textarea placeholder="Например: нужен подъём, сборка или консультация" rows="3" /></label>
            </div>
          </section>

          <section className="rp-checkout__card">
            <h3>Оплата</h3>
            <div className="rp-checkout__pay-options">
              <button className="is-active" type="button">Оплатить онлайн</button>
              <button type="button">Согласовать с менеджером</button>
            </div>
            <p className="rp-checkout__note">Авторизацию и личный кабинет добавим отдельным этапом. Сейчас заявка может уходить без входа в аккаунт.</p>
          </section>
        </div>

        <div className="rp-checkout__foot">
          <button type="button" className="rp-checkout__secondary" onClick={onClose}>Вернуться к проекту</button>
          <button type="button" className="rp-checkout__primary">Перейти к оплате</button>
        </div>
      </aside>
    </div>
  )
}
