# Stage R9 — scene price state cleanup

## 1. Контекст этапа

После Stage R8 в активной сцене конструктора была найдена оставшаяся фейковая fallback-цена:

```tsx
formatPrice(quote?.total ?? 42800)
```

Это противоречило уже исправленной логике checkout: если расчёт ещё не готов, нельзя показывать случайное число как настоящую стоимость.

## 2. Что найдено в проекте

Фейковая цена осталась только в:

```txt
src/static-pages/constructor/components/ConstructorScene.tsx
```

В checkout fallback-цены уже были убраны на Stage R7.

## 3. Что можно менять

Безопасно изменены только:

```txt
src/static-pages/constructor/components/ConstructorScene.tsx
src/static-pages/ConstructorPage.tsx
src/static-pages/constructor/components/ConstructorScenePriceState.test.ts
```

## 4. Что нельзя менять

Не трогал:

- checkout submit flow;
- backend/API;
- Supabase;
- админку;
- pricing formulas;
- production export;
- delivery/assembly rules;
- store/rules бизнес-логику;
- CSS/layout.

## 5. План изменений

1. Передать `quoteError` в `ConstructorScene`.
2. Убрать `quote?.total ?? 42800`.
3. Если `quote` есть — показывать реальную цену.
4. Если `quote` ещё нет — показывать `Считаем`.
5. Если есть `quoteError` — показывать `Ошибка расчёта`.
6. Добавить статический тест, который запрещает возвращение fallback-цен.
7. Прогнать проверки.

## 6. Внесённые правки

В `ConstructorScene.tsx` добавлена централизованная логика состояния price chip:

```ts
const priceState = quoteError ? "error" : quote ? (quote.pricingNotice?.level ?? "exact") : "pending";
const priceTitle = quoteError || quote?.pricingNotice?.clientMessage || (quote ? undefined : "Стоимость рассчитывается по текущей конфигурации");
const priceLabel = quoteError ? "Ошибка расчёта" : quote ? formatPrice(quote.total) : "Считаем";
```

Теперь сцена показывает:

- реальную цену — только если `quote` готов;
- `Считаем` — если quote ещё не рассчитан;
- `Ошибка расчёта` — если hook вернул `quoteError`;
- `проверка` — если pricing notice имеет fallback-level.

В `ConstructorPage.tsx` добавлена передача:

```tsx
quoteError={quoteError}
```

Добавлен тест:

```txt
src/static-pages/constructor/components/ConstructorScenePriceState.test.ts
```

Он проверяет, что в активной сцене больше нет hardcoded fallback-цен `42800`, `31600`, `6400`, `4800`, и что есть состояния `Считаем` / `Ошибка расчёта`.

## 7. Ревью: план vs факт

План выполнен полностью.

Главный результат: сцена теперь честно показывает состояние расчёта и больше не выдаёт фейковую стоимость за настоящую.

## 8. Анализ рисков

Риск низкий:

- формула цены не менялась;
- checkout не менялся;
- submit flow не менялся;
- backend/API не трогались;
- изменён только вывод состояния price chip.

## 9. Проверки

Успешно выполнено:

```bash
npm install
npm run typecheck
npm run typecheck:api
npm run build
node --no-warnings --import tsx src/static-pages/constructor/components/ConstructorScenePriceState.test.ts
npm run test:constructor-flow
npm run test:constructor-store
```

## 10. Следующий шаг

Следующий логичный этап: Stage R10 — финальный UX/code audit после R2–R9.

Нужно ещё раз пройти весь сценарий конструктора и проверить, не осталось ли других фейковых значений, технических заглушек или UX-разрывов в основном пользовательском пути.
