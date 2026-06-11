# Stage R10 — финальный UX/code аудит конструктора после R2–R9

Дата: 2026-06-09
Архив-источник: `razmerno-constructor-stageR9-scene-price-state-cleanup.zip`

## 1. Контекст этапа

Этап R10 — контрольный аудит без функциональных правок. Цель: проверить текущее состояние конструктора после возврата от преждевременной production/pricing-ветки к core UX-сценарию R2–R9.

Проверялось:

- основной маршрут конструктора;
- сценарий `Размеры → Наполнение → Материалы → Заявка`;
- состояние store/rules/actions;
- связь панели и сцены;
- честность цены в scene и checkout;
- validation UX;
- checkout snapshot;
- mobile CSS-структура;
- наличие фейковых fallback-значений;
- build/typecheck/профильные тесты.

Код на этапе R10 не менялся.

---

## 2. Что найдено в проекте

### 2.1. Активный конструктор

Активный конструктор по-прежнему находится в:

```txt
src/static-pages/ConstructorPage.tsx
src/static-pages/constructor/
```

Ключевые рабочие блоки:

```txt
ConstructorPage.tsx
ConstructorSidebar.tsx
ConstructorScene.tsx
SizesStep.tsx
FillStep.tsx
MaterialsStep.tsx
ConstructorCheckoutLayout.tsx
CheckoutProjectReviewCard.tsx
constructorStore.ts
projectRules.ts
constructorPayload.ts
```

### 2.2. Core-сценарий конструктора

Сценарий стал значительно лучше после R2–R9:

1. **Размеры** — пользователь вводит ширину, высоту, глубину и количество секций.
2. **Точная настройка размеров** — при включённом toggle можно менять ширину каждой секции.
3. **Наполнение** — пользователь выбирает секцию/отсек и добавляет полки, ящики, штангу.
4. **Точная настройка наполнения** — показывает карту секций, высоты отсеков, фасад выбранной секции.
5. **Материалы** — корпус только ЛДСП, фасады ЛДСП/МДФ, задняя стенка ХДФ автоматически.
6. **Сцена** — показывает выбранную секцию/отсек, материалы, фасады, наполнение, 3D/2D режим.
7. **Validation** — ошибка ведёт к нужному шагу/секции/отсеку и показывает fixHint.
8. **Заявка** — checkout показывает честную сводку того, что отправится менеджеру.

### 2.3. Цена

После R9 фейковая цена в сцене исправлена.

Проверка по активному конструктору не нашла старые fallback-значения в runtime-компонентах:

```txt
quote?.total ?? 42800
31600
6400
4800
```

Остался только тест, который специально проверяет отсутствие этих значений:

```txt
src/static-pages/constructor/components/ConstructorScenePriceState.test.ts
```

Единственное найденное число `4800` в `src/constructor/catalog.ts` относится к старому catalog priceAdd, а не к активному scene/checkout fallback.

---

## 3. Что можно считать реально сделанным

### 3.1. Материалы

Сделано:

- реальные декоры подключены;
- есть общий material catalog;
- корпус ограничен ЛДСП 16 мм;
- фасады поддерживают ЛДСП 16 мм и МДФ 18 мм;
- задняя стенка ХДФ 3 мм выбирается автоматически по корпусу;
- материалы используются в UI, SVG/Three preview и production payload.

Статус: **готово как foundation + UI usage**.

### 3.2. Секции и отсеки

Сделано:

- `sectionLayout` хранит ручные ширины секций;
- `compartmentLayout` хранит высоты отсеков;
- сумма секций сохраняется равной общей ширине;
- сумма отсеков сохраняется равной высоте;
- есть выбор активной секции и активного отсека;
- scene получает выбранную область.

Статус: **готово для MVP**, но store всё ещё переходный.

### 3.3. Наполнение

Сделано:

- `fillingLayout` хранит наполнение по конкретному отсеку;
- полки/ящики/штанга применяются к выбранной области;
- totals сохраняются для совместимости;
- для тумбы/комода штанга блокируется validation/rules.

Статус: **готово для MVP**, но требуется визуальная приёмка.

### 3.4. Фасады

Сделано:

- `facadeLayout` поддерживает `open / hinged` по секциям;
- в обычном режиме можно применить фасад ко всем секциям;
- в точной настройке можно выбрать фасад активной секции;
- SVG/Three preview учитывает open/hinged;
- ручки скрываются при handleless.

Статус: **базово готово**.

Не готово:

- выбор стиля ручек;
- точная логика петель/зазоров по фасадам;
- supplier-level hardware как live-price source.

### 3.5. Validation UX

Сделано:

- ошибки имеют target и fixHint;
- клик по ошибке переводит пользователя на нужный шаг;
- секция/отсек/поле подсвечиваются;
- blocking issues не дают перейти в checkout;
- в FillStep и SizesStep есть focused cards.

Статус: **существенно улучшено**, нужно проверить глазами в браузере.

### 3.6. Scene UX

Сделано:

- 3D/2D переключатель;
- views: free/front/side/top;
- WebGL fallback в 2D;
- overlay выбранной области;
- рамка активной секции/отсека в SVG;
- Three.js получает selected section/compartment;
- scene price state больше не показывает фейковую цену.

Статус: **технически собрано**, visual QA не подтверждён.

### 3.7. Checkout review

Сделано:

- убраны фейковые checkout fallback-цены;
- добавлена карточка `Что отправится менеджеру`;
- показываются размеры, секции, отсеки, наполнение, фасады, материалы, ХДФ, validation status;
- submit flow не переписывался.

Статус: **готово как UX foundation**.

---

## 4. Что осталось недоделанным

### 4.1. Нет подтверждённого visual QA

