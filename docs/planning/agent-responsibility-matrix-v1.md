# Agent Responsibility Matrix v1 — Размерно

Статус: управляющий архитектурный документ.
Дата: 2026-06-14.
Роль автора: Lead Architect.

## 0. Назначение

Документ распределяет зоны ответственности между агентами проекта «Размерно».

Цель — исключить хаотичную работу, пересечение задач и ситуацию, когда один агент начинает выполнять работу другого слоя.

Этот документ не создаёт новый функционал и не меняет runtime. Он задаёт правила передачи работ после архитектурного этапа.

## 1. Главный принцип разделения ролей

Каждый агент работает только в своём слое.

Если задача требует изменения чужого слоя, агент обязан остановиться и зафиксировать dependency / risk.

Пример:

- QA Agent не меняет pricing formula.
- Pricing Agent не делает UI redesign.
- Three.js Agent не меняет checkout submit flow.
- Production Agent не меняет клиентский UX конструктора.
- Admin Agent не меняет Supabase schema без отдельного scope.

## 2. Lead Architect Agent

Статус: текущая роль.

Отвечает за:

- архитектурный аудит;
- roadmap alignment;
- выявление P0/P1/P2/P3;
- границы слоёв;
- ownership map;
- risk register на уровне архитектуры;
- порядок запуска агентов;
- stop rules;
- handoff для следующей роли.

Может создавать:

- planning docs;
- architecture docs;
- task briefs;
- responsibility matrix;
- dependency map на высоком уровне.

Не должен делать:

- писать runtime code;
- писать tests;
- менять package scripts;
- менять pricing;
- менять checkout;
- менять Three.js;
- менять API;
- менять Supabase;
- менять production;
- менять admin;
- удалять legacy.

Текущие deliverables Lead Architect:

- `docs/audit/architecture-gap-analysis-v1.md`
- `docs/planning/architecture-boundaries-v1.md`
- `docs/planning/agent-task-architecture-guard-v1.md`
- `docs/planning/legacy-migration-master-plan-v1.md`
- `docs/planning/agent-responsibility-matrix-v1.md`

## 3. Architecture Guard Agent

Приоритет запуска: 1.

Отвечает за:

- аудит текущих architecture guards;
- спецификацию guard для Constructor3D;
- запрет dangerous imports;
- runtime boundary checks;
- docs-only или scripts-only изменения, если разрешено отдельным scope.

Должен читать:

- `docs/planning/architecture-boundaries-v1.md`
- `docs/audit/architecture-gap-analysis-v1.md`
- `docs/planning/agent-task-architecture-guard-v1.md`

Может менять:

- `docs/audit/**`
- `docs/planning/**`
- `scripts/check-*.mjs` только если задача явно разрешает implementation
- `package.json` только для добавления guard script и только после audit/spec

Не должен менять:

- Constructor3D runtime;
- pricing;
- checkout;
- Three.js visuals;
- API;
- Supabase;
- admin;
- production.

## 4. Legacy Migration Agent

Приоритет запуска: 2, после Architecture Guard audit/spec.

Отвечает за:

- inventory `src/configurator/**`;
- dependency graph legacy imports;
- test ownership map;
- bridge audit;
- migration plan from legacy to active Constructor3D.

Должен читать:

- `docs/planning/legacy-migration-master-plan-v1.md`
- `docs/planning/architecture-boundaries-v1.md`
- `docs/audit/architecture-gap-analysis-v1.md`

Может менять:

- docs first;
- tests only after explicit approval;
- guards only after explicit approval.

Не должен менять:

- active runtime behavior;
- pricing formula;
- checkout flow;
- production logic;
- admin;
- Supabase.

## 5. QA / Build Agent

Приоритет запуска: 3.

Отвечает за:

- package scripts audit;
- current / legacy / historical / release command map;
- minimal quality gates per task type;
- CI readiness plan;
- test command normalization.

Может менять:

- docs/QA maps;
- package scripts only after separate approval;
- CI config only after separate approval.

Не должен менять:

- product code;
- pricing logic;
- constructor behavior;
- production/admin logic.

## 6. Constructor State Agent

Приоритет запуска: 4.

Отвечает за:

- constructor store boundary;
- domain selectors;
- root store interface split plan;
- reducing `useConstructorPageState` as God Facade;
- state invariants tests.

Должен работать только после:

- Architecture Guard Agent;
- Legacy Migration inventory;
- QA command map.

Может менять:

- `src/static-pages/constructor/store/**`
- `src/static-pages/constructor/hooks/**`
- state tests

Не должен менять:

- pricing formula;
- checkout submit contract;
- Three.js visuals;
- API;
- Supabase;
- production;
- admin.

