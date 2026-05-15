import Icon from '../../icons/Icon'

const dimensionFields = [
  ['height', 'Высота, мм', '200–2800', 100],
  ['width', 'Ширина, мм', '400–3000', 100],
  ['depth', 'Глубина, мм', '300–800', 50],
]

const materials = [
  ['ЛДСП Дуб Сонома', 'Тёплый древесный декор'],
  ['ЛДСП Белый матовый', 'Светлый минимализм'],
  ['ЛДСП Серый камень', 'Нейтральный современный тон'],
]

function CounterField({ label, value, hint, onMinus, onPlus }) {
  return (
    <div className="rp-ref-field">
      <div>
        <strong>{label}</strong>
        <span>{hint}</span>
      </div>
      <div className="rp-ref-counter">
        <button type="button" onClick={onMinus}>−</button>
        <input value={value} readOnly inputMode="numeric" />
        <button type="button" onClick={onPlus}>+</button>
      </div>
    </div>
  )
}

function DimensionsStep({ project, onDimensionChange, onSectionsChange }) {
  return (
    <>
      <div className="rp-ref-fields">
        {dimensionFields.map(([key, label, hint, step]) => (
          <CounterField
            key={key}
            label={label}
            value={project.dimensions[key]}
            hint={hint}
            onMinus={() => onDimensionChange(key, -step)}
            onPlus={() => onDimensionChange(key, step)}
          />
        ))}
        <CounterField
          label="Количество секций"
          value={project.sections}
          hint="от 1 до 6"
          onMinus={() => onSectionsChange(-1)}
          onPlus={() => onSectionsChange(1)}
        />
      </div>

      <div className="rp-ref-block">
        <h3>Ширина секции</h3>
        <p>Автоматическое распределение</p>
        <div className="rp-ref-section-widths" style={{ gridTemplateColumns: `repeat(${project.sections}, 1fr)` }}>
          {Array.from({ length: project.sections }, (_, index) => (
            <button type="button" key={index}>{Math.round(project.dimensions.width / project.sections)} мм</button>
          ))}
        </div>
      </div>
    </>
  )
}

function FillingStep({ project, onSectionSelect, onSectionPartChange, onRailToggle }) {
  const activeSection = project.filling[project.activeSection - 1]

  return (
    <>
      <div className="rp-ref-block rp-ref-block--topless">
        <h3>Выберите секцию</h3>
        <p>Активная секция подсвечивается в визуализации</p>
        <div className="rp-ref-section-tabs">
          {project.filling.map((_, index) => (
            <button className={project.activeSection === index + 1 ? 'is-active' : ''} type="button" key={index} onClick={() => onSectionSelect(index + 1)}>
              Секция {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="rp-ref-fields rp-ref-fields--compact">
        <CounterField label="Полки" value={activeSection.shelves} hint="минимальный шаг 200 мм" onMinus={() => onSectionPartChange('shelves', -1)} onPlus={() => onSectionPartChange('shelves', 1)} />
        <CounterField label="Ящики" value={activeSection.drawers} hint="фасад от 200 мм" onMinus={() => onSectionPartChange('drawers', -1)} onPlus={() => onSectionPartChange('drawers', 1)} />
      </div>

      <div className="rp-ref-block">
        <h3>Штанга</h3>
        <p>Рекомендуемая глубина для одежды — от 520 мм</p>
        <button className={`rp-ref-toggle-option ${activeSection.rail ? 'is-active' : ''}`} type="button" onClick={onRailToggle}>
          <span>{activeSection.rail ? 'Штанга включена' : 'Добавить штангу'}</span>
          <b />
        </button>
      </div>
    </>
  )
}

function MaterialsStep({ project, onMaterialChange }) {
  return (
    <>
      <div className="rp-ref-block rp-ref-block--topless">
        <h3>Материал корпуса</h3>
        <p>Выберите декор ЛДСП для корпуса и полок</p>
        <div className="rp-ref-material-list">
          {materials.map(([title, text]) => (
            <button className={project.material.body === title ? 'is-active' : ''} type="button" key={title} onClick={() => onMaterialChange('body', title)}>
              <i />
              <span>{title}<small>{text}</small></span>
            </button>
          ))}
        </div>
      </div>

      <div className="rp-ref-block">
        <h3>Открывание</h3>
        <div className="rp-ref-section-tabs rp-ref-section-tabs--two">
          <button className={project.material.handles === 'С ручками' ? 'is-active' : ''} type="button" onClick={() => onMaterialChange('handles', 'С ручками')}>С ручками</button>
          <button className={project.material.handles === 'Без ручек' ? 'is-active' : ''} type="button" onClick={() => onMaterialChange('handles', 'Без ручек')}>Без ручек</button>
        </div>
      </div>

      <div className="rp-ref-block rp-ref-info">
        <Icon name="check-circle" size={16} />
        <span>Кромка ПВХ 2 мм подобрана автоматически в цвет корпуса</span>
      </div>
    </>
  )
}

export default function ConstructorConfig({
  activeStep,
  project,
  canGoBack,
  canGoNext,
  onBack,
  onNext,
  onDimensionChange,
  onSectionsChange,
  onSectionSelect,
  onSectionPartChange,
  onRailToggle,
  onMaterialChange,
}) {
  const stepContent = {
    dimensions: {
      number: 1,
      title: 'Размеры и секции',
      text: 'Укажите габариты шкафа и количество секций. Конструктор сразу пересчитает проект.',
      body: <DimensionsStep project={project} onDimensionChange={onDimensionChange} onSectionsChange={onSectionsChange} />,
      next: 'Далее: наполнение',
    },
    filling: {
      number: 2,
      title: 'Наполнение',
      text: 'Настройте полки, ящики и штанги внутри выбранной секции.',
      body: <FillingStep project={project} onSectionSelect={onSectionSelect} onSectionPartChange={onSectionPartChange} onRailToggle={onRailToggle} />,
      next: 'Далее: материалы',
    },
    materials: {
      number: 3,
      title: 'Материалы',
      text: 'Подберите декор, кромку и базовую фурнитуру для комплекта.',
      body: <MaterialsStep project={project} onMaterialChange={onMaterialChange} />,
      next: 'В корзину',
    },
  }

  const current = stepContent[activeStep] ?? stepContent.dimensions

  return (
    <aside className="rp-ctor-card rp-ctor-config rp-ref-config">
      <div className="rp-ref-panel-head">
        <span>{current.number}</span>
        <div>
          <h2>{current.title}</h2>
          <p>{current.text}</p>
        </div>
      </div>

      <div className="rp-ref-step-body">
        {current.body}
      </div>

      <div className="rp-ref-config-nav">
        <button type="button" disabled={!canGoBack} onClick={onBack}>Назад</button>
        <button className="is-primary" type="button" onClick={onNext}>{canGoNext ? current.next : 'В корзину'}<Icon name="arrow-right" size={15} /></button>
      </div>
    </aside>
  )
}
