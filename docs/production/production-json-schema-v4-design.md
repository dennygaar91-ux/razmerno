# Production JSON Schema v4 Design Doc — «Размерно»

Статус: проектный документ v1  
Назначение: зафиксировать целевую Basis-oriented production JSON модель для дальнейшей разработки блока моделирования, материалов, фурнитуры, кромки, пазов, присадки и manual Basis JSON.  
Граница: документ описывает целевую архитектуру и правила; он не является runtime-реализацией и не закрывает технологические/SKU-решения.

---

## 1. Executive summary

Текущий production export уже стал значительно сильнее: он умеет формировать production package, хранит панели, кромку, фурнитуру, присадку, Basis manual plan, review/validation и golden snapshots. Но для следующего этапа этого недостаточно: production JSON должен стать не просто списком деталей, а промежуточной объектно-производственной моделью, близкой к логике БАЗИС-Мебельщик.

Целевая модель `razmerno.production.v4` должна описывать изделие как набор производственных объектов:

- панели;
- составные узлы;
- материалы;
- кромку;
- пазы;
- фурнитуру;
- присадку;
- опоры;
- правила сборки;
- план ручной сборки в БАЗИС;
- validation/review слой.

Главная цель v4 — создать понятный Basis-oriented JSON, который технолог сможет использовать для ручной или полуавтоматизированной сборки модели в БАЗИС-Мебельщик. Цель v4 не в генерации `.b3d`, а в формировании корректного промежуточного производственного языка.

---

## 2. Non-goals

В рамках v4 design doc не делаем и не обещаем:

1. Автоматическую генерацию `.b3d`.
2. Автоматическую интеграцию с БАЗИС-Мебельщик.
3. Финальный SKU-каталог.
4. Финальные шаблоны присадки.
5. Финальную panel-local coordinate system для drilling.
6. Изменения pricing logic.
7. Изменения Supabase schema/runtime catalog.
8. Изменения API/order flow.
9. Изменения текущего production runtime export.
10. Изменения UI/constructor state.

MVP boundary остаётся:

```text
Размерно → production JSON / Basis manual plan → технолог вручную собирает модель в БАЗИС → .b3d сохраняется вручную в БАЗИС.
```

---

## 3. Target schema overview

Целевая структура `razmerno.production.v4`:

```json
{
  "schema": "razmerno.production.v4",
  "meta": {},
  "basisCompatibility": {},
  "coordinateSystem": {},
  "product": {},
  "rules": {},
  "materials": [],
  "panels": [],
  "assemblies": [],
  "edgeBanding": [],
  "grooves": [],
  "hardware": [],
  "drilling": [],
  "supports": [],
  "basisManualPlan": [],
  "validation": {},
  "review": {},
  "revisions": []
}
```

### 3.1. Основные секции

| Секция | Назначение |
|---|---|
| `schema` | Версия схемы JSON. |
| `meta` | Версия конфигурации, orderId, timestamps, генератор, source. |
| `basisCompatibility` | Явная граница: manual JSON, no `.b3d`. |
| `coordinateSystem` | Единицы, origin, оси, точность, future panel-local need. |
| `product` | Тип мебели и внешние габариты. |
| `rules` | Зафиксированные производственные правила. |
| `materials` | Нормализованный список материалов. |
| `panels` | Все производимые панели. |
| `assemblies` | Составные узлы: корпус, секция, ящик, фасадный блок. |
| `edgeBanding` | Операции кромления по сторонам панелей. |
| `grooves` | Пазы и будущие операции под ХДФ/дно ящика. |
| `hardware` | Фурнитура как отдельные объекты. |
| `drilling` | Присадка/future-ready drilling operations. |
| `supports` | Опоры/ножки/режим установки на дно. |
| `basisManualPlan` | Пошаговый manual plan для технолога. |
| `validation` | Ошибки, предупреждения, технологические проверки. |
| `review` | Production review metadata, скрытая от клиента. |
| `revisions` | Версии production model. |

