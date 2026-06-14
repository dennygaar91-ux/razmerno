# Current Backlog — Размерно

Статус: единый backlog для агентов.

Формат приоритета:

- P0 — блокирует безопасный MVP.
- P1 — требуется для качественного MVP.
- P2 — усиливает production-ready уровень.
- P3 — post-MVP.

---

## P0 — Critical MVP Safety

### P0-01 Unified Constructor Architecture

Зачем: зафиксировать Constructor3D как активную ветку, а legacy Constructor — как quarantine.

Риск невыполнения: агенты будут менять старый код или дублировать логику.

Объём: XL.

Зависимости: architecture audit.

Независимо: нет.

### P0-02 Constructor State Model Stabilization

Зачем: единая модель данных для размеров, секций, зон, наполнения, фасадов, материалов, checkout и validation.

Риск: ломается связь UI, 3D, fallback, pricing и checkout.

Объём: L.

Зависимости: P0-01.

Независимо: нет.

### P0-03 Pricing Engine Validation

Зачем: цена должна быть точной.

Риск: расхождение цены ломает доверие и заявку.

Объём: M.

Зависимости: price sources, delivery, assembly.

Независимо: частично.

### P0-04 Checkout Reliability

Зачем: заявка должна стабильно отправляться с корректными данными.

Риск: потеря конверсии и заявок.

Объём: M.

Зависимости: pricing, validation, order API.

Независимо: частично.

### P0-05 Three.js Stability

Зачем: 3D является основным интерфейсом.

Риск: пользователь видит сломанный продукт.

Объём: XL.

Зависимости: scene adapter, state model.

Независимо: нет.

### P0-06 WebGL / 2D Fallback

Зачем: пользователь должен продолжить настройку, если WebGL недоступен.

Риск: часть пользователей не сможет отправить заявку.

Объём: M.

Зависимости: P0-05.

Независимо: нет.

### P0-07 Documentation Sync

Зачем: единый источник истины для агентов.

Риск: агенты читают устаревшие документы.

Объём: M.

Зависимости: audits, backlog.

Независимо: да.

### P0-08 Testing Foundation

Зачем: минимальная защита от регрессий.

Риск: крупная декомпозиция станет небезопасной.

Объём: L.

Зависимости: стабильные границы модулей.

Независимо: частично.

---

## P1 — MVP Quality

### P1-01 Constructor3D UX Completion

Задачи: выбор зон, локальное меню, наполнение, фасады, random preset.

Объём: XL.

Зависимости: P0-02, P0-05.

### P1-02 Material System

Задачи: реальные текстуры, категории, swatches, zoom-preview.

Объём: L.

Зависимости: Three.js material pipeline.

### P1-03 3D Furniture Details

Задачи: петли, направляющие, ручки, штанги, базовая фурнитура.

Объём: XL.

Зависимости: hardware model, scene architecture.

### P1-04 Warning / Error System

Задачи: warning, blocking warning, error, auto-fix для простых случаев.

Объём: M.

Зависимости: validation model.

### P1-05 Checkout UX Completion

Задачи: итоговая смета, доставка, сборка, контакты, согласие, success state.

Объём: M.

Зависимости: pricing, order flow.

### P1-06 Legacy Constructor Cleanup Plan

Задачи: миграция тестов, quarantine, безопасное удаление после подтверждения.

Объём: L.

Зависимости: tests.

### P1-07 CI/CD Quality Gates

Задачи: typecheck, build, tests as required checks.

Объём: M.

Зависимости: package scripts.

### P1-08 Design System Stabilization

Задачи: tokens, buttons, forms, cards, focus states, spacing.

Объём: L.

Зависимости: актуальный UI scope.

---

## P2 — Production-Ready Depth

1. Production Model Decomposition.
2. Manufacturing Rules Engine.
3. Basis Export JSON.
4. Admin Orders.
5. Admin Production Panel.
6. Production Revisions.
7. Operation editor for hinges/guides/drilling.
8. Detailed production warnings.

---

## P3 — Post-MVP

1. AI Assembly System.
2. B2B Mode.
3. Kitchens.
4. Automatic `.b3d` generation.
5. Cinematic assembly animation.
6. Deep Three.js optimization.
7. CRM/logistics integration.
8. Full PDF binary generation.
9. Real email attachments.