Самая важная проблема: в этом окружении не удалось получить реальные браузерные screenshots desktop/mobile.

Причина: Playwright browser executable отсутствует:

```txt
Executable doesn't exist at /home/oai/.cache/ms-playwright/chromium_headless_shell-1223/...
```

`npm run test:browser` запустил тесты, но все 10 browser-тестов упали именно из-за отсутствующего браузера, а не из-за UI-assertions.

Вывод: **кодовая проверка есть, визуальной приёмки нет**.

### 4.2. Store остаётся переходным

В store одновременно живут старые и новые поля:

```txt
sections + sectionLayout
compartments + compartmentLayout
fill + fillingLayout
material/facadeMaterial + projectMaterials
shelvesCount/drawersCount/rodsCount + fillingLayout totals
```

Это сделано ради обратной совместимости с pricing/payload, но архитектурно это technical debt.

Статус: **не критично для MVP**, но нужно запланировать cleanup после стабилизации UX.

### 4.3. Production/pricing ветка слишком глубокая для текущего момента

В проекте остались слои Stage 12–24:

- production panel pricing;
- hardware pricing audit;
- services pricing audit;
- decision layers;
- supplier hardware catalog;
- supplier price import foundation.

Они не ломают core-сценарий, но усложняют проект.

Решение: **заморозить эту ветку**, не продолжать Stage 25, не углублять supplier/pricing до финального UX конструктора.

### 4.4. Mobile UX не подтверждён браузером

CSS mobile bottom sheet добавлен, но без screenshot QA нельзя утверждать, что:

- CTA всегда виден;
- scene не съедает экран;
- шаги удобно прокручиваются;
- controls не слишком мелкие;
- validation не ломает панель.

Статус: **требуется ручная проверка на телефоне/браузере**.

### 4.5. Сцена может быть визуально перегружена

В коде сейчас есть:

- top toolbar;
- 3D/2D switch;
- view switch;
- advanced toggle;
- price chip;
- scene material legend;
- active target overlay;
- validation markers;
- optional debug-card.

Функционально это полезно, но визуально может быть много шума. Нужна фактическая проверка интерфейса.

### 4.6. Фурнитура и ручки не завершены как продуктовая настройка

Сейчас есть:

- ручки включены / без ручек;
- handleless/push-to-open;
- open/hinged секции.

Не сделано:

- выбор стиля ручек;
- понятный UI ручек в Materials/Fill;
- ручки как отдельный material/option catalog;
- влияние конкретного стиля ручек на production/hardware.

### 4.7. 2D — это preview, не производственный чертёж

2D сейчас полезен как fallback/preview. Его нельзя позиционировать как чертёж или производственную проекцию.

---

## 5. Проверки, которые реально выполнены

Успешно выполнено:

```bash
npm install
npm run typecheck
npm run typecheck:api
npm run build
npm run test:browser-smoke-static
npm run test:constructor-flow
npm run test:constructor-store
npm run test:constructor-payload
npm run test:production-preview
npm run test:constructor-draft
npm run test:constructor-three
npm run test:constructor-three-safety
node --no-warnings --import tsx src/static-pages/constructor/components/ConstructorScenePriceState.test.ts
node --no-warnings --import tsx src/static-pages/constructor/adapters/constructorCheckoutReview.test.ts
```

Результат: **все команды выше прошли успешно**.

Не засчитывается как успешное:

```bash
npm run test:browser -- --reporter=line
```

Причина: отсутствует Playwright Chromium executable. Это проблема окружения, не доказанный UI-баг.

---

## 6. Текущая оценка готовности

| Направление | Оценка | Комментарий |
|---|---:|---|
| Кодовая сборка | 8.5/10 | typecheck/build проходят |
| Store/rules foundation | 7.5/10 | работает, но гибрид старого и нового state |
| Материалы | 8/10 | реальные декоры и правила есть |
| Секции/отсеки | 8/10 | ручные layout-структуры есть |
| Наполнение | 7.8/10 | привязано к отсеку, нужна visual QA |
| Scene linkage | 7.5/10 | связь есть, визуал не подтверждён скриншотами |
| Validation UX | 8/10 | логика хорошая, нужна проверка глазами |
| Checkout review | 8.2/10 | честнее, snapshot виден |
| Mobile UX | 6.8/10 | CSS есть, browser QA нет |
| Production/pricing depth | 7/10 | много foundation, но преждевременно |
| Product readiness | 7.4/10 | core стал лучше, но финальная визуальная приёмка не пройдена |

---

## 7. Рекомендованный следующий этап

Не продолжать production/pricing.

Следующий этап должен быть:

# Stage R11 — visual QA pack / browser acceptance checklist

Цель: получить реальное визуальное подтверждение или список правок по desktop/mobile.

Что нужно сделать:

1. Подготовить локальный checklist для ручной проверки пользователем.
2. Подготовить список экранов, которые нужно прислать скриншотами:
   - размеры desktop;
   - наполнение desktop обычный режим;
   - наполнение desktop точная настройка;
   - материалы desktop;
   - заявка desktop;
   - mobile размеры;
   - mobile наполнение;
   - mobile заявка.
3. По скриншотам исправить визуальные проблемы, а не углублять архитектуру.
4. Только после визуальной стабилизации возвращаться к cleanup store или pricing.

---

## 8. Вывод

После R2–R9 проект вернулся в правильное направление. Core UX конструктора стал заметно более логичным: пользователь выбирает область, добавляет наполнение, видит выбранное место на модели, получает validation-подсказки и честную заявку.

Но финальной стабильной версией конструктор пока считать нельзя, потому что нет визуального browser QA. Следующий правильный шаг — не новая архитектура, а проверка интерфейса в реальном браузере и точечный visual polish.