---

## 4. Coordinate system

### 4.1. World coordinate system

Базовый world coordinate contract:

```json
{
  "unit": "mm",
  "worldOrigin": "front-bottom-left",
  "axes": {
    "x": "left-to-right",
    "y": "bottom-to-top",
    "z": "front-to-back"
  },
  "precisionMm": 0.1
}
```

Интерпретация:

- `X` — ширина изделия слева направо;
- `Y` — высота снизу вверх;
- `Z` — глубина от фасада к задней стенке;
- origin — передний нижний левый угол изделия.

### 4.2. Panel-local coordinates

Для панелей, пазов и присадки world coordinates недостаточно. Нужно отдельное future decision по panel-local coordinates.

Пока v4 должен предусмотреть поля:

```json
{
  "coordinateSpace": "world | panel-local | both",
  "world": {
    "xMm": 0,
    "yMm": 0,
    "zMm": 0
  },
  "local": {
    "xMm": 0,
    "yMm": 0,
    "zMm": 0
  }
}
```

До отдельного решения по P2-07 все drilling/panel-local операции должны иметь `requiresTechnologistCheck: true`.

---

## 5. Material model

### 5.1. Зафиксированные material rules

1. Корпус — только ЛДСП 16 мм.
2. Фасад ЛДСП — 16 мм.
3. Фасад МДФ — 18 мм.
4. ХДФ — 3 мм.
5. Drawer board — ЛДСП 16 мм, если не принято другое решение.
6. Supabase/runtime catalog позже станет основным источником материала и цены, но этот документ не меняет Supabase.

```json
{
  "rules": {
    "materials": {
      "body": {
        "kind": "ldsp",
        "thicknessMm": 16,
        "locked": true
      },
      "facade": {
        "ldspThicknessMm": 16,
        "mdfThicknessMm": 18
      },
      "hdf": {
        "thicknessMm": 3
      }
    }
  }
}
```

### 5.2. Material fields

Материал в v4 должен быть описан не только названием и ценой, но и производственными параметрами:

```json
{
  "id": "mat-body-white-ldsp-16",
  "kind": "ldsp",
  "producer": "Egger",
  "article": "W960",
  "decorName": "Белый матовый",
  "thicknessMm": 16,
  "sheetWidthMm": 2800,
  "sheetHeightMm": 2070,
  "unit": "m2",
  "textureDirection": "vertical",
  "grainAxis": "y",
  "source": "seed | supabase | manual"
}
```

### 5.3. Texture direction

Для раскроя и корректного производства нужно хранить направление текстуры:

| Роль панели | Default texture direction |
|---|---|
| Боковина | `vertical` |
| Фасад | `vertical` |
| Вертикальная перегородка | `vertical` |
| Полка | `horizontal` / по ширине, требует уточнения |
| Дно/крышка | `horizontal` / по ширине, требует уточнения |
| ХДФ | `none` или `vertical`, зависит от материала |

Поля:

```json
{
  "textureDirection": "vertical | horizontal | none",
  "grainAxis": "x | y | none",
  "grainLocked": true
}
```

---

## 6. Panel model

Panel — основная производимая деталь.

```json
{
  "id": "panel-side-left",
  "objectType": "panel",
  "basisObjectType": "panel",
  "role": "side-left",
  "name": "Боковина левая",
  "article": "BD-SIDE-L",
  "materialRef": "mat-body-white-ldsp-16",
  "materialKind": "ldsp",
  "thicknessMm": 16,
  "dimensions": {
    "widthMm": 600,
    "heightMm": 2384,
    "thicknessMm": 16
  },
  "position": {
    "xMm": 0,
    "yMm": 16,
    "zMm": 0
  },
  "orientation": {
    "basisPanelKind": "vertical",
    "plane": "YZ",
    "normalAxis": "X"
  },
  "faceSide": "inner",
  "textureDirection": "vertical",
  "includeInDocumentation": true,
  "edgeBandingRefs": [],
  "grooveRefs": [],
  "hardwareRefs": [],
  "drillingRefs": [],
  "review": {
    "requiresTechnologistCheck": false,
    "visibleToClient": false
  }
}
```

