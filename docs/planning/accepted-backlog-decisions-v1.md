# Accepted Backlog Decisions v1

## 1. Назначение документа

Этот документ фиксирует уже принятые product / planning решения, которые обязательны для всех агентов до их явной замены или reconciliation.

## 2. Связь с current-backlog.md

- `docs/planning/current-backlog.md` остаётся главным backlog source of truth.
- `docs/planning/accepted-backlog-decisions-v1.md` является обязательным decision layer поверх backlog.
- Backlog описывает статус, scope и evidence, а этот документ фиксирует принятые правила и ограничения, которые нельзя тихо переписать локальным решением в PR или ветке.

## 3. Decision Register

1. Open PR, draft PR и branch-only evidence не являются closure evidence.
2. PR #41 не merge как есть.
3. PR #43 устарел после PR #77-#79.
4. PR #51 не merge как есть; production snapshots для MVP должны быть вокруг active v3 path.
5. PR #52 должен быть согласован с true payload-match idempotency.
6. Legacy Constructor находится в quarantine.
7. Constructor3D state ownership должен жить в отдельном документе.
8. Ближайшая release goal: `8/10 strong MVP-ready`.

## 4. Pricing Decisions

- Q8: `Supabase/runtime catalog` является главным источником цены для MVP.
- Pricing решения в backlog не должны противоречить этому правилу без явного reconciliation.
- Итоговая цена в customer-facing constructor / checkout округляется до 1 ₽.
- Цена должна восприниматься как результат точной спецификации и системы расчёта, а не как маркетинговая округлённая оценка.
- Минимальная стоимость заказа для MVP: 10 000 ₽.

## 5. API / Orders / Idempotency Decisions

- Q14: same payload replay должен возвращать тот же order/result.
- Q14: different payload replay должен возвращать `409 conflict`.
- Customer email failure не отменяет успешную заявку; ошибка логируется.
- Manager email failure не отменяет успешную заявку для клиента; должен фиксироваться внутренний статус или событие `manager_notification_failed`.
- В MVP используется manual retry; automatic retry queue откладывается на более поздний цикл.

## 6. Constructor3D Decisions

- Active customer-facing path должен оставаться вокруг Constructor3D, а не legacy Constructor.
- Legacy Constructor не должен тихо возвращаться в активный scope.
- Constructor3D state ownership требует отдельного документа, а не неявного решения в feature PR.
- В 3D-режиме пользователь не должен видеть labels, markers или технические overlay-подсказки.
- 3D-режим является чистым customer-facing preview: модель должна быть главным визуальным элементом и не должна конкурировать с интерфейсными подсказками.
- Labels и markers разрешены в 2D-режиме.
- 2D-режим не должен выглядеть как инженерный чертёж; он должен быть визуальным 2D-preview с выбранными материалами и декорами.
- Current implementation focus: desktop / website experience first.
- Mobile layout / mobile constructor redesign is out of current implementation scope unless explicitly requested by the user.
- Future mobile version should be designed as a smartphone-app-like experience, not as a compressed desktop website.
- Existing mobile behavior may be preserved or minimally guarded from breakage, but agents must not spend current scope redesigning mobile layout.
- На desktop stepper показывает полные названия шагов.
- Mobile stepper/app navigation decisions are deferred to the future mobile app-like design cycle, except for preventing obvious regressions if touched by desktop changes.

## 7. Three.js / WebGL / Fallback Decisions

- WebGL fallback должен быть полноценным SVG/2D режимом, а не сломанным или урезанным preview state.
- Scene/fallback path должен оставаться customer-usable even when WebGL is unavailable.

## 8. Production / Manufacturing Decisions

- Q23: HDF = 3 мм во всех MVP-сценариях.
- Q24: корпус, ящики и полки используют кромку 1 мм в круг.
- Q24: фасады используют кромку 2 мм в круг.
- Для MVP нельзя обещать automatic `.b3d` export для БАЗИС-Мебельщик.
- Разрешён только JSON/intermediate handoff до отдельного подтверждённого implementation cycle.
- Клиент не должен видеть production warnings, manufacturing details или технические ошибки, связанные с кромкой, присадкой, HDF, фурнитурой, Basis JSON, factory profile, SKU или технологическими операциями.
- Production validation является отдельным внутренним слоем и не должна превращаться в customer-facing complexity.
- Internal production warnings должны быть отдельно проработаны как крупный production rules / Basis JSON decision block перед глубокой реализацией manufacturing engine.

