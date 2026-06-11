# Admin access MVP

## Что сделано

Route `/admin` закрыт временным client-side access gate.

## Env

Нужно задать:

```env
ADMIN_PASSWORD_HASH=<длинный случайный ключ минимум 12 символов>
```

## Ограничение

Это не полноценная production-auth. Переменные `VITE_*` попадают в frontend bundle, поэтому такой gate защищает только от случайного открытия route, но не от целенаправленного доступа.

## Что нужно для production

- server-side auth;
- role-based access;
- Supabase Auth или отдельная admin auth;
- audit log входов;
- запрет индексации `/admin`.
