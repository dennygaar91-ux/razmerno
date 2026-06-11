# Admin Auth v2

## Что изменилось

`/admin` больше не использует `ADMIN_PASSWORD_HASH` как основной ключ доступа.

Теперь flow такой:

1. Администратор вводит пароль на `/admin`.
2. Frontend отправляет пароль на `POST /api/admin/login`.
3. Сервер сравнивает пароль с `ADMIN_PASSWORD_HASH`.
4. Сервер выдаёт signed session token.
5. Frontend хранит token в `sessionStorage`.
6. Admin API принимает Bearer session token.

## Required env

```env
ADMIN_API_KEY=<long server signing secret min 24 chars>
ADMIN_PASSWORD_HASH=<admin password hash min 12 chars>
```

## Optional frontend env

```env
VITE_ADMIN_LOGIN_API_URL=/api/admin/login
```

## Smoke

Server scripts могут продолжать использовать:

```env
ADMIN_API_KEY=<server key>
```

Frontend `/admin` использует пароль `ADMIN_PASSWORD_HASH`, но сам пароль не должен попадать в bundle.

## Ограничение

Session token хранится в `sessionStorage`. Это лучше, чем frontend static key, но полноценный production-auth должен быть на HttpOnly cookie / Supabase Auth / RBAC.
