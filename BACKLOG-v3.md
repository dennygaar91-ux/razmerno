# BACKLOG v3 — «Размерно»

Дата обновления: 2026-06-14  
Статус: архитектурная подготовка и GitHub QA стабилизированы; начат backlog дальнейшей разработки конструктора на основе фактического аудита `main`.

## Правила статусов

- `todo` — задача не начата.
- `in_progress` — работа начата, но не завершена в GitHub.
- `done` — результат закоммичен в GitHub и может быть проверен.
- `blocked` — задача заблокирована внешней причиной.
- `deferred` — задача осознанно перенесена после MVP/после отдельного решения.

## Правила приоритетов

- `P0` — критично: нельзя начинать крупную новую разработку, пока риск не проверен или не закрыт.
- `P1` — важно до production/MVP hardening.
- `P2` — технический долг и устойчивость разработки.
- `P3` — улучшения после MVP.

## Protected scope

До отдельного задания запрещено менять без явного решения владельца проекта:

- pricing engine;
- order flow;
- checkout logic;
- отправку заявок;
- Supabase;
- API;
- backend;
- admin panel;
- export logic;
- UX/UI redesign;
- Three.js redesign;
- новые функции.

Исключение: P0-аудит и точечные проверки, которые не меняют runtime-поведение, либо отдельное явное задание на исправление.

---

# 1. Architecture block

| ID | Задача | Статус | Критерий завершения | Факт/комментарий |
|---|---|---|---|---|
| A01 | Провести первичный infrastructure audit | done | `docs/audits/infrastructure-audit-001.md` существует в GitHub | Завершено ранее |
| A02 | Зафиксировать runtime boundaries | done | `docs/architecture/runtime-boundaries.md` существует в GitHub | Завершено ранее |
| A03 | Зафиксировать protected zones | done | `docs/architecture/protected-zones.md` и `ADR-003` существуют в GitHub | Архитектурный блок закрыт |
| A04 | Описать constructor architecture | done | `docs/architecture/constructor-architecture.md` существует в GitHub | Архитектурный блок закрыт |
| A05 | Зафиксировать testing strategy | done | `docs/architecture/testing-strategy.md` и QA matrix существуют в GitHub | Архитектурный блок закрыт |
| A06 | Зафиксировать CI/audit pipeline | done | workflow, CI doc и ADR по CI согласованы | GitHub QA проходит |
| A07 | Зафиксировать contracts для API/order/pricing/export/admin | done | contract-docs существуют в GitHub без изменения runtime-кода | Архитектурный блок закрыт |
| A08 | Подготовить development readiness task | done | `docs/agent/task-003-development-readiness.md` существует в GitHub | Архитектурный блок закрыт |

---

# 2. CI block

| ID | Задача | Статус | Комментарий |
|---|---|---|---|
| CI01 | Проверить `.github/workflows/qa.yml` | done | workflow существует и запускается |
| CI02 | Стабилизировать Node/npm для CI | done | CI переведен на стабильный install path; `npm ci` проходит |
| CI03 | Проверить lockfile после успешного install | done | lockfile пересоздан и запушен; registry/artifactory проблема закрыта |
| CI04 | Добиться успешного Typecheck frontend | done | TypeScript frontend проходит |
| CI05 | Добиться успешного Typecheck API | done | API typecheck проходит |
| CI06 | Добиться успешного Build frontend | done | build проходит |
| CI07 | CSS architecture check | done | check проходит в QA |
| CI08 | Production geometry architecture check | done | check проходит в QA |

Текущий подтвержденный статус: GitHub QA workflow проходит успешно на `main` после стабилизации lockfile/tsconfig.

---

# 3. Documentation block

