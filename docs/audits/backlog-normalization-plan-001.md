# Backlog Normalization Plan 001

Дата: 2026-06-13

## Причина создания

Во время Infrastructure Audit 001 выявлено, что часть записей в `docs/BACKLOG.md` относится к более ранним этапам проекта и может не соответствовать текущему состоянию репозитория после декомпозиции конструктора, CSS split и появления новой документации.

Из-за риска потери важных задач прямое редактирование `docs/BACKLOG.md` без полной сверки всех пунктов считается небезопасным.

## Что обнаружено

1. Некоторые файлы, ранее помеченные как огромные god-components, уже были частично декомпозированы.
2. Появились новые архитектурные документы, которых нет в backlog.
3. Появился GitHub Actions workflow `qa.yml`.
4. Не отражены новые architecture boundaries.
5. Не отражены новые audit-документы.

## Безопасный план актуализации

### Этап A — инвентаризация

Собрать:

- все пункты текущего `docs/BACKLOG.md`;
- статус каждого пункта;
- фактическое состояние файлов.

Результат:

- таблица «актуально / выполнено / устарело / требует проверки».

### Этап B — сверка с репозиторием

Для каждого backlog-пункта определить:

- выполнен полностью;
- выполнен частично;
- не выполнен;
- устарел;
- заменён новым решением.

### Этап C — нормализация

Разделить backlog на разделы:

- Architecture
- Infrastructure
- Constructor
- Three.js
- Pricing
- Order Flow
- Production
- Admin
- UX/UI
- Testing
- Documentation

### Этап D — статусная модель

Для каждого пункта:

- Planned
- In Progress
- Blocked
- Done
- Deferred
- Replaced

## Новые backlog-пункты, уже выявленные аудитом

### Architecture

- project-map maintenance
- runtime-boundaries maintenance
- constructor-state-and-layout maintenance
- pricing-and-order-boundaries maintenance
- css-ownership-map maintenance

### Infrastructure

- GitHub Actions QA verification
- automated repository inventory
- largest files report
- dependency graph report
- route map report

### Documentation

- audit index maintenance
- architecture index maintenance
- ADR/decision log design

## Риск

Без полной инвентаризации существует риск ошибочно удалить или закрыть задачи, которые всё ещё актуальны.

Поэтому на текущем этапе backlog не изменяется напрямую.
