# Legacy Migration Master Plan v1

Статус: Strategic Planning.

Дата: 2026-06-14.

Основание:

- docs/audit/architecture-gap-analysis-v1.md
- docs/planning/architecture-boundaries-v1.md

Цель документа:

Подготовить безопасный долгосрочный план вывода legacy-архитектуры из проекта без потери:

- функциональности;
- тестов;
- production стабильности;
- возможности отката.

Важно:

Этот документ НЕ означает немедленное удаление legacy.

На текущем этапе legacy рассматривается как quarantine layer.

## 1. Что считается legacy

На текущий момент legacy-зоной считается:

```txt
src/configurator/**
src/static-pages/ConstructorPage.tsx
legacy bridge scripts
legacy architecture checks
historical stage scripts
```

Не всё legacy можно удалить.

Часть модулей может всё ещё использоваться:

- тестами;
- bridge-адаптерами;
- проверками совместимости.

Поэтому используется стратегия:

Audit → Isolate → Replace → Verify → Remove.

## 2. Почему нельзя удалять legacy сейчас

После архитектурного аудита выявлены риски:

### Risk A

Часть тестов может зависеть от:

```txt
src/configurator/model/**
src/configurator/store/**
src/configurator/context.tsx
```

### Risk B

Часть quality checks может ожидать наличие legacy файлов.

### Risk C

Некоторые bridge-механизмы могли остаться скрытыми.

### Risk D

Возможен скрытый импорт legacy модулей через промежуточные adapters.

Поэтому прямое удаление сейчас запрещено.

## 3. Целевая архитектура после миграции

После завершения миграции активной должна остаться только цепочка:

```txt
App
 ↓
Constructor3DPage
 ↓
static-pages/constructor/**
 ↓
pricing
 ↓
order flow
 ↓
production preview
```

Legacy runtime должен исчезнуть из продуктового пути.

## 4. Карта миграции

### Фаза 1. Полная инвентаризация

Цель:

понять, что реально используется.

Необходимо:

1. Найти все файлы внутри:

```txt
src/configurator/**
```

2. Для каждого файла определить:

- используется ли runtime;
- используется ли тестами;
- используется ли scripts;
- используется ли bridge.

Результат:

legacy inventory.

Статус:

Обязательно.

Приоритет:

P0.

## Фаза 2. Dependency Graph

Цель:

понять реальные связи.

Необходимо построить граф:

```txt
legacy module
 ↓
кто импортирует
 ↓
зачем импортирует
```

Результат:

dependency map.

Приоритет:

P0.

## Фаза 3. Test Ownership Audit

Цель:

понять, какие тесты защищают legacy.

Для каждого теста определить:

- active constructor;
- pricing;
- checkout;
- production;
- legacy only.

Результат:

test ownership map.

Приоритет:

P0.

## Фаза 4. Bridge Audit

Цель:

найти все переходные механизмы.

Особенно проверить:

```txt
useConfigBridge
configActions
configStore
configReducer
context.tsx
```

Нужно понять:

можно ли отключить bridge без изменения поведения.

Приоритет:

P0.

## Фаза 5. Active Replacement Verification

Цель:

убедиться, что для каждого legacy-модуля уже существует активная замена.

Проверять:

### state

legacy:

```txt
configStore
configReducer
ConfigProvider
```

replacement:

```txt
ConstructorStore
slices
selectors
```

### validation

legacy validation

↓

new constructor validation

### scene

legacy viewer

↓

new Constructor3D viewer

### quote

legacy calculatePrice

↓

new quote path

Без замены удаление запрещено.

## Фаза 6. Quarantine Mode

После завершения аудита:

legacy переводится в режим:

```txt
READ ONLY
```

Запрещается:

- новый функционал;
- новые тесты;
- новые импорты.

Разрешается:

- migration fixes;
- documentation.

## Фаза 7. Import Ban

После подтверждения dependency map:

должен появиться guard:

```txt
active constructor
cannot import
legacy configurator
```

Без этого миграция невозможна.

## Фаза 8. Test Migration

После import ban:

тесты переносятся с legacy на active constructor.

Порядок:

1. state tests
2. validation tests
3. scene tests
4. integration tests
5. e2e tests

Удаление legacy до завершения тестовой миграции запрещено.

## Фаза 9. Soft Removal

После миграции тестов:

legacy не удаляется сразу.

Вместо этого:

```txt
legacy archive
```

или

```txt
legacy-disabled
```

режим.

Период наблюдения:

минимум один release cycle.

## Фаза 10. Final Removal

Удаление возможно только если:

- dependency graph пуст;
- import graph пуст;
- tests migrated;
- build green;
- release green;
- rollback strategy существует.

## 5. Категории legacy-модулей

### Category A

Safe Removal Candidate

После миграции может быть удалён полностью.

### Category B

Migration Candidate

Нужен перенос.

### Category C

Historical Documentation

Код может исчезнуть,
но логика должна остаться в docs.

### Category D

Unknown Ownership

До аудита удаление запрещено.

## 6. Что нельзя делать

Запрещено:

- удалять src/configurator/** сейчас;
- удалять ConstructorPage сейчас;
- удалять bridge сейчас;
- удалять tests сейчас;
- удалять checks сейчас;
- менять pricing ради миграции;
- менять checkout ради миграции;
- менять production ради миграции.

## 7. Главные критерии успеха

Legacy считается успешно выведенным из эксплуатации если:

1. Active Constructor3D полностью автономен.
2. Нет импортов из src/configurator/**.
3. Нет зависимости тестов от legacy runtime.
4. Нет зависимости scripts от legacy runtime.
5. Pricing использует единый source-of-truth.
6. Checkout использует только active path.
7. Production preview не зависит от legacy.
8. Возможен безопасный rollback.

## 8. Следующие документы

После этого плана должны появиться:

1. legacy-inventory-v1.md
2. legacy-dependency-map-v1.md
3. legacy-test-ownership-v1.md
4. bridge-audit-v1.md
5. import-ban-spec-v1.md

Только после их завершения можно обсуждать реальное удаление legacy-кода.