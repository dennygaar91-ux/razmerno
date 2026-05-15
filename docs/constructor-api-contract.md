# API contract конструктора Размерно

Документ фиксирует первичный контракт между frontend-конструктором, backend-расчётом и будущим модулем оформления заказа.

## 1. Создание заявки

```http
POST /api/constructor/orders
Content-Type: application/json
```

### Request

```json
{
  "productType": "cabinet_wardrobe",
  "dimensions": {
    "height": 2400,
    "width": 1800,
    "depth": 600
  },
  "sections": 3,
  "activeSection": 1,
  "filling": [
    {
      "section": 1,
      "shelves": 4,
      "drawers": 2,
      "rail": false
    }
  ],
  "material": {
    "id": "sonoma",
    "title": "ЛДСП Дуб Сонома",
    "thickness": "16 мм",
    "edge": "ПВХ 2 мм в цвет",
    "opening": "С ручками",
    "openingId": "handles"
  },
  "summary": {
    "shelves": 8,
    "drawers": 2,
    "rails": 1,
    "elements": 11
  },
  "estimate": {
    "total": 24350,
    "currency": "RUB",
    "breakdown": {
      "material": 14500,
      "cutting": 2340,
      "edging": 1980,
      "hardware": 3680,
      "packaging": 850
    }
  },
  "production": {
    "leadTime": "10–14 дней",
    "city": "Москва",
    "deliveryFrom": 6000
  },
  "customer": {
    "name": "Денис",
    "phone": "+7 999 000-00-00",
    "address": "Москва",
    "comment": "Нужна консультация"
  },
  "auth": {
    "mode": "guest",
    "status": "guest_checkout"
  },
  "payment": {
    "method": "online",
    "status": "pending"
  }
}
```

### Response 201

```json
{
  "ok": true,
  "orderId": "RZM-123456",
  "status": "created",
  "payment": {
    "status": "pending",
    "paymentUrl": "https://payment.example/checkout/RZM-123456"
  },
  "managerReviewRequired": true
}
```

### Response 400

```json
{
  "ok": false,
  "code": "VALIDATION_ERROR",
  "message": "Проект содержит ошибки",
  "fields": {
    "dimensions.depth": "Глубина должна быть от 300 до 800 мм"
  }
}
```

## 2. Расчёт стоимости

```http
POST /api/constructor/estimate
Content-Type: application/json
```

### Request

Отправляется проект без блока `customer`, `auth`, `payment`.

### Response 200

```json
{
  "ok": true,
  "estimate": {
    "total": 24350,
    "currency": "RUB",
    "breakdown": {
      "material": 14500,
      "cutting": 2340,
      "edging": 1980,
      "hardware": 3680,
      "packaging": 850
    }
  },
  "warnings": [
    "Для штанги рекомендуем глубину от 520 мм"
  ]
}
```

## 3. Сохранение проекта пользователя

```http
POST /api/constructor/projects
Content-Type: application/json
```

### Response 201

```json
{
  "ok": true,
  "projectId": "PRJ-123456",
  "updatedAt": "2026-05-15T19:00:00.000Z"
}
```

## 4. Загрузка проекта пользователя

```http
GET /api/constructor/projects/{projectId}
```

### Response 200

```json
{
  "ok": true,
  "project": {
    "productType": "cabinet_wardrobe",
    "dimensions": {
      "height": 2400,
      "width": 1800,
      "depth": 600
    },
    "sections": 3,
    "filling": []
  }
}
```

## 5. Производственные правила MVP

Frontend может показывать подсказки, но backend должен быть источником истины.

Минимальные правила:

- высота шкафа: 200–2800 мм;
- ширина: 400–3000 мм;
- глубина: 300–800 мм;
- количество секций: 1–6;
- штанга рекомендована при глубине от 520 мм;
- полки: ориентир минимум 200 мм между полками;
- ящики: фасад от 200 мм;
- backend возвращает warnings и validation errors независимо от frontend-проверок.

## 6. Что важно для backend

- Не доверять цене с frontend.
- Пересчитывать смету на backend.
- Хранить исходный project payload.
- Хранить финальную backend-смету отдельно.
- Отдельно фиксировать customer, payment, order status.
- В будущем добавить экспорт JSON для БАЗИС/worker.
