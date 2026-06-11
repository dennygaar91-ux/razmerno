# Production preflight

Перед деплоем выполнить:

```bash
npm install
npm run production:preflight
```

## Что проверяется

- валидность config/manifest;
- static QA;
- отсутствие `/server`;
- чистота корня от stage/build логов;
- отсутствие runtime-импортов legacy-модулей;
- normal URL routing `/configurator`;
- production env guard;
- order security safeguards;
- integrity прайса;
- typecheck frontend/API;
- финальные smoke-тесты pricing/layout/three;
- production build;
- `npm audit --audit-level=moderate`.

## Strict env mode

В CI/Vercel можно дополнительно запускать:

```bash
CHECK_ENV_MODE=production npm run check:production-env
```

Это проверит реальные production env-переменные.
