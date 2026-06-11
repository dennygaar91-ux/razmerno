# Stage 24 — confirmed supplier price import foundation

## Цель

Подготовить безопасный слой для загрузки подтверждённых цен фурнитуры от поставщиков без изменения live-price, checkout, API и production export.

## Что добавлено

- `src/pricing/hardwareSupplierPriceImport.ts` — helper для применения строк прайса к foundation-каталогу SKU.
- `HardwareSupplierPriceImportRow` — минимальная строка импорта: `sku`, `unitPrice`, `currency`, `supplierName`, `effectiveFrom`, `sourceDocument`, `note`.
- `applyHardwareSupplierPriceImport()` — возвращает новый каталог и отчёт импорта.
- `buildHardwareSupplierPriceImportTemplate()` — формирует шаблон строк для заполнения реальными ценами.

## Правила безопасности

- Импорт подтверждает только существующие SKU из foundation-каталога.
- Неизвестные SKU не создаются автоматически.
- Цена должна быть больше 0.
- Поддерживается только RUB.
- Подтверждённый SKU получает:
  - `status: confirmed`;
  - `priceSource: supplier-price-list`;
  - `requiresPriceConfirmation: false`.

## Что не менялось

- Live-price заявки не изменён.
- Checkout не изменён.
- Submit flow не изменён.
- Backend/API не изменены.
- Production export не изменён.

## Как это использовать позже

1. Сформировать шаблон через `buildHardwareSupplierPriceImportTemplate()`.
2. Заполнить реальные цены из прайса Hettich/Firmax/ручек/штанг/крепежа.
3. Применить через `applyHardwareSupplierPriceImport()`.
4. Передать подтверждённый каталог в `summarizeProductionHardwarePricing({ supplierCatalog })`.
5. Проверить `buildProductionHardwarePricingDecision()`.
6. Только после полного покрытия SKU и стабильной дельты готовить controlled live integration.

## Текущий статус

Foundation готов. Реальных прайсов поставщиков пока нет, поэтому в runtime используется прежний foundation-каталог. Новый слой покрыт тестом и не влияет на клиентскую цену.
