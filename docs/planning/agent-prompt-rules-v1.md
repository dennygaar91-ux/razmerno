# Agent Prompt Rules v1 — Размерно

## 1. Назначение документа

Этот документ фиксирует правила подготовки промптов для Codex / Cursor / AI-агентов проекта «Размерно».

Цель: сократить расход токенов, уменьшить количество лишних итераций, запретить широкие неуправляемые аудиты и повысить безопасность изменений в репозитории.

## 2. Обязательные источники истины

Перед работой агент должен учитывать:

1. `docs/planning/current-backlog.md` — главный backlog source of truth.
2. `docs/planning/accepted-backlog-decisions-v1.md` — обязательный decision layer.
3. Этот файл — правила чтения, scope и подготовки prompts.

Если `current-backlog.md`, `accepted-backlog-decisions-v1.md` и этот файл конфликтуют, агент должен остановиться и запросить reconciliation.

Repo state и merged/main evidence имеют приоритет над session memory, local branch claims, open PR claims и предположениями агента.

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

## 4. Anti-Assumption Rule

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
- visual approval.

Если доказательства нет, агент должен написать `not verified` и остановиться или запросить нужный источник.

Запрещено использовать слова вроде `готово`, `закрыто`, `проверено`, `merged`, `success`, если это не подтверждено repo / GitHub / explicit user evidence.

## 5. Anti-Overengineering Rule

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

## 6. Главное правило экономии контекста

Агенту запрещено читать весь репозиторий или весь большой файл без необходимости.

По умолчанию промпт должен ограничивать чтение:

- конкретным task block;
- конкретным разделом документа;
- конкретным диапазоном строк;
- конкретными файлами;
- прямыми зависимостями целевого файла.

Если информации недостаточно, агент должен остановиться и запросить дополнительный диапазон, файл или dependency scope.

## 7. Session Memory / Run Ledger Rule

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

## 8. Правила чтения больших файлов

Большой файл — любой файл больше 1000 строк.

Для больших файлов запрещено начинать с full-file read.

Разрешённые стратегии:

### 8.1. Чтение по task block

Использовать для backlog / planning docs.

Пример:

```text
Найди задачу P0-13 в docs/planning/current-backlog.md.
Прочитай только блок P0-13 до следующего заголовка того же уровня.
Не читать остальные разделы backlog.
```

### 8.2. Чтение по заголовку раздела

Пример:

```text
Прочитай только раздел "## Production Rules Discovery Block" в docs/planning/accepted-backlog-decisions-v1.md до следующего H2-заголовка.
```

### 8.3. Чтение по диапазону строк

Пример:

```text
Прочитай только строки 1180–2001 файла docs/planning/current-backlog.md.
Не читать остальной файл.
```

### 8.4. Чтение вокруг найденного совпадения

Пример:

```text
Найди первое вхождение "manager_notification_failed".
Прочитай 80 строк до и 120 строк после найденного места.
```

## 9. Правила для кода

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

## 10. Scope по умолчанию

Одна задача = один узкий слой.

Запрещено в одном prompt смешивать:

- UI и pricing;
- UI и API;
- production logic и checkout UX;
- Supabase schema и визуальные правки;
- workflow/package изменения и runtime changes;
- admin UX и customer-facing constructor;
- docs-only closure и implementation.

Если задача требует нескольких слоёв, агент должен предложить split plan и остановиться до подтверждения.

## 11. Stop conditions

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

Stop condition не означает провал. Агент должен вернуть краткий report и запросить отдельный prompt.

## 12. Правила для docs-only задач

Docs-only задача должна:

- менять только явно разрешённые docs-файлы;
- не менять runtime code;
- не менять tests;
- не менять package/workflow;
- не закрывать задачи без merged/main evidence;
- не создавать новые backlog-файлы, если не указано явно;
- не использовать open PR / branch-only result как closure evidence.

Для больших docs-файлов агент должен читать только целевой раздел и связанные decision rules.

## 13. Правила для visual / UX задач

Visual closure невозможна без:

- fresh screenshots;
- явного visual review;
- explicit human visual approval;
- подтверждения, что screenshot artifact — это не само закрытие задачи;
- проверки desktop / tablet / mobile scope, если задача responsive.

Агент не должен сам выбирать новую визуальную концепцию, если есть принятые решения в `accepted-backlog-decisions-v1.md`.

Visual task cannot be closed by code changes alone.

Если визуальная задача неоднозначна, сначала нужен decision prompt, затем implementation prompt.

## 14. Правила для production / manufacturing задач

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

## 15. Autonomous Run Limit

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

## 16. Формат хорошего implementation prompt

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
```

## 17. Формат хорошего read-only prompt

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
```

## 18. Когда нужен широкий аудит

Широкий аудит разрешён только для:

- архитектурной migration;
- конфликтов между backlog и accepted decisions;
- failed tests неизвестного происхождения;
- package/workflow/dependency recovery;
- production rules redesign;
- pricing source-of-truth redesign;
- pre-release global verification.

Даже в этих случаях агент должен сначала перечислить, какие директории и файлы он собирается читать, и почему.

## 19. Агентские роли

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

## 20. Короткое правило

Если задачу можно решить чтением 1 раздела и 3 файлов, нельзя читать весь backlog и весь репозиторий.
