Architecture Audit v1 — Размерно
Введение

Цель этого аудита — дать полную картину текущей архитектуры конструктора «Размерно» по состоянию на июнь 2026 г. В работе использовались актуализированные документы (docs/architecture.md, docs/decomposition-plan.md, docs/infrastructure-final-report.md, материалы по pricing и production), а также анализ каталогов src/, api/, scripts/, tests/ и конфигурационных файлов. Документы docs/agent/architect-rules.md и docs/agent/task-001-architecture-audit.md в репозитории не найдены — это само по себе признак несогласованности документации.

Документ построен по разделам, отражающим структуру проекта и проверяемые элементы: структура каталогов, состояние 3D‑ветки конструктора и legacy‑модулей, pricing‑слой, production‑слой, API, скрипты, тесты, стили, Three.js, Zustand‑store, дубли логики и риски для дальнейшей разработки.

1. Структура проекта
Основные каталоги

В docs/architecture.md описаны текущие границы проекта: активная работа сосредоточена в src/static-pages/constructor/**, а каталог src/configurator/** объявлен legacy quarantine и не подключается в основных маршрутах. Помимо них, структура включает:

src/constructor/** — геометрия, production‑модели и каталоги (панели, фурнитура). Это низкоуровневый слой, который управляет базовыми сущностями и не зависит от UI.
src/pricing/** — движок расчёта цены; в него входят обработка прайс‑каталогов, delivery/assembly‑модули и вспомогательные тесты.
src/shared/** — общие утилиты (React‑примитивы, хелперы, цвета).
src/admin/** — интерфейсы и логика панели администратора.
api/** — серверные функции для Vercel (orders.ts, price-items.ts, config.ts, admin/**).
supabase/** — SQL‑скрипты и конфигурации базы.
tests/ — end‑to‑end и unit‑тесты.
scripts/ — сборка, отчёты, проверки.
docs/, docs/architecture, docs/pricing, docs/production — документация.

Такое разделение определяет слои системы, но сегодня границы между ними размыты: UI‑слои, state‑управление и бизнес‑логика зачастую перемешаны, а legacy‑код продолжает жить рядом с новой 3D‑веткой.

Файл vite.config.ts и сборка

Конфигурация Vite подключает React и Tailwind, поддерживает single‑file mode, настраивает алиасы (@ указывает на src) и ручное разделение чанков для React, Three.js и Supabase библиотек. Ограничение chunkSizeWarningLimit: 700 КБ помогает контролировать размер бандлов, однако наличие огромного CSS‑монолита может приводить к крупным чанкам (см. вывод ниже).

Настройки TypeScript

tsconfig.json использует strict‑мод (strict, noUnusedLocals, noUnusedParameters), что обеспечивает высокий уровень типовой безопасности. Путь @/* резолвится в src/*, что упрощает импорты.

2. src/static-pages/constructor
Активная 3D‑ветка

Маршруты /constructor, /configurator, /constructor-3d и их варианты ведут на Constructor3DPage.tsx — главную страницу конструктора. Это крупный компонент (2772 строки по данным инфраструктурного аудита) и фактически «God Component». В нём содержатся shell, stepper, drawer, сценовая панель, checkout и другие подкомпоненты. По плану декомпозиции из этого файла должны быть выделены самостоятельные сущности (Shell, Stepper, Panels, Validation, PriceFooter, отдельные hooks).

Zustand‑store для конструктора

Хранилище constructorState находится в src/static-pages/constructor/store/constructorStore.ts (1673 строки). Сейчас это монолит, содержащий состояние мебели, размеров, компоновки, наполнения, материалов, проверки и UI‑флагов. Целевая структура — набор срезов (dimensionsSlice, layoutSlice, selectionSlice, fillingSlice, materialsSlice, checkoutSlice, validationSlice, uiSlice), что позволит разъединить ответственность и уменьшить риск race‑condition при обновлении state.

Компоненты и UI‑слой

Основная сцена находится в компонентах ThreeFurnitureViewer.tsx, ThreeFurnitureModel.tsx, ThreeFurniturePanels.tsx и адаптере threeSceneAdapter.ts. 3D‑слой имеет защиту от ошибок: WebGL недоступен → SVG fallback, таймауты, error boundary, режим reduced quality. 2D fallback реализован в ConstructorRealisticSvgModel.tsx, но планируется выделить полноценный BlueprintViewer.

В компонентах присутствуют большие файлы: projectRules.ts (1429 строк), ConstructorRealisticSvgModel.tsx (517 строк), threeSceneAdapter.ts (820 строк) и несколько других. Для каждого файла предложено выделять отдельные модули: правила зон, материалы, адаптеры состояния, SVG‑utils, чтобы снизить связность.

Legacy-фолдер

Каталог src/configurator/** хранит старый конструктор. Stage 1 отчёт указывает, что существуют две семьи конструктора: новая (src/static-pages/constructor/**) и старая (src/configurator/**). В старой ветке есть собственный store, checkout, viewer и fallback. Эти файлы оставлены в репозитории из‑за тестов и проверок, но не подключаются в актуальные маршруты. Их необходимо держать в quarantine, чтобы случайно не импортировать их в новую архитектуру. Самые большие legacy‑файлы (ConfiguratorPage.tsx, Visualization.tsx, context.tsx, модели compartment) следует удалить после миграции тестов.

Большие файлы

По результатам инфраструктурного аудита, самыми критичными являются:

Constructor3DPage.tsx — 2772 строки;
constructorStore.ts — 1673 строки;
projectRules.ts — 1429 строк;
constructor.css — 10 805 строк;
constructor3d.css — 3983 строки.

Такие файлы сложно поддерживать, их код сложно ревьюить, и они замедляют работу IDE. Применение slices, выделение подмодулей и CSS‑модулей уменьшит размер.

3. src/constructor (geometry и production)
Геометрия и модели

Каталог src/constructor/ содержит базовые модели мебели и геометрии: построение панелей (buildPanels.ts, 333 строки), построение hardware (buildHardware.ts, 452 строки) и расчёт production‑модели (productionModel.ts, 634 строки). Эти файлы смешивают несколько обязанностей (панели, фурнитура, сверловка, предупреждения) и требуют разделения на более мелкие модули (panel model, hardware model, drilling, warning, export).

ProductionModel

productionModel.ts строит структуру для раскроя и просчёта производства. Доступ к нему есть в pricing‑движке и API. Этот файл нужно декомпозировать; в противном случае добавление новых форматов (например, тумбы или комода) увеличит риск ошибок.

Catalogs

catalog.ts (416 строк) объединяет каталоги материалов, фурнитуры, мебели и лимитов. Его лучше разбить на отдельные файлы (materials/hardware/furniture/limits) с единым экспортом.

Типы и тесты

model/compartments.ts и другие legacy‑типы имеют терминологию, конфликтующую с новым UI (compartment vs zone). Эти файлы следует удалить после перехода на новую терминологию. Тесты, например tests/geometry.test.ts (664 строки) и constructorStore.test.ts (369 строк), проверяют множество сценариев в одном файле. Их нужно разбивать по тематикам.

4. src/pricing
Структура и движок

В каталоге src/pricing/ реализован pricing‑engine и вспомогательные модули (delivery.ts, assembly.ts, materialPricing.ts). Документ pricing-production-checklist.md определяет ключевые правила: retail price вычисляется как source_price * markup_multiplier. Pricing‑движок больше не использует простую формулу объём × коэффициент — цена складывается из панелей, фасадов, задней стенки, кромки, услуг, наполнения, фурнитуры и изготовления.

Catalog vs production‑model pricing

В backlog production‑pricing описано, что материалы и кромка уже считаются по производственной модели, а hardware и услуги — нет. Предстоит провести аудит (Stage 19 и 20) и постепенно переключить hardware/services на productionModel.hardware и операции присадки/упаковки. До этих интеграций следует избегать смешения старой формулы с новой, чтобы не получить двойной учёт.

Pricing helpers

Stage 1 отчёт подчеркивает, что есть несколько слоёв pricing: src/pricing/**, src/static-pages/constructor/adapters/productionPricingPreview.ts, src/constructor/pricing.ts, src/constructor/quickEstimate.ts, src/shared/lib/price.ts и т.д., и требуется строгая классификация. Логику pricing лучше централизовать в движке и избегать дублирующих хелперов.

5. Production Layer и Supabase
Go-live и Supabase

Документ PRODUCTION-HANDBOOK.md описывает пошаговый процесс развертывания: запуск SQL‑скриптов для Supabase (deploy-all.sql), настройку Vercel env, локальные проверки, smoke‑тесты и деплой. Он перечисляет критичные environment переменные для сервера (ADMIN_API_KEY, SUPABASE_SERVICE_ROLE_KEY, ORDER_MANAGER_EMAIL) и клиента (VITE_ORDER_API_URL, VITE_USE_MOCK_API, VITE_ADMIN_LOGIN_API_URL, VITE_YANDEX_METRIKA_ID). Соблюдение этих инструкций обязательно для корректной работы production‑слоя.

Go-live, deploy и smoke

Перед деплоем нужно запустить многочисленные проверки: predeploy:guard, qa:stage9–qa:stage6, qa:all, build, npm audit. Далее следует деплой (Vercel runbook, Windows deploy commands) и smoke‑тесты. Эти документы обеспечивают последовательность операций и должны поддерживаться в актуальном состоянии.

Production warnings и PII

В production‑слое нельзя хранить PII в локальном состоянии: клиентская заявка очищается от персональных данных перед отправкой; serverless‑функции должны валидировать payload и пересчитывать цену на сервере. Нарушение этого правила создаёт риск утечки данных.

6. API

Каталог api/ содержит serverless‑функции:

api/orders.ts — принимает заявки, валидирует payload, пересчитывает цену, сохраняет заказ в Supabase, отправляет e‑mail менеджеру и клиенту.
api/price-items.ts — возвращает прайсовые позиции (панели, фасады и т.д.), загруженные из Supabase.
api/config.ts — отдает публичные конфиги.
api/admin/** — административные endpoints.

API обязательно перерасчитывает цену на сервере и проверяет токены; клиентские функции должны использовать эти endpoints. Документация по API почти отсутствует, что является пробелом. Требуется описать входные параметры, коды ошибок и security‑требования.

7. Скрипты

В package.json перечислены сотни npm‑команд для сборки, проверок и тестов. Стандартные скрипты (dev, build, preview, typecheck) дополняются сложными QA‑цепочками (например, qa:all выполняет серию проверок: валидация конфигов, проверка legacy runtime, проверка production‑layer, тесты Zustand‑store, проверка дизайна и т.д.). В scripts/ находятся Node‑скрипты, выполняющие аудит CSS (css-usage-report.mjs), отчёты по компонентам, проверки legacy‑импортов (check-legacy-runtime-imports.mjs), генерацию прайс‑seed (build-price-seed.mjs), сборку бандла и другие утилиты.

Сложность scripts‑папки высока: множество скриптов имеют зависимость от текущей структуры. Рефакторинг и разделение этих скриптов (например, выделение утилит для CSS/React/QA) улучшат поддерживаемость.

8. Тесты

Тесты разделены на несколько категорий:

Юнит‑тесты геометрии и производственных моделей (e.g., tests/geometry.test.ts, productionModel.test.ts). В одном файле проверяется множество сценариев (панели, ящики, фурнитура), что делает их громоздкими.
Zustand‑тесты проверяют синхронность стора со страницами и компонентами (e.g., test:zustand-foundation).
UI‑тесты — e2e‑smoke‑скрипты (tests/ui-e2e-smoke.test.ts) запускаются через Playwright.
Three.js‑тесты — проверка адаптеров, safety‑режимов (threeSceneAdapter.test.ts, threeSceneSafety.test.ts).
Pricing‑тесты — pricing-engine.test.ts, pricing-final.test.ts.

Большие тестовые файлы рекомендовано разбивать: каждый функциональный аспект (панели, геометрия фурнитуры, layout) должен иметь свой тест, чтобы упростить отладку.

9. Стили
CSS‑монолиты

Основная боль — огромные файлы src/styles/constructor.css (10 805 строк) и constructor3d.css (3983 строки). В них смешиваются стили домашней страницы, измерений, материалов, сборки, 3D‑viewer, checkout, мобильных состояний и т.д. В decomposition-plan.md предлагается отделить shell, stepper, drawer, scene, forms, checkout и status CSS в отдельные файлы. Однако удалять или переносить стили нельзя без визуального review — отчёт CSS usage подчёркивает, что очистка должна выполняться только после ручного просмотра и маркировки потенциально неиспользуемых классов.

Дизайн‑система

Документы docs/design-system/tokens-v1.md и components-v1.md вводят новую систему токенов (--rzm-*) и базовых компонентов. В коде начинают появляться классы rzm- и CSS‑переменные. Важно придерживаться этих стандартов и постепенно удалять старые токены.

Tailwind

Проект использует Tailwind через плагин @tailwindcss/vite. Tailwind‑классы используются в новых компонентах, но базовые монолитные CSS‑файлы всё ещё тянут старые стили. Переход на Tailwind и дизайн‑систему должен быть постепенным.

10. Three.js слой

В 3D‑слое основными файлами являются LazyThreeFurnitureViewer.tsx, ThreeFurnitureViewer.tsx, ThreeFurnitureModel.tsx, ThreeFurniturePanels.tsx, threeSceneAdapter.ts, threeMaterials.ts, threeCamera.ts. Адаптер threeSceneAdapter.ts отвечает за трансляцию Zustand‑state в формат Three.js, за материалы, режимы сцены, выделение, hardware и другие аспекты. Его размер (820 строк) и разнообразие обязанностей делает его кандидатом на разделение: предложено выделить adapters для размеров, зон, материалов, фурнитуры и режима сцены.

Диагностика WebGL (хуки useWebGLAvailable.ts, useThreeSceneQuality.ts) обеспечивает graceful degradation: отключение эффектов на мобильных, reduced quality, fallback на SVG.

Legacy‑viewer (src/configurator/three/**) дублирует функции нового трехмерного viewer. Данные файлы не должны использоваться в новой архитектуре; после миграции тестов их нужно удалить.

11. Zustand/store

Как уже упомянуто, текущий Zustand‑store — монолит. Он хранит множество доменов (dimensions, layout, filling, materials, checkout, validation, UI). Это упрощает обращение к состоянию, но усложняет разделение ответственности и делает импорт из стора непредсказуемым. Планы по декомпозиции slices детализированы в decomposition-plan.md; важно перенести actions и selectors в соответствующие части, сохранив API. Также стоит изучить возможность переноса части логики в React‑hooks и context‑providers.

12. Legacy‑зоны

Файлы в src/configurator/**, включая ConfiguratorPage.tsx, CheckoutDrawer.tsx, Visualization.tsx, context.tsx и сторы/модели, относятся к legacy‑зоне. Stage 1 отчёт подчёркивает существование двух семейств: активной и legacy. Эти модули продолжают использоваться в тестах, поэтому не могут быть удалены немедленно. Тем не менее, наличие двух параллельных реализаций порождает риск случайных импортов и увеличивает сложность. Необходимо:

запретить импорт legacy‑модулей в новый код (скрипт check-legacy-runtime-imports уже есть в пакете);
мигрировать оставшиеся тесты на новую реализацию;
удалить legacy‑код после миграции.
13. Дубли логики

Stage 1 отчёт перечисляет ключевые дублирования:

Constructor families: новая (src/static-pages/constructor/**) и старая (src/configurator/**) ветки с собственными UI‑компонентами, checkout, store bridge и viewer.
Viewer families: новая src/static-pages/constructor/three/** и legacy src/configurator/three/**.
Fallback families: новый SVG fallback (ConstructorRealisticSvgModel.tsx) и старый Visualization.tsx/ProductionModel2DView.tsx.
Checkout UIs: компоненты src/static-pages/constructor/components/Checkout* и legacy src/configurator/checkout/*.
Pricing helpers: несколько слоёв pricing‑логики распределены между src/pricing, src/shared/lib/price.ts, src/constructor/pricing.ts, adapters и т.д..

Такие дубли создают риск расхождения поведения и сложности поддержки. Следует выбрать одну реализацию (новую) и удалить/архивировать остальные после завершения миграций.

14. Риски для дальнейшей работы агентов
Сложные God‑компоненты и монолитный store. Большие файлы и отсутствие разделения responsibilities осложняют автоматический анализ, refactoring‑tasks и генерацию кода. Модульность и slices облегчат дальнейшую работу агентов.
Дублирование кода. Наличие параллельных реализаций (legacy vs new) может привести к тому, что агент случайно обновит устаревший файл или тест. Нужно явно помечать legacy‑зоны и блокировать их в CI.
CSS‑монолиты. Огромные CSS‑файлы затрудняют анализ стилей, поиск unused‑классов и внедрение дизайн‑системы. Агенты могут столкнуться с конфликтающим каскадом. Необходимо разрабатывать фичи только в новых CSS‑модулях и постепенно вычищать старые после визуального review.
Расхождение документов. Отсутствие architect-rules.md и task-001-architecture-audit.md говорит о том, что единые правила архитектурного аудита отсутствуют. Агенты могут руководствоваться устаревшими инструкциями. Важно создать единый документ с актуальными правилами и чек‑листами.
Неполное покрытие API‑документацией. Заявки на заказ и прайсовые позиции должны иметь чётко описанные API‑контракты, включая схемы запросов и ответов. Без этого сложно писать клиентский код и проводить интеграционные тесты.
Сложные скрипты и тесты. Большое количество npm‑команд и мега‑скриптов требует строгого соблюдения последовательности. Любой пропуск может нарушить сборку или деплой. Для агентов полезно иметь единую точку входа (например, qa:all), но нужно регулярно обновлять её.
Несогласованность pricing. Пока не внедрены hardware/services‑price, возможно несоответствие цены в UI и production. Агентам необходимо проверять, какую формулу использовать, чтобы не сломать итоговый расчёт.
Production env и PII. Ошибки в обработке окружения (например, неправильный URL или отсутствующий API‑key) могут остановить сборку. Любые изменения должны проходить через predeploy:guard и smoke‑тесты.
15. Рекомендованный backlog (P0–P3)

P0 (критично):

Декомпозировать Constructor3DPage.tsx и constructorStore.ts на мелкие компоненты и slices, сохраняя API.
Создать единый master‑документ для архитектурных правил (замена отсутствующих architect-rules.md) и описать процессы аудита.
Провести окончательную миграцию от src/configurator/** к src/static-pages/constructor/**; запретить legacy‑imports и удалить legacy‑код после переноса тестов.
Централизовать pricing‑логику и убрать дублирующие helpers.
Разработать схемы API для всех серверных функций и задокументировать их.

P1 (высокий приоритет):

Разбить монолитные CSS‑файлы на тематические модули (shell, stepper, drawer, scene, forms, checkout, status); при этом сохранить визуальное соответствие (понадобится визуальный QA).
Разбить крупные тестовые файлы (geometry, store, rules) на более мелкие; увеличить читабельность.
Отдельно вынести adapters в Three.js‑слое (dimensions, materials, selection, hardware, mode).

P2 (средний приоритет):

Завершить интеграцию hardware/services‑pricing (Stage 19–22) и обновить документацию о pricing.
Архивировать stage‑отчёты и устаревшие документы, чтобы уменьшить шум и избежать путаницы.
Оптимизировать scripts: объединить аудиты (CSS, компонентный, визуальный), упростить порядок запусков, добавить описания.

P3 (низкий приоритет):

Перейти на feature‑based архитектуру по плану feature-architecture-plan.md (выделение app, features/constructor, viewer, pricing и т.д.).
Усовершенствовать design system adoption: заменить оставшиеся legacy‑классы на rzm-*, добавить документацию по motion, surfaces и mobile.
Дополнить glossary новыми терминами, обновлять определения по мере развития проекта.
Заключение

Проект «Размерно» перешёл к 3D‑first конструктору, но его архитектура всё ещё несёт значительный legacy‑багаж: God‑компоненты, монолитные CSS и store, дублирование модулей, смешение UI и бизнес‑логики. Однако существует чёткий план декомпозиции и перехода к feature‑архитектуре, описанный в документах. Для успешной работы в рамках LLM‑агентов необходимо придерживаться этих планов, строго разделять ответственности, обновлять документацию и устранять дубли. Это сократит технический долг и упростит дальнейшее развитие конструктора.