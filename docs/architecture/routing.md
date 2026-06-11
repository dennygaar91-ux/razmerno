# Routing

## Решение

MVP использует normal URL для конструктора:

```txt
/configurator
```

Старые hash-ссылки сохраняются через compatibility redirect:

```txt
#/configurator → /configurator
```

## Vercel

`vercel.json` содержит rewrites:

```json
{
  "rewrites": [
    { "source": "/configurator", "destination": "/index.html" },
    { "source": "/configurator/(.*)", "destination": "/index.html" }
  ]
}
```

## Почему так

- `/configurator` понятнее пользователю;
- путь лучше для SEO/аналитики;
- Telegram/VK/мессенджеры корректнее отображают ссылку;
- hash-routing оставлен только как обратная совместимость.
