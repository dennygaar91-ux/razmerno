# Documentation Gap Analysis v1 — Размерно

Дата: 2026-06-14

Статус: documentation-only audit.

Scope: полный аудит документационного слоя `docs/` по доступному GitHub-репозиторию `dennygaar91-ux/razmerno` на ветке `main`.

Важно: в рамках этого этапа не менялись runtime-код, функциональность, архитектура, pricing, constructor, Three.js, checkout, admin, production logic. Документы не удалялись, не архивировались и не переписывались. Создан только данный audit-файл.

---

## 1. Executive Summary

Документация проекта «Размерно» уже содержит новый управляющий planning-слой, но рядом с ним продолжают существовать старые root-документы, исторические stage-отчёты, два каталога аудитов (`docs/audit` и `docs/audits`), несколько pricing/production документов разных этапов и документы, описывающие legacy-состояния.

Главный риск — не отсутствие документации, а избыток несинхронизированных источников. Для агентов это опасно: они могут читать старый roadmap, старый backlog, старые stage-отчёты или устаревший architecture audit и принимать решения по уже заменённым правилам.

Ключевой вывод: источниками истины должны стать `docs/planning/*`, `docs/architecture/*`, `docs/pricing/*` после нормализации, `docs/production/PRODUCTION-HANDBOOK.md`, `docs/BACKLOG.md` или `docs/planning/current-backlog.md` после выбора одного главного backlog, а старые stage/handoff/audit документы должны быть явно помечены как historical.

---

## 2. Что проверено

Обязательно проверенные каталоги и зоны:

- `docs/planning/`
- `docs/audit/`
- `docs/audits/`
- `docs/architecture/`
- `docs/pricing/`
- `docs/production/`
- `docs/agent/`
- `docs/history/`
- `docs/handoff/`
- `docs/deployment/`
- root-level документация внутри `docs/`: `docs/BACKLOG.md`, `docs/roadmap.md`, `docs/css-*`, `docs/infrastructure-*`, `docs/ARCHITECTURE_CONFIG_STATE.md`

Обязательно прочитанные управляющие документы:

- `docs/planning/README.md`
- `docs/planning/master-development-plan-v1.md`
- `docs/planning/current-backlog.md`
- `docs/planning/mvp-scope.md`
- `docs/planning/architecture-decisions.md`
- `docs/planning/agent-workflow.md`
- `docs/planning/parallelization-rules.md`
- `docs/planning/release-roadmap.md`
- `docs/audit/documentation-audit-v1.md`
- `docs/audit/architecture-audit-v1.md`
- `docs/agent/architect-rules.md`

Также учитывались найденные через поиск документы:

- `docs/BACKLOG.md`
- `docs/roadmap.md`
- `docs/architecture/README.md`
- `docs/architecture/project-map.md`
- `docs/architecture/ci-and-audit-pipeline.md`
- `docs/architecture/pricing-contract.md`
- `docs/architecture/pricing-and-order-boundaries.md`
- `docs/pricing/pricing-production-checklist.md`
- `docs/pricing/production-model-pricing-backlog.md`
- `docs/pricing/production-hardware-pricing-decision-stage22.md`
- `docs/pricing/production-services-pricing-decision-stage21.md`
- `docs/pricing/price-update-runbook.md`
- `docs/pricing/price-list-analysis.md`
- `docs/pricing/supplier-hardware-catalog-foundation-stage23.md`
- `docs/pricing/confirmed-supplier-price-import-foundation-stage24.md`
- `docs/production/PRODUCTION-HANDBOOK.md`
- `docs/production/env-checklist.md`
- `docs/production/deploy-smoke.md`
- `docs/production/stage4-deploy-readiness.md`
- `docs/audits/README.md`
- `docs/audits/infrastructure-audit-001.md`
- `docs/audits/architecture-completion-audit-001.md`
- `docs/audits/backlog-normalization-plan-001.md`
- многочисленные `docs/history/stage-reports/*`

---

## 3. Главные найденные проблемы

### DOC-P0-01 — Несколько конкурирующих источников backlog

Риск: Critical.

Конфликтующие документы:

- `docs/planning/current-backlog.md`
- `docs/BACKLOG.md`
- `BACKLOG-v3.md`
- отдельные backlog-файлы внутри `docs/audits/*` и `docs/planning/*`

