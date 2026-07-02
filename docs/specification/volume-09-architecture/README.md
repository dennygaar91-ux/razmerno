
# RPES — Том IX. System Architecture

Проект: «Размерно»  
Версия: 1.1 draft  
Статус: рабочий Source of Truth по архитектуре системы  
Дата: 2026-06-25  

---

# 1. Назначение тома

Том IX описывает системную архитектуру проекта «Размерно»: frontend, backend, Supabase, API, конструктор, Three.js, Pricing Engine, Production Engine, админку, личный кабинет, email и тестовую инфраструктуру.

Этот том нужен, чтобы все подсистемы развивались согласованно и не смешивали ответственность.

Главная цель архитектуры:

> Любое пользовательское действие должно проходить через понятную цепочку: UI → состояние → валидация → pricing → production model → заявка → snapshots → admin/customer views.

---

# 2. Архитектурная философия

## 2.1 Один слой — одна ответственность

Каждый слой системы должен отвечать только за свою область:

- Constructor UI — пользовательский сценарий и ввод;
- Constructor State — конфигурация пользователя;
- Three.js — визуализация и интерактивность;
- Pricing Engine — стоимость;
- Production Engine — производственная модель;
- API — серверные контракты и создание заказов;
- Supabase — данные, каталог, заявки, пользователи;
- Admin — операционный контроль;
- Customer Cabinet — клиентский доступ к проектам и заявкам;
- Email — уведомления;
- Tests — защита контрактов.

Смешивание ответственности запрещено.

## 2.2 Production correctness first

Если возникает конфликт между красивым UX и производственной корректностью, система должна сохранить производственную корректность и найти понятный способ объяснить ограничение пользователю.

## 2.3 Deterministic data flow

Одна и та же конфигурация должна давать одинаковые результаты:

- price snapshot;
- production snapshot;
- Basis manual plan;
- customer summary;
- admin summary.

---

# 3. Высокоуровневая схема

```text
Landing
  ↓
Constructor UI
  ↓
Constructor State
  ↓
Validation Layer
  ↓
Pricing Engine ← Supabase Catalog
  ↓
Production Engine / Production JSON
  ↓
Order API
  ↓
Supabase Orders
  ↓
Email Notifications
  ↓
Customer Cabinet / Admin
```

Three.js подключается к Constructor State и отображает модель, но не является source of truth.

---

# 4. Frontend

## 4.1 Основные зоны frontend

Frontend включает:

- главную страницу;
- страницы материалов/замеров/сборки;
- конструктор;
- Three.js-сцену;
- авторизацию;
- личный кабинет;
- админку;
- fallback UI.

## 4.2 Принцип frontend

Frontend не должен самостоятельно принимать производственные решения.

Он может:

- показывать интерфейс;
- собирать ввод;
- вызывать validation;
- показывать цену;
- отображать 3D;
- отправлять заявку.

Но он не должен быть единственным источником производственной истины.

---

# 5. Constructor State

## 5.1 Назначение

Constructor State хранит пользовательскую конфигурацию.

В нём должны быть:

- тип мебели;
- размеры;
- секции;
- наполнение;
- материалы;
- panel-level overrides;
- фурнитура;
- опоры;
- delivery/assembly choices;
- selected object;
- режимы отображения;
- validation status.

## 5.2 Инвариант

Constructor State должен быть достаточным, чтобы восстановить проект пользователя.

Но он не заменяет Production JSON.

---

# 6. Three.js Architecture

## 6.1 Роль

Three.js отображает конфигурацию и принимает пользовательские действия через сцену.

## 6.2 Source of truth

Three.js не является source of truth.

Он получает данные из Constructor State и отправляет события обратно.

## 6.3 Примеры событий

- select panel;
- select section;
- add shelf;
- change panel material;
- open static mode;
- open exploded mode.

---

# 7. Pricing Architecture

## 7.1 Роль

Pricing Engine рассчитывает точную стоимость.

## 7.2 Источники

Pricing использует:

- constructor configuration;
- production model;
- Supabase catalog;
- fallback seed catalog для development/staging;
- delivery/assembly policy.

## 7.3 Snapshot

При отправке заявки сохраняется price snapshot.

---

# 8. Production Architecture

## 8.1 Роль

Production Engine формирует производственную модель.

## 8.2 v3 / v4

Текущий runtime может использовать v3, но v4 является целевой моделью до MVP.

Миграция должна быть контролируемой:

- isolated v4;
- adapter;
- validation;
- golden comparison;
- dual-run;
- runtime switch.

## 8.3 Инвариант

Заявка не может быть создана без валидной production model.

---

# 9. API Architecture

## 9.1 Роль API

API отвечает за серверные контракты:

- создание заказа;
- idempotency;
- price validation;
- production export;
- email triggering;
- diagnostics;
- admin access.

## 9.2 Order API

Order API должен:

- принимать валидный payload;
- проверять idempotency;
- формировать/сохранять snapshots;
- не создавать duplicate orders;
- обрабатывать notification failure без потери заявки.

## 9.3 Idempotency

Same payload with same idempotency key → replay success.

Different payload with same idempotency key → conflict.

---

# 10. Supabase Architecture

## 10.1 Роль Supabase

Supabase хранит:

- пользователей;
- проекты;
- заявки;
- snapshots;
- material catalog;
- hardware catalog;
- price catalog;
- admin data;
- history.

## 10.2 Catalog

Supabase catalog должен включать:

- материалы;
- размеры листов;
- декоры;
- толщины;
- цены;
- фурнитуру;
- характеристики.

