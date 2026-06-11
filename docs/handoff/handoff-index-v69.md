# Размерно — handoff index v69

## Основные документы

- `docs/handoff/technical-handoff-v69.md` — технический handoff по v53–v68.
- `docs/handoff/commands-checklist-v69.md` — команды для локальной проверки.
- `docs/handoff/visual-review-checklist-v69.md` — что проверять глазами.
- `docs/audit/css-usage-report-v68.md` — CSS usage report.
- `docs/audit/css-usage-report-v68.json` — machine-readable CSS report.
- `docs/qa/browser-smoke-v67.md` — browser smoke инструкция.
- `tests/browser/configurator.spec.ts` — Playwright smoke spec.

## Быстрый старт

```bash
npm install
npm run typecheck
npm run build
npm run test:browser-smoke-static
```

## Browser smoke

```bash
npx playwright install chromium
npm run test:browser-smoke
npm run test:browser-smoke:mobile
```

## Самые важные проверки глазами

1. `/` — равнозначность шкаф / тумба / комод.
2. `/configurator` — 3D/2D, OrbitControls, mobile.
3. `/measurements` — читаемость линий замеров.
4. `/materials` — палитра 7 декоров.
5. `/assembly` — комплект и порядок сборки.
