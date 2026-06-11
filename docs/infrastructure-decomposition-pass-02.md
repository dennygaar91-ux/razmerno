# Infrastructure Decomposition Pass 02

Дата: 2026-06-10

## Цель

Продолжить безопасную декомпозицию `src/static-pages/Constructor3DPage.tsx` без изменения поведения, UX, дизайна, Three.js, pricing и checkout.

## Что изменено

### 1. Вынесен шаг «Размеры»

Создан компонент:

- `src/static-pages/constructor/components/SizesStepPanel.tsx`

В него вынесены:

- UI шага «Размеры»;
- выбор типа мебели;
- поля ширины/высоты/глубины;
- блок ширины секций;
- локальный `NumberControl` для этого шага;
- локальная функция поиска validation issue по `targetId`.

### 2. Уменьшен God Component

`src/static-pages/Constructor3DPage.tsx`:

- было: 2384 строки;
- стало: 2019 строк.

Снижение: примерно 365 строк.

## Что не изменялось

Не менялись:

- бизнес-логика;
- pricing;
- checkout;
- order submit;
- Three.js layer;
- CSS;
- routing;
- validation rules;
- внешний вид;
- поведение reset/autosave;
- legacy quarantine.

## Почему это безопасно

Вынесенный компонент получает все значения и callbacks через props. Источник данных, actions store, validation и pricing flow остались прежними.

## Проверки

Успешно выполнены:

```bash
npm install --no-audit --no-fund
npm run typecheck
npm run build
npm run qa:static
npm run validate:config
npm run test:constructor-store
npm run test:constructor-three
npm run test:pricing-final
```

## Оставшийся риск

`Constructor3DPage.tsx` всё ещё остаётся крупным файлом и содержит:

- orchestration активной страницы;
- drawer routing;
- filling step;
- materials step;
- checkout step;
- inline helper components.

Следующий безопасный pass: вынести `MaterialsStepPanel` и material-related helper components.
