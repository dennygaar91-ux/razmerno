# Bundle budget

## Зачем

Vite предупреждает, если chunk больше 500 KB после minification. Для проекта это ожидаемо из-за Three.js, но предупреждение нельзя игнорировать полностью.

## Текущий подход

Добавлен guard:

```bash
npm run check:bundle-budget
```

Он проверяет `dist/assets/*.js` после build.

## Пороги

По умолчанию:

```txt
BUNDLE_WARN_JS_KB=500
BUNDLE_MAX_JS_KB=800
```

- `warn` — фиксирует крупный chunk, но не валит build.
- `max` — валит проверку.

## Почему max 800 KB

`three-vendor` и основной 3D chunk могут быть крупными. В MVP это приемлемо, потому что configurator lazy-loaded и лендинг не должен сразу грузить Three.js.

## Что делать дальше

Если chunk приблизится к 800 KB:

1. Проверить `npm run report:bundle`.
2. Отложить debug/development chunks.
3. Проверить, не попали ли тестовые/legacy-модули в runtime.
4. Разделить 3D-viewer, geometry и debug panel на дополнительные lazy chunks.
5. Рассмотреть более строгий manualChunks.
