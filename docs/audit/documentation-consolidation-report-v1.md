# Documentation Consolidation Report v1 — Размерно

Дата: 2026-06-15

Статус: documentation-only consolidation.

Runtime code, architecture, pricing, constructor, checkout, Three.js и production logic не менялись.

## 1. Executive Summary

`docs/planning/current-backlog.md` закреплён как единственный operational backlog для агентов.

Временный backlog `docs/planning/backlog-followups-test-infrastructure-v1.md` был проверен и консолидирован: его задачи перенесены, объединены или сопоставлены с уже существующими задачами в `current-backlog.md`.

Удаление временного файла было попытано, но GitHub connector заблокировал delete action. Поэтому создан archive marker: `docs/archive/planning/backlog-followups-test-infrastructure-v1.md`.

## 2. Найденные дубли

- `docs/planning/current-backlog.md` и `docs/planning/backlog-followups-test-infrastructure-v1.md` — временный backlog дублировал основной.
- `docs/roadmap.md` и `docs/planning/release-roadmap.md` — roadmap overlap, требует отдельной нормализации.
- `docs/BACKLOG.md`, `BACKLOG-v3.md`, `docs/planning/current-backlog.md` — backlog overlap, требует отдельного cleanup.
- `docs/audit/*` и `docs/audits/*` — audit folder split, требует отдельного решения.

## 3. Найденные конфликты

- Во временном backlog `Nightly Pipeline` и `Release Pipeline` были P2, но в основном backlog уже существуют как P1-14 и P1-15. Приоритет оставлен P1.
- Номера P1-14, P1-15, P1-16 во временном backlog конфликтовали с уже занятыми номерами в `current-backlog.md`.

## 4. Выполненная консолидация

Изменён `docs/planning/current-backlog.md`.

Добавлено:

- P0-16 Constructor Reset Contract Resolution.
- P0-17 Constructor Smoke Test Stabilization.
- P1-18 Deployment Validation Layer.
- P1-19 Test Quarantine System.

Объединено:

- P1-16 Fast / Medium / Heavy Test Separation объединён с P1-16 Package Scripts Ownership.

Не добавлено как дубли:

- P2-04 Nightly Pipeline — уже покрыто P1-14 Nightly QA Workflow.
- P2-05 Release Pipeline — уже покрыто P1-15 Release QA Workflow.

## 5. Source of Truth

- Backlog → `docs/planning/current-backlog.md`.
- Roadmap → `docs/planning/release-roadmap.md`.
- Master strategy → `docs/planning/master-development-plan-v1.md`.
- MVP scope → `docs/planning/mvp-scope.md`.
- Architecture decisions → `docs/planning/architecture-decisions.md`.
- Agent workflow → `docs/planning/agent-workflow.md`.
- Parallelization rules → `docs/planning/parallelization-rules.md`.
- Architect rules → `docs/agent/architect-rules.md`.
- Test infrastructure report → `docs/qa/test-infrastructure-report-v1.md`.

## 6. Archive Candidate

- `docs/planning/backlog-followups-test-infrastructure-v1.md` — consolidated, should be deleted or replaced by redirect marker in a follow-up cleanup pass.
- `docs/roadmap.md` — archive candidate if `release-roadmap.md` remains roadmap source of truth.
- `BACKLOG-v3.md` — archive candidate.
- `docs/history/stage-reports/*` — historical only.

## 7. Финальная структура документации

```text
docs/
├ planning/
├ audit/
├ architecture/
├ pricing/
├ production/
├ qa/
├ agent/
└ archive/
```

`docs/audit` vs `docs/audits` still requires a separate consolidation decision.

## 8. Изменённые документы

- `docs/planning/current-backlog.md`

## 9. Созданные документы

- `docs/archive/planning/backlog-followups-test-infrastructure-v1.md`
- `docs/audit/documentation-consolidation-report-v1.md`

## 10. Архивированные документы

- Archive marker created: `docs/archive/planning/backlog-followups-test-infrastructure-v1.md`.

Not physically removed:

- `docs/planning/backlog-followups-test-infrastructure-v1.md`.

Reason: GitHub connector blocked delete action.

## 11. Перенесённые записи

- P0-16 Constructor Reset Contract Resolution.
- P0-17 Constructor Smoke Test Stabilization.
- P1-18 Deployment Validation Layer.
- P1-19 Test Quarantine System.

Merged:

- Fast / Medium / Heavy Test Separation → P1-16.

Mapped without duplicate:

- Nightly Pipeline → P1-14.
- Release Pipeline → P1-15.

## 12. Был ли удалён backlog-followups-test-infrastructure-v1.md

Нет. Удаление было попытано, но заблокировано GitHub connector.

## 13. Оставшиеся риски

- Временный follow-up файл физически остаётся в `docs/planning/`.
- `docs/planning/README.md` не обновлён: update call был заблокирован connector.
- `docs/audit` и `docs/audits` всё ещё конкурируют.
- Root backlog/roadmap документы требуют отдельного cleanup.

## 14. Checks

Кодовые проверки не запускались, потому что задача documentation-only.
