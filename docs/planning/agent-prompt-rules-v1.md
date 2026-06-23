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

## 3. Главное правило экономии контекста

Агенту запрещено читать весь репозиторий или весь большой файл без необходимости.

По умолчанию промпт должен ограничивать чтение:

- конкретным task block;
- конкретным разделом документа;
- конкретным диапазоном строк;
- конкретными файлами;
- прямыми зависимостями целевого файла.

Если информации недостаточно, агент должен остановиться и запросить дополнительный диапазон, файл или dependency scope.

## 4. Правила чтения больших файлов

Большой файл — любой файл больше 1000 строк.

Для больших файлов запрещено начинать с full-file read.

Разрешённые стратегии:

### 4.1. Чтение по task block

Использовать для backlog / planning docs.

Пример:

```text
Найди задачу P0-13 в docs/planning/current-backlog.md.
Прочитай только блок P0-13 до следующего заголовка того же уровня.
Не читать остальные разделы backlog.
```

### 4.2. Чтение по заголовку раздела

Пример:

```text
Прочитай только раздел "## Production Rules Discovery Block" в docs/planning/accepted-backlog-decisions-v1.md до следующего H2-заголовка.
```

### 4.3. Чтение по диапазону строк

Пример:

```text
Прочитай только строки 1180–2001 файла docs/planning/current-backlog.md.
Не читать остальной файл.
```

### 4.4. Чтение вокруг найденного совпадения

Пример:

```text
Найди первое вхождение "manager_notification_failed".
Прочитай 80 строк до и 120 строк после найденного места.
```

## 5. Правила для кода

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

## 6. Scope по умолчанию

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

## 7. Stop conditions

Агент обязан остановиться, если:

- нужно менять `package.json` или `package-lock.json`;
- нужно менять `.github/**`;
- нужно менять Supabase schema / migrations / RLS;
- нужно менять pricing formulas;
- нужно менять API order flow;
- нужно менять idempotency / notification semantics;
- нужно менять production export / Basis JSON rules;
- найден конфликт с `accepted-backlog-decisions-v1.md`;
- задача требует full-file rewrite большого файла;
- diff становится больше исходного scope;
- тесты падают по причине вне scope;
- агент не может доказать, какие файлы изменены и почему.

Stop condition не означает провал. Агент должен вернуть краткий report и запросить отдельный prompt.

## 8. Правила для docs-only задач

Docs-only задача должна:

- менять только явно разрешённые docs-файлы;
- не менять runtime code;
- не менять tests;
- не менять package/workflow;
- не закрывать задачи без merged/main evidence;
- не создавать новые backlog-файлы, если не указано явно;
- не использовать open PR / branch-only result как closure evidence.

Для больших docs-файлов агент должен читать только целевой раздел и связанные decision rules.

## 9. Правила для visual / UX задач

Visual closure невозможна без:

- fresh screenshots;
- явного visual review;
- подтверждения, что screenshot artifact — это не само закрытие задачи;
- проверки desktop / tablet / mobile scope, если задача responsive.

Агент не должен сам выбирать новую визуальную концепцию, если есть принятые решения в `accepted-backlog-decisions-v1.md`.

Если визуальная задача неоднозначна, сначала нужен decision prompt, затем implementation prompt.

## 10. Правила для production / manufacturing задач

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

## 11. Формат хорошего implementation prompt

Каждый implementation prompt должен включать:

```text
Задача:
<одна конкретная задача>

Источник истины:
- docs/planning/current-backlog.md: <конкретный task block>
- docs/planning/accepted-backlog-decisions-v1.md: <конкретный decision section>

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
- QA result
- remaining risks
```

## 12. Формат хорошего read-only prompt

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

## 13. Когда нужен широкий аудит

Широкий аудит разрешён только для:

- архитектурной migration;
- конфликтов между backlog и accepted decisions;
- failed tests неизвестного происхождения;
- package/workflow/dependency recovery;
- production rules redesign;
- pricing source-of-truth redesign;
- pre-release global verification.

Даже в этих случаях агент должен сначала перечислить, какие директории и файлы он собирается читать, и почему.

## 14. Агентские роли

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

## 15. Короткое правило

Если задачу можно решить чтением 1 раздела и 3 файлов, нельзя читать весь backlog и весь репозиторий.
