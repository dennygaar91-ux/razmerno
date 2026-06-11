# Stage 23 — Supplier-level hardware catalog foundation

## Цель

Подготовить слой сопоставления production hardware → supplier SKU без изменения live-price, checkout, API и production export.

## Что добавлено

- `src/pricing/hardwareSupplierCatalog.ts` — foundation-каталог фурнитуры.
- `resolveHardwareSupplierSku()` — сопоставление production hardware с SKU по типу, поставщику и алиасам.
- `productionHardwarePricing` теперь показывает supplier SKU coverage и количество позиций, где цена требует подтверждения.
- Debug-card показывает покрытие SKU и количество позиций с неподтверждённой ценой.

## Ограничения

Каталог Stage 23 — foundation, не финальный прайс поставщика:

- `priceSource: foundation-estimate`;
- `status: foundation`;
- `requiresPriceConfirmation: true`;
- live-price не переключается на supplier SKU;
- decision-layer блокирует live integration, пока цены не подтверждены.

## Следующие шаги

1. Загрузить/нормализовать реальный supplier-level прайс Hettich/Firmax/ручек/штанг/крепежа.
2. Добавить точные SKU и цены.
3. Перевести `status` у подтверждённых позиций в `confirmed`.
4. Добавить длины/размеры для направляющих, штанг и профилей.
5. Только после этого повторно рассматривать controlled live integration для hardware pricing.