### 6.1. Required panel roles

Базовые роли:

- `side-left`;
- `side-right`;
- `bottom`;
- `top`;
- `vertical-partition`;
- `shelf`;
- `back-panel`;
- `facade-door`;
- `drawer-front`;
- `drawer-side-left`;
- `drawer-side-right`;
- `drawer-back`;
- `drawer-bottom`;
- `plinth`.

### 6.2. Basis panel kind

| Role | `basisPanelKind` | Plane |
|---|---|---|
| Side | `vertical` | YZ |
| Partition | `vertical` | YZ |
| Bottom/top/shelf | `horizontal` | XZ |
| Back panel | `frontal` | XY |
| Facade | `frontal` | XY |

---

## 7. Assembly model

Assembly — составной объект, объединяющий панели/фурнитуру/операции.

```json
{
  "id": "assembly-body",
  "objectType": "assembly",
  "basisObjectType": "composite-object",
  "role": "body",
  "children": [
    "panel-bottom",
    "panel-side-left",
    "panel-side-right",
    "panel-top"
  ],
  "contacts": []
}
```

### 7.1. Side-panels-on-bottom

Принятое правило:

```text
Боковые стенки строго устанавливаются на дно и крепятся снизу.
```

В JSON это должно быть contact graph:

```json
{
  "contacts": [
    {
      "id": "contact-side-left-bottom",
      "panelId": "panel-side-left",
      "restsOnPanelId": "panel-bottom",
      "contactType": "vertical-panel-on-horizontal-panel",
      "fasteningDirection": "from-bottom",
      "requiresFasteners": true
    }
  ]
}
```

### 7.2. Drawer assembly

Ящик — не filling counter, а assembly:

```json
{
  "id": "assembly-drawer-1",
  "objectType": "assembly",
  "basisObjectType": "composite-object",
  "role": "drawer",
  "children": [
    "panel-drawer-front-1",
    "panel-drawer-side-left-1",
    "panel-drawer-side-right-1",
    "panel-drawer-back-1",
    "panel-drawer-bottom-1",
    "hardware-slide-left-1",
    "hardware-slide-right-1"
  ]
}
```

---

## 8. Edge banding model

### 8.1. Accepted edge rules

1. Корпус/полки/ящики — 1 мм all-around.
2. Фасады и drawer-front — 2 мм all-around.
3. HDF back-panel/drawer-bottom — noEdge.

```json
{
  "rules": {
    "edgeBanding": {
      "bodyThicknessMm": 1,
      "facadeThicknessMm": 2,
      "bodyCoverage": "all-around",
      "facadeCoverage": "all-around",
      "hdfCoverage": "none"
    }
  }
}
```

### 8.2. Edge operation

```json
{
  "id": "edge-shelf-1-front",
  "objectType": "edgeBanding",
  "panelId": "panel-shelf-1",
  "side": "front",
  "materialRef": "edge-white-abs-1mm",
  "thicknessMm": 1,
  "lengthMm": 764,
  "visible": true,
  "trimAllowanceMm": 0,
  "cutAllowanceMm": 0,
  "basisOperation": "apply-edge"
}
```

Future concern: после технологической проверки может потребоваться исключение hidden/groove edges, но пока принятое правило — all-around.

---

## 9. Groove model

Grooves должны быть future-ready, но не финализированы без технолога.

### 9.1. Back panel groove

```json
{
  "id": "groove-back-panel-left-side",
  "objectType": "groove",
  "panelId": "panel-side-left",
  "purpose": "back-panel-insert",
  "side": "back",
  "widthMm": 3.2,
  "depthMm": 6,
  "offsetFromBackMm": 8,
  "startMm": 0,
  "endMm": 2384,
  "requiresTechnologistCheck": true
}
```