Проблема:

`docs/planning/current-backlog.md` объявлен единым backlog для агентов. Одновременно `docs/BACKLOG.md` обновлён 2026-06-13 и содержит нормализованный backlog после Infrastructure Audit 001. Также в корне найден `BACKLOG-v3.md`. Для агента неочевидно, какой backlog является главным.

Риск невыполнения:

Агенты могут брать задачи из разных backlog-версий и параллельно выполнять разные приоритеты. Особенно опасно для protected zones: pricing, checkout, API, Supabase, admin, Three.js.

Рекомендация:

Выбрать один главный backlog:

- вариант A: `docs/planning/current-backlog.md` как source of truth, а `docs/BACKLOG.md` сделать публичным индексом/сводкой;
- вариант B: `docs/BACKLOG.md` как source of truth, а `docs/planning/current-backlog.md` превратить в ссылку на него.

До выбора — пометить оба как conflicting active backlog.

---

### DOC-P0-02 — Два каталога аудитов: `docs/audit` и `docs/audits`

Риск: Critical.

Конфликтующие документы/каталоги:

- `docs/audit/documentation-audit-v1.md`
- `docs/audit/architecture-audit-v1.md`
- `docs/audits/README.md`
- `docs/audits/infrastructure-audit-001.md`
- `docs/audits/architecture-completion-audit-001.md`
- `docs/audits/backlog-normalization-plan-001.md`

Проблема:

В проекте одновременно существуют `docs/audit` и `docs/audits`. Новый `docs/audits/README.md` задаёт формальный индекс аудитов и правила для каждого аудита, но текущая задача создаёт документ в `docs/audit`. Старый documentation audit также лежит в `docs/audit`.

Риск невыполнения:

Новые агенты не поймут, куда складывать аудиты. Часть аудитов окажется в `docs/audit`, часть — в `docs/audits`, индексы будут расходиться.

Рекомендация:

Выбрать единую схему:

- `docs/audits/` — формальные аудиты с датой, scope, findings, risks, backlog;
- `docs/audit/` — legacy/historical reports до миграции;
- либо наоборот, но только один каталог должен быть active.

Так как `docs/audits/README.md` уже описывает правила, предпочтительно сделать `docs/audits/` active, а `docs/audit/` — legacy archive после отдельного этапа миграции.

---

### DOC-P0-03 — Старый `architecture-audit-v1` содержит уже неверное утверждение

Риск: High.

Конфликтующие документы:

- `docs/audit/architecture-audit-v1.md`
- `docs/agent/architect-rules.md`
- `docs/planning/README.md`
- `docs/planning/agent-workflow.md`

Проблема:

`docs/audit/architecture-audit-v1.md` утверждает, что `docs/agent/architect-rules.md` и `docs/agent/task-001-architecture-audit.md` не найдены. При текущем аудите `docs/agent/architect-rules.md` найден и прочитан. Planning-документы прямо требуют читать этот файл перед стартом задач.

Риск невыполнения:

Агент может считать architecture audit более актуальным и сделать ложный вывод, что agent-rules отсутствуют. Это ломает governance-слой.

Рекомендация:

Не переписывать `architecture-audit-v1.md` в рамках текущего этапа, но пометить его как partially stale. Создать новый follow-up task: `architecture-audit-v2` или `architecture-audit-v1-corrections`, где зафиксировать, какие выводы v1 устарели.

---

### DOC-P0-04 — Planning layer и old roadmap/backlog частично дублируют друг друга

Риск: High.

Конфликтующие документы:

- `docs/planning/master-development-plan-v1.md`
- `docs/planning/release-roadmap.md`
- `docs/planning/current-backlog.md`
- `docs/roadmap.md`
- `docs/BACKLOG.md`

Проблема:

`docs/planning/master-development-plan-v1.md` содержит P0/P1/P2/P3 backlog и roadmap до MVP. `docs/planning/release-roadmap.md` содержит Stage 01–12. `docs/roadmap.md` содержит MVP/Post MVP/Future. `docs/BACKLOG.md` содержит Needs Verification/High/Medium/Deferred.

Все документы полезны, но без иерархии они конкурируют.

Риск невыполнения:

Агент может начать с `docs/roadmap.md` и пропустить более строгие planning-ограничения: protected zones, очередность, запрет параллельных работ, правило stop.

Рекомендация:

Сделать `docs/planning/README.md` главным индексом и явно указать:

1. `master-development-plan-v1.md` — стратегический source of truth.
2. `release-roadmap.md` — порядок этапов.
3. `current-backlog.md` или `docs/BACKLOG.md` — единственный operational backlog.
4. `docs/roadmap.md` — historical/summary, если не выбран как active.

---

### DOC-P0-05 — Исторические stage-отчёты всё ещё легко находятся как актуальные документы

Риск: High.

Затронутые документы:

- `docs/history/stage-reports/STAGE_CONSTRUCTOR_*_REPORT.txt`
- `docs/history/stage-reports/STAGE_N*_REPORT.txt`
- `docs/history/stage-reports/STAGE_Q*_REPORT.txt`
- `docs/history/stage-reports/STAGE_R*_REPORT.txt`
- `docs/audit/STAGE_*_REPORT.md`

Проблема:

Исторические отчёты полезны как журнал, но GitHub search возвращает их рядом с актуальными документами. В них могут быть старые решения по constructor, 2D, 3D, pricing, checkout, CSS cleanup.

Риск невыполнения:

Агент может прочитать stage-отчёт как актуальное ТЗ и восстановить старую функциональность или старую архитектуру.

Рекомендация:

Не удалять. На отдельном этапе добавить в начало каждого исторического stage report короткий статус-блок:

```md
Status: historical
Do not use as source of truth.
Current source: docs/planning/README.md
```

Или создать `docs/history/README.md`, который явно объясняет, что все stage reports являются historical.

---

### DOC-P1-01 — Pricing documentation разбросана между architecture, pricing, audit и stage reports

Риск: High.

Конфликтующие/пересекающиеся документы:

- `docs/planning/architecture-decisions.md`
- `docs/planning/mvp-scope.md`
- `docs/architecture/pricing-contract.md`
- `docs/architecture/pricing-and-order-boundaries.md`
- `docs/pricing/pricing-production-checklist.md`
- `docs/pricing/production-model-pricing-backlog.md`
- `docs/pricing/production-services-pricing-decision-stage21.md`
- `docs/pricing/production-hardware-pricing-decision-stage22.md`
- `docs/pricing/price-update-runbook.md`
- `docs/pricing/price-list-analysis.md`
- `docs/audit/architecture-audit-v1.md`
- `docs/history/stage-reports/STAGE_Q2_PRICE_CLARITY_REPORT.txt`

Проблема:

Pricing имеет несколько уровней: правила цены, источники прайса, production pricing, delivery/assembly, hardware/services decisions, runbook обновления прайса. Эти документы не собраны в единый индекс `docs/pricing/README.md`.

Риск невыполнения:

Агент может изменить pricing по stage-документу, не сверив protected boundaries. Самый опасный риск — двойной учёт hardware/services или расхождение клиентской и серверной цены.

Рекомендация:

Создать `docs/pricing/README.md` как source of truth index:

- pricing policy;
- price sources;
- dealer markup ×1.3;
- production model relation;
- delivery/assembly;
- forbidden changes without separate task;
- mapping of historical pricing decisions.

---

### DOC-P1-02 — Production documentation смешивает MVP, deploy, admin и future Basis/export

Риск: Medium/High.

Затронутые документы:

- `docs/production/PRODUCTION-HANDBOOK.md`
- `docs/production/env-checklist.md`
- `docs/production/deploy-smoke.md`
- `docs/production/stage4-deploy-readiness.md`
- `docs/planning/mvp-scope.md`
- `docs/planning/architecture-decisions.md`
- `docs/audit/architecture-audit-v1.md`

Проблема:

Production layer в проекте означает сразу несколько разных вещей: production model для технолога, deploy/ops production, admin production warnings, Basis/export future. Без индекса легко спутать runtime production deployment с manufacturing production model.

Риск невыполнения:

Агент может принять Basis/export или advanced operation editor за обязательный MVP, хотя planning-документы относят это к P2/P3/post-MVP.

Рекомендация:

Создать `docs/production/README.md` с разделением:

1. Manufacturing production model.
2. Admin/manager production review.
3. Deployment/ops production.
4. Basis/export future.
5. Documents by status: active / historical / future.

---

### DOC-P1-03 — Architecture docs и planning docs пересекаются по protected zones

Риск: Medium/High.

