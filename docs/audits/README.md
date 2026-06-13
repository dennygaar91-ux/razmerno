# Audits — «Размерно»

Дата создания: 2026-06-13
Назначение: индекс формальных аудитов проекта.

## Правило

Каждый аудит должен быть самостоятельным документом: с датой, scope, проверенными зонами, выводами, рисками и backlog.

Аудит не должен менять runtime-код. Если аудит выявляет проблему, исправление оформляется отдельным этапом.

## Текущие аудиты

| Документ | Тип | Назначение | Статус |
|---|---|---|---|
| `infrastructure-audit-001.md` | Infrastructure audit | Карта проекта, docs, technical debt, protected zones, рекомендации | created |

## Планируемые аудиты

| Документ | Тип | Назначение |
|---|---|---|
| `architecture-audit-001.md` | Architecture audit | Подробный импорт/зависимости/legacy/new constructor conflicts. |
| `css-audit-002.md` | CSS audit | Follow-up после CSS ownership map. |
| `pricing-order-audit-001.md` | Protected runtime audit | Только анализ pricing/order boundaries без изменений. |
| `constructor-state-audit-001.md` | Constructor state audit | State/source-of-truth, sections/zones/filling/facades. |

## Минимальная структура каждого аудита

1. Дата.
2. Scope.
3. Что проверялось.
4. Что не проверялось.
5. Карта затронутой зоны.
6. Findings.
7. Risks.
8. Technical debt.
9. Recommendations.
10. Backlog.
11. Checks.
12. Что планировалось / сделано / не сделано / почему.

## Связанные документы

- `docs/architecture/README.md`
- `docs/architecture/project-map.md`
- `docs/architecture/runtime-boundaries.md`
- `docs/BACKLOG.md`
- `docs/agent/architect-rules.md`
