# Release v1 Scope — Размерно

> Путь файла сохранён как `docs/planning/mvp-scope.md` для совместимости с существующими ссылками и workflow.
>
> Содержание документа описывает **Release v1 Scope**, а не урезанный «сырой MVP».

Документ фиксирует обязательный продуктовый объём Release v1, логическую последовательность поставки, границы scope и exit criteria.

---

## Главная цель Release v1

Пользователь должен пройти полный сервисный цикл:

```text
Главная
→ конструктор
→ валидная конфигурация
→ авторизация (при отправке заявки)
→ заявка
→ личный кабинет
→ операционная обработка в админке
→ price snapshot
→ production snapshot / JSON
→ ручная подготовка B3D
→ ручная оплата
→ передача в работу
→ завершение
```

---

## Логическая последовательность поставки

1. **Constructor Core** — Constructor3D, state model, pricing preview, checkout submit, WebGL fallback.
2. **Pricing & Order Reliability** — server-authoritative pricing, parity evidence, stored order snapshot.
3. **Customer Platform** — auth gate, email + password, профиль, черновики, личный кабинет, карточка заказа.
4. **Orders Lifecycle** — domain statuses `Черновик → Проверка → Оплата → В работе → Завершено` и terminal `Отмена`; `RZM_0001`, Change Request, Production Lock, audit trail.
5. **Operations Workspace** — Order Operations Workspace в админке, Operations View, Approval View, ручные корректировки цены.
6. **Production Handoff** — structured JSON обязателен; B3D создаётся вручную в Basis; backend остаётся source of truth.
7. **Payments & Notifications** — ручная оплата, notification center + email, preview/screenshot на submit.
8. **Release Candidate** — QA gate, live provider verification, visual review, release workflow.

---

## Входит в Release v1

### Продукт и конструктор

- шкафы как основной безопасный сценарий;
- тумбы и комоды — в scope, если не блокируют сроки; при сокращении приоритет: шкаф → тумба → комод;
- кухни не входят;
- Constructor3D по умолчанию, 2D/WebGL fallback как полноценный режим;
- выбор секций/зон, наполнение, материалы, фасады, random preset, камеры;
- checkout с контактами, доставкой, сборкой, сметой, success без reset модели.

### Customer Platform

- точки входа в авторизацию: `Войти` / `Личный кабинет` в header и auth gate при `Оформить заявку`;
- регистрация: email + password + ФИО; phone не обязателен при регистрации;
- phone автозаполняется в профиле после первого заказа; адрес принадлежит заказу, не профилю;
- изменение ФИО/phone — через email-code confirmation; email меняется только через support;
- черновики/проекты для авторизованных пользователей; autosave meaningful changes;
- личный кабинет: черновики, заявки, карточка заказа, notification center;
- публичный номер заказа `RZM_0001`, `RZM_0002`, … только после submit;
- customer order card: номер, статус, дата, контакты, адрес, preview, размеры, декор, фурнитура, pricing summary, ETA, progress timeline, customer actions;
- `Отменить заявку` создаёт cancellation request, не мгновенную отмену.

### Orders, views и lifecycle

- customer-facing domain statuses: `Черновик`, `Проверка`, `Оплата`, `В работе`, `Завершено`, `Отмена` (terminal cancel only);
- статусы меняет только manager/operator;
- единая модель данных с тремя представлениями: **Customer View**, **Operations View**, **Approval View**;
- Change Request lifecycle; Production Lock при открытом CR в `Проверка`;
- принцип **Status vs Business Rules / Locks**: статус = этап lifecycle; locks = разрешённые действия;
- audit trail / event log для операций; клиент видит упрощённый progress, не полный audit log.

### Pricing

- финальная цена рассчитывается только на backend; frontend — preview/non-authoritative;
- после submit фиксируется initial pricing snapshot (`initial_backend_price`, `pricing_version`, `config_snapshot`, breakdown);
- manager manual price adjustment не перезаписывает initial snapshot;
- рост цены после submit требует customer approval через Approval View;
- delivery и assembly — отдельные строки; округление до 1 ₽.

### Admin / Operations

- Admin Platform Release v1 = **Order Operations Workspace**, не CRM;
- список/очереди, карточка заказа, customer summary, technical JSON, pricing snapshot, Change Request, Approval View, audit log, manual payment confirmation, status updates;
- manager не редактирует JSON вручную в Release v1.

### Production / Manufacturing

- structured configuration JSON обязателен для каждого submitted order;
- B3D создаётся вручную в Basis после submit; production package в Release v1 — primarily B3D;
- JSON alone не является factory-ready handoff;
- backend остаётся source of truth после production handoff; Basis — production tool/editor;
- preview/screenshot wardrobe сохраняется при submit (object storage reference).

### Payments & Notifications

- online payment out of scope;
- manual payment link через messenger; manager подтверждает оплату;
- channels: email + notification center в кабинете; без push/SMS.

---

## Не входит в Release v1

- кухни;
- online payment;
- magic link / OAuth / social login;
- полноценная CRM, Bitrix/amoCRM replacement;
- automatic `.b3d` generation;
- manager manual JSON editing;
- push / SMS notifications;
- mobile-first rebuild как блокер desktop Release v1;
- полноценная инженерная 2D CAD-система;
- cinematic assembly animation;
- сложная production editor-система;
- automatic retry payment queue;
- отзывы и фейковые social proof.

---

## Exit criteria Release v1

Release v1 считается готовым, когда на merged/main evidence подтверждено:

1. Полный customer path: constructor → auth gate → submit → cabinet → order card.
2. Server-authoritative pricing + stored snapshot + parity evidence для ключевых сценариев.
3. Customer statuses и Operations Workspace согласованы с RPES и backlog.
4. WebGL fallback не блокирует конфигурацию и checkout.
5. Structured JSON + preview сохраняются при submit; B3D flow documented as manual.
6. Manual payment workflow и notification center/email работают для core events.
7. GitHub QA / main verification / live provider checks — по release gate из backlog.
8. Visual review для desktop constructor/checkout/fallback — explicit human approval.

---

## Правило scope control

Если новая задача не помогает закрыть Release v1 customer + operations cycle, она остаётся в backlog за пределами обязательного release scope.

Если задача улучшает производство, но не нужна для первой ручной обработки заявки, она не блокирует Release v1 без отдельного planning decision.

Если задача ломает pricing, checkout, state или order lifecycle contracts, она не выполняется без architectural review.