| ID | Документ | Статус |
|---|---|---|
| D01 | `docs/architecture/project-map.md` | done |
| D02 | `docs/architecture/runtime-boundaries.md` | done |
| D03 | `docs/architecture/constructor-state-and-layout.md` | done |
| D04 | `docs/architecture/ci-and-audit-pipeline.md` | done |
| D05 | `docs/architecture/protected-zones.md` | done |
| D06 | `docs/architecture/constructor-architecture.md` | done |
| D07 | `docs/architecture/testing-strategy.md` | done |
| D08 | `docs/decisions/ADR-001-architecture-docs.md` | done |
| D09 | `docs/decisions/ADR-002-ci-pipeline.md` | done |
| D10 | `docs/decisions/ADR-003-protected-zones.md` | done |

---

# 4. Constructor architecture audit summary

Дата аудита: 2026-06-14  
Источник аудита: фактические файлы GitHub `main`.

Проверенные зоны:

- routing: `src/App.tsx`;
- основной constructor route: `src/static-pages/Constructor3DPage.tsx`;
- state: `src/static-pages/constructor/store/*`;
- hooks: `useConstructorPageState`, `useConstructorQuote`, `useConstructorSubmit`;
- UI panels: `SizesStepPanel`, `FillingStepPanel`, `MaterialsStepPanel`, `Checkout3DStep`, `ConstructorDrawerContent`;
- 3D layer: `ThreeFurnitureViewer`, `ThreeSelectionLayer`, `threeSceneAdapter`;
- 2D/WebGL fallback;
- CSS scope: `src/styles/constructor3d.css` и модули `constructor3d/*`;
- validation rules;
- payload/order adapters;
- production preview/pricing adapters;
- API order route;
- Supabase order boundary;
- server validation, server price, DB mapping, email layer;
- pricing engine, production panel/hardware/services pricing.

Краткий вывод:

- Архитектура стала пригодной для дальнейшей разработки: есть zustand-store, adapters, validation layer, production layer, API boundary и CI.
- Основной конструктор уже не выглядит как хаотичный монолит, но остались крупные orchestration-точки.
- Главный подтвержденный архитектурный риск — потенциальное расхождение клиентского и серверного pricing path.
- CSS находится в переходном stage-based состоянии: это допустимо сейчас, но требует cleanup после ключевых продуктовых решений.

---

# 5. P0 — критично перед новой крупной разработкой

| ID | Задача | Статус | Обоснование | Критерий завершения |
|---|---|---|---|---|
| PR-001 | Проверить единый источник истины цены client/server | todo | Клиентский quote может использовать `productionPanelPricing`, а серверный `calculateServerPrice` пересчитывает через catalog pricing path. Это может нарушить правило «точная цена» | Есть тест/аудит, подтверждающий `UI total === API/server total` для базовых сценариев, либо внесено исправление |
| PR-002 | Добавить integration test полного pricing flow | todo | Нужен воспроизводимый контроль: UI quote → payload → server price → order total | Тесты покрывают шкаф/тумбу/комод, доставка, сборка, ручки/без ручек |
| PR-003 | Зафиксировать pricing source policy | todo | Сейчас встречаются `catalog`, `production-panels`, debug-only services summaries. Нужно явно указать, какой source является live price для MVP | Документ/кодовая политика: какой pricing path считается источником истины, где допустим preview/debug |

---

# 6. P1 — архитектура конструктора

