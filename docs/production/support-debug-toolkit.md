# Support debug toolkit

## Для каждой проблемы спрашивать

1. Что пользователь делал?
2. В какое время?
3. Был ли номер заявки?
4. Какой телефон/email вводил? Не вставлять в публичные логи.
5. Что было на экране?
6. Есть ли requestId из ответа/API?

## Где смотреть

### API health

```text
https://razmerno.ru/api/health
```

### Diagnostics

```bash
curl -H "Authorization: Bearer $ADMIN_API_KEY" https://razmerno.ru/api/diagnostics
```

### Admin

```text
https://razmerno.ru/admin
```

### Smoke

```powershell
$env:SMOKE_BASE_URL="https://razmerno.ru"
$env:ADMIN_API_KEY="<ADMIN_API_KEY>"
npm run smoke:deploy
```

## Request id

Каждый API ответ должен содержать:

```text
X-Request-Id
```

Этот id использовать для поиска в Vercel logs.

## PII rule

Не копировать в отчёты:

- полный телефон;
- email;
- адрес;
- комментарий клиента;
- service role key;
- admin key.
