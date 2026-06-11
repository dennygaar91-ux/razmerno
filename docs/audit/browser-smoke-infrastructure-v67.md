# Размерно — browser smoke infrastructure v67

## Что сделано

Продолжены безопасные задачи после Three.js safety hardening v66: добавлена инфраструктура browser-smoke проверок без pixel-perfect assertions.

## Изменённые файлы

- `tests/browser/configurator.spec.ts`
- `scripts/browser-smoke-static.mjs`
- `docs/qa/browser-smoke-v67.md`
- `package.json`

## Что обновлено

### Playwright spec

Файл `tests/browser/configurator.spec.ts` переписан под актуальный интерфейс после этапов v53–v66.

Покрывает:

1. `/` открывается и ведёт к `/configurator`.
2. `/measurements`, `/materials`, `/assembly` открываются через normal URLs.
3. `/configurator` показывает актуальные элементы конструктора.
4. Переключатели `3D / 2D` доступны.
5. Виды модели доступны:
   - `Свободно`
   - `Спереди`
   - `Сбоку`
   - `Сверху`
6. Клик по `2D` переводит сцену в `.rzm-constructor-canvas--svg-fallback`.
7. Клик по видам добавляет:
   - `.rzm-constructor-canvas--front`
   - `.rzm-constructor-canvas--side`
   - `.rzm-constructor-canvas--top`
8. Wizard доходит до checkout.
9. Пустая заявка показывает обязательные поля/согласие.
10. Mobile viewport 390×844 открывает конструктор без smoke-падения.

## Static browser-smoke

Добавлен script:

```bash
npm run test:browser-smoke-static
```

Он не запускает браузер. Он проверяет:

- актуальные normal routes в `App.tsx`;
- что Playwright spec содержит актуальные routes;
- что spec содержит mobile viewport 390×844;
- что есть `3D / 2D` switch;
- что есть view switch;
- что scene canvas содержит WebGL и SVG fallback classes;
- что checkout декомпозирован на карточки.

## Browser commands

Добавлены scripts:

```bash
npm run test:browser-smoke
npm run test:browser-smoke:mobile
```

Они требуют установленный Playwright browser.

## QA-документация

Добавлен файл:

```text
docs/qa/browser-smoke-v67.md
```

В нём описано:

- назначение smoke-проверок;
- команды запуска;
- что покрывается;
- что не покрывается;
- что проверять после браузерного запуска.

## Важно

Этот этап не запускал Playwright browser tests, потому что в текущей среде браузерная проверка может зависеть от установленных browser binaries. Вместо этого добавлена и прогнана статическая проверка browser-smoke инфраструктуры.

## Что не трогалось

- backend/API;
- pricing engine;
- order flow implementation;
- checkout logic;
- production preview adapter;
- admin;
- Supabase/API/env;
- Three.js визуальные параметры;
- SVG/3D сцена визуально.

## QA

Пройдены проверки:

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

CSS usage report v68:

- собрать список классов, добавленных v53–v67;
- найти потенциальные дубли;
- не удалять CSS без визуальной проверки;
- подготовить safe cleanup plan.
