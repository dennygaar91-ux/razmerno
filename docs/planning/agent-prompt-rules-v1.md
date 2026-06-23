# Agent Prompt Rules v1 — Размерно

## 1. Назначение документа

Этот документ фиксирует правила подготовки промптов для Codex / Cursor / AI-агентов проекта «Размерно».

Цель:

- сократить расход токенов;
- уменьшить лишние итерации;
- запретить широкие неуправляемые аудиты;
- запретить принятие решений агентом без product approval;
- повысить безопасность изменений в репозитории;
- сохранить контроль над backlog, architecture, UX, pricing, production и release readiness.

## 2. Обязательные источники истины

Перед работой агент должен учитывать:

1. `docs/planning/current-backlog.md` — главный backlog source of truth.
2. `docs/planning/accepted-backlog-decisions-v1.md` — обязательный decision layer.
3. `docs/planning/agent-prompt-rules-v1.md` — правила prompt, context, scope, stop conditions.
4. `AGENTS.md` — короткие root-инструкции для агентов.

Если `current-backlog.md`, `accepted-backlog-decisions-v1.md`, `agent-prompt-rules-v1.md` и `AGENTS.md` конфликтуют, агент должен остановиться и запросить reconciliation.

Repo state и merged/main evidence имеют приоритет над:

- session ledger;
- memory;
- chat;
- open PR claims;
- draft PR claims;
- branch-only claims;
- local assumptions.

## 3. Product Decision Priority

Перед любой implementation-задачей агент обязан сначала проверить relevant accepted decisions.

Запрещено самостоятельно менять или принимать решения по:

- UX-flow;
- Constructor3D / 2D behavior;
- labels / markers behavior;
- mobile UX;
- stepper behavior;
- pricing source of truth;
- pricing rounding;
- minimum order;
- customer-facing validation rules;
- production validation boundary;
- Basis JSON / production export rules;
- admin MVP scope;
- release gate.

Если решение отсутствует или конфликтует:

- остановиться;
- сформулировать вопрос;
- не писать код;
- не создавать PR.

Запрещено компенсировать отсутствие решения собственными предположениями.

## 4. Repo-First Context Rule

Агент не должен использовать старый chat / memory как основной источник истины.

Порядок источников:

1. repo files;
2. `docs/planning/current-backlog.md`;
3. `docs/planning/accepted-backlog-decisions-v1.md`;
4. current diff / git status;
5. session ledger;
6. chat memory only as secondary context.

Если chat memory конфликтует с repo, repo wins.

Если repo state неполный, агент должен запросить нужный файл, диапазон, diff или status.

## 5. Anti-Assumption Rule

Агенту запрещено придумывать данные.

Запрещено придумывать:

- backlog status;
- closure evidence;
- merged PR status;
- GitHub Actions status;
- Vercel status;
- file contents;
- dependencies;
- product decisions;
- architecture boundaries;
- pricing rules;
- production rules;
- Supabase / schema state;
- user approval;
- visual approval;
- release readiness;
- production readiness.

Если доказательства нет, агент должен написать `not verified` и остановиться или запросить нужный источник.

Запрещено использовать слова `готово`, `закрыто`, `проверено`, `merged`, `success`, `release-ready`, если это не подтверждено repo / GitHub / explicit user evidence.

## 6. Anti-Overengineering Rule

Агент должен менять только то, что входит в scope.

Запрещено:

- переписывать весь файл ради маленькой правки;
- менять нецелевые файлы;
- создавать новые абстракции без явной необходимости;
- выполнять refactor вне scope;
- улучшать стиль/архитектуру по собственной инициативе;
- объединять unrelated cleanup с feature/fix;
- удалять legacy/dead code без отдельного scope;
- менять публичный UX из-за удобства реализации.

Default strategy: minimal safe diff.

Любой cleanup, refactor или architecture improvement должен быть отдельной задачей с отдельным prompt.

## 7. Targeted Edit Rule

Default edit strategy: targeted patch / localized replacement.

Full-file rewrite запрещён для больших файлов и нежелателен для любых existing files.

Full-file rewrite разрешён только если:

- файл маленький;
- меняется большая часть файла;
- это явно разрешено prompt;
- агент может доказать, что полный content актуален.

Для больших файлов агент должен предпочитать:

- локальный patch;
- replace section;
- replace task block;
- append explicitly approved section;
- small file split только при отдельном scope.

## 8. File Creation Rule

Перед созданием нового файла агент обязан проверить:

- существует ли аналогичный файл;
- разрешено ли создавать новый файл;
- не нарушает ли это backlog / decision rules;
- не создаёт ли это дубль planning/backlog source of truth.