### 9.2. Drawer bottom groove

```json
{
  "id": "groove-drawer-bottom-left-side-1",
  "objectType": "groove",
  "panelId": "panel-drawer-side-left-1",
  "purpose": "drawer-bottom-insert",
  "side": "inner-bottom",
  "widthMm": 3.2,
  "depthMm": 5,
  "offsetMm": 10,
  "requiresTechnologistCheck": true
}
```

All groove dimensions are placeholders until технологическое решение.

---

## 10. Hardware model

Hardware — отдельный объектный слой.

### 10.1. Required hardware types

- `hinge`;
- `concealed-slide`;
- `reinforced-shelf-support`;
- `rod-holder`;
- `handle`;
- `push-to-open`;
- `adjustable-leg`;
- `metal-spiked-adjustable-support`;
- `confirmat` / fastening hardware later.

```json
{
  "id": "hardware-slide-left-1",
  "objectType": "hardware",
  "basisObjectType": "furniture-component",
  "type": "concealed-slide",
  "supplier": "Firmax",
  "series": "Soft-Close",
  "model": "FRM0444.S",
  "sku": null,
  "article": null,
  "side": "left",
  "mountingPanelId": "panel-side-left",
  "targetAssemblyId": "assembly-drawer-1",
  "mountingTemplateId": null,
  "drillingRefs": [],
  "requiresTechnologistCheck": true
}
```

SKU remains future work.

---

## 11. Drawer system rules

Стартовая система: Firmax Soft-Close concealed full-extension slides.

Из предоставленной технической документации:

```text
SKW = LW - 42
LT = NL + 5 для стандартного ящика
max board thickness = 16 mm
available NL = 250, 300, 350, 400, 450, 500, 550, 600
```

JSON:

```json
{
  "drawerSystem": {
    "supplier": "Firmax",
    "series": "Soft-Close",
    "mounting": "concealed-full-extension",
    "rules": {
      "drawerWidthFormula": "SKW = LW - 42",
      "standardBoxDepthFormula": "LT = NL + 5",
      "maxBoardThicknessMm": 16,
      "availableLengthsMm": [250, 300, 350, 400, 450, 500, 550, 600]
    }
  }
}
```

Implementation impact:

- drawer assembly must know opening inner width `LW`;
- drawer box width `SKW` derives from `LW - 42`;
- slide length `NL` must be chosen by available depth;
- body material thickness for drawer box must be 16 mm.

---

## 12. Hinge system rules

Стартовая система: Smartline / Firmax.

Из предоставленной документации:

```text
opening angle = 105°
cup diameter = Ø35
min cup depth = 12 mm
facade thickness range = 14–24 mm
door types = overlay / half-overlay / inset
```

JSON:

```json
{
  "hingeSystem": {
    "supplier": "Firmax",
    "series": "Smartline",
    "openingAngleDeg": 105,
    "cupDiameterMm": 35,
    "minCupDepthMm": 12,
    "facadeThicknessRangeMm": {
      "min": 14,
      "max": 24
    },
    "supportedDoorTypes": ["overlay", "half-overlay", "inset"]
  }
}
```

Для hardware:

```json
{
  "id": "hardware-hinge-1",
  "type": "hinge",
  "doorType": "overlay",
  "facadePanelId": "panel-facade-left",
  "mountingPanelId": "panel-side-left",
  "cup": {
    "diameterMm": 35,
    "depthMm": 12
  },
  "openingAngleDeg": 105,
  "requiresTechnologistCheck": true
}
```

Drilling templates for hinges are blocked until coordinate/template decision.

---

## 13. Support system

Supported support modes:

1. `adjustable-leg-60`
2. `adjustable-leg-100`
3. `metal-spiked-adjustable-support`
4. `no-support-on-bottom`

JSON:

