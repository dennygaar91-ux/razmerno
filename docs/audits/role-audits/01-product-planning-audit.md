# Role Audit — Product / Planning

## Scope

Роль владеет product intent, source-of-truth hierarchy, release target, backlog structure, acceptance wording, reconciliation правилом и постановкой задач для остальных ролей.

## Sources Reviewed

- `AGENTS.md`
- `docs/specification/README.md`
- `docs/specification/volume-01-product/README.md`
- `docs/specification/volume-09-architecture/README.md`
- `docs/specification/volume-10-governance/README.md`
- `docs/planning/current-backlog.md`
- `docs/planning/accepted-backlog-decisions-v1.md`
- `docs/planning/agent-prompt-rules-v1.md`
- `docs/planning/current-backlog-kanban-v1.md`
- `docs/planning/release-roadmap.md`
- `docs/planning/mvp-scope.md`

## Current State

- В репо есть новый primary SoT пакет RPES в `docs/specification/**` с корневым README и 10 томами.
- Operational backlog baseline зафиксирован в `docs/planning/current-backlog.md`.
- Decision layer и prompt guard layer существуют отдельно.
- Backlog уже разложен по P0/P1/P2/P3 и maturity tracks `M8-*`, `M9-*`, `M10-*`.
- В backlog явно зафиксированы closure/evidence rules, open PR triage, release target `8/10 strong MVP-ready` и role ownership по части задач.

## RPES Alignment

- RPES и governance уже формализуют иерархию `RPES -> backlog -> code`.
- Product intent в RPES томе I совпадает с backlog focus на customer-safe constructor, точную цену и production correctness.
- Governance том и planning docs синхронно запрещают закрывать задачи без evidence.
- Backlog уже отражает ключевые RPES направления: constructor, pricing, order flow, production, visual QA, release maturity.

## Backlog Alignment

- `P0-07 Documentation Sync`
- `P1-21 Release / Post-MVP Visual QA Matrix`
- `M8-P1-05 MVP release candidate checklist`
- `M10-P2-04 Incident response playbook`
- `M10-P3-01 Post-MVP product roadmap`
- cross-role reconciliation blocks for pricing, notification policy, visual closure and production boundaries

## Gaps

- RPES пакет выглядит как `1.0/1.1 draft`; для части томов видно foundation/scaffold слой, а не полностью завершённый executable spec.
- Нет единого role-based audit пакета на уровне planning до этой задачи.
- Между RPES, accepted decisions, backlog и secondary docs уже есть риск drift по частным формулировкам.
- В backlog остаётся большой объём open work по MVP gate, но нет одного product-facing release readiness dashboard файла, который бы связывал RPES, backlog и merged evidence в одном месте.

## Risks

- Product risk: команды могут интерпретировать старые audit/planning docs как равные RPES, если не держать hierarchy жёсткой.
- Release risk: `8/10 strong MVP-ready` останется словесной целью без consolidated evidence map.
- Coordination risk: разные роли могут закрывать локальные technical findings без общего reconciliation against RPES.

## Recommended Next Tasks

- Создать RPES-to-backlog crosswalk по open tasks уровня P0/P1/M8.
- Выделить отдельный release evidence register для `8/10 strong MVP-ready`.
- Для каждого open risk-блока закрепить one-line product decision status: `accepted`, `open`, `conflict`, `not verified`.
- Провести отдельный reconciliation pass по secondary docs, которые формулируют UX/design/product правила вне RPES.

## Evidence Required for Closure

- merged/main updates для planning docs
- explicit RPES/backlog reconciliation commits
- task-level QA/artifacts для technical tasks
- human visual approval для visual closure tracks
- main verification of any release checklist or maturity claim

## Do Not Touch

- runtime code как способ “исправить” product conflict
- backlog task status без main/merged evidence
- accepted product decisions без явного decision update
- pricing/API/production boundaries без отдельного scoped task
