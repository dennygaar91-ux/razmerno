# Price import summary

Источник: `Прайс-лист для дилеров до 01.04.26(1).xlsx`

Правило импорта: `retailPrice = sourcePrice × 1.30`.

## Количество импортированных позиций

| Тип | Кол-во |
|---|---:|
| `board` | 1457 |
| `edge` | 43 |
| `service` | 12 |
| `worktop` | 49 |

| **Всего** | **1561** |

## Контрольные примеры

```json
[
  {
    "itemType": "board",
    "producer": "Kronospan",
    "collection": "White Front",
    "article": "101",
    "name": "Kronospan 101 РЕ Белый фасадный 10 мм",
    "decorName": "Белый фасадный",
    "texture": "РЕ",
    "thicknessMm": 10,
    "unit": "кв.м.",
    "sourcePrice": 1984.62,
    "markupMultiplier": 1.3,
    "retailPrice": 2580.01,
    "sourceSheet": "Kronospan",
    "sourceRow": 3
  },
  {
    "itemType": "board",
    "producer": "Kronospan",
    "collection": "White Front",
    "article": "101",
    "name": "Kronospan 101 РЕ Белый фасадный 16 мм",
    "decorName": "Белый фасадный",
    "texture": "РЕ",
    "thicknessMm": 16,
    "unit": "кв.м.",
    "sourcePrice": 1432.83,
    "markupMultiplier": 1.3,
    "retailPrice": 1862.68,
    "sourceSheet": "Kronospan",
    "sourceRow": 3
  },
  {
    "itemType": "board",
    "producer": "Kronospan",
    "collection": "White Front",
    "article": "101",
    "name": "Kronospan 101 РЕ Белый фасадный 25 мм",
    "decorName": "Белый фасадный",
    "texture": "РЕ",
    "thicknessMm": 25,
    "unit": "кв.м.",
    "sourcePrice": 2219.72,
    "markupMultiplier": 1.3,
    "retailPrice": 2885.64,
    "sourceSheet": "Kronospan",
    "sourceRow": 3
  },
  {
    "itemType": "board",
    "producer": "Kronospan",
    "collection": "White Front",
    "article": "101",
    "name": "Kronospan 101 PR Белый фасадный 10 мм",
    "decorName": "Белый фасадный",
    "texture": "PR",
    "thicknessMm": 10,
    "unit": "кв.м.",
    "sourcePrice": 1984.62,
    "markupMultiplier": 1.3,
    "retailPrice": 2580.01,
    "sourceSheet": "Kronospan",
    "sourceRow": 4
  },
  {
    "itemType": "board",
    "producer": "Kronospan",
    "collection": "White Front",
    "article": "101",
    "name": "Kronospan 101 PR Белый фасадный 16 мм",
    "decorName": "Белый фасадный",
    "texture": "PR",
    "thicknessMm": 16,
    "unit": "кв.м.",
    "sourcePrice": 1432.83,
    "markupMultiplier": 1.3,
    "retailPrice": 1862.68,
    "sourceSheet": "Kronospan",
    "sourceRow": 4
  }
]
```

## Примечания

- Пустые цены пропущены.
- Нечисловые цены не попали в seed, чтобы не ломать калькулятор.
- Для Egger/Kronospan каждая толщина стала отдельной строкой.
- Для кромки разобраны левая и правая таблицы листа `Кромка`.