Пересекающиеся документы:

- `docs/planning/agent-workflow.md`
- `docs/planning/parallelization-rules.md`
- `docs/planning/architecture-decisions.md`
- `docs/architecture/README.md`
- `docs/architecture/project-map.md`
- `docs/architecture/runtime-boundaries.md`
- `docs/architecture/pricing-and-order-boundaries.md`
- `docs/agent/architect-rules.md`

Проблема:

Запреты и protected zones повторяются в нескольких местах. Это правильно для безопасности, но без master-источника возможны расхождения.

Риск невыполнения:

Если один документ обновится, а другой нет, агент получит противоречивые правила.

Рекомендация:

Назначить source of truth:

- protected zones — `docs/architecture/README.md` + `docs/planning/agent-workflow.md`;
- detailed architectural boundaries — `docs/architecture/runtime-boundaries.md`;
- agent behavior — `docs/planning/agent-workflow.md`;
- architect role — `docs/agent/architect-rules.md`.

---

### DOC-P1-04 — Handoff documents и generated reports требуют отдельного жизненного цикла

Риск: Medium.

Затронутые документы:

- `docs/handoff/handoff-index-v69.md`
- `docs/handoff/technical-handoff-v69.md`
- `docs/audit/technical-handoff-pack-v69.md`
- `docs/architecture/generated-reports-policy.md`
- `docs/audit/css-usage-report-v68.json`
- `docs/history/class-inventories/*`

Проблема:

Handoff, generated reports, class inventories и machine-readable JSON сейчас находятся рядом с ручными источниками истины.

Риск невыполнения:

Агенты будут использовать generated snapshots как актуальные архитектурные решения.

Рекомендация:

Ввести структуру:

- `docs/reports/generated/` — machine-generated outputs;
- `docs/handoff/` — только текущий handoff или latest index;
- `docs/history/handoff/` — старые handoff packs;
- `docs/history/class-inventories/` — оставить historical.

---

### DOC-P1-05 — CSS/design-system документы требуют статусов active/historical

Риск: Medium.

Затронутые документы:

- `docs/design-system/tokens-v1.md`
- `docs/css-architecture-audit.md`
- `docs/css-migration-plan.md`
- `docs/audit/css-usage-report-v68.json`
- `docs/audit/home-stabilized-v1.md`
- `docs/audit/home-page-react-v27.md`
- `docs/audit/info-pages-react-v28.md`

Проблема:

Часть документов описывает текущие design-system токены, часть — миграционные планы и старые аудиты landing/info pages. Без статуса можно принять старые дизайн-решения за текущую дизайн-систему.

Риск невыполнения:

Агент может начать глобальный CSS cleanup или вернуть старые visual паттерны, хотя planning запрещает глобальный cleanup без этапности и visual baseline.

Рекомендация:

Создать/актуализировать `docs/design-system/README.md` и добавить статусы:

- active: tokens, components, css ownership map;
- planning: css migration plan;
- historical: page-specific audits v27/v28/v68.

---

## 4. Устаревшие документы

Документы/группы, которые следует считать устаревшими или partially stale до дополнительной проверки:

1. `docs/audit/architecture-audit-v1.md` — partially stale из-за утверждения, что `docs/agent/architect-rules.md` не найден.
2. `docs/roadmap.md` — потенциально superseded by `docs/planning/release-roadmap.md` и `docs/planning/master-development-plan-v1.md`.
3. Root/stage roadmap/backlog документы вне `docs/planning` — требуют выбора главного источника.
4. `docs/audit/home-page-react-v27.md`, `docs/audit/info-pages-react-v28.md`, `docs/audit/home-stabilized-v1.md` — page-specific historical audits, не должны управлять текущей разработкой без проверки.
5. `docs/audit/STAGE_*_REPORT.md` и `docs/history/stage-reports/*` — historical.
6. `docs/audit/static-pricing-bridge-v5.md`, `docs/audit/lazy-pricing-bridge-v6.md` — вероятно historical implementation reports; использовать только после сверки с current pricing boundaries.
7. Старые CSS inventory/class inventory файлы — generated/historical, не source of truth.

---

## 5. Дубли документов

### Backlog / roadmap duplicates

- `docs/planning/current-backlog.md`
- `docs/BACKLOG.md`
- `BACKLOG-v3.md`
- `docs/roadmap.md`
- `docs/planning/release-roadmap.md`
- `docs/planning/master-development-plan-v1.md`