## 7. Pricing Agent

Приоритет запуска: 5.

Отвечает за:

- pricing source-of-truth audit;
- client/server pricing consistency;
- delivery / assembly / material / edge / packaging rules audit;
- tests for critical price scenarios.

Может менять:

- pricing docs;
- pricing tests;
- pricing implementation only after explicit pricing scope.

Не должен менять:

- UI design;
- Three.js;
- checkout UX except price display contract;
- production cost rules in parallel without review.

## 8. Three.js Stability Agent

Приоритет запуска: 6.

Отвечает за:

- WebGL runtime stability;
- fallback reliability;
- scene adapter decomposition;
- error boundary;
- reduced quality;
- performance safety.

Может менять:

- `src/static-pages/constructor/three/**`
- Three viewer components;
- scene runtime tests.

Не должен менять:

- state model structure in same phase;
- checkout;
- pricing;
- production model;
- visual redesign beyond stability scope.

## 9. Constructor UX Agent

Приоритет запуска: 7.

Отвечает за:

- Constructor3D interaction MVP;
- section/zone selection UX;
- local menu;
- filling interactions;
- facades interactions;
- random preset UX;
- materials UI after material system readiness.

Должен работать после:

- State boundary stabilization;
- Three.js stability baseline.

Не должен менять:

- pricing formula;
- order flow;
- API;
- Supabase;
- production/admin.

## 10. Checkout Agent

Приоритет запуска: 8.

Отвечает за:

- checkout UX completion;
- required fields;
- delivery toggle + address;
- assembly toggle;
- quote summary;
- submit states;
- success without model reset.

Должен работать после:

- pricing validation;
- state stabilization.

Не должен менять:

- server order contract without API review;
- Supabase schema;
- production logic;
- pricing formula.

## 11. Production Agent

Приоритет запуска: 9.

Отвечает за:

- production model decomposition;
- panels;
- hardware basics;
- drilling basics;
- production warnings;
- technologist review data;
- Basis JSON planning.

Не должен работать до:

- Constructor state stabilized;
- pricing source-of-truth clarified.

Не должен:

- показывать сложную production logic клиенту;
- делать automatic `.b3d` generation в MVP;
- менять pricing cost rules параллельно Pricing Agent.

## 12. Admin Agent

Приоритет запуска: 10.

Отвечает за:

- admin orders list;
- order detail;
- statuses;
- production warnings;
- manual review tools.

Должен работать после:

- order flow reliability;
- production warning model baseline;
- Supabase/API contracts stable.

Не должен менять:

- constructor UX;
- pricing formulas;
- customer checkout behavior.

## 13. Release Agent

Приоритет запуска: последним.

Отвечает за:

- release candidate checklist;
- CI/CD gates;
- deploy runbook;
- smoke tests;
- production env validation;
- rollback plan.

Не должен:

- исправлять архитектуру в release phase;
- менять feature scope;
- внедрять post-MVP features.

## 14. Critical Path

Текущий безопасный порядок:

1. Lead Architect — завершить архитектурное управление.
2. Architecture Guard Agent — защитить границы.
3. Legacy Migration Agent — составить карту legacy и тестов.
4. QA / Build Agent — нормализовать команды и quality gates.
5. Constructor State Agent — стабилизировать state model.
6. Pricing Agent — подтвердить source-of-truth цены.
7. Three.js Stability Agent — стабилизировать 3D/fallback.
8. Constructor UX Agent — завершить interaction MVP.
9. Checkout Agent — завершить заявку.
10. Production Agent — довести production MVP.
11. Admin Agent — довести admin MVP.
12. Release Agent — release candidate.

## 15. Parallelization Rules

Можно параллельно:

- docs-only planning;
- guard specification;
- legacy inventory;
- QA command mapping;
- pricing audit без implementation;
- production planning без implementation.

Нельзя параллельно:

- state refactor + checkout refactor;
- pricing changes + production cost changes;
- Three.js architecture refactor + visual redesign;
- legacy removal + test migration;
- global CSS cleanup + active constructor UI changes.

## 16. Handoff rule

Каждый агент в конце обязан сообщить:

- что сделал;
- какие файлы изменил;
- какие проверки запустил;
- что не делал;
- какие риски остались;
- кому передавать следующий этап;
- промпт для следующего агента.

## 17. Current Lead Architect status

Lead Architect этап считается завершённым после создания:

- architecture gap analysis;
- architecture boundaries;
- architecture guard task brief;
- legacy migration master plan;
- responsibility matrix;
- final lead architect handoff prompt.

После этого следующий агент:

Architecture Guard Agent.
