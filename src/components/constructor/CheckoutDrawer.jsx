import { useEffect, useMemo, useState } from 'react'
import { createConstructorOrder } from '../../services/constructorOrders'

function formatPrice(value) {
  const numericValue = Number(value)
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0
  return new Intl.NumberFormat('ru-RU').format(safeValue)
}

const initialCustomer = {
  name: '',
  phone: '',
  address: '',
  entrance: '',
  floor: '',
  comment: '',
}

function validateCustomer(customer, agreementAccepted) {
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

  if (!agreementAccepted) {
    errors.agreement = 'Нужно согласие на обработку заявки'
  }

  return errors
}

function getErrorProps(field, errors) {
  return errors[field]
    ? {
        'aria-invalid': 'true',
        'aria-describedby': `checkout-${field}-error`,
      }
    : {
        'aria-invalid': 'false',
      }
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
  const [deliveryMode, setDeliveryMode] = useState('mkad')
  const [paymentMode, setPaymentMode] = useState('after-check')
  const [agreementAccepted, setAgreementAccepted] = useState(true)
  const [orderId, setOrderId] = useState('')

  const deliveryPrice = deliveryMode === 'pickup' ? 0 : deliveryMode === 'mo' ? 6000 : 6000
  const finalTotal = project.price + deliveryPrice

  const orderRows = useMemo(() => [
    ['Размер', `${project.dimensions.height} × ${project.dimensions.width} × ${project.dimensions.depth} мм`],
    ['Материал', `${project.material.body}, ${project.material.thickness}`],
    ['Кромка', project.material.edge],
    ['Фурнитура', `${project.material.handles} · ${project.material.hardware ?? 'Стандарт'}`],
    ['Наполнение', `${summary.shelves} полок · ${summary.drawers} ящиков · ${summary.rails} штанг`],
    ['Срок', '10–14 дней'],
  ], [project, summary])

  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const isSubmitting = submitState === 'loading'
  const isSuccess = submitState === 'success'

  function updateCustomer(field, value) {
    setCustomer(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: undefined }))
    setSubmitState('idle')
    setOrderId('')
  }

  function updateAgreement(value) {
    setAgreementAccepted(value)
    setErrors(current => ({ ...current, agreement: undefined }))
    setSubmitState('idle')
  }

  async function handleSubmit() {
    const nextErrors = validateCustomer(customer, agreementAccepted)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setSubmitState('error')
      return
    }

    const payload = {
      ...orderPayload,
      customer,
      delivery: {
        mode: deliveryMode,
        price: deliveryPrice,
        address: customer.address,
        entrance: customer.entrance,
        floor: customer.floor,
      },
      auth: {
        mode: authMode,
        status: authMode === 'guest' ? 'guest_checkout' : 'auth_required_later',
      },
      payment: {
        method: paymentMode,
        status: 'pending_after_tech_check',
        amount: finalTotal,
      },
      agreements: {
        personalData: agreementAccepted,
        offerStatus: 'draft_for_later',
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
    <div className="rp-checkout rp-checkout--polished rp-checkout--structured" role="dialog" aria-modal="true" aria-label="Оформление заказа">
      <button className="rp-checkout__overlay" type="button" aria-label="Закрыть оформление" onClick={onClose} />

      <aside className="rp-checkout__panel">
        <div className="rp-checkout__head rp-checkout__head--polished">
          <div>
            <p>Оформление заказа</p>
            <h2>{isSuccess ? 'Заявка создана' : 'Проверьте комплект и оставьте контакты'}</h2>
            <span>{isSuccess ? 'Мы зафиксировали параметры проекта и передадим их на проверку.' : 'Оплата будет доступна после проверки проекта технологом.'}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="rp-checkout__body rp-checkout__body--polished">
          {isSuccess ? (
            <section className="rp-checkout__success" role="status">
              <div className="rp-checkout__success-icon">✓</div>
              <h3>Заявка {orderId} создана</h3>
              <p>Следующий шаг — менеджер проверит деталировку, подтвердит стоимость и отправит ссылку на оплату.</p>
              <dl>
                <div><dt>Комплект</dt><dd>{formatPrice(project.price)} ₽</dd></div>
                <div><dt>Доставка</dt><dd>{deliveryPrice ? `${formatPrice(deliveryPrice)} ₽` : 'самовывоз'}</dd></div>
                <div><dt>Итого ориентир</dt><dd>{formatPrice(finalTotal)} ₽</dd></div>
                <div><dt>Контакт</dt><dd>{customer.phone}</dd></div>
              </dl>
            </section>
          ) : (
            <>
              <section className="rp-checkout__hero-total rp-checkout__hero-total--structured">
                <span>Ориентировочно к оплате после проверки</span>
                <strong>{formatPrice(finalTotal)} ₽</strong>
                <p>Комплект {formatPrice(project.price)} ₽ + доставка {deliveryPrice ? `${formatPrice(deliveryPrice)} ₽` : '0 ₽'}. Финальная стоимость будет подтверждена технологом.</p>
              </section>

              <CheckoutStep number="1" title="Заказ" text="Проверьте основные параметры комплекта перед оформлением.">
                <dl className="rp-checkout__summary rp-checkout__summary--compact">
                  {orderRows.map(([label, value]) => (
                    <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                  ))}
                </dl>
              </CheckoutStep>

              <CheckoutStep number="2" title="Контакты" text="Нужны только данные для связи. Авторизацию подключим отдельным этапом.">
                <div className="rp-checkout__fields rp-checkout__fields--polished">
                  <label className={errors.name ? 'has-error' : ''} htmlFor="checkout-name">
                    <span>Имя</span>
                    <input id="checkout-name" placeholder="Например, Денис" value={customer.name} onChange={(event) => updateCustomer('name', event.target.value)} {...getErrorProps('name', errors)} />
                    {errors.name && <small id="checkout-name-error">{errors.name}</small>}
                  </label>
                  <label className={errors.phone ? 'has-error' : ''} htmlFor="checkout-phone">
                    <span>Телефон</span>
                    <input id="checkout-phone" placeholder="+7 999 000-00-00" inputMode="tel" value={customer.phone} onChange={(event) => updateCustomer('phone', event.target.value)} {...getErrorProps('phone', errors)} />
                    {errors.phone && <small id="checkout-phone-error">{errors.phone}</small>}
                  </label>
                </div>
              </CheckoutStep>

              <CheckoutStep number="3" title="Доставка" text="Для MVP считаем доставку по Москве внутри МКАД как базовый сценарий.">
                <div className="rp-checkout__option-grid rp-checkout__option-grid--delivery" role="group" aria-label="Способ доставки">
                  <button className={deliveryMode === 'mkad' ? 'is-active' : ''} type="button" aria-pressed={deliveryMode === 'mkad'} onClick={() => setDeliveryMode('mkad')}>Москва МКАД<span>6 000 ₽</span></button>
                  <button className={deliveryMode === 'mo' ? 'is-active' : ''} type="button" aria-pressed={deliveryMode === 'mo'} onClick={() => setDeliveryMode('mo')}>МО / за МКАД<span>от 6 000 ₽ + км</span></button>
                  <button className={deliveryMode === 'pickup' ? 'is-active' : ''} type="button" aria-pressed={deliveryMode === 'pickup'} onClick={() => setDeliveryMode('pickup')}>Самовывоз<span>0 ₽</span></button>
                </div>
                <div className="rp-checkout__fields rp-checkout__fields--polished rp-checkout__fields--delivery">
                  <label className={errors.address ? 'has-error' : ''} htmlFor="checkout-address">
                    <span>Город / адрес доставки</span>
                    <input id="checkout-address" placeholder="Москва, район или адрес" value={customer.address} onChange={(event) => updateCustomer('address', event.target.value)} {...getErrorProps('address', errors)} />
                    {errors.address && <small id="checkout-address-error">{errors.address}</small>}
                  </label>
                  <label htmlFor="checkout-entrance">
                    <span>Подъезд</span>
                    <input id="checkout-entrance" placeholder="1" value={customer.entrance} onChange={(event) => updateCustomer('entrance', event.target.value)} />
                  </label>
                  <label htmlFor="checkout-floor">
                    <span>Этаж</span>
                    <input id="checkout-floor" placeholder="5" value={customer.floor} onChange={(event) => updateCustomer('floor', event.target.value)} />
                  </label>
                  <label htmlFor="checkout-comment">
                    <span>Комментарий</span>
                    <textarea id="checkout-comment" placeholder="Например: нужен подъём, сборка или консультация" rows="3" value={customer.comment} onChange={(event) => updateCustomer('comment', event.target.value)} />
                  </label>
                </div>
              </CheckoutStep>

              <CheckoutStep number="4" title="Оплата и согласие" text="Оплата не списывается сейчас: сначала проверка проекта и подтверждение цены.">
                <div className="rp-checkout__option-grid" role="group" aria-label="Способ оформления">
                  <button className={authMode === 'guest' ? 'is-active' : ''} type="button" aria-pressed={authMode === 'guest'} onClick={() => setAuthMode('guest')}>Без входа<span>Оформить по телефону</span></button>
                  <button className={authMode === 'login' ? 'is-active' : ''} type="button" aria-pressed={authMode === 'login'} onClick={() => setAuthMode('login')}>Войти позже<span>Под кабинет</span></button>
                </div>
                <div className="rp-checkout__option-grid rp-checkout__option-grid--pay" role="group" aria-label="Способ оплаты">
                  <button className={paymentMode === 'after-check' ? 'is-active' : ''} type="button" aria-pressed={paymentMode === 'after-check'} onClick={() => setPaymentMode('after-check')}>После проверки<span>Ссылка на оплату</span></button>
                  <button className={paymentMode === 'manager' ? 'is-active' : ''} type="button" aria-pressed={paymentMode === 'manager'} onClick={() => setPaymentMode('manager')}>Через менеджера<span>Согласовать вручную</span></button>
                </div>
                <label className={`rp-checkout__agreement ${errors.agreement ? 'has-error' : ''}`} htmlFor="checkout-agreement">
                  <input id="checkout-agreement" type="checkbox" checked={agreementAccepted} onChange={(event) => updateAgreement(event.target.checked)} aria-invalid={errors.agreement ? 'true' : 'false'} aria-describedby={errors.agreement ? 'checkout-agreement-error' : undefined} />
                  <span>Согласен на обработку заявки и понимаю, что цена предварительная до проверки технологом.</span>
                </label>
                {errors.agreement && <p id="checkout-agreement-error" className="rp-checkout__status is-error">{errors.agreement}</p>}
                <p className="rp-checkout__note">Публичную оферту, оплату и авторизацию подключим позже. Сейчас создаётся заявка с параметрами проекта.</p>
                {submitState === 'error' && <p className="rp-checkout__status is-error" role="status">Заполните обязательные поля или попробуйте ещё раз.</p>}
                {submitState === 'loading' && <p className="rp-checkout__status is-loading" role="status">Создаём заявку и готовим переход к оплате…</p>}
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