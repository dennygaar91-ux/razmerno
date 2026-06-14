# Planning Documentation — Размерно

Эта папка содержит управляющие документы для дальнейшей работы агентов над MVP проекта «Размерно».

Перед началом любой задачи агент должен прочитать:

1. `docs/planning/master-development-plan-v1.md`
2. `docs/planning/current-backlog.md`
3. `docs/planning/mvp-scope.md`
4. `docs/planning/architecture-decisions.md`
5. `docs/planning/agent-workflow.md`
6. `docs/planning/parallelization-rules.md`
7. `docs/planning/release-roadmap.md`
8. `docs/audit/documentation-audit-v1.md`
9. `docs/audit/architecture-audit-v1.md`
10. `docs/agent/architect-rules.md`

Главная стратегия проекта:

**Stabilize → Complete → Harden → Release**

Сначала стабилизировать архитектуру, state, pricing и Three.js. Затем завершить Constructor3D, checkout и fallback. После этого усилить тесты, CI/CD, production layer и admin MVP.
