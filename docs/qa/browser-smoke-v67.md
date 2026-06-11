# Browser smoke v67

## Назначение

Этот этап добавляет инфраструктуру браузерной проверки без pixel-perfect assertions.

Проверки нужны не для оценки дизайна, а для ответа на вопросы:

- открываются ли ключевые страницы;
- работает ли нормальная маршрутизация;
- открывается ли конструктор;
- переключается ли 3D/2D;
- переключаются ли виды модели;
- доходит ли wizard до заявки;
- срабатывает ли базовая валидация заявки;
- не падает ли mobile viewport 390px.

## Команды

### Static smoke, можно запускать всегда

```bash
npm run test:browser-smoke-static
```

Эта команда не открывает браузер. Она проверяет, что Playwright spec и исходные компоненты содержат актуальные smoke-проверки и ключевые переключатели.

### Desktop browser smoke

```bash
npm run test:browser-smoke
```

Требует установленный Playwright browser.

### Mobile browser smoke

```bash
npm run test:browser-smoke:mobile
```

Требует установленный Playwright browser.

### Полный browser pack

```bash
npm run test:browser
```

Использует `playwright.config.ts`.

## Что покрывает `tests/browser/configurator.spec.ts`

1. `/` открывается и ведёт к `/configurator`.
2. `/measurements`, `/materials`, `/assembly` открываются через normal URLs.
3. `/configurator` показывает `3D / 2D`.
4. Виды `Свободно / Спереди / Сбоку / Сверху` доступны.
5. При клике `2D` появляется `.rzm-constructor-canvas--svg-fallback`.
6. При клике видов появляются классы:
   - `.rzm-constructor-canvas--front`
   - `.rzm-constructor-canvas--side`
   - `.rzm-constructor-canvas--top`
7. Wizard проходит до `Заявка`.
8. Пустая отправка заявки показывает обязательные поля/согласие.
9. Mobile viewport 390×844 открывает конструктор без runtime-smoke падения.

## Важно

Эти тесты не заменяют визуальную проверку. Они не проверяют:

- красоту сцены;
- точность camera angle;
- pixel-perfect spacing;
- качество 3D света;
- читаемость картинок;
- реальные browser screenshots.

## Следующий этап

Когда будет возможность проверить визуально, нужно:

1. запустить `npm run test:browser-smoke`;
2. запустить `npm run test:browser-smoke:mobile`;
3. открыть Playwright report;
4. прислать скриншоты `/configurator` desktop/mobile и 3D/2D states.
