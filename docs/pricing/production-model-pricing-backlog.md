# Production-model pricing backlog

Статус: подготовлено после Stage Constructor 18. Это не реализованные коммерческие правила, а безопасный backlog для следующих этапов.

## Что уже является source of truth

- Материалы и кромка live-price считаются через фактические `productionModel.panels` и `productionModel.edgeBanding`.
- Production preview для quote и debug-card берётся из одного источника: `quote.productionPreview`.
- Store хранит только лёгкий `productionSnapshot` без PII.

## Что пока не является source of truth

1. Hardware pricing.
   - Петли, направляющие, ручки, штанги и крепёж пока не считаются по фактическому production hardware list.
   - Текущая стоимость hardware остаётся из существующей catalog formula.

2. Services pricing.
   - Распил, присадка, упаковка и производственный буфер пока не полностью считаются по операциям production model.
   - Кромка уже выделена panel-based, но остальные услуги остаются в текущей формуле.

3. Drilling pricing.
   - Присадка пока не имеет production-grade ценовой матрицы по операциям.
   - Нужны правила: цена за отверстие, тип операции, диаметр, глубина, группа фурнитуры.

4. Manufacturing validation.
   - Warning/error уже есть на уровне UI/project rules, но production-specific auto reject/auto repair ещё не финализированы.

## Следующие безопасные этапы

### Stage 19 — hardware pricing audit

- Сравнить `productionModel.hardware` с текущей hardware formula.
- Разделить hardware buckets: hinges, drawer slides, handles, rods, fasteners, legs.
- Посчитать debug-only estimate без изменения live-price.
- Добавить delta к текущей hardware price.

### Stage 20 — controlled hardware pricing integration

- После проверки Stage 19 перевести hardware live-price на production hardware list.
- Оставить fallback на catalog formula, если hardware list неполный.
- Не менять checkout/backend submit flow.

### Stage 21 — services and drilling pricing audit

- Сгруппировать production operations: cutting, edging, drilling, packaging.
- Кромка уже считается отдельно; проверить, нет ли двойного учёта.
- Добавить debug-only estimate для присадки и упаковки.

### Stage 22 — controlled services pricing integration

- Перевести services live-price на production operation buckets.
- Оставить производственный буфер отдельной строкой.
- Сохранить прозрачность для manager/debug layer.

## Стоп-условия

Перед интеграцией hardware/services в live-price нужно остановиться и уточнить правила, если не определены:

- конкретные артикулы Hettich/Firmax;
- цена петель/направляющих/ручек/штанг;
- цена крепежа;
- цена присадки за операцию;
- цена упаковки;
- правила auto repair для технологических конфликтов.
