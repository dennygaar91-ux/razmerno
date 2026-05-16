# Three.js Viewer Contract

Документ фиксирует контракт между React UI конструктора и будущим Three.js viewer.

## Цель

Заменить текущий CSS-preview шкафа на реальный `<Canvas />` без переписывания UX-слоя:

- `ViewerToolbar` остаётся React UI;
- `ViewerQuickActions` остаётся React UI;
- `SectionMap` остаётся React UI;
- подписи размеров остаются overlay-слоем React;
- Three.js отвечает только за 3D-сцену и события выбора секций.

## Текущий bridge

Сейчас `ViewerScene` рендерит `CanvasSlot`.

```jsx
<CanvasSlot sceneProps={sceneProps} renderCanvas={renderCanvas} />
```

Если `renderCanvas` не передан, используется CSS fallback через `WardrobeMockup`.

Если `renderCanvas` передан, `CanvasSlot` пробует вызвать:

```jsx
renderCanvas(sceneProps)
```

Если будущий Canvas упадёт во время render-функции, `CanvasSlot` безопасно вернётся к CSS fallback. Это не заменяет полноценный React Error Boundary внутри будущего Canvas, но защищает текущий pre-MVP интерфейс от простых ошибок подключения.

## sceneProps

Формируются в `buildViewerSceneProps(project)`.

```js
{
  dimensions: {
    width: number,
    height: number,
    depth: number,
  },
  sections: number,
  sectionWidth: number,
  activeSection: number,
  filling: Array<{
    shelves: number,
    drawers: number,
    rail: boolean,
  }>,
  material: {
    materialId: string,
    body: string,
    manufacturer?: string,
    article?: string,
    tone: string,
    thickness: string,
    edge: string,
    handles: string,
  },
  meta: {
    sectionWidth: number,
    fillingElements: number,
    materialTone: string,
    rendererReady: boolean,
    activeSectionLabel: string,
  },
  three: {
    version: 1,
    unit: 'mm',
    coordinateSystem: 'width-x_height-y_depth-z',
    interaction: {
      selectable: 'section',
      activeSection: number,
      emits: ['section:select'],
    },
    cabinet: {
      width: number,
      height: number,
      depth: number,
      sectionWidth: number,
      sectionCount: number,
    },
    material: {
      id: string,
      tone: string,
      title: string,
      manufacturer?: string,
      article?: string,
      thickness: string,
      edge: string,
    },
    sections: Array<{
      id: string,
      index: number,
      number: number,
      width: number,
      height: number,
      depth: number,
      bounds: {
        xMin: number,
        xMax: number,
        yMin: number,
        yMax: number,
        zMin: number,
        zMax: number,
      },
      active: boolean,
      shelves: number,
      drawers: number,
      rail: boolean,
      label: string,
      shortLabel: string,
      slots: Array<{
        type: 'shelf' | 'drawer' | 'rail',
        index: number,
        label: string,
      }>,
    }>,
  },
}
```

## Будущий компонент

Рекомендуемый интерфейс:

```jsx
function CabinetCanvas3D({ sceneProps, onReady, onError, onSectionClick }) {
  return <Canvas>{/* scene */}</Canvas>
}
```

Подключение:

```jsx
<ConstructorViewer
  project={projectWithPrice}
  renderCanvas={(sceneProps) => (
    <CabinetCanvas3D
      sceneProps={sceneProps}
      onReady={() => {}}
      onError={(message) => console.warn(message)}
      onSectionClick={(sectionNumber) => selectSection(sectionNumber)}
    />
  )}
/>
```

## Координатная система

```txt
width  -> X
height -> Y
depth  -> Z
unit   -> mm
```

`bounds` каждой секции уже рассчитаны в миллиметрах. На стороне Three.js можно масштабировать миллиметры в scene units, например:

```js
const SCENE_SCALE = 0.001
const widthInScene = width * SCENE_SCALE
```

## Подсветка activeSection

В массиве `three.sections` каждая секция содержит:

```js
active: project.activeSection === index + 1
```

Three.js должен подсвечивать активную секцию по этому признаку.

Рекомендация:

- active outline / emissive highlight;
- мягкая прозрачная заливка;
- не менять геометрию секции;
- не перекрывать полки, ящики и штангу.

## Наполнение секций

Для каждой секции есть агрегированные поля:

```js
shelves: number
drawers: number
rail: boolean
```

И детальный список `slots`:

```js
[
  { type: 'shelf', index: 0, label: 'Полка 1' },
  { type: 'drawer', index: 0, label: 'Ящик 1' },
  { type: 'rail', index: 0, label: 'Штанга' },
]
```

На первом этапе Three.js может строить элементы по агрегированным полям. Позже `slots` можно расширить координатами и размерами деталей.

## Материалы

На первом этапе достаточно использовать:

```js
three.material.tone
three.material.title
three.material.edge
```

Позже можно расширить контракт:

```js
material: {
  id: string,
  tone: string,
  title: string,
  thickness: string,
  edge: string,
  textureUrl?: string,
  edgeColor?: string,
}
```

## События

Будущий Canvas должен уметь вернуть выбор секции:

```js
onSectionClick(section.number)
```

Нельзя хранить state активной секции внутри Canvas как источник истины. Источник истины остаётся в `ConstructorPage`.

## Fallback

Если 3D не загрузился:

- вернуть ошибку через `onError(message)`;
- React оставляет CSS fallback;
- пользователь не должен терять возможность редактировать проект.

## Что не должно попадать в Canvas

- управление шагами конструктора;
- форма размеров;
- quick actions;
- карта секций;
- checkout;
- расчёт цены;
- сохранение проекта.

Canvas — только визуализация и клики по секциям.