# Incident response — Размерно MVP

## 1. Определить тип инцидента

### Order flow broken

Симптомы:

- клиент не может отправить заявку;
- `/api/orders` возвращает 4xx/5xx;
- менеджеру не приходит письмо.

Проверить:

```powershell
$env:SMOKE_BASE_URL="https://razmerno.ru"
$env:ADMIN_API_KEY="<ADMIN_API_KEY>"
npm run smoke:deploy
```

Открыть:

```text
https://razmerno.ru/api/health
```

### Admin broken

Симптомы:

- `/admin` не открывается;
- заявки не грузятся;
- статус не меняется.

Проверить:

```text
/api/diagnostics
/api/admin/orders?limit=5
/api/admin/status-events?limit=20
```

### Email broken

Симптомы:

- заявка сохраняется, но письмо не приходит;
- customer email failed, manager email OK.

Проверить:

- `RESEND_API_KEY`;
- `MAIL_FROM`;
- verified domain in Resend;
- `ORDER_MANAGER_EMAIL`.

## 2. Быстрые действия

1. Проверить `/api/health`.
2. Проверить Vercel logs по `requestId`.
3. Проверить Supabase migrations.
4. Проверить Resend dashboard.
5. Если admin key скомпрометирован — заменить `ADMIN_API_KEY`.
6. Если клиентский `/admin` открыт лишним людям — заменить `ADMIN_PASSWORD_HASH`.

## 3. Rollback

```powershell
git log --oneline -5
git revert <bad_commit_hash>
git push origin main
```

Supabase migrations additive — обычно не откатывать.

## 4. Что логировать в заметки

- дата/время;
- requestId;
- endpoint;
- статус ответа;
- что сделал клиент;
- была ли сохранена заявка;
- пришло ли письмо менеджеру;
- была ли ошибка в Supabase/Resend/Vercel.

## 5. Stop conditions

Остановить рекламу/трафик, если:

- заявки не сохраняются;
- менеджеру не приходят письма;
- `/api/admin/orders` открыт без ключа;
- `/api/health` показывает missing env;
- 5xx держится больше 10 минут.
