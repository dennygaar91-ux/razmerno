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

const successSteps = [
  ['1', 'Проверка технологом', 'Проверим размеры, материалы, фурнитуру и возможность производства.'],
  ['2', 'Подтверждение стоимости', 'Если потребуется, уточним доставку, сборку и нестандартные позиции.'],
  ['3', 'Оплата и запуск', 'После согласования отправим ссылку на оплату и запустим комплект в работу.'],
]

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

function CheckoutStep({ title, text, children }) {
  return (
    <section className="rp-checkout__step rp-checkout__step--focused">
      <div className="rp-checkout__step-head">
        <div>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function CheckoutProgress({ current }) {
  return (
    <div className="rp-checkout__progress" aria-label="Шаги оформления">
      <span className={current === 'review' ? 'is-active' : 'is-done'}>1. Проверьте заказ</span>
      <span className={current === 'contacts' ? 'is-active' : ''}>2. Контакты и доставка</span>
    </div>
  )
}

function getDeliveryPrice(deliveryMode, outsideMkadKm) {
  if (deliveryMode === 'pickup') return 0
  if (deliveryMode === 'mo') return 6000 + Math.max(0, Number(outsideMkadKm) || 0) * 75
  return 6000
}

export default function CheckoutDrawer({ open, project, summary, orderPayload, onClose }) {
  const [customer, setCustomer] = useState(initialCustomer)
  const [errors, setErrors] = useState({})
  const [submitState, setSubmitState] = useState('idle')
  const [checkoutStep, setCheckoutStep] = useState('review')
  const [deliveryMode, setDeliveryMode] = useState('mkad')
  const [outsideMkadKm, setOutsideMkadKm] = useState(0)
  const [assemblySelected, setAssemblySelected] = useState(false)
  const [paymentMode, setPaymentMode] = useState('after-check')
  const [agreementAccepted, setAgreementAccepted] = useState(true)
  const [orderId, setOrderId] = useState('')

  const deliveryPrice = getDeliveryPrice(deliveryMode, outsideMkadKm)
  const assemblyPrice = assemblySelected ? Math.round(project.price * 0.1 / 10) * 10 : 0
  const finalTotal = project.price + deliveryPrice + assemblyPrice

  const orderRows = useMemo(() => [
    ['Размер', `${project.dimensions.height} × ${project.dimensions.width} × ${project.dimensions.depth} мм`],
    ['Материал', `${project.material.body}, ${project.material.thickness}`],
    ['Кромка', project.material.edge],
    ['Фурнитура', `${project.material.handles} · ${project.material.hardware ?? 'Стандарт'}`],
    ['Наполнение', `${summary.shelves} полок · ${summary.drawers} ящиков · ${summary.rails} штанг`],
    ['Срок', '10–14 дней'],
  ], [project, summary])

  const checkoutTotals = [
    ['Комплект деталей', project.price],
    ['Доставка', deliveryPrice],
    ['Сборка', assemblyPrice],
  ]

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

  useEffect(() => {
    if (open) {
      setCheckoutStep('review')
      setErrors({})
      setSubmitState('idle')
      setOrderId('')
    }
  }, [open])

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

  function updateDeliveryMode(nextMode) {
    setDeliveryMode(nextMode)
    if (nextMode !== 'mo') setOutsideMkadKm(0)
    setSubmitState('idle')
  }

  function updateOutsideMkadKm(value) {
    const numericValue = Math.max(0, Math.min(250, Number(value) || 0))
    setOutsideMkadKm(numericValue)
    setSubmitState('idle')
  }

  function updateAssembly(value) {
    setAssemblySelected(value)
    setSubmitState('idle')
  }

  async function handleSubmit() {
    const nextErrors = validateCustomer(customer, agreementAccepted)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setCheckoutStep('contacts')
      setSubmitState('error')
      return
    }

    const payload = {
      ...orderPayload,
      customer,
      delivery: {
        mode: deliveryMode,
        price: deliveryPrice,
        outsideMkadKm: deliveryMode === 'mo' ? outsideMkadKm : 0,
        basePrice: deliveryMode === 'pickup' ? 0 : 6000,
        pricePerKm: deliveryMode === 'mo' ? 75 : 0,
        address: customer.address,
        entrance: customer.entrance,
        floor: customer.floor,
      },
      services: {
        assembly: {
          selected: assemblySelected,
          rate: 0.1,
          price: assemblyPrice,
        },
      },
      auth: {
        mode: 'guest',
        status: 'guest_checkout',
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
    <div className="rp-checkout rp-checkout--polished rp-checkout--structured rp-checkout--two-step" role="dialog" aria-modal="true" aria-label="Оформление заказа">
      <button className="rp-checkout__overlay" type="button" aria-label="Закрыть оформление" onClick={onClose} />

      <aside className="rp-checkout__panel">
        <div className="rp-checkout__head rp-checkout__head--polished">
          <div>
            <p>Оформление заказа</p>
            <h2>{isSuccess ? 'Заявка создана' : checkoutStep === 'review' ? 'Проверьте заказ' : 'Контакты и доставка'}</h2>
            <span>{isSuccess ? 'Мы зафиксировали параметры проекта и передадим их на проверку.' : 'Оплата не списывается сейчас: финальную стоимость подтвердит технолог.'}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="rp-checkout__body rp-checkout__body--polished">
          {isSuccess ? (
            <section className="rp-checkout__success rp-checkout__success--final" role="status">
              <div className="rp-checkout__success-icon">✓</div>
              <span className="rp-checkout__success-kicker">Заявка принята</span>
              <h3>{orderId ? `Заявка ${orderId} создана` : 'Заявка создана'}</h3>
              <p>Мы получили параметры шкафа. Оплата пока не списывается: сначала технолог проверит проект, подтвердит стоимость и только после этого менеджер отправит следующий шаг.</p>

              <div className="rp-checkout__success-total">
                <span>Ориентир по заявке</span>
                <b>{formatPrice(finalTotal)} ₽</b>
                <small>Финальная сумма может измениться после проверки материалов, доставки и сборки.</small>
              </div>

              <dl>
                <div><dt>Комплект</dt><dd>{formatPrice(project.price)} ₽</dd></div>
                <div><dt>Доставка</dt><dd>{deliveryPrice ? `${formatPrice(deliveryPrice)} ₽` : 'самовывоз'}</dd></div>
                <div><dt>Сборка</dt><dd>{assemblySelected ? `${formatPrice(assemblyPrice)} ₽` : 'не выбрана'}</dd></div>
                <div><dt>Контакт</dt><dd>{customer.phone}</dd></div>
                <div><dt>Адрес</dt><dd>{customer.address}</dd></div>
              </dl>

              <div className="rp-checkout__success-next">
                {successSteps.map(([num, title, text]) => (
                  <div key={num}>
                    <b>{num}</b>
                    <span>{title}</span>
                    <small>{text}</small>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <>
              <CheckoutProgress current={checkoutStep} />

              <section className="rp-checkout__hero-total rp-checkout__hero-total--structured">
                <span>Ориентировочно к оплате после проверки</span>
                <strong>{formatPrice(finalTotal)} ₽</strong>
                <p>Комплект {formatPrice(project.price)} ₽ + доставка {deliveryPrice ? `${formatPrice(deliveryPrice)} ₽` : '0 ₽'}{assemblySelected ? ` + сборка ${formatPrice(assemblyPrice)} ₽` : ''}.</p>
              </section>

              <section className="rp-checkout__total-breakdown" aria-label="Состав предварительной суммы">
                {checkoutTotals.map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <b>{value ? `${formatPrice(value)} ₽` : '0 ₽'}</b>
                  </div>
                ))}
              </section>

              {checkoutStep === 'review' ? (
                <CheckoutStep title="Параметры заказа" text="Проверьте главное без длинной формы. Контакты заполним на следующем шаге.">
                  <dl className="rp-checkout__summary rp-checkout__summary--compact">
                    {orderRows.map(([label, value]) => (
                      <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                    ))}
                  </dl>
                  <p className="rp-checkout__note">Цена предварительная. Перед оплатой технолог проверит размеры, фурнитуру, присадку и доступность материалов.</p>
                </CheckoutStep>
              ) : (
                <CheckoutStep title="Контакты и доставка" text="Минимум обязательных полей: имя, телефон и адрес/город доставки.">
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

                  <div className="rp-checkout__option-grid rp-checkout__option-grid--delivery" role="group" aria-label="Способ доставки">
                    <button className={deliveryMode === 'mkad' ? 'is-active' : ''} type="button" aria-pressed={deliveryMode === 'mkad'} onClick={() => updateDeliveryMode('mkad')}>Москва МКАД<span>6 000 ₽</span></button>
                    <button className={deliveryMode === 'mo' ? 'is-active' : ''} type="button" aria-pressed={deliveryMode === 'mo'} onClick={() => updateDeliveryMode('mo')}>МО / за МКАД<span>6 000 ₽ + 75 ₽/км</span></button>
                    <button className={deliveryMode === 'pickup' ? 'is-active' : ''} type="button" aria-pressed={deliveryMode === 'pickup'} onClick={() => updateDeliveryMode('pickup')}>Самовывоз<span>0 ₽</span></button>
                  </div>

                  {deliveryMode === 'mo' && (
                    <label className="rp-checkout__distance" htmlFor="checkout-distance">
                      <span>Км за МКАД</span>
                      <input id="checkout-distance" type="number" min="0" max="250" value={outsideMkadKm} onChange={(event) => updateOutsideMkadKm(event.target.value)} />
                      <small>Доставка: 6 000 ₽ + {outsideMkadKm} км × 75 ₽ = {formatPrice(deliveryPrice)} ₽</small>
                    </label>
                  )}

                  <div className="rp-checkout__service-card">
                    <div>
                      <span>Дополнительная услуга</span>
                      <b>Сборка мебели</b>
                      <small>+10% от стоимости комплекта: {formatPrice(assemblyPrice || Math.round(project.price * 0.1 / 10) * 10)} ₽</small>
                    </div>
                    <button className={assemblySelected ? 'is-active' : ''} type="button" aria-pressed={assemblySelected} onClick={() => updateAssembly(!assemblySelected)}>{assemblySelected ? 'Выбрана' : 'Добавить'}</button>
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

                  <div className="rp-checkout__option-grid rp-checkout__option-grid--pay" role="group" aria-label="Способ оплаты">
                    <button className={paymentMode === 'after-check' ? 'is-active' : ''} type="button" aria-pressed={paymentMode === 'after-check'} onClick={() => setPaymentMode('after-check')}>После проверки<span>Ссылка на оплату</span></button>
                    <button className={paymentMode === 'manager' ? 'is-active' : ''} type="button" aria-pressed={paymentMode === 'manager'} onClick={() => setPaymentMode('manager')}>Через менеджера<span>Согласовать вручную</span></button>
                  </div>

                  <label className={`rp-checkout__agreement ${errors.agreement ? 'has-error' : ''}`} htmlFor="checkout-agreement">
                    <input id="checkout-agreement" type="checkbox" checked={agreementAccepted} onChange={(event) => updateAgreement(event.target.checked)} aria-invalid={errors.agreement ? 'true' : 'false'} aria-describedby={errors.agreement ? 'checkout-agreement-error' : undefined} />
                    <span>Согласен на обработку заявки и понимаю, что цена предварительная до проверки технологом.</span>
                  </label>
                  {errors.agreement && <p id="checkout-agreement-error" className="rp-checkout__status is-error">{errors.agreement}</p>}
                  {submitState === 'error' && <p className="rp-checkout__status is-error" role="status">Заполните обязательные поля или попробуйте ещё раз.</p>}
                  {submitState === 'loading' && <p className="rp-checkout__status is-loading" role="status">Создаём заявку…</p>}
                </CheckoutStep>
              )}
            </>
          )}
        </div>

        <div className="rp-checkout__foot rp-checkout__foot--polished">
          {isSuccess ? (
            <button type="button" className="rp-checkout__secondary" onClick={onClose}>Закрыть</button>
          ) : checkoutStep === 'review' ? (
            <>
              <button type="button" className="rp-checkout__secondary" onClick={onClose}>Вернуться к проекту</button>
              <button type="button" className="rp-checkout__primary" onClick={() => setCheckoutStep('contacts')}>Продолжить к контактам</button>
            </>
          ) : (
            <>
              <button type="button" className="rp-checkout__secondary" onClick={() => setCheckoutStep('review')}>Назад к заказу</button>
              <button type="button" className="rp-checkout__primary" disabled={isSubmitting} onClick={handleSubmit}>{isSubmitting ? 'Создаём заявку…' : 'Создать заявку'}</button>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