```json
{
  "support": {
    "mode": "adjustable-leg-60",
    "heightMm": 60,
    "hardwareRequired": true,
    "affectsBodyGeometry": true,
    "requiresTechnologistCheck": false
  }
}
```

No-support mode:

```json
{
  "support": {
    "mode": "no-support-on-bottom",
    "heightMm": 0,
    "hardwareRequired": false,
    "affectsBodyGeometry": true
  }
}
```

Open decision: exact relationship between support height, plinth/base panel and total product height must be locked before runtime implementation.

---

## 14. Drilling model

Drilling remains future-ready.

Required future fields:

```json
{
  "id": "drill-hinge-cup-1",
  "objectType": "drilling",
  "panelId": "panel-facade-left",
  "purpose": "hinge-cup",
  "side": "inner",
  "coordinateSpace": "panel-local",
  "world": null,
  "local": {
    "xMm": 22,
    "yMm": 100,
    "zMm": 0
  },
  "diameterMm": 35,
  "depthMm": 12,
  "templateRef": null,
  "hardwareRef": "hardware-hinge-1",
  "requiresTechnologistCheck": true
}
```

Blocked decisions:

- panel-local origin;
- local axes per panel orientation;
- world-to-local transform;
- edge-distance rules;
- hole collision validation;
- final mounting templates.

---

## 15. Basis manual plan

Basis compatibility must stay explicit:

```json
{
  "basisCompatibility": {
    "target": "basis-mebelshchik",
    "mode": "manual-json",
    "status": "manual-json-ready",
    "doesNotGenerateB3d": true,
    "requiresTechnologist": true
  }
}
```

Plan steps:

```json
[
  {
    "id": "basis-step-create-panels",
    "type": "create-panels",
    "status": "manual",
    "description": "Создать панели по списку panels"
  },
  {
    "id": "basis-step-apply-materials",
    "type": "apply-materials",
    "status": "manual",
    "description": "Назначить материалы и направление текстуры"
  },
  {
    "id": "basis-step-apply-edge",
    "type": "apply-edge",
    "status": "manual",
    "description": "Нанести кромку по edgeBanding"
  },
  {
    "id": "basis-step-technologist-review",
    "type": "technologist-review",
    "status": "required",
    "description": "Проверить пазы, присадку, фурнитуру и сборку"
  }
]
```

---

## 16. Validation / review model

Validation layers:

1. Client-visible errors — только простые ошибки, влияющие на возможность заявки.
2. Production warnings — скрытые от клиента.
3. Production errors — требуют технолога/админки.
4. Review flags — для ручной проверки.

```json
{
  "validation": {
    "errors": [],
    "warnings": [
      {
        "code": "drilling-template-not-final",
        "severity": "warning",
        "visibleToClient": false,
        "requiresTechnologistCheck": true,
        "message": "Присадка требует проверки технологом"
      }
    ]
  },
  "review": {
    "visibleToClient": false,
    "requiresTechnologistCheck": true,
    "status": "manual-review-required"
  }
}
```

---

## 17. Example JSON

