# Constructor CSS layer map

Документ фиксирует текущую карту CSS-слоёв конструктора и план будущей чистки.

## Почему это важно

Во время быстрой UX/UI-полировки появились дополнительные CSS-файлы. Это ускорило итерации, но создало каскадный технический долг.

Сейчас это допустимо для pre-MVP, но перед production нужно привести структуру к более понятному виду.

## Текущая точка входа

Основная страница конструктора импортирует:

```js
import './ConstructorPage.css'
import './ConstructorWizard.css'
import './ConstructorReference.css'
import './ConstructorInteractive.css'
import './ConstructorAdaptive.css'
import './ConstructorSummaryProduct.css'
```

`ConstructorSummaryProduct.css` сейчас работает как дополнительная точка сборки polish-слоёв.

## Текущие polish/fix layers

Порядок важен:

```css
@import './ConstructorConfigPolish.css';
@import './ConstructorViewerPolish.css';
@import './ConstructorCheckoutPolish.css';
@import './ConstructorDesktopPass.css';
@import './ConstructorMaterialsPolish.css';
@import './ConstructorProjectSafety.css';
@import './ConstructorStatusPolish.css';
@import './ConstructorScreenshotFixes.css';
@import './ConstructorSectionMapFix.css';
@import './ConstructorFinalCompactFix.css';
```

## Назначение файлов

### ConstructorConfigPolish.css

Отвечает за:

- левую панель;
- поля размеров;
- step body;
- config navigation;
- визуальные подсказки.

### ConstructorViewerPolish.css

Отвечает за:

- viewer layout;
- toolbar;
- canvas/fallback visual;
- quick actions;
- базовую карту секций.

### ConstructorCheckoutPolish.css

Отвечает за:

- checkout drawer;
- checkout steps;
- fields;
- options;
- success state.

### ConstructorDesktopPass.css

Отвечает за:

- desktop/laptop layout;
- 25 / 50 / 25 логику;
- высоты колонок;
- общую подгонку конструктора.

### ConstructorMaterialsPolish.css

Отвечает за:

- шаг материалов;
- material cards;
- option list;
- selected material/specification;
- swatches.

### ConstructorProjectSafety.css

Отвечает за:

- confirm modal перед очисткой проекта.

### ConstructorStatusPolish.css

Отвечает за:

- StatusBadge;
- inline status;
- success/loading/error/neutral tone.

### ConstructorScreenshotFixes.css

Исторический слой под первые screenshot-правки.

Риск: может дублировать часть новых compact-правил.

### ConstructorSectionMapFix.css

Отвечает за:

- новую semantic structure карты секций;
- article + select button + action buttons;
- focus-visible;
- responsive state action-кнопок.

### ConstructorFinalCompactFix.css

Финальный слой, который сейчас перекрывает часть предыдущих правил:

- compact checkout;
- compact right summary;
- screenshot-based polish;
- laptop improvements;
- filling/material controls compact.

## Главный риск

`ConstructorFinalCompactFix.css` перекрывает несколько более ранних файлов. Это нормально сейчас, но опасно в долгую.

Типичный риск:

```txt
исправили компонент в ConstructorViewerPolish.css,
но изменение не видно,
потому что ниже его перекрыл ConstructorFinalCompactFix.css
```

## Что не делать сейчас

До финальной визуальной проверки не нужно:

- удалять polish files;
- сливать все стили;
- переписывать CSS architecture;
- переходить на CSS modules;
- делать BEM-миграцию.

## Production cleanup plan

После того как UI будет визуально принят, сделать рефакторинг по этапам.

### Этап 1. Заморозить визуал

- сделать скриншоты accepted-state;
- больше не добавлять новые visual-fix файлы;
- зафиксировать текущие breakpoint targets.

### Этап 2. Разнести стили по компонентам

Целевая структура:

```txt
src/components/constructor/
  ConstructorConfig.jsx
  ConstructorConfig.css
  ConstructorViewer.jsx
  ConstructorViewer.css
  ConstructorSummary.jsx
  ConstructorSummary.css
  CheckoutDrawer.jsx
  CheckoutDrawer.css
  StatusBadge.jsx
  StatusBadge.css

src/components/constructor/viewer/
  ViewerToolbar.jsx
  ViewerToolbar.css
  ViewerScene.jsx
  ViewerScene.css
  SectionMap.jsx
  SectionMap.css
  ViewerQuickActions.jsx
  ViewerQuickActions.css
```

### Этап 3. Оставить один адаптивный слой

```txt
src/pages/ConstructorAdaptive.css
```

В нём держать только:

- 1536×864;
- 1440×900;
- 1366×768;
- height-based fixes.

### Этап 4. Удалить временные layers

Кандидаты на удаление после переноса:

```txt
ConstructorScreenshotFixes.css
ConstructorSectionMapFix.css
ConstructorFinalCompactFix.css
ConstructorDesktopPass.css
```

### Этап 5. Проверить visual regression вручную

На каждом этапе переноса проверять:

- общий экран;
- шаг Размеры;
- шаг Наполнение;
- шаг Материалы;
- checkout drawer.

## Pre-MVP решение

Для текущей стадии лучше оставить всё как есть, потому что:

- build уже проходил до последних правок;
- каскад понятен и задокументирован;
- визуальные правки ещё не финально приняты;
- преждевременный CSS-refactor может занять больше времени, чем даст пользы.

## Правило на ближайшие итерации

Не создавать новые CSS-fix файлы без крайней необходимости.

Если нужна новая точечная правка до визуального принятия — добавлять её в:

```txt
ConstructorFinalCompactFix.css
```

После визуального принятия — переходить к cleanup plan.
