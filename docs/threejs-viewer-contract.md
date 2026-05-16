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

Если `renderCanvas` передан, он вызывается так:

```jsx
renderCanvas(sceneProps)
```

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
  },
  three: {
    unit: 'mm',
    coordinateSystem: 'width-x_height-y_depth-z',
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
      thickness: string,
    },
    sections: Array<{
      id: string,
      index: number,
      number: number,
      width: number,
      height: number,
      depth: number,
      active: boolean,
      shelves: number,
      drawers: number,
      rail: boolean,
      label: string,
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

## Материалы

На первом этапе достаточно использовать `material.tone` и `material.title`.

Позже можно расширить контракт:

```js
material: {
  id: string,
  tone: string,
  title: string,
  thickness: string,
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