## 9. Visual QA / Design System Decisions

- Visual closure требует fresh screenshots и явный visual review.
- Screenshot artifact сам по себе не закрывает visual task без review decision.
- В UX/UI конфликте модель/preview важнее декоративных подсказок: интерфейсные элементы не должны перекрывать или визуально подавлять мебель.
- Current visual/design-system implementation focus is desktop / website. Mobile redesign is postponed to a separate future mobile app-like design cycle.

## 10. Customer-facing Validation Decisions

- Клиентские critical errors блокируют отправку заявки.
- Критичными customer-facing errors являются: размеры вне допустимого диапазона, слишком узкая секция, слишком маленькая зона, незаполненные или невалидные обязательные контакты, отсутствие согласия на обработку персональных данных, сумма заказа ниже минимального порога.
- Клиенту разрешено показывать только простые и понятные ошибки: слишком узко, слишком широко, слишком высоко, слишком низко, слишком глубоко, слишком мелко, заполните телефон, заполните email, примите согласие, минимальная сумма заказа 10 000 ₽.
- Клиент отвечает только за размеры, конфигурацию, материалы, контактные данные, согласие и отправку заявки.
- Система отвечает за производственную валидность, Basis JSON, кромку, присадку, HDF, фурнитуру, технологические ограничения, production warnings и ручную проверку в админке.

## 11. Production Rules Discovery Block

- Требуется отдельный production decision cycle для формирования production rules engine и Basis JSON specification.
- Этот цикл должен быть выполнен до заявлений о factory-ready production handoff.
- В рамках production decision cycle должны быть отдельно определены: production warnings, production critical errors, auto-repair rules, manual review rules, Basis JSON validation rules, panel generation rules, edge banding rules, drilling rules, hardware rules, hinge rules, drawer slide rules, rod rules, HDF rules, factory profile rules, SKU/article mapping и production export requirements.
- Этот блок требует отдельного сбора технической документации и проектирования, потому что на его основе будет формироваться Basis JSON и дальнейшая производственная логика.

## 12. Admin / Operations Decisions

- Минимальная рабочая админка входит в MVP scope.
- MVP admin scope: список заявок, детали заявки, статус, production JSON / intermediate handoff, базовая ручная проверка.
- Manager notes нужны в MVP как простое текстовое поле для внутреннего контекста заявки.

## 13. Live Provider / Supabase / PII Decisions

- Live pricing/catalog baseline для MVP опирается на `Supabase/runtime catalog`.
- Failures в notification flow должны логироваться без превращения customer-success path в ложный hard failure там, где это уже запрещено принятыми решениями.

## 14. Release Maturity Decisions

- Цель ближайшего цикла: выйти на состояние `8/10 strong MVP-ready`.
- Это означает приоритет устойчивых customer-visible flows и согласованных operational decisions вместо broad unfinished branches.
- Public MVP требует строгий release gate.
- Минимальный release gate для public MVP: pricing parity, submit flow, live Supabase/email verification, desktop / website visual QA for constructor and core site, fallback usability, and absence of customer blocking regressions.
- Mobile app-like design is not part of current release gate unless explicitly re-scoped by the user.

## 15. Mandatory Agent Rules

- Агент обязан читать `current-backlog.md` как backlog source of truth.
- Агент обязан читать этот файл как обязательный decision layer.
- Агент не должен считать локальную ветку, open PR или draft PR источником принятого product decision.
- Агент должен остановиться, если proposed implementation нарушает любой decision из этого файла.

## 16. Closure Evidence Rules

- Closure evidence требует merged/main evidence согласно backlog rules.
- Open PR, draft PR и branch-only result не являются closure evidence.
- Visual closure требует fresh screenshots и visual review.

## 17. Reconciliation Rules

- Если `current-backlog.md` и `accepted-backlog-decisions-v1.md` конфликтуют, агент обязан остановиться и запросить reconciliation.
- Агент не должен самостоятельно выбирать один источник против другого без явного planning decision.
- Любая замена решения из этого документа должна быть оформлена как явное updated decision layer, а не как случайная правка backlog status.