Запрещено создавать новые planning/backlog файлы без явного разрешения.

Новые files должны иметь ясную роль и ссылку из relevant planning layer, если они становятся источником процесса.

## 9. Главное правило экономии контекста

Агенту запрещено читать весь репозиторий или весь большой файл без необходимости.

По умолчанию prompt должен ограничивать чтение:

- конкретным task block;
- конкретным разделом документа;
- конкретным диапазоном строк;
- конкретными файлами;
- прямыми зависимостями целевого файла.

Если информации недостаточно, агент должен остановиться и запросить дополнительный диапазон, файл или dependency scope.

## 10. Session Memory / Run Ledger Rule

В рамках одного и того же agent chat/session агент не обязан перечитывать весь backlog и decision layer перед каждой итерацией, если scope, agent role и task family не менялись.

Первый prompt в session должен создать compact session ledger:

- source files read;
- accepted decisions used;
- active task;
- closed tasks in this session;
- files changed;
- QA commands run;
- remaining risks;
- next allowed task scope.

После каждой итерации агент обязан обновлять ledger.

В следующих итерациях агент должен использовать ledger и читать только:

- новый целевой task block;
- файлы, изменённые после последней итерации;
- direct dependencies целевой задачи;
- changed files / diff;
- relevant accepted decision section, если task family изменилась.

Агент обязан заново перечитать relevant backlog / accepted decisions, если:

- начат новый chat/session;
- сменился agent role;
- сменился task family;
- появился новый main commit после начала session;
- задача затрагивает pricing, API/order flow, Supabase, production export, Basis JSON, package/workflow;
- есть stop condition;
- есть конфликт между ledger и repo state;
- нужно закрывать задачу с closure evidence;
- агент не уверен, что decision still valid.

Session ledger не заменяет repo source of truth.

Если ledger конфликтует с repository files, repo files win and agent must stop for reconciliation.

## 11. Task Checklist Rule

Для каждой implementation-задачи агент ведёт короткий checklist:

- read context;
- verify decisions;
- define scope;
- implement;
- run QA;
- summarize diff;
- update ledger.

Checklist не заменяет QA/evidence.

Checklist не должен превращаться в длинный план на несколько задач, если prompt ограничен одной задачей.

## 12. Правила чтения больших файлов

Большой файл — любой файл больше 1000 строк.

Для больших файлов запрещено начинать с full-file read.

Разрешённые стратегии:

### 12.1. Чтение по task block

Использовать для backlog / planning docs.

Пример:

```text
Найди задачу P0-13 в docs/planning/current-backlog.md.
Прочитай только блок P0-13 до следующего заголовка того же уровня.
Не читать остальные разделы backlog.
```

### 12.2. Чтение по заголовку раздела

Пример:

```text
Прочитай только раздел "## Production Rules Discovery Block" в docs/planning/accepted-backlog-decisions-v1.md до следующего H2-заголовка.
```

### 12.3. Чтение по диапазону строк

Пример:

```text
Прочитай только строки 1180–2001 файла docs/planning/current-backlog.md.
Не читать остальной файл.
```

### 12.4. Чтение вокруг найденного совпадения

Пример:

```text
Найди первое вхождение "manager_notification_failed".
Прочитай 80 строк до и 120 строк после найденного места.
```

## 13. Правила для кода

Для TypeScript / React / API / production code чтение по строкам допустимо только если scope локальный.

Для кода предпочтительнее читать:

- целевой файл;
- прямые imports;
- связанные тесты;
- guard scripts;
- небольшие локальные зависимости.

Пример хорошего prompt:

```text
Работай только с ConstructorStagebar.
Разрешено читать:
- src/static-pages/constructor/components/ConstructorStagebar.tsx
- src/styles/constructor3d/101-client-facing-shell.css
- связанные tests, если они явно существуют.

Запрещено читать весь src/**.
Если потребуется другой файл — остановись и объясни зачем.
```

Пример плохого prompt:

```text
Проанализируй весь конструктор и исправь stepper.
```

## 14. Scope по умолчанию

Одна задача = один узкий слой.

Запрещено в одном prompt смешивать:

- UI и pricing;
- UI и API;
- production logic и checkout UX;
- Supabase schema и visual fixes;
- workflow/package changes и runtime changes;
- admin UX и customer-facing constructor;
- docs-only closure и implementation.

Если задача требует нескольких слоёв, агент должен предложить split plan и остановиться до подтверждения.

## 15. Stop Conditions

Агент обязан остановиться, если:

