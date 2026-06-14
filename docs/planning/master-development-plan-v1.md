# Master Development Plan v1 — Размерно

Статус: главный управляющий документ для дальнейшей работы агентов.

Цель документа — зафиксировать порядок развития проекта до MVP, приоритеты, зависимости, ограничения и безопасную стратегию разработки.

---

## 1. Executive Summary

Проект «Размерно» находится в состоянии рабочего MVP-прототипа, но ещё не готов к production-запуску.

Главный риск сейчас — не отсутствие функций, а рост сложности: активная 3D-ветка, legacy-конструктор, крупные файлы, pricing, checkout, production layer, API, Supabase и большая документация существуют одновременно.

Основная стратегия:

**Stabilize → Complete → Harden → Release**

Сначала нужно стабилизировать архитектуру, state, pricing и Three.js. Затем завершить Constructor3D, checkout и fallback. После этого — тесты, CI/CD, production layer, admin и release candidate.

---

## 2. Текущее состояние проекта

### Инфраструктура

Есть GitHub, Vercel, Supabase, docs, архитектурный аудит и документационный аудит.

Проблемы: документационный шум, слабый CI/CD quality gate, недостаточное тестовое покрытие, отсутствие единого planning-слоя до создания этой папки.

### Конструктор

Активная разработка должна идти вокруг нового Constructor3D.

Проблемы: крупный Constructor3DPage, крупный constructorStore, legacy Constructor в репозитории, риск дублирования логики.

### Three.js

3D открыт по умолчанию и является главным интерфейсом. Нужны стабильность, fallback, контроль производительности, реальные текстуры и аккуратная архитектура сцены.

### Pricing Engine

Цена должна быть точной, не предварительной. Главный риск — расхождение между клиентом, сервером и production layer.

### Production Layer

Нужна production model для технолога, но сложная производственная логика не должна перегружать клиентский UI.

### UX/UI

Продукт должен ощущаться как понятный мебельный конструктор, а не инженерная программа.

---

## 3. Главные риски

1. Архитектурное расслоение между старым Constructor и новым Constructor3D.
2. God Component и God Store, которые сложно менять агентами.
3. Расхождение pricing.
4. Нестабильность WebGL/Three.js без рабочего fallback.
5. Устаревшая или противоречивая документация.
6. Scope creep: кухни, AI, B2B, cinematic animation и автоматическая Basis generation не должны попадать в обязательный MVP.

---

## 4. P0 Backlog

P0 — задачи, без которых MVP нельзя считать безопасным.

1. Unified Constructor Architecture.
2. Constructor State Model Stabilization.
3. Pricing Engine Validation.
4. Checkout Reliability.
5. Three.js Stability.
6. WebGL / 2D Fallback.
7. Documentation Sync.
8. Testing Foundation.

---

## 5. P1 Backlog

1. Constructor3D UX Completion.
2. Material System.
3. 3D Furniture Details.
4. Warning / Error System.
5. Checkout UX Completion.
6. Legacy Constructor Cleanup Plan.
7. CI/CD Quality Gates.
8. Design System Stabilization.

---

## 6. P2 Backlog

1. Production Model Decomposition.
2. Manufacturing Rules Engine.
3. Basis Export JSON.
4. Admin Orders.
5. Admin Production Panel.
6. Production Revisions.

---

## 7. P3 Backlog

Post-MVP:

- AI Assembly System;
- B2B Mode;
- кухни;
- automatic .b3d generation;
- cinematic assembly animation;
- deep Three.js optimization;
- CRM/logistics integration;
- полноценная PDF generation;
- real Resend attachments;
- advanced operation editor.

---

## 8. Roadmap до MVP

1. Stage 01 — Planning & Governance.
2. Stage 02 — Constructor Architecture Stabilization.
3. Stage 03 — Constructor State Model.
4. Stage 04 — Pricing Validation.
5. Stage 05 — Three.js Stability.
6. Stage 06 — Constructor3D Interaction MVP.
7. Stage 07 — Materials MVP.
8. Stage 08 — Checkout MVP.
9. Stage 09 — Testing & CI/CD.
10. Stage 10 — Production Layer MVP.
11. Stage 11 — Admin MVP.
12. Stage 12 — Release Candidate.

---

## 9. Рекомендуемый порядок запуска агентов

1. Documentation / Planner Agent.
2. Architect Agent.
3. Constructor Core Agent.
4. Pricing Agent.
5. Three.js Agent.
6. Constructor UX Agent.
7. Checkout Agent.
8. QA / Testing Agent.
9. Production Layer Agent.
10. Release Agent.

---

## 10. Самая безопасная стратегия

Не начинать с дизайна, удаления legacy, Basis integration или post-MVP функций.

Сначала стабилизировать документы, архитектуру, state и Three.js. Затем завершить pricing, checkout и основной 3D-flow. После этого покрыть тестами и только потом углублять production/admin.

Главный принцип:

**каждый этап должен уменьшать неопределённость, а не добавлять новую.**
