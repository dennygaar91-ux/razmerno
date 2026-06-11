# Размерно — production preview UI v14

## Что сделано

Production preview summary подключён к UI конструктора.

## Новые изменения

- Добавлен hook:
  - `src/static-pages/constructor/hooks/useProductionPreview.ts`
- `ConstructorPage.tsx` теперь строит production preview из `constructorSnapshot` и текущего quote.
- `ConstructorScene.tsx` показывает блок «Техническая проверка».
- Добавлены CSS-классы:
  - `.rzm-production-preview-card`
  - `.rzm-production-preview-head`
  - `.rzm-production-status`
  - `.rzm-production-status--ready`
  - `.rzm-production-status--needs-review`
  - `.rzm-production-status--blocked`
  - `.rzm-production-status--loading`
  - `.rzm-production-preview-grid`
  - `.rzm-production-preview-meta`
  - `.rzm-production-preview-error`

## Что показывает UI

- статус проверки;
- количество панелей;
- количество фурнитуры;
- количество операций присадки;
- количество шагов БАЗИС;
- нужна ли проверка технолога;
- количество предупреждений;
- количество ошибок.

## Важно

Production preview adapter подгружается лениво через dynamic import внутри `useProductionPreview`, чтобы не делать production pipeline top-level зависимостью конструктора.

## Что не трогалось

- backend/API;
- pricing engine;
- delivery;
- admin;
- order flow;
- production geometry internals.

## Следующий этап

Можно сделать отдельный collapsible «Техническая проверка» или включить preview summary только в dev/admin-режиме, если блок будет слишком техническим для клиента.
