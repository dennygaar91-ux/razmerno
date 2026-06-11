# Stage 05 — Constructor shell

## Цель
Убрать лендинговую структуру из активного 3D-конструктора и собрать рабочий shell под 3D-first сценарий без изменения pricing/order flow и без глубокой переработки UX шагов.

## Выполнено

### 1. Compact constructor header
- `ConstructorHeader` получил режим `variant="workspace"`.
- В активной `Constructor3DPage` используется workspace header.
- В workspace header удалена лендинговая nav и CTA `Собрать шкаф`.
- Добавлены: логотип, статус текущего шага, статус стоимости, кнопка `Сбросить`, ссылка `Выйти на сайт`.
- Legacy `ConstructorPage` продолжает использовать обычный landing header через default variant.

### 2. Stepper над сценой
- Stagebar оставлен над рабочей областью и теперь содержит stepper + компактный статус сцены.
- Убрано дублирование верхнего price chip из stagebar.
- Price оставлен в drawer footer рядом с CTA.

### 3. Desktop layout shell
- Добавлен Stage 05 marker `data-stage="STAGE05"`.
- Основной shell получил классы `rzm-3d-shell--stage05`, `rzm-3d-stagebar--stage05`.
- Панель настроек расширена до 360–420 px.
- Сцена получила больше пространства.
- Sticky offsets адаптированы под compact constructor header.

### 4. Scene chrome simplification
- Toolbar переименован в пользовательском тексте из `Реалистичный 3D preview` в `Рабочая сцена`.
- Scene info вынесен в компактный floating status внизу сцены.
- Top price chip скрыт для Stage 05.

### 5. CTA semantics
- Основная кнопка больше не использует generic `Далее`.
- По шагам:
  - Размеры → `Перейти к наполнению`.
  - Наполнение → `Выбрать материалы`.
  - Материалы → `Перейти к заявке`.
  - Заявка → существующая логика отправки/валидации.

### 6. Guard
- Добавлен `scripts/check-stage05-constructor-shell.mjs`.
- Добавлен script `npm run check:stage05-constructor-shell`.
- Guard проверяет workspace header, отсутствие лендинговой nav в active branch, stepper above scene, price in drawer footer и stage-specific CTA labels.

## Не делалось намеренно
- Не менялась бизнес-логика цены.
- Не менялся order flow.
- Не менялась логика 3D selection/filling.
- Не делался глубокий CSS purge.
- Не удалялись legacy routes/files.
- Не начинался Stage 6.

## Риски
- Средний: Playwright browser E2E не подтверждён из-за отсутствующего Chromium executable в среде.
- Средний: Stage 05 меняет shell визуально, но не является финальной дизайн-системой. Stage 6 всё ещё нужен для разведения ролей компонентов.
- Низкий: CSS добавлен override-слоем Stage 05, без удаления старых Q/N слоёв. Это безопаснее сейчас, но позже потребуется cleanup.

## Проверки
Успешно:
- `npm install --no-audit --no-fund`
- `npm run typecheck`
- `npm run build`
- `npm run qa:static`
- `npm run validate:config`
- `npm run check:pre-stage3-debt`
- `npm run check:stage03-three-runtime-stability`
- `npm run check:stage04-2d-fallback`
- `npm run check:stage05-constructor-shell`
- `npm run test:constructor-three-safety`
- `npm run test:constructor-three`
- `npm run test:browser-smoke-static`
- `npm run test:ui-e2e`
- `npm run test:pricing-final`
- `npm run test:three-final`
- `npm run test:geometry`
- `npm run test:layout-state`
- `npm run test:compartment-ui`
- `npm run test:three-layout-markers`

Неуспешно из-за среды:
- `npm run test:constructor3d-e2e` — Playwright Chromium executable не установлен.

## Изменённые файлы
- `src/static-pages/Constructor3DPage.tsx`
- `src/static-pages/constructor/components/ConstructorHeader.tsx`
- `src/styles/constructor3d.css`
- `scripts/browser-smoke-static.mjs`
- `scripts/check-stage05-constructor-shell.mjs`
- `package.json`
- `docs/audit/STAGE_05_CONSTRUCTOR_SHELL_REPORT.md`