- нужно менять `package.json` или `package-lock.json`;
- нужно менять `.github/**`;
- нужно менять Supabase schema / migrations / RLS;
- нужно менять pricing formulas;
- нужно менять API order flow;
- нужно менять idempotency / notification semantics;
- нужно менять production export / Basis JSON rules;
- найден конфликт с `accepted-backlog-decisions-v1.md`;
- найден конфликт с `current-backlog.md`;
- задача требует product decision, которого нет в accepted decisions;
- задача требует visual/product approval;
- агент собирается изменить UX-flow, layout или interaction model;
- агент собирается закрыть visual task без fresh screenshots и explicit approval;
- задача требует full-file rewrite большого файла;
- diff становится больше исходного scope;
- тесты падают по причине вне scope;
- агент не может доказать, какие файлы изменены и почему.

Stop condition не означает провал.

Агент должен вернуть краткий report и запросить отдельный prompt.

## 16. Правила для docs-only задач

Docs-only задача должна:

- менять только явно разрешённые docs-файлы;
- не менять runtime code;
- не менять tests;
- не менять package/workflow;
- не закрывать задачи без merged/main evidence;
- не создавать новые backlog-файлы, если не указано явно;
- не использовать open PR / branch-only result как closure evidence.

Для больших docs-файлов агент должен читать только целевой раздел и связанные decision rules.

## 17. Правила для visual / UX задач

Visual closure невозможна без:

- fresh screenshots;
- явного visual review;
- explicit human visual approval;
- подтверждения, что screenshot artifact — это не само закрытие задачи;
- проверки desktop / tablet / mobile scope, если задача responsive.

Агент не должен сам выбирать новую визуальную концепцию, если есть принятые решения в `accepted-backlog-decisions-v1.md`.

Visual task cannot be closed by code changes alone.

Если visual-задача неоднозначна, сначала нужен decision prompt, затем implementation prompt.

## 18. Правила для production / manufacturing задач

Production / manufacturing задачи требуют отдельной осторожности.

Запрещено утверждать factory-ready handoff без:

- production rules;
- Basis JSON specification;
- validation rules;
- SKU/article mapping, если scope касается фурнитуры;
- drilling/edge/HDF rules;
- tests / golden snapshots;
- merged/main evidence.

Customer-facing Three.js preview не является production truth.

Basis JSON не равен automatic `.b3d` generation.

Production warnings и production critical errors должны проектироваться отдельно в production decision cycle, а не решаться внутри UI/API quick fix.

## 19. Human Approval Rule

Агент обязан запросить human approval перед:

- visual closure;
- release closure;
- production readiness claim;
- merge risky PR;
- changing accepted decisions;
- broad architecture migration;
- deleting legacy code;
- changing public UX behavior;
- changing pricing/order/production semantics.

Если approval отсутствует, статус `not approved`.

## 20. Autonomous Run Limit

Агенту запрещено автономно брать весь backlog без ограничений.

Автономный режим разрешён только если prompt задаёт:

- максимум задач за run;
- разрешённые категории задач;
- forbidden categories;
- stop conditions;
- requirement to stop after first risky dependency.

По умолчанию:

- 1 задача на implementation prompt;
- до 2 задач только для safe docs-only или test-only scope;
- остановка при первой рискованной зависимости.

## 21. No Autonomous Merge Rule

Агент не должен самостоятельно merge PR, если prompt явно не разрешает merge.

Для merge требуется:

- PR scope verified;
- changed files verified;
- required QA/checks green;
- no stop conditions;
- user or prompt permission;
- expected head SHA if available;
- main verification after merge.

Open PR, draft PR, branch-only tests are not closure evidence.

## 22. Proof Before Completion Rule

Перед заявлением о completion агент должен предоставить proof:

- changed files;
- diff summary;
- QA commands;
- QA results;
- relevant evidence;
- remaining risks;
- ledger update.

Если proof неполный, задача не считается completed.

## 23. Формат хорошего implementation prompt

Каждый implementation prompt должен включать:

```text
Задача:
<одна конкретная задача>

Источник истины:
- docs/planning/current-backlog.md: <конкретный task block>
- docs/planning/accepted-backlog-decisions-v1.md: <конкретный decision section>
- docs/planning/agent-prompt-rules-v1.md: <конкретный rules section>

Session mode:
- First run: read required source files and create ledger.
- Follow-up run: reuse ledger, do not reread full backlog unless trigger condition exists.

Разрешено читать:
- <точные файлы / разделы / диапазоны>

Запрещено читать:
- весь репозиторий
- весь файл >1000 строк без дополнительного разрешения

Разрешено менять:
- <точные файлы или директории>

Запрещено менять:
- package.json
- package-lock.json
- .github/**
- API/pricing/Supabase/order-flow, если не входит в scope

Stop conditions:
- <конкретные условия остановки>

QA:
- <точные команды>

Отчёт:
- changed files
- why each file changed
- diff summary
- QA result
- updated ledger
- remaining risks

Обращаться к агенту: <agent name>
```