Рекомендация: разделить роли и оставить один operational backlog.

### Audit duplicates

- `docs/audit/*`
- `docs/audits/*`

Рекомендация: один active audit каталог, второй — legacy/historical.

### Pricing duplicates

- `docs/architecture/pricing-contract.md`
- `docs/architecture/pricing-and-order-boundaries.md`
- `docs/pricing/pricing-production-checklist.md`
- `docs/pricing/production-model-pricing-backlog.md`
- stage pricing reports

Рекомендация: единый `docs/pricing/README.md` + active policy docs.

### Handoff/report duplicates

- `docs/audit/technical-handoff-pack-v69.md`
- `docs/handoff/technical-handoff-v69.md`
- `docs/handoff/handoff-index-v69.md`
- generated inventories/reports

Рекомендация: latest handoff index + historical handoff archive.

---

## 6. Противоречащие документы

| Конфликт | Документы | Риск | Решение |
|---|---|---:|---|
| Agent rules exists vs not found | `architecture-audit-v1.md` vs `docs/agent/architect-rules.md` | High | Пометить `architecture-audit-v1` как partially stale |
| Главный backlog неочевиден | `current-backlog.md`, `docs/BACKLOG.md`, `BACKLOG-v3.md` | Critical | Выбрать один operational backlog |
| Active audit folder неочевиден | `docs/audit`, `docs/audits` | Critical | Назначить один active каталог |
| Roadmap stage model vs MVP summary | `release-roadmap.md`, `docs/roadmap.md`, `master-development-plan-v1.md` | High | Развести стратегию/этапы/summary |
| Pricing as current vs stage reports | `docs/pricing/*`, `docs/audit/*pricing*`, stage reports | High | Pricing README + current policy |
| Production deployment vs manufacturing production | `docs/production/*`, planning production scope | Medium/High | Production README с разделением смыслов |
| CSS cleanup timing | CSS audits, migration plan, planning parallelization rules | Medium | Явный запрет cleanup без visual baseline |

---

## 7. Документы, которые больше не должны использоваться как source of truth

1. Все `docs/history/stage-reports/*`.
2. Все `docs/history/class-inventories/*`.
3. Старые `STAGE_*` отчёты в `docs/audit`.
4. Page-specific old audits: home v27/v28/v68 без актуальной привязки.
5. Generated JSON reports — только как данные, не как решения.
6. Handoff v69 — только как исторический handoff, если есть новый planning layer.
7. `docs/roadmap.md` — только если не выбран как current roadmap.
8. `BACKLOG-v3.md` — только historical/root artifact, если active backlog находится в docs.

---

## 8. Документы, которые описывают удалённую или legacy-функциональность

Требуют отдельной проверки перед архивацией:

- документы про `src/configurator/**` и legacy constructor;
- `legacy-runtime-audit` / legacy migration docs;
- старые stage reports по pre-Constructor3D этапам;
- старые 2D fallback reports, если они описывают прежний fallback, а не current WebGL/2D fallback;
- старые CSS reports до текущей ownership map;
- старые pricing bridge docs до production pricing integration.

Важно: не удалять и не архивировать сейчас. Только пометить как candidates for archive.

---

## 9. Документы, которые можно объединить

### 9.1 Backlog consolidation

Объединить:

- `docs/planning/current-backlog.md`
- `docs/BACKLOG.md`
- relevant parts from `BACKLOG-v3.md`

Итог:

- `docs/BACKLOG.md` или `docs/planning/current-backlog.md` как единственный operational backlog.

### 9.2 Roadmap consolidation

Объединить/развести роли:

- `docs/planning/master-development-plan-v1.md`
- `docs/planning/release-roadmap.md`
- `docs/roadmap.md`

Итог:

- Master plan — стратегия и приоритеты.
- Release roadmap — этапы.
- Roadmap summary — можно удалить из active layer или превратить в краткий index.

### 9.3 Pricing documentation index

Объединить через индекс:

- `docs/architecture/pricing-contract.md`
- `docs/architecture/pricing-and-order-boundaries.md`
- `docs/pricing/pricing-production-checklist.md`
- `docs/pricing/production-model-pricing-backlog.md`
- stage 21/22/23/24 pricing decision docs