```json
{
  "schema": "razmerno.production.v4",
  "meta": {
    "orderId": "RZM-EXAMPLE-001",
    "generator": "razmerno-production-v4-design",
    "configVersion": "v4-design"
  },
  "basisCompatibility": {
    "target": "basis-mebelshchik",
    "mode": "manual-json",
    "status": "manual-json-ready",
    "doesNotGenerateB3d": true,
    "requiresTechnologist": true
  },
  "coordinateSystem": {
    "unit": "mm",
    "worldOrigin": "front-bottom-left",
    "axes": {
      "x": "left-to-right",
      "y": "bottom-to-top",
      "z": "front-to-back"
    },
    "precisionMm": 0.1
  },
  "product": {
    "type": "wardrobe",
    "widthMm": 1800,
    "heightMm": 2400,
    "depthMm": 600
  },
  "rules": {
    "materials": {
      "body": { "kind": "ldsp", "thicknessMm": 16 },
      "facade": { "ldspThicknessMm": 16, "mdfThicknessMm": 18 },
      "hdf": { "thicknessMm": 3 }
    },
    "edgeBanding": {
      "bodyThicknessMm": 1,
      "facadeThicknessMm": 2,
      "bodyCoverage": "all-around",
      "facadeCoverage": "all-around",
      "hdfCoverage": "none"
    },
    "facadeGapMm": 1.5,
    "shelfFrontInsetMm": 30,
    "bodyConstruction": "side-panels-on-bottom"
  },
  "materials": [
    {
      "id": "mat-body-white-ldsp-16",
      "kind": "ldsp",
      "decorName": "Белый матовый",
      "thicknessMm": 16,
      "textureDirection": "vertical"
    },
    {
      "id": "mat-facade-mdf-18",
      "kind": "mdf",
      "decorName": "МДФ фасад",
      "thicknessMm": 18,
      "textureDirection": "vertical"
    },
    {
      "id": "mat-hdf-white-3",
      "kind": "hdf",
      "decorName": "ХДФ белый",
      "thicknessMm": 3,
      "textureDirection": "none"
    }
  ],
  "panels": [
    {
      "id": "panel-bottom",
      "objectType": "panel",
      "basisObjectType": "panel",
      "role": "bottom",
      "name": "Дно",
      "materialRef": "mat-body-white-ldsp-16",
      "dimensions": { "widthMm": 1800, "heightMm": 600, "thicknessMm": 16 },
      "position": { "xMm": 0, "yMm": 0, "zMm": 0 },
      "orientation": { "basisPanelKind": "horizontal", "plane": "XZ" },
      "faceSide": "top",
      "includeInDocumentation": true
    },
    {
      "id": "panel-side-left",
      "objectType": "panel",
      "basisObjectType": "panel",
      "role": "side-left",
      "name": "Боковина левая",
      "materialRef": "mat-body-white-ldsp-16",
      "dimensions": { "widthMm": 600, "heightMm": 2384, "thicknessMm": 16 },
      "position": { "xMm": 0, "yMm": 16, "zMm": 0 },
      "orientation": { "basisPanelKind": "vertical", "plane": "YZ" },
      "faceSide": "inner",
      "includeInDocumentation": true
    },
    {
      "id": "panel-shelf-1",
      "objectType": "panel",
      "basisObjectType": "panel",
      "role": "shelf",
      "name": "Полка 1",
      "materialRef": "mat-body-white-ldsp-16",
      "dimensions": { "widthMm": 860, "heightMm": 554, "thicknessMm": 16 },
      "frontInsetMm": 30,
      "orientation": { "basisPanelKind": "horizontal", "plane": "XZ" },
      "includeInDocumentation": true
    },
    {
      "id": "panel-facade-left",
      "objectType": "panel",
      "basisObjectType": "panel",
      "role": "facade-door",
      "name": "Фасад левый",
      "materialRef": "mat-facade-mdf-18",
      "dimensions": { "widthMm": 897, "heightMm": 2397, "thicknessMm": 18 },
      "facadeGaps": { "topMm": 1.5, "rightMm": 1.5, "bottomMm": 1.5, "leftMm": 1.5 },
      "orientation": { "basisPanelKind": "frontal", "plane": "XY" },
      "faceSide": "outer",
      "includeInDocumentation": true
    }
  ],
  "assemblies": [
    {
      "id": "assembly-body",
      "objectType": "assembly",
      "basisObjectType": "composite-object",
      "role": "body",
      "children": ["panel-bottom", "panel-side-left"],
      "contacts": [
        {
          "panelId": "panel-side-left",
          "restsOnPanelId": "panel-bottom",
          "contactType": "vertical-panel-on-horizontal-panel",
          "fasteningDirection": "from-bottom"
        }
      ]
    }
  ],
  "edgeBanding": [
    {
      "id": "edge-shelf-1-front",
      "panelId": "panel-shelf-1",
      "side": "front",
      "thicknessMm": 1,
      "lengthMm": 860,
      "visible": true
    },
    {
      "id": "edge-facade-left-left",
      "panelId": "panel-facade-left",
      "side": "left",
      "thicknessMm": 2,
      "lengthMm": 2397,
      "visible": true
    }
  ],
  "grooves": [],
  "hardware": [
    {
      "id": "hardware-hinge-1",
      "objectType": "hardware",
      "basisObjectType": "furniture-component",
      "type": "hinge",
      "supplier": "Firmax",
      "series": "Smartline",
      "openingAngleDeg": 105,
      "cupDiameterMm": 35,
      "minCupDepthMm": 12,
      "requiresTechnologistCheck": true
    }
  ],
  "drilling": [],
  "basisManualPlan": [
    {
      "id": "basis-step-create-panels",
      "type": "create-panels",
      "status": "manual"
    },
    {
      "id": "basis-step-technologist-review",
      "type": "technologist-review",
      "status": "required"
    }
  ],
  "validation": {
    "errors": [],
    "warnings": []
  },
  "review": {
    "visibleToClient": false,
    "requiresTechnologistCheck": true,
    "status": "manual-review-required"
  },
  "revisions": []
}
```

