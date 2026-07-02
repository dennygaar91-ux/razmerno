
# RPES — Том VIII. Admin Platform

Проект: «Размерно»
Версия: 1.1 draft

# 1. Назначение

Административная панель является внутренним **Order Operations Workspace** продукта.

Она предназначена для обработки заявок, контроля статусов, проверки производственной модели, мониторинга цены, Change Requests, audit trail и передачи заказа в производство.

Админка не является CRM и не заменяет Bitrix/amoCRM или полноценный sales pipeline.

Админка не должна дублировать конструктор. Она работает с уже сформированной конфигурацией.

# 2. Пользователи

На MVP единственный пользователь — владелец бизнеса.

В будущем:

- менеджер;
- технолог;
- производство;
- поддержка.

# 3. Основные разделы

MVP включает:

- Dashboard;
- список заявок;
- карточку заявки;
- Production Summary;
- Pricing Summary;
- Customer Summary;
- история статусов;
- мониторинг email;
- экспорт (после реализации).

# 4. Dashboard

Dashboard показывает:

- новые заявки;
- заявки в работе;
- производство;
- отправленные;
- закрытые;
- проблемные заявки;
- количество заказов;
- общую сумму;
- предупреждения.

# 5. Список заявок

Каждая строка содержит:

- номер;
- дату;
- клиента;
- тип мебели;
- стоимость;
- статус;
- email status;
- production status.

Поддерживаются:

- поиск;
- фильтрация;
- сортировка.

# 6. Карточка заявки

Карточка включает:

- параметры изделия;
- размеры;
- материалы;
- наполнение;
- стоимость;
- доставка;
- сборка;
- Production Summary;
- Basis Status;
- snapshots;
- историю.

PII должна отображаться безопасно (masking там, где требуется).

# 7. Статусы

Customer-facing Release v1 domain statuses:

```text
Черновик → Проверка → Оплата → В работе → Завершено
Отмена — terminal cancel status (только manager/operator)
```

Канонический enum: `Черновик`, `Проверка`, `Оплата`, `В работе`, `Завершено`, `Отмена`.

Decision source: Release v1 product decisions.

Operations queues (recommended):

- New / Проверка;
- Waiting for customer approval;
- Payment;
- Ready for production / В работе handoff;
- In production / В работе;
- Completed;
- Cancelled.

Только manager/operator меняет order status. Customer cancel action создаёт cancellation request.

При open Change Request в `Проверка` активируется **Production Lock** — business rule, не отдельный customer status. Canonical CR lifecycle: RPES IX §12.2.

# 8. Production Review

Админка показывает:

- validation;
- review;
- warnings;
- Basis readiness;
- production version.

Редактирование production model на MVP не требуется.

# 9. Pricing

Админ видит:

- цену изделия;
- доставку;
- сборку;
- итог;
- snapshot;
- источник цены;
- client/server parity.

# 10. Email

Показываются:

- отправлено клиенту;
- отправлено менеджеру;
- ошибки доставки.

# 11. Безопасность

Админка не должна быть доступна неавторизованным пользователям.

Все действия логируются.

# 12. Инварианты

1. Только валидные заявки.
2. Read-only работа с production model на MVP.
3. Одна заявка — один snapshot.
4. Нет расхождения между ценой и Production JSON.
5. Dashboard строится по тем же данным, что и личный кабинет.

# 13. Backlog

- Admin Dashboard v2
- Production Review Editor
- JSON/PDF Export
- Order Timeline
- KPI Dashboard
- Multi-role Access
- Manufacturing Queue
- Notifications Center

# 14. Дополнительные решения Admin v1.1

## 14.1 Редактирование

Админ может:

- менять статус заказа;
- создавать/вести Change Request (canonical lifecycle: RPES IX §12.2);
- готовить Approval View;
- подтверждать оплату вручную;
- делать manual commercial price adjustment с reason/audit;
- просматривать Audit Log / История изменений.

Manager **не редактирует JSON вручную** в Release v1. Initial JSON остаётся submitted/configuration snapshot; post-Basis changes описываются через Change Requests и audit events.

Ручное редактирование production model пока не входит в ближайший scope.

## 14.2 Роли

Роли не требуются в MVP/Release v1.

На первом этапе админкой пользуется один человек.

Роли владелец/менеджер/технолог можно добавить позже.

## 14.3 JSON/PDF export

JSON export для operations — in scope Release v1.

PDF/specification export — optional, если JSON/B3D flow достаточен для production/manual validation.

Decision source: Release v1 product decisions.

## 14.4 PII

На первом этапе ограничение PII по ролям не требуется, так как админкой пользуется один человек.

Но технически система всё равно не должна логировать PII без необходимости.

## 14.5 Email retry

Нужен ручной retry email.

Админ должен иметь возможность повторить отправку email, если уведомление не ушло.
