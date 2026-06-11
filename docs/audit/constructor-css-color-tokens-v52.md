# Размерно — constructor CSS color tokens v52

## Что сделано

Разобраны `raw color review findings` в `src/styles/constructor.css`.

## Изменённые файлы

- `src/styles/constructor.css`
- `scripts/visual-qa-inventory.mjs`

## Что добавлено

В `constructor.css` добавлены CSS custom properties без изменения визуальных значений:

```css
--rzm-constructor-soft-orange: #FFF0EA;
--rzm-constructor-soft-yellow: #FFF7EA;
--rzm-constructor-help-text: #F15E37;
--rzm-constructor-toggle-thumb: #fff;

--rzm-svg-corpus-default: #F7F7F4;
--rzm-svg-accent: #FF724C;
--rzm-svg-material-lightwood: #E7D2AE;
--rzm-svg-material-oak: #C99A5C;
--rzm-svg-material-sand: #D7BE91;
--rzm-svg-material-graphite: #4B5067;
--rzm-svg-material-black: #202235;
--rzm-svg-material-gray: #B9BFCC;
```

## Что заменено

Повторяющиеся значения заменены на `var(...)`:

- warning/help backgrounds;
- client validation backgrounds;
- production status backgrounds;
- SVG corpus fill;
- SVG rod/accent fill;
- material-specific SVG corpus fills;
- toggle thumb white.

## Что изменено в visual QA script

`visual-qa-inventory.mjs` теперь классифицирует constructor CSS token definitions как:

```text
constructor-token-definition
```

## Новый результат visual QA

```text
Raw color findings: 152
Raw color review findings: 0
```

Категории:

```text
catalog-swatch-data: 16
constructor-token-definition: 25
design-token-definition: 10
gradient-css: 21
material-texture-data: 11
svg-illustration-color: 19
tailwind-arbitrary-runtime-class: 5
three-runtime-visual: 15
token-composed-css: 7
white-text-css: 23
```

## Что не менялось

- визуальные значения цветов;
- CSS-селекторы;
- React visual components;
- backend/API;
- pricing engine;
- order flow;
- production preview adapter;
- Zustand-store implementation.

## QA

Пройдены проверки:

- `npm run report:visual-qa`
- `npm run check:constructor-architecture`
- `npm run check:static-pages-architecture`
- `npm run check:no-static-html-pages`
- `npm run report:react-components`
- `npm run report:css-inventory`
- `npm run test:constructor-flow`
- `npm run test:constructor-pii-order`
- `npm run test:constructor-store`
- `npm run test:constructor-draft`
- `npm run test:constructor-payload`
- `npm run test:production-preview`
- `npm run typecheck`
- `npm run build`
- `npm run check:no-server`
- `npm run check:normal-urls`
- `npm run check:root-docs`
- `npm run check:legacy-runtime-imports`
- `npm run test:pricing-engine`
- `npm run test:delivery`
- `npm run test:pricing-final`

## Следующий этап

Перейти к точечным visual fixes на основе ручной проверки: CTA consistency, spacing, constructor sidebar density, mobile header/bottom area.