| ID | Задача | Статус | Обоснование | Критерий завершения |
|---|---|---|---|---|
| AR-001 | Декомпозировать `threeSceneAdapter.ts` | todo | Файл строит корпус, зоны, фасады, наполнение, selection и interaction targets; риск повторного монолита | Логика разбита на `buildCarcass`, `buildCompartments`, `buildFilling`, `buildFacades`, `buildInteractionTargets` или эквивалентные модули |
| AR-002 | Декомпозировать `Constructor3DPage.tsx` | todo | Главный orchestration-компонент останется точкой разрастания при новых функциях | Выделены scene/drawer/checkout/step controllers без изменения UX |
| AR-003 | Сократить props contract `ConstructorDrawerContent` | todo | Слишком широкий props contract и местами `any` усложняют поддержку | Используются typed selectors, context или narrower view models |
| AR-004 | Убрать `any` из material handlers | todo | В `MaterialsStepPanel` handlers типизированы слабее, чем остальной код | `onMaterialChange` и `onFacadeMaterialChange` принимают строгий тип материала |
| AR-005 | Вынести business constants в единый источник | todo | Лимиты вроде max sections, min widths, fallback values встречаются в разных слоях | Есть единый rules/config source, UI и validation используют его |
| AR-006 | Проверить hardware selection rules | todo | В payload hardware может зависеть от `handleless`, но ранее принято решение, что фурнитура не должна зависеть только от ручек | Правила выбора фурнитуры описаны и синхронизированы между UI/order/production |
| AR-007 | Вынести derived state из UI panels | todo | Часть вычислений живет в `FillingStepPanel`/`SizesStepPanel`, что усложняет тестирование | Derived selectors/rules вынесены из UI и покрыты тестами |

---

# 7. P1 — pricing/manufacturing/production layer

| ID | Задача | Статус | Обоснование | Критерий завершения |
|---|---|---|---|---|
| MF-001 | Проверить `ProductionPanelPricing` на соответствие прайсу | todo | Панельный расчет уже есть, но нужно подтвердить body/facade/back/edge на реальных сценариях | Есть QA matrix с ожидаемыми расчетами и допустимой погрешностью |
| MF-002 | Проверить `ProductionHardwarePricing` | todo | Hardware pricing использует supplier catalog/foundation/fallback; часть цен требует подтверждения | Список fallback/foundation SKU вынесен в отчет, подтверждено что live price/preview трактуется правильно |
| MF-003 | Проверить `ProductionServicesPricing` | todo | Файл явно говорит debug-only; распил/присадка включены в ЛДСП/МДФ, отдельно кромление/упаковка | Решено: services pricing влияет или не влияет на live price; тексты и UI синхронизированы |
| MF-004 | Проверить, что распил и присадка не считаются дважды | todo | По прайсу ЛДСП/МДФ уже включают распил/присадку | Тест/аудит подтверждает отсутствие двойного счета |
| MF-005 | Проверить edge banding по production model | todo | Кромка считается как в catalog, так и production-summary layers | Есть сверка edge length/cost по 3–5 типовым моделям |

---

# 8. P1 — order/backend/contracts

| ID | Задача | Статус | Обоснование | Критерий завершения |
|---|---|---|---|---|
| OR-001 | Проверить `buildOrderPayloadFromConstructor` против `OrderRequest` | todo | Payload adapter сильный, но contract должен быть зафиксирован тестом | Type/integration test подтверждает совместимость payload ↔ API validation |
| OR-002 | Проверить server validation parity | todo | Клиентская и серверная validation должны одинаково трактовать обязательные поля и ошибки | Matrix: client validation vs server validation без расхождений по P0/P1 сценариям |
| OR-003 | Проверить email copy: точная/предварительная цена | todo | В продуктовой логике цена точная, в email есть «предварительная стоимость» | Тексты email/UI/API синхронизированы с принятой политикой цены |
| OR-004 | Проверить Resend attachments в production | todo | Attachments строятся из `productionExport`, но реальная отправка требует проверки | Production/staging тест подтверждает attachment delivery или задача явно отложена |
| OR-005 | Проверить manager-email failure policy | todo | Сейчас ошибка письма менеджеру возвращает 502, хотя заявка сохранена | Решение зафиксировано: это ожидаемая политика или требуется изменить поведение |

---

# 9. P2 — CSS/design-system architecture

