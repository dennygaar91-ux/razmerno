# Размерно — CSS usage report stage v68

## Что сделано

Выполнен безопасный этап после v67: добавлен CSS usage report без удаления CSS и без визуальных изменений.

## Изменённые файлы

- `scripts/css-usage-report.mjs`
- `scripts/browser-smoke-static.mjs`
- `docs/audit/css-usage-report-v68.md`
- `docs/audit/css-usage-report-v68.json`
- `docs/audit/css-usage-report-stage-v68.md`
- `package.json`

## Добавленная команда

```bash
npm run report:css-usage
```

## Что делает отчёт

Скрипт анализирует:

- все CSS-файлы в `src`;
- TS/TSX/JS/MJS в `src`, `tests`, `scripts`;
- уникальные CSS-классы;
- exact-used классы;
- likely dynamic/modifier классы;
- potential unused классы;
- дубли классов между CSS-файлами;
- классы с version tags `v53–v67`;
- stage marker comments.

## Итоги отчёта

```text
CSS files scanned: 5
Source/test/script files scanned: 464
Unique CSS classes: 412
Exact-used classes: 352
Likely dynamic/modifier classes: 14
Potential unused classes: 46
Duplicate class names across CSS files: 30
```

## Размеры CSS

```text
src/styles/constructor.css — 106.49 KB / 347 classes
src/index.css — 13.36 KB / 56 classes
src/styles/header.css — 7.15 KB / 19 classes
src/styles/info-pages.css — 3.22 KB / 28 classes
src/styles/base.css — 1.04 KB / 1 class
```

## Главный вывод

Удалять CSS сейчас нельзя. Отчёт — только аудит.

Основной риск: `constructor.css` большой, но он содержит активный слой конструктора, Three.js/SVG scene, страницы v53–v67 и много modifier-классов. Без browser/pixel review удаление может сломать визуал.

## Safe cleanup plan

1. Не удалять CSS до browser review.
2. После скриншотов разметить `potential-unused` как:
   - keep;
   - delete;
   - merge;
   - unknown.
3. Чистить только секционно:
   - home;
   - measurements;
   - materials;
   - assembly;
   - constructor scene;
   - constructor sidebar;
   - checkout.
4. После каждого небольшого удаления запускать:
   - `npm run report:css-usage`
   - `npm run report:css-inventory`
   - `npm run report:visual-qa`
   - `npm run test:browser-smoke-static`
   - `npm run typecheck`
   - `npm run build`

## Что не трогалось

- визуальные стили не удалялись;
- CSS не переименовывался;
- layout не менялся;
- backend/API не трогались;
- pricing/order/checkout logic не трогались;
- Three.js runtime не менялся.

## QA

Пройдены проверки:

- `npm run report:css-usage`
- `npm run test:browser-smoke-static`
- `npm run test:constructor-three`
- `npm run test:constructor-three-safety`
- `npm run check:constructor-architecture`
- `npm run check:static-pages-architecture`
- `npm run check:no-static-html-pages`
- `npm run report:react-components`
- `npm run report:visual-qa`
- `npm run report:css-inventory`
- `npm run test:constructor-store`
- `npm run test:constructor-flow`
- `npm run test:constructor-pii-order`
- `npm run test:constructor-draft`
- `npm run test:constructor-payload`
- `npm run test:production-preview`
- `npm run typecheck`
- `npm run build`
- `npm run check:no-server`
- `npm run check:normal-urls`
- `npm run check:root-docs`
- `npm run check:legacy-runtime-imports`
- `npm run test:pricing-engine`
- `npm run test:delivery`
- `npm run test:pricing-final`

## Следующий безопасный этап

Можно сделать `v69 — technical handoff and review pack`:

- один итоговый документ по архитектуре v53–v68;
- инструкция как проверять локально;
- список команд;
- карта изменённых страниц;
- known risks;
- что обязательно проверить глазами.
