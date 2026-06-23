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

## 2A. Product Decision Priority

Перед любой implementation-задачей агент обязан сначала проверить relevant accepted decisions.

Запрещено самостоятельно менять или принимать решения по:
- UX-flow;
- Constructor3D / 2D behavior;
- mobile UX;
- stepper behavior;
- pricing policy;
- minimum order;
- validation rules;
- production boundary;
- Basis JSON rules;
- admin MVP scope;
- release gate.

Если решение отсутствует или конфликтует:
- остановиться;
- сформулировать вопрос;
- не писать код;
- не создавать PR.

Запрещено компенсировать отсутствие решения собственными предположениями.

## 3. Главное правило экономии контекста

Агенту запрещено читать весь репозиторий или весь большой файл без необходимости.

По умолчанию промпт должен ограничивать чтение конкретным task block, разделом документа, диапазоном строк, файлами и прямыми зависимостями.

## 3A. Session Memory / Run Ledger Rule

В рамках одного и того же agent chat/session агент не обязан перечитывать весь backlog и decision layer перед каждой итерацией.

Первый prompt должен создать session ledger:
- source files read;
- accepted decisions used;
- active task;
- closed tasks;
- changed files;
- QA commands;
- remaining risks.

В следующих итерациях агент использует ledger и читает только новый task block, changed files и прямые зависимости.

Агент обязан заново перечитать relevant backlog/decisions если:
- новый chat/session;
- сменился agent role;
- сменился task family;
- появились новые изменения в main;
- затронуты pricing/API/Supabase/production/Basis JSON;
- возник stop condition;
- найден конфликт между ledger и repo.

Repo остаётся source of truth. Ledger не заменяет repository state.

## 15. Короткое правило

Если задачу можно решить чтением 1 раздела и 3 файлов, нельзя читать весь backlog и весь репозиторий.

## 16. Autonomous Run Limit

Агенту запрещено автономно брать весь backlog без ограничений.

По умолчанию:
- 1 задача на implementation prompt;
- до 2 задач только для safe docs-only или test-only scope;
- остановка при первой рискованной зависимости.

Для autonomous run обязательно задавать:
- allowed categories;
- forbidden categories;
- stop conditions;
- максимальное число задач за run.