Итог:

- `docs/pricing/README.md` как карта pricing-документов.

### 9.4 Production documentation index

Объединить через индекс:

- `docs/production/PRODUCTION-HANDBOOK.md`
- `docs/production/env-checklist.md`
- `docs/production/deploy-smoke.md`
- `docs/production/stage4-deploy-readiness.md`

Итог:

- `docs/production/README.md` с разделением manufacturing/admin/deploy/export.

### 9.5 Audit folder normalization

Объединить организационно:

- `docs/audit/*`
- `docs/audits/*`

Итог:

- `docs/audits/` active;
- `docs/audit/` historical или migrated.

---

## 10. Документы, которые нужно архивировать позже

Не выполнять сейчас. Кандидаты:

1. Старые stage reports из `docs/audit` в `docs/history/stage-reports`.
2. Старые page audits (`home-page-react-v27`, `info-pages-react-v28`, etc.).
3. Handoff v69 после создания current handoff.
4. Generated reports после переноса в `docs/reports/generated`.
5. Legacy constructor audits после завершения migration/removal.
6. Старые pricing bridge reports после утверждения current pricing contract.
7. `docs/roadmap.md`, если `docs/planning/release-roadmap.md` становится единственным roadmap.
8. `BACKLOG-v3.md`, если `docs/BACKLOG.md` или `docs/planning/current-backlog.md` становится единственным active backlog.

---

## 11. Документы, которые должны стать источником истины

### Project governance

- `docs/planning/README.md`
- `docs/planning/master-development-plan-v1.md`
- `docs/planning/agent-workflow.md`
- `docs/planning/parallelization-rules.md`

### Product / MVP scope

- `docs/planning/mvp-scope.md`
- `docs/planning/architecture-decisions.md`

### Roadmap

- `docs/planning/release-roadmap.md`

### Backlog

Нужно выбрать один:

- `docs/planning/current-backlog.md`
- или `docs/BACKLOG.md`

### Architecture

- `docs/architecture/README.md`
- `docs/architecture/project-map.md`
- `docs/architecture/runtime-boundaries.md`
- `docs/architecture/constructor-state-and-layout.md`
- `docs/architecture/pricing-and-order-boundaries.md`
- `docs/architecture/css-ownership-map.md`
- `docs/architecture/ci-and-audit-pipeline.md`

### Pricing

После создания индекса:

- `docs/pricing/README.md`
- `docs/architecture/pricing-and-order-boundaries.md`
- `docs/pricing/pricing-production-checklist.md`
- `docs/pricing/price-update-runbook.md`

### Production / deployment / admin

- `docs/production/README.md` — нужно создать.
- `docs/production/PRODUCTION-HANDBOOK.md`
- `docs/production/env-checklist.md`
- `docs/production/deploy-smoke.md`

### Agent rules

- `docs/planning/agent-workflow.md`
- `docs/agent/architect-rules.md`

### Audits

- `docs/audits/README.md` should become active audit index.
- Current file should later be moved or indexed according to selected audit folder convention.

---

## 12. Рекомендованная финальная структура документации

```text
docs/
  README.md                         # главный вход в документацию проекта

  planning/
    README.md                       # governance index
    master-development-plan-v1.md
    mvp-scope.md
    architecture-decisions.md
    agent-workflow.md
    parallelization-rules.md
    release-roadmap.md
    current-backlog.md              # only if selected as active backlog

  architecture/
    README.md
    project-map.md
    runtime-boundaries.md
    constructor-state-and-layout.md
    pricing-and-order-boundaries.md
    css-ownership-map.md
    ci-and-audit-pipeline.md
    generated-reports-policy.md

  pricing/
    README.md                       # create
    pricing-production-checklist.md
    price-update-runbook.md
    price-list-analysis.md
    decisions/
      production-services-pricing-decision-stage21.md
      production-hardware-pricing-decision-stage22.md
      supplier-hardware-catalog-foundation-stage23.md
      confirmed-supplier-price-import-foundation-stage24.md

  production/
    README.md                       # create
    PRODUCTION-HANDBOOK.md
    env-checklist.md
    deploy-smoke.md

  agent/
    README.md
    architect-rules.md
    tasks/
      ...

  audits/
    README.md
    documentation-gap-analysis-v1.md # after migration if audits/ is chosen
    infrastructure-audit-001.md
    architecture-completion-audit-001.md
    backlog-normalization-plan-001.md

  reports/
    generated/
      css-usage-report-v68.json
      class-inventories/
      dependency-graphs/

  handoff/
    README.md
    current-handoff.md

  history/
    README.md
    stage-reports/
    handoff/
    audits/
    class-inventories/
```

