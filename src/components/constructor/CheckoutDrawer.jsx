import { useState } from 'react'
import { createConstructorOrder } from '../../services/constructorOrders'

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU').format(value)
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

function CheckoutStep({ number, title, text, children }) {
  return (
    <section className="rp-checkout__step">
      <div className="rp-checkout__step-head">
        <span>{number}</span>
        <div>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

export default function CheckoutDrawer({ open, project, summary, orderPayload, onClose }) {
  const [customer, setCustomer] = useState(initialCustomer)
  const [errors, setErrors] = useState({})
  const [submitState, setSubmitState] = useState('idle')
  const [authMode, setAuthMode] = useState('guest')
  const [paymentMode, setPaymentMode] = useState('online')
  const [orderId, setOrderId] = useState('')

  if (!open) return null

  const isSubmitting = submitState === 'loading'
  const isSuccess = submitState === 'success'

  const orderRows = [
    ['Размер', `${project.dimensions.height} × ${project.dimensions.width} × ${project.dimensions.depth} мм`],
    ['Материал', `${project.material.body}, ${project.material.thickness}`],
    ['Наполнение', `${summary.shelves} полок · ${summary.drawers} ящиков · ${summary.rails} штанг`],
    ['Срок', '10–14 дней'],
  ]

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
        method: paymentMode,
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
    <div className="rp-checkout rp-checkout--polished" role="dialog" aria-modal="true" aria-label="Оформление заказа">
      <button className="rp-checkout__overlay" type="button" aria-label="Закрыть оформление" onClick={onClose} />

      <aside className="rp-checkout__panel">
        <div className="rp-checkout__head rp-checkout__head--polished">
          <div>
            <p>Оформление заказа</p>
            <h2>{isSuccess ? 'Заявка создана' : 'Проверьте комплект и оставьте контакты'}</h2>
            <span>{isSuccess ? 'Мы зафиксировали параметры проекта и передадим их на проверку.' : 'Оплата появится после проверки проекта технологом.'}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="rp-checkout__body rp-checkout__body--polished">
          {isSuccess ? (
            <section className="rp-checkout__success">
              <div className="rp-checkout__success-icon">✓</div>
              <h3>Заявка {orderId} создана</h3>
              <p>Следующий шаг — менеджер проверит деталировку, подтвердит стоимость и отправит ссылку на оплату.</p>
              <dl>
                <div><dt>Стоимость</dt><dd>{formatPrice(project.price)} ₽</dd></div>
                <div><dt>Срок</dt><dd>10–14 дней после подтверждения</dd></div>
                <div><dt>Контакт</dt><dd>{customer.phone}</dd></div>
              </dl>
            </section>
          ) : (
            <>
              <section className="rp-checkout__hero-total">
                <span>Предварительная стоимость</span>
                <strong>{formatPrice(project.price)} ₽</strong>
                <p>Финальная стоимость будет подтверждена после проверки проекта технологом.</p>
              </section>

              <CheckoutStep number="1" title="Комплект" text="Проверьте основные параметры перед оформлением.">
                <dl className="rp-checkout__summary rp-checkout__summary--compact">
                  {orderRows.map(([label, value]) => (
                    <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                  ))}
                </dl>
              </CheckoutStep>

              <CheckoutStep number="2" title="Контакты и доставка" text="Нужны только данные для связи и предварительной доставки.">
                <div className="rp-checkout__fields rp-checkout__fields--polished">
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
              </CheckoutStep>

              <CheckoutStep number="3" title="Оформление" text="Можно продолжить без входа. Личный кабинет добавим позже.">
                <div className="rp-checkout__option-grid">
                  <button className={authMode === 'guest' ? 'is-active' : ''} type="button" onClick={() => setAuthMode('guest')}>Без входа<span>Оформить по телефону</span></button>
                  <button className={authMode === 'login' ? 'is-active' : ''} type="button" onClick={() => setAuthMode('login')}>Войти позже<span>Сохраним UX под кабинет</span></button>
                </div>
                <div className="rp-checkout__option-grid rp-checkout__option-grid--pay">
                  <button className={paymentMode === 'online' ? 'is-active' : ''} type="button" onClick={() => setPaymentMode('online')}>Онлайн-оплата<span>После проверки</span></button>
                  <button className={paymentMode === 'manager' ? 'is-active' : ''} type="button" onClick={() => setPaymentMode('manager')}>Через менеджера<span>Согласовать вручную</span></button>
                </div>
                <p className="rp-checkout__note">Сейчас создаём заявку и резервируем параметры проекта. Платёжный шлюз подключим следующим техническим этапом.</p>
                {submitState === 'error' && <p className="rp-checkout__status is-error">Заполните обязательные поля или попробуйте ещё раз.</p>}
                {submitState === 'loading' && <p className="rp-checkout__status is-loading">Создаём заявку и готовим переход к оплате…</p>}
              </CheckoutStep>
            </>
          )}
        </div>

        <div className="rp-checkout__foot rp-checkout__foot--polished">
          <button type="button" className="rp-checkout__secondary" onClick={onClose}>{isSuccess ? 'Закрыть' : 'Вернуться к проекту'}</button>
          {!isSuccess && <button type="button" className="rp-checkout__primary" disabled={isSubmitting} onClick={handleSubmit}>{isSubmitting ? 'Создаём заявку…' : 'Создать заявку'}</button>}
        </div>
      </aside>
    </div>
  )
}