## 24. Формат хорошего read-only prompt

```text
Выполни read-only audit.
Не меняй файлы.
Не создавай PR.
Не трогай GitHub issues.

Прочитай только:
- <task block / section / file range>
- <2-5 связанных файлов>

Цель:
- определить scope;
- выявить зависимости;
- предложить один safe implementation prompt;
- перечислить stop conditions.

Обращаться к агенту: <agent name>
```

## 25. Когда нужен широкий аудит

Широкий аудит разрешён только для:

- архитектурной migration;
- конфликтов между backlog и accepted decisions;
- failed tests неизвестного происхождения;
- package/workflow/dependency recovery;
- production rules redesign;
- pricing source-of-truth redesign;
- pre-release global verification.

Даже в этих случаях агент должен сначала перечислить, какие директории и файлы он собирается читать, и почему.

## 26. Agent Skills / Future Cursor Skills

Допустимо позже создать `.cursor/skills/**`, если skills не дублируют backlog и не становятся новым source of truth.

Потенциальные skills:

- `safe-pr-review`
- `visual-qa-review`
- `backlog-task-runner`
- `production-rules-audit`
- `pricing-parity-check`
- `release-candidate-check`

Skills должны ссылаться на:

- `AGENTS.md`;
- `docs/planning/current-backlog.md`;
- `docs/planning/accepted-backlog-decisions-v1.md`;
- `docs/planning/agent-prompt-rules-v1.md`.

## 27. Агентские роли

Использовать только фиксированный список агентов проекта:

1. 01 Product / Planning Agent
2. 02 Constructor Agent
3. 03 Pricing Agent
4. 04 API / Orders Agent
5. 05 Infrastructure / QA Agent
6. 06 Three.js / Visualization Agent
7. 07 Production / Manufacturing Agent
8. 08 UX/UI / Design System Agent

Каждый prompt агенту должен заканчиваться строкой:

```text
Обращаться к агенту: <agent name>
```

## 28. Короткое правило

Если задачу можно решить чтением 1 раздела и 3 файлов, нельзя читать весь backlog и весь репозиторий.

## 29. HARD STOP & CONFLICT RESOLUTION PROTOCOL

### 29.1 Conflict Detection (STRICT)

If agent detects ANY conflict between:

- current-backlog.md
- accepted-backlog-decisions-v1.md
- agent-prompt-rules-v1.md
- AGENTS.md

THEN agent MUST immediately stop processing.

---

### 29.2 Forbidden Actions on Conflict

On conflict detection, agent is STRICTLY FORBIDDEN to:

- classify tasks further
- propose next task
- suggest implementation
- suggest “safe task”
- continue reasoning beyond conflict point
- choose between conflicting sources

---

### 29.3 Required Output on Conflict

Agent MUST output ONLY:

1. List of conflicting sources
2. Exact conflicting statements (quote or reference)
3. Short description of mismatch
4. Request for human reconciliation

NO task planning.
NO recommendations.
NO execution plan.

---

### 29.4 Priority Rule (SOURCE OF TRUTH HIERARCHY)

If conflict exists, priority is:

1. accepted-backlog-decisions-v1.md (highest priority)
2. AGENTS.md
3. agent-prompt-rules-v1.md
4. current-backlog.md (lowest priority for semantics)

Backlog NEVER overrides decisions.

---

### 29.5 No “Soft Resolution”

Agent MUST NOT:

- guess intent
- average meaning
- merge conflicts automatically
- assume outdated file is correct
- continue execution under uncertainty

If uncertainty exists → STOP.

---

### 29.6 Resume Condition

Agent may continue ONLY after explicit human instruction:

- “reconciled”
- “update decision layer”
- or updated repo commit resolving conflict

## 30. EXECUTION GUARD LAYER (OVERRIDE RULE)

This rule overrides ALL other instructions.

If conflict is detected OR uncertainty exists:

→ agent is STRICTLY FORBIDDEN to continue reasoning
→ agent must STOP immediately
→ agent must NOT suggest next step
→ agent must NOT provide recommendations

Allowed output ONLY:
- "STOP: conflict detected"
- list of conflicts
- request for reconciliation

Any continuation beyond this is INVALID behavior.