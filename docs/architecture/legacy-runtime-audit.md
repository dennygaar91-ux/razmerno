# Legacy runtime audit

## Решение

На этом шаге deprecated-файлы не удалялись физически, потому что аудит показал, что названия `productionModel`, `pricing`, `payload`, `basisAdapter` частично пересекаются с новыми типами, тестами и безопасными serverless-модулями.

## Что сделано безопасно

Добавлена проверка:

```bash
npm run check:legacy-runtime-imports
```

Проверка запрещает runtime-импорты следующих deprecated-модулей:

- `src/constructor/api.ts`
- `src/constructor/legacyGeometry.ts`
- `src/constructor/payload.ts`
- `src/constructor/basisAdapter.ts`
- `src/constructor/pricing.ts`

## Почему не удаляли сразу

Удаление без отдельного dependency cleanup может сломать:

- debug/manual export;
- исторические тесты;
- типы geometry;
- новые проверки, где слова `payload/pricing/productionModel` используются не как импорт legacy-файлов.

## Следующий безопасный шаг

Отдельной задачей:
1. заменить debug/manual export зависимости;
2. удалить deprecated-файлы;
3. снова прогнать `qa:all`.