## 10.3 Не учитывать пока

Остатки/наличие материалов пока не учитываются.

---

# 11. Customer Cabinet Architecture

Личный кабинет использует:

- user auth;
- projects;
- orders;
- price snapshots;
- production snapshots;
- customer summary;
- status history.

Клиентский кабинет не показывает raw production JSON.

---

# 12. Admin Architecture

Админка использует:

- orders;
- customer data;
- price snapshots;
- production summaries;
- validation/review statuses;
- email statuses;
- Basis status;
- Change Requests;
- Approval View preparation;
- audit/event log;
- exports.

Release v1 admin = Order Operations Workspace: status changes, manual payment confirmation, pricing adjustment, CR resolution, audit inspection.

Manager не редактирует submitted JSON manually в Release v1.

---

# 12.1 Status vs Business Rules / Locks

Архитектурный принцип Release v1:

- **Status** отвечает: где заказ в lifecycle (`Черновик`, `Проверка`, `Оплата`, `В работе`, `Завершено`, `Отмена`).
- **Business Rules / Locks** отвечают: какие действия сейчас разрешены (`Production Lock`, `Approval Lock`, future payment/delivery locks).

Не кодировать каждое operational ограничение отдельным customer-facing status.

Пример: open Change Request в `Проверка` → `Production Lock = true`.

---

# 12.2 Change Request Lifecycle (canonical)

Decision source: Release v1 product decisions.

Единое определение business process. RPES VII и RPES VIII ссылаются сюда; не дублировать lifecycle в других томах.

## Initiator

- customer (через cancellation request или запрос изменений);
- manager/operator (через operational evaluation).

## Manager evaluation

Manager/operator оценивает запрос, фиксирует изменения в Operations View и при необходимости открывает Approval View для customer confirmation.

## Approval View

Text-based customer confirmation для изменений цены/конфигурации. Customer outcomes:

- **Confirmed** — `Изменения подтверждаю`;
- **Rejected** — `Изменения не подтверждаю`;
- **Cancelled** — `Отмена изменений` (CR закрыт без применения изменений).

## Production Lock interaction

- Open CR при order status `Проверка` → `Production Lock = true`;
- B3D handoff и production transfer блокируются до resolution CR;
- status остаётся `Проверка`; lock — business rule, не отдельный customer status.

## Terminal CR outcomes

| Outcome | Meaning |
|---|---|
| Confirmed | Изменения приняты и зафиксированы в audit trail |
| Rejected | Изменения отклонены customer |
| Cancelled | CR закрыт без применения изменений |

---

# 13. Email Architecture

Email используется для:

- подтверждения заявки клиенту;
- уведомления менеджера;
- передачи номера заказа;
- ссылки в личный кабинет.

Email не должен содержать raw production JSON или технические warnings.

---

# 14. Validation Architecture

Валидация должна существовать на нескольких уровнях:

- client validation;
- constructor validation;
- pricing validation;
- production validation;
- API validation.

Нельзя полагаться только на client-side validation.

---

# 15. Testing Architecture

## 15.1 Типы тестов

Нужны:

- unit tests;
- contract tests;
- golden snapshots;
- pricing parity tests;
- production export tests;
- admin summary tests;
- env diagnostics tests;
- future e2e tests;
- future visual regression tests.

## 15.2 Инвариант

Любое ключевое product/engineering rule должно иметь тест или explicit manual QA checklist.

---

# 16. Deployment Architecture

Production deployment должен быть возможен только если:

- build зелёный;
- typecheck зелёный;
- contract tests зелёные;
- production tests зелёные;
- env readiness проверен;
- Supabase catalog готов;
- email provider готов;
- admin доступ защищён.

---

# 17. Security Architecture

## 17.1 PII

PII не должен попадать в логи.

Admin может видеть клиентские данные, но backend/frontend logging должен быть PII-safe.

## 17.2 Auth

Авторизация обязательна для:

- личного кабинета;
- просмотра заказов;
- admin access.

## 17.3 Admin

Admin route должен быть защищён.

---

# 18. Observability

Нужны:

- diagnostics;
- env readiness;
- order pipeline status;
- email status;
- pricing source status;
- production validation status.

Всё это должно быть PII-safe.

---

# 19. Инварианты архитектуры

1. Three.js не является source of truth.
2. Constructor State не заменяет Production JSON.
3. Pricing и Production должны опираться на одну конфигурацию.
4. Заявка сохраняет snapshots.
5. Client/server price mismatch виден админу.
6. Клиент не видит raw production data.
7. Supabase catalog нужен до MVP.
8. API защищает idempotency.
9. Email failure не должен уничтожать заказ.
10. PII не логируется.
11. Backlog-задачи должны соответствовать RPES.
12. Production v4 migration должна быть контролируемой.

---

# 20. Открытые вопросы

1. Финальная Supabase schema.
2. Auth provider и механизм логина.
3. Storage strategy для snapshots.
4. Runtime migration v3 → v4.
5. Full e2e test strategy.
6. Visual regression strategy.
7. Monitoring provider.
8. Admin access model.
9. Customer cabinet routing.
10. Release pipeline.

---

# 21. Backlog implications

1. Supabase Schema v1.
2. Auth Architecture.
3. Customer Cabinet Data Model.
4. Order Snapshot Storage.
5. Production v4 Runtime Migration Plan.
6. API Diagnostics v2.
7. Admin Access Hardening.
8. Test Orchestration.
9. Visual Regression Setup.
10. Release Readiness Pipeline.
