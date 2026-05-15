const DIMENSION_LIMITS = {
  height: { min: 200, max: 2800 },
  width: { min: 400, max: 3000 },
  depth: { min: 300, max: 800 },
}

function validationError(fields) {
  const error = new Error('Проект содержит ошибки')
  error.status = 400
  error.code = 'VALIDATION_ERROR'
  error.fields = fields
  return error
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

export function validateProjectPayload(payload) {
  const fields = {}

  if (!payload || typeof payload !== 'object') {
    throw validationError({ payload: 'Некорректный payload' })
  }

  const dimensions = payload.dimensions ?? {}

  Object.entries(DIMENSION_LIMITS).forEach(([key, limits]) => {
    const value = dimensions[key]
    if (!isNumber(value) || value < limits.min || value > limits.max) {
      fields[`dimensions.${key}`] = `Значение должно быть от ${limits.min} до ${limits.max} мм`
    }
  })

  if (!Number.isInteger(payload.sections) || payload.sections < 1 || payload.sections > 6) {
    fields.sections = 'Количество секций должно быть от 1 до 6'
  }

  if (!Array.isArray(payload.filling) || payload.filling.length !== payload.sections) {
    fields.filling = 'Наполнение должно соответствовать количеству секций'
  } else {
    payload.filling.forEach((section, index) => {
      if (!Number.isInteger(section.shelves) || section.shelves < 0 || section.shelves > 8) {
        fields[`filling.${index}.shelves`] = 'Количество полок должно быть от 0 до 8'
      }

      if (!Number.isInteger(section.drawers) || section.drawers < 0 || section.drawers > 4) {
        fields[`filling.${index}.drawers`] = 'Количество ящиков должно быть от 0 до 4'
      }

      if (typeof section.rail !== 'boolean') {
        fields[`filling.${index}.rail`] = 'Поле rail должно быть boolean'
      }
    })
  }

  if (!payload.material || typeof payload.material !== 'object') {
    fields.material = 'Материал обязателен'
  }

  if (Object.keys(fields).length > 0) {
    throw validationError(fields)
  }

  return payload
}

export function validateOrderPayload(payload) {
  validateProjectPayload(payload)

  const fields = {}
  const customer = payload.customer ?? {}

  if (!customer.name || customer.name.trim().length < 2) {
    fields['customer.name'] = 'Укажите имя'
  }

  const phoneDigits = String(customer.phone ?? '').replace(/\D/g, '')
  if (phoneDigits.length < 10) {
    fields['customer.phone'] = 'Укажите телефон для связи'
  }

  if (!customer.address || customer.address.trim().length < 3) {
    fields['customer.address'] = 'Укажите город или адрес доставки'
  }

  if (Object.keys(fields).length > 0) {
    throw validationError(fields)
  }

  return payload
}
