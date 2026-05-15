import Icon from '../../icons/Icon'

const dimensionFields = [
  ['height', 'Высота, мм', '200–2800', 100],
  ['width', 'Ширина, мм', '400–3000', 100],
  ['depth', 'Глубина, мм', '300–800', 50],
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

function WarningList({ warnings }) {
  if (!warnings?.length) return null

  return (
    <div className="rp-ref-warnings">
      {warnings.map((warning) => (
        <p key={warning}><Icon name="clock" size={14} />{warning}</p>
      ))}
    </div>
  )
}

function DimensionsStep({ project, warnings, onDimensionChange, onSectionsChange }) {
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

      <WarningList warnings={warnings} />
    </>
  )
}

function FillingStep({ project, warnings, onSectionSelect, onSectionPartChange, onRailToggle }) {
  const activeSection = project.filling[project.activeSection - 1]
  const railDisabled = project.dimensions.depth < 520

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
        <p>{railDisabled ? 'Недоступна: нужна глубина от 520 мм' : 'Рекомендуемая глубина для одежды — от 520 мм'}</p>
        <button className={`rp-ref-toggle-option ${activeSection.rail ? 'is-active' : ''}`} type="button" disabled={railDisabled} onClick={onRailToggle}>
          <span>{activeSection.rail ? 'Штанга включена' : 'Добавить штангу'}</span>
          <b />
        </button>
      </div>

      <WarningList warnings={warnings} />
    </>
  )
}

function MaterialsStep({ project, materials, handleOptions, onMaterialChange }) {
  return (
    <>
      <div className="rp-ref-block rp-ref-block--topless">
        <h3>Материал корпуса</h3>
        <p>Выберите декор ЛДСП для корпуса и полок</p>
        <div className="rp-ref-material-list">
          {materials.map((material) => (
            <button className={project.material.materialId === material.id ? 'is-active' : ''} type="button" key={material.id} onClick={() => onMaterialChange('materialId', material.id)}>
              <i className={`rp-ref-material-swatch rp-ref-material-swatch--${material.tone}`} />
              <span>{material.title}<small>{material.text} · {material.thickness}</small></span>
              <b>{material.priceFactor > 1 ? `+${Math.round((material.priceFactor - 1) * 100)}%` : material.priceFactor < 1 ? `−${Math.round((1 - material.priceFactor) * 100)}%` : 'база'}</b>
            </button>
          ))}
        </div>
      </div>

      <div className="rp-ref-block">
        <h3>Открывание</h3>
        <div className="rp-ref-handle-list">
          {handleOptions.map((option) => (
            <button className={project.material.handleId === option.id ? 'is-active' : ''} type="button" key={option.id} onClick={() => onMaterialChange('handleId', option.id)}>
              <span>{option.title}<small>{option.text}</small></span>
              <b>{option.priceAdd ? `+${option.priceAdd.toLocaleString('ru-RU')} ₽` : 'включено'}</b>
            </button>
          ))}
        </div>
      </div>

      <div className="rp-ref-block rp-ref-info">
        <Icon name="check-circle" size={16} />
        <span>{project.material.edge} подобрана автоматически</span>
      </div>
    </>
  )
}

export default function ConstructorConfig({
  activeStep,
  project,
  warnings,
  materials,
  handleOptions,
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
      body: <DimensionsStep project={project} warnings={warnings} onDimensionChange={onDimensionChange} onSectionsChange={onSectionsChange} />,
      next: 'Далее: наполнение',
    },
    filling: {
      number: 2,
      title: 'Наполнение',
      text: 'Настройте полки, ящики и штанги внутри выбранной секции.',
      body: <FillingStep project={project} warnings={warnings} onSectionSelect={onSectionSelect} onSectionPartChange={onSectionPartChange} onRailToggle={onRailToggle} />,
      next: 'Далее: материалы',
    },
    materials: {
      number: 3,
      title: 'Материалы',
      text: 'Подберите декор, кромку и базовую фурнитуру для комплекта.',
      body: <MaterialsStep project={project} materials={materials} handleOptions={handleOptions} onMaterialChange={onMaterialChange} />,
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