---

## 13. Рекомендованный порядок исправления документации

### Step 1 — Documentation Governance Decision

Принять 3 решения:

1. Главный backlog: `docs/BACKLOG.md` или `docs/planning/current-backlog.md`.
2. Главный audit каталог: `docs/audit` или `docs/audits`.
3. Главный roadmap: `docs/planning/release-roadmap.md` или `docs/roadmap.md`.

### Step 2 — Add root `docs/README.md`

Создать единый вход:

- что читать перед задачей;
- что является source of truth;
- что historical;
- protected zones;
- ссылка на current backlog.

### Step 3 — Add README indexes

Создать/обновить:

- `docs/pricing/README.md`
- `docs/production/README.md`
- `docs/history/README.md`
- `docs/handoff/README.md`
- `docs/reports/README.md`

### Step 4 — Mark stale docs

Не удалять. Добавить статус-блоки:

- `Status: historical`
- `Status: partially stale`
- `Superseded by: ...`

### Step 5 — Normalize audit folders

Мигрировать/индексировать `docs/audit` и `docs/audits` по выбранной схеме.

### Step 6 — Backlog/Roadmap consolidation

Оставить один operational backlog и один release roadmap.

---

## 14. Риски

| Риск | Уровень | Почему важно |
|---|---:|---|
| Агент читает старый backlog | Critical | Может начать не тот этап или залезть в protected zones |
| Агент читает historical stage report как ТЗ | High | Может вернуть удалённую/legacy логику |
| Pricing docs расходятся | High | Возможна неверная цена или двойной учёт |
| Audit folder split сохраняется | High | Новые аудиты будут теряться между двумя каталогами |
| Architecture audit stale statement остаётся без пометки | High | Ложный вывод о missing agent rules |
| Production docs смешивают deploy и manufacturing | Medium/High | Неверная трактовка MVP scope |
| CSS cleanup docs без статуса | Medium | Риск сломать визуал до visual baseline |
| Generated reports не отделены | Medium | Снапшоты могут принять за решения |

---

## 15. Checks

Кодовые проверки не запускались, потому что задача documentation-only и runtime/source files не менялись.

Проверено через GitHub:

- наличие репозитория `dennygaar91-ux/razmerno`;
- наличие ветки `main`;
- наличие required planning docs;
- наличие `docs/agent/architect-rules.md`;
- наличие `docs/audit/documentation-audit-v1.md` и `docs/audit/architecture-audit-v1.md`;
- наличие двух audit folders: `docs/audit` и `docs/audits`;
- наличие старых root docs: `docs/BACKLOG.md`, `docs/roadmap.md`;
- наличие pricing/production/architecture/history/handoff documents.

---

## 16. Что планировалось / сделано / не сделано

### Планировалось

Провести аудит документации проекта и создать `docs/audit/documentation-gap-analysis-v1.md`.

### Сделано

- Просканирован `docs/` через GitHub search.
- Прочитаны обязательные planning, audit и agent документы.
- Найдены ключевые конфликты, дубли, stale-документы и кандидаты на архивирование.
- Создан данный gap-analysis документ.

### Не сделано

- Не удалялись документы.
- Не архивировались документы.
- Не менялись существующие документы.
- Не менялся runtime-код.
- Не запускались build/typecheck, так как это documentation-only задача.

### Почему

Scope задачи — только аудит и создание одного документа. Любые изменения структуры документации должны быть отдельным этапом после принятия решений по source of truth.

---

## 17. Итоговые рекомендации

1. Срочно выбрать один active backlog.
2. Срочно выбрать один active audit каталог.
3. Добавить `docs/README.md` как главный вход в документацию.
4. Создать `docs/pricing/README.md` и `docs/production/README.md`.
5. Пометить `architecture-audit-v1.md` как partially stale или выпустить v2.
6. Отделить historical/generated reports от active documentation.
7. После каждого будущего этапа обновлять только назначенные source of truth документы, а не плодить новые параллельные stage-файлы без индекса.