---

## 18. Migration plan from v3 to v4

### Phase 1 — docs/types only

- Add this design doc.
- Add v4 TypeScript types.
- Add static example JSON.
- Add schema guard tests.
- No runtime export changes.

### Phase 2 — adapter layer

- Add v3 → v4 adapter.
- Keep v3 export stable.
- Add golden tests comparing v3 package and v4 semantic projection.

### Phase 3 — material policy engine

- Lock LDSP 16 / MDF 18 / HDF 3.
- Add textureDirection.
- Add material validation.

### Phase 4 — body/facade/shelf geometry rules

- side-panels-on-bottom;
- shelf inset 30;
- facade gaps 1.5;
- support modes.

### Phase 5 — hardware semantic layer

- drawers as assemblies;
- hinges/slides/shelf supports as hardware objects;
- no final SKU yet.

### Phase 6 — drilling/grooves after decisions

- panel-local coordinate standard;
- groove dimensions;
- drilling templates;
- SKU mapping.

---

## 19. Backlog impact

Future epics:

1. A — Production JSON Schema v4.
2. B — Material Policy Engine.
3. C — Body Assembly Geometry.
4. D — Shelf Rules.
5. E — Facade Rules.
6. F — Drawer System / Firmax.
7. G — Hinge System.
8. H — Support System.
9. I — Grooves.
10. J — Drilling Coordinate Standard.

This document does not edit `docs/planning/current-backlog.md`. Backlog update should be a separate planning task after review.

---

## 20. Open decisions

1. Panel-local coordinate system for drilling.
2. Exact groove dimensions for back panel.
3. Exact groove dimensions for drawer bottom.
4. Final SKU catalog.
5. Exact hinge SKU.
6. Exact slide SKU.
7. Exact support SKU.
8. Whether shelf all-around edge remains after technologist review.
9. Whether hidden/groove edges require exceptions later.
10. How support height affects customer-visible height vs body panel height.
11. Whether top panel is between sides or overlays sides in final construction.
12. Whether drawer bottom is HDF or LDSP in all scenarios.
13. Whether facade inset/overlay rules differ by product type.

---

## 21. Summary

`razmerno.production.v4` should become a Basis-oriented object model. It should not be treated as a simple export dump or as automatic `.b3d` generation.

The correct direction:

```text
Constructor state
→ normalized furniture project
→ production object model
→ Basis-oriented manual JSON
→ technologist review
→ manual Basis assembly
```

The most important change is conceptual: every production entity must become explicit — panel, assembly, edge, groove, hardware, drilling, support and review. This will make future SKU mapping, drilling templates, Basis automation and factory handoff possible without breaking current MVP boundaries.
