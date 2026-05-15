import { useState } from 'react'
import { createConstructorOrder } from '../../services/constructorOrders'

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU').format(value)
}

const breakdownLabels = {
  material: 'Материалы и детали',
  cutting: 'Распил',
  edging: 'Кромление',
  hardware: 'Фурнитура',
  packaging: 'Упаковка',
}

const initialCustomer = {
  name: '',
  phone: '',
  address: '',
  comment: '',
}

function validateCustomer(customer) {
  const errors = {}

  if (customer.name.trim().length < 2) {
    errors.name = 'Укажите имя'
  }

  const phoneDigits = customer.phone.replace(/\D/g, '')
  if (phoneDigits.length < 10) {
    errors.phone = 'Укажите телефон для связи'
  }

  if (customer.address.trim().length < 3) {
    errors.address = 'Укажите город или адрес доставки'
  }

  return errors
}

export default function CheckoutDrawer({ open, project, summary, orderPayload, onClose }) {
  const [customer, setCustomer] = useState(initialCustomer)
  const [errors, setErrors] = useState({})
  const [submitState, setSubmitState] = useState('idle')
  const [authMode, setAuthMode] = useState('guest')
  const [orderId, setOrderId] = useState('')

  if (!open) return null

  const breakdown = project.priceBreakdown ?? {}
  const isSubmitting = submitState === 'loading'

  function updateCustomer(field, value) {
    setCustomer(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: undefined }))
    setSubmitState('idle')
    setOrderId('')
  }

  async function handleSubmit() {
    const nextErrors = validateCustomer(customer)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setSubmitState('error')
      return
    }

    const payload = {
      ...orderPayload,
      customer,
      auth: {
        mode: authMode,
        status: authMode === 'guest' ? 'guest_checkout' : 'auth_required_later',
      },
      payment: {
        method: 'online',
        status: 'pending',
      },
    }

    try {
      setSubmitState('loading')
      const result = await createConstructorOrder(payload)

      if (!result?.ok) {
        throw new Error('Order service returned an error')
      }

      setOrderId(result.orderId)
      setSubmitState('success')
    } catch (error) {
      console.warn('Constructor order submit failed:', error)
      setSubmitState('error')
    }
  }

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

          <section className="rp-checkout__card rp-checkout__auth">
            <h3>Как оформить</h3>
            <div className="rp-checkout__auth-options">
              <button className={authMode === 'guest' ? 'is-active' : ''} type="button" onClick={() => setAuthMode('guest')}>Продолжить без входа<span>Быстрое оформление по телефону</span></button>
              <button className={authMode === 'login' ? 'is-active' : ''} type="button" onClick={() => setAuthMode('login')}>Войти позже<span>Личный кабинет добавим отдельным этапом</span></button>
            </div>
          </section>

          <section className="rp-checkout__card">
            <h3>Состав заказа</h3>
            <dl className="rp-checkout__summary">
              <div><dt>Изделие</dt><dd>Шкаф корпусный</dd></div>
              <div><dt>Размеры</dt><dd>{project.dimensions.height} × {project.dimensions.width} × {project.dimensions.depth} мм</dd></div>
              <div><dt>Материал</dt><dd>{project.material.body}, {project.material.thickness}</dd></div>
              <div><dt>Кромка</dt><dd>{project.material.edge}</dd></div>
              <div><dt>Открывание</dt><dd>{project.material.handles}</dd></div>
              <div><dt>Наполнение</dt><dd>{summary.shelves} полок, {summary.drawers} ящика, {summary.rails} штанга</dd></div>
              <div><dt>Срок</dt><dd>10–14 дней</dd></div>
              <div><dt>Доставка</dt><dd>от 6000 ₽ по Москве</dd></div>
            </dl>
          </section>

          <section className="rp-checkout__card">
            <h3>Смета</h3>
            <dl className="rp-checkout__summary">
              {Object.entries(breakdown).map(([key, value]) => (
                <div key={key}><dt>{breakdownLabels[key] ?? key}</dt><dd>{formatPrice(value)} ₽</dd></div>
              ))}
            </dl>
          </section>

          <section className="rp-checkout__card">
            <h3>Ваши данные</h3>
            <div className="rp-checkout__fields">
              <label className={errors.name ? 'has-error' : ''}>
                <span>Имя</span>
                <input placeholder="Например, Денис" value={customer.name} onChange={(event) => updateCustomer('name', event.target.value)} />
                {errors.name && <small>{errors.name}</small>}
              </label>
              <label className={errors.phone ? 'has-error' : ''}>
                <span>Телефон</span>
                <input placeholder="+7 999 000-00-00" inputMode="tel" value={customer.phone} onChange={(event) => updateCustomer('phone', event.target.value)} />
                {errors.phone && <small>{errors.phone}</small>}
              </label>
              <label className={errors.address ? 'has-error' : ''}>
                <span>Город / адрес доставки</span>
                <input placeholder="Москва, район или адрес" value={customer.address} onChange={(event) => updateCustomer('address', event.target.value)} />
                {errors.address && <small>{errors.address}</small>}
              </label>
              <label>
                <span>Комментарий</span>
                <textarea placeholder="Например: нужен подъём, сборка или консультация" rows="3" value={customer.comment} onChange={(event) => updateCustomer('comment', event.target.value)} />
              </label>
            </div>
          </section>

          <section className="rp-checkout__card">
            <h3>Оплата</h3>
            <div className="rp-checkout__pay-options">
              <button className="is-active" type="button">Оплатить онлайн</button>
              <button type="button">Согласовать с менеджером</button>
            </div>
            <p className="rp-checkout__note">Сейчас создаём заявку и резервируем параметры проекта. Платёжный шлюз подключим следующим техническим этапом.</p>
            {submitState === 'error' && <p className="rp-checkout__status is-error">Заполните обязательные поля или попробуйте ещё раз.</p>}
            {submitState === 'loading' && <p className="rp-checkout__status is-loading">Создаём заявку и готовим переход к оплате…</p>}
            {submitState === 'success' && <p className="rp-checkout__status is-success">Заявка создана{orderId ? `: ${orderId}` : ''}. Следующий этап — реальная оплата и backend.</p>}
          </section>
        </div>

        <div className="rp-checkout__foot">
          <button type="button" className="rp-checkout__secondary" onClick={onClose}>Вернуться к проекту</button>
          <button type="button" className="rp-checkout__primary" disabled={isSubmitting} onClick={handleSubmit}>{isSubmitting ? 'Создаём заявку…' : 'Перейти к оплате'}</button>
        </div>
      </aside>
    </div>
  )
}
