# Constructor accessibility checklist

Документ фиксирует базовые accessibility-требования для frontend pre-MVP конструктора.

## 1. Dialog / Checkout

Проверить:

- checkout имеет `role="dialog"`;
- checkout имеет `aria-modal="true"`;
- checkout имеет понятный `aria-label`;
- закрывается по Escape;
- закрывается кнопкой `×`;
- закрывается overlay;
- кнопка закрытия имеет `aria-label`.

Текущий статус: хорошо.

Ограничение: focus trap пока не реализован. Для pre-MVP допустимо, но перед production лучше добавить focus management.

## 2. Status messages

Проверить:

- notice имеет `role="status"`;
- inline error/status имеет `role="status"`;
- статусы не завязаны только на цвет;
- текст статуса понятен человеку.

Текущий статус: хорошо.

## 3. Buttons

Проверить:

- все интерактивные элементы являются `<button>`, а не `div`;
- у icon-only кнопок есть `aria-label`;
- disabled-состояния реальны через `disabled`;
- focus-visible виден.

Особенно проверить:

- quick actions viewer;
- buttons `+ / −`;
- кнопки выбора секций;
- кнопки сценариев в SectionMap;
- кнопки checkout options.

Текущий статус: средне-хорошо.

## 4. Forms

Проверить:

- у input есть видимый label;
- ошибки полей показываются рядом с полем;
- ошибка не только цветом;
- телефон имеет `inputMode="tel"`;
- обязательные поля понятны по submit error.

Текущий статус: хорошо для pre-MVP.

Что можно добавить позже:

- `aria-invalid` для полей с ошибками;
- `aria-describedby` для связки input и error message.

## 5. Keyboard navigation

Проверить клавиатурой:

1. Tab идёт по верхним кнопкам.
2. Tab идёт по flow steps.
3. Tab идёт по controls левой панели.
4. Tab идёт по quick actions viewer.
5. Tab идёт по карте секций.
6. Tab идёт по правой панели и CTA.
7. В checkout можно добраться до всех полей и кнопок.
8. Escape закрывает checkout.

Текущий статус: нужно проверить вручную.

## 6. Visual hierarchy

Проверить:

- активные состояния видны не только цветом;
- active section имеет outline / border;
- selected material имеет border;
- selected checkout option имеет border/background;
- disabled state заметен.

Текущий статус: хорошо.

## 7. Contrast

Проверить:

- основной текст достаточно контрастный;
- серый secondary text читается;
- зелёные статусы читаются;
- оранжевые warning-блоки читаются;
- белый текст на чёрных кнопках читается.

Текущий статус: визуально хорошо, но не проверено инструментом.

## 8. Reduced motion

Сейчас интерфейс почти без агрессивных анимаций. Для production можно добавить:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

Текущий статус: не критично для pre-MVP.

## 9. Что добавить перед production

1. Focus trap для checkout.
2. `aria-invalid` и `aria-describedby` для input errors.
3. Более строгий keyboard QA.
4. Проверка contrast через Lighthouse или axe.
5. Skip-to-content не нужен для конструктора как standalone page, но можно добавить позже.

## 10. Минимальный pre-MVP критерий

Для текущей стадии достаточно:

- build проходит;
- нет invalid DOM nesting;
- checkout закрывается по Escape;
- кнопки доступны по Tab;
- ошибки форм видны текстом;
- user не теряет проект при обновлении страницы.
