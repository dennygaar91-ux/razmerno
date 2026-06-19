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

## 7. Three.js / WebGL / Fallback Decisions

- WebGL fallback должен быть полноценным SVG/2D режимом, а не сломанным или урезанным preview state.
- Scene/fallback path должен оставаться customer-usable even when WebGL is unavailable.

## 8. Production / Manufacturing Decisions

- Q23: HDF = 3 мм во всех MVP-сценариях.
- Q24: корпус, ящики и полки используют кромку 1 мм в круг.
- Q24: фасады используют кромку 2 мм в круг.
- Для MVP нельзя обещать automatic `.b3d` export для БАЗИС-Мебельщик.
- Разрешён только JSON/intermediate handoff до отдельного подтверждённого implementation cycle.

## 9. Visual QA / Design System Decisions

- Visual closure требует fresh screenshots и явный visual review.
- Screenshot artifact сам по себе не закрывает visual task без review decision.

## 10. Live Provider / Supabase / PII Decisions

- Live pricing/catalog baseline для MVP опирается на `Supabase/runtime catalog`.
- Failures в notification flow должны логироваться без превращения customer-success path в ложный hard failure там, где это уже запрещено принятыми решениями.

## 11. Release Maturity Decisions

- Цель ближайшего цикла: выйти на состояние `8/10 strong MVP-ready`.
- Это означает приоритет устойчивых customer-visible flows и согласованных operational decisions вместо broad unfinished branches.

## 12. Mandatory Agent Rules

- Агент обязан читать `current-backlog.md` как backlog source of truth.
- Агент обязан читать этот файл как обязательный decision layer.
- Агент не должен считать локальную ветку, open PR или draft PR источником принятого product decision.
- Агент должен остановиться, если proposed implementation нарушает любой decision из этого файла.

## 13. Closure Evidence Rules

- Closure evidence требует merged/main evidence согласно backlog rules.
- Open PR, draft PR и branch-only result не являются closure evidence.
- Visual closure требует fresh screenshots и visual review.

## 14. Reconciliation Rules

- Если `current-backlog.md` и `accepted-backlog-decisions-v1.md` конфликтуют, агент обязан остановиться и запросить reconciliation.
- Агент не должен самостоятельно выбирать один источник против другого без явного planning decision.
- Любая замена решения из этого документа должна быть оформлена как явное updated decision layer, а не как случайная правка backlog status.
