# Role Audit Index — RPES v11 / current-backlog

## Audit Purpose

Этот пакет фиксирует role-based audit репозитория `razmerno` против актуального пакета RPES в `docs/specification/**` и операционного baseline в `docs/planning/current-backlog.md`.

Аудит не меняет backlog status, не закрывает задачи и не является release/QA evidence сам по себе.

## Source-of-Truth Hierarchy

1. RPES: `docs/specification/README.md` и `docs/specification/volume-*/README.md`
2. Operational backlog baseline: `docs/planning/current-backlog.md`
3. Decision layer: `docs/planning/accepted-backlog-decisions-v1.md`
4. Prompt/scope rules: `docs/planning/agent-prompt-rules-v1.md`
5. Current repository state: код, тесты, workflows, docs

## Findings-Only Rules

- Эти документы содержат только findings, gaps, risks и recommended next tasks.
- Ни один task не считается closed на основании этих audit docs.
- Branch-only, local-only и report-only evidence не является closure evidence.
- Если RPES, backlog и код расходятся, аудит фиксирует расхождение, но не примиряет его автоматически.

## Roles

1. `01 Product / Planning Agent`
2. `02 Constructor Agent`
3. `03 Pricing Agent`
4. `04 API / Orders Agent`
5. `05 Infrastructure / QA Agent`
6. `06 Three.js / Visualization Agent`
7. `07 Production / Manufacturing Agent`
8. `08 UX/UI / Design System Agent`

## Recommended Execution Order

1. Product / Planning
2. Constructor
3. Pricing
4. API / Orders
5. Infra / QA
6. Three.js / Visualization
7. Production / Manufacturing
8. UX / Design System

## Audit Outputs

- [01-product-planning-audit.md](./01-product-planning-audit.md)
- [02-constructor-audit.md](./02-constructor-audit.md)
- [03-pricing-audit.md](./03-pricing-audit.md)
- [04-api-orders-audit.md](./04-api-orders-audit.md)
- [05-infra-qa-audit.md](./05-infra-qa-audit.md)
- [06-threejs-visualization-audit.md](./06-threejs-visualization-audit.md)
- [07-production-manufacturing-audit.md](./07-production-manufacturing-audit.md)
- [08-ux-design-system-audit.md](./08-ux-design-system-audit.md)