| ID | Задача | Статус | Обоснование | Критерий завершения |
|---|---|---|---|---|
| CSS-001 | Не делать массовый CSS cleanup до завершения продуктового редизайна | deferred | Массовая чистка сейчас может сломать визуал | Возвращаться после стабилизации финального конструктора |
| CSS-002 | Перевести CSS от stage-based к domain-based структуре | todo | Сейчас много stage override слоев: `00-base`, `92-ui-role-system`, `96-product-scene-composition` | После редизайна структура ближе к `scene/`, `drawer/`, `checkout/`, `materials/` |
| CSS-003 | Убрать дубли base/stage overrides | todo | Накопление каскадного долга затруднит поддержку | Удалены устаревшие override-слои, QA visual/manual пройден |
| CSS-004 | Зафиксировать class ownership для constructor3d | todo | Много классов `rzm-3d-*`, нужно понимать владельца каждого блока | Обновлен class inventory/ownership map |

---

# 10. P2 — QA/testing/tooling

| ID | Задача | Статус | Обоснование | Критерий завершения |
|---|---|---|---|---|
| QA-001 | Unit tests для pricing/rules/payload/validation | todo | Эти зоны критичны для точной цены и заявки | Тесты добавлены и проходят в CI |
| QA-002 | Integration tests checkout/submit/quote | todo | Нужно ловить расхождения между UI quote и server submit | Тесты покрывают ключевые сценарии MVP |
| QA-003 | Component/file metrics report | todo | Проект растет, нужны метрики размера файлов и связности | Скрипт генерирует отчет по строкам/сложности/крупным файлам |
| QA-004 | Dependency graph report | todo | Нужен контроль архитектурных зависимостей для LLM-разработки | Генерируется `docs/reports/dependency-graph.md` или аналог |
| QA-005 | Manual QA matrix для конструктора | todo | Нужна ручная проверка размеров/наполнения/материалов/заявки | Matrix обновлена и связана с текущим constructor flow |

---

# 11. P3 — после MVP / после отдельного решения

| ID | Задача | Статус | Обоснование | Критерий завершения |
|---|---|---|---|---|
| UX-001 | Mobile bottom sheet architecture | deferred | Mobile сейчас не главный ближайший scope | Возвращаться после desktop/MVP стабилизации |
| UX-002 | Полноценный production-grade 2D drawing mode | deferred | Сейчас есть рабочий fallback, инженерный 2D можно позже | Отдельное ТЗ |
| UX-003 | AI assembly assistant | deferred | Стратегический post-MVP приоритет | Отдельная roadmap-задача |
| UX-004 | B2B mode | deferred | Post-MVP | Отдельная roadmap-задача |
| UX-005 | Kitchen architecture | deferred | Кухни исключены из MVP | Отдельное решение владельца проекта |
| UX-006 | Cinematic assembly animation | deferred | Уже переносилось в backlog | Отдельное решение после MVP |
| UX-007 | Deep Three.js performance optimization | deferred | Уже переносилось в backlog | Возвращаться после стабилизации 3D UX |

---

# 12. Рекомендуемый порядок разработки в следующем чате

1. Закрыть `PR-001` — проверить и устранить риск расхождения client/server price.
2. Закрыть `PR-002` — добавить integration tests pricing flow.
3. Закрыть `PR-003` — зафиксировать pricing source policy.
4. Затем переходить к `AR-001`/`AR-002` — безопасная декомпозиция без изменения UX.
5. Только после этого переходить к продуктовой переработке конструктора/3D/UI.

Запрещено начинать редизайн или новые функции, пока `PR-001` не проверен.

---

# 13. Reporting rule

Каждый отчет должен разделять:

1. Планировалось.
2. Реально найдено в GitHub.
3. Реально изменено в GitHub.
4. Подготовлено, но не закоммичено.
5. Не выполнено.
6. Риски.
7. Следующий этап.

Для задач из backlog обязательно указывать:

- ID задачи;
- статус до работы;
- статус после работы;
- какие файлы изменены;
- какой commit SHA;
- какие проверки пройдены.
