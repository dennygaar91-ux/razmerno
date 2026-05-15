import Icon from '../../icons/Icon'

const dimensionFields = [
  ['height', 'Высота', 'от 200 до 2800 мм', 100, 'мм'],
  ['width', 'Ширина', 'от 400 до 3000 мм', 100, 'мм'],
  ['depth', 'Глубина', 'от 300 до 800 мм', 50, 'мм'],
]

const fillingPresets = [
  ['clothes', 'Гардероб', 'штанга + полка', 'Для одежды на плечиках'],
  ['shelves', 'Полки', '5 полок', 'Для белья, коробок и хранения'],
  ['drawers', 'Ящики', '3 ящика', 'Для мелких вещей и аксессуаров'],
  ['empty', 'Пусто', 'очистить секцию', 'Начать секцию заново'],
]

function CounterField({ label, value, hint, unit = '', min, max, onMinus, onPlus }) {
  const minusDisabled = typeof min === 'number' && value <= min
  const plusDisabled = typeof max === 'number' && value >= max

  return (
    <div className="rp-ref-field rp-ref-field--polished">
      <div>
        <strong>{label}</strong>
        <span>{hint}</span>
      </div>
      <div className="rp-ref-counter-wrap">
        <div className="rp-ref-counter">
          <button type="button" disabled={minusDisabled} onClick={onMinus} aria-label={`Уменьшить ${label}`}>−</button>
          <input value={unit ? `${value}` : value} readOnly inputMode="numeric" />
          <button type="button" disabled={plusDisabled} onClick={onPlus} aria-label={`Увеличить ${label}`}>+</button>
        </div>
        {unit && <small>{unit}</small>}
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

function StepHint({ title, text }) {
  return (
    <div className="rp-ref-step-hint">
      <Icon name="check-circle" size={16} />
      <div>
        <b>{title}</b>
        <span>{text}</span>
      </div>
    </div>
  )
}

function DimensionsStep({ project, warnings, onDimensionChange, onSectionsChange }) {
  const sectionWidth = Math.round(project.dimensions.width / project.sections)

  return (
    <>
      <StepHint title="Начните с габаритов" text="Укажите реальные размеры ниши или места, где будет стоять шкаф. Секции распределятся автоматически." />

      <div className="rp-ref-fields rp-ref-fields--polished">
        {dimensionFields.map(([key, label, hint, step, unit]) => (
          <CounterField
            key={key}
            label={label}
            value={project.dimensions[key]}
            hint={hint}
            unit={unit}
            min={key === 'height' ? 200 : key === 'width' ? 400 : 300}
            max={key === 'height' ? 2800 : key === 'width' ? 3000 : 800}
            onMinus={() => onDimensionChange(key, -step)}
            onPlus={() => onDimensionChange(key, step)}
          />
        ))}
        <CounterField
          label="Секции"
          value={project.sections}
          hint="от 1 до 6 вертикальных зон"
          min={1}
          max={6}
          onMinus={() => onSectionsChange(-1)}
          onPlus={() => onSectionsChange(1)}
        />
      </div>

      <div className="rp-ref-block rp-ref-block--polished">
        <h3>Ширина секции</h3>
        <p>Сейчас каждая секция примерно по {sectionWidth} мм</p>
        <div className="rp-ref-section-widths" style={{ gridTemplateColumns: `repeat(${project.sections}, 1fr)` }}>
          {Array.from({ length: project.sections }, (_, index) => (
            <button type="button" key={index}>
              <span>{index + 1}</span>
              <b>{sectionWidth} мм</b>
            </button>
          ))}
        </div>
      </div>

      <WarningList warnings={warnings} />
    </>
  )
}

function FillingStep({ project, warnings, activeSectionWarnings, onSectionSelect, onSectionPartChange, onRailToggle, onPresetApply }) {
  const activeSection = project.filling[project.activeSection - 1]
  const railDisabled = project.dimensions.depth < 520
  const activePreset = activeSection.rail && activeSection.shelves <= 2 && activeSection.drawers === 0
    ? 'Гардероб'
    : activeSection.shelves >= 4 && !activeSection.drawers && !activeSection.rail
      ? 'Полки'
      : activeSection.drawers >= 2
        ? 'Ящики'
        : !activeSection.shelves && !activeSection.drawers && !activeSection.rail
          ? 'Пусто'
          : 'Смешанная'

  return (
    <>
      <StepHint title="Настройте одну секцию" text="Выберите секцию ниже, затем добавьте полки, ящики или штангу. Изменения сразу видны в центре." />

      <div className="rp-ref-block rp-ref-block--topless rp-ref-block--polished">
        <h3>Секция для редактирования</h3>
        <p>Активная секция подсвечивается в визуализации</p>
        <div className="rp-ref-section-tabs">
          {project.filling.map((section, index) => (
            <button className={project.activeSection === index + 1 ? 'is-active' : ''} type="button" key={index} onClick={() => onSectionSelect(index + 1)}>
              <span>{index + 1}</span>
              <small>{section.shelves}П · {section.drawers}Я · {section.rail ? 'Ш' : '—'}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="rp-ref-active-section rp-ref-active-section--polished">
        <div>
          <span>Секция {project.activeSection}</span>
          <b>{activePreset}</b>
        </div>
        <strong>{activeSection.shelves} полок · {activeSection.drawers} ящиков · {activeSection.rail ? 'штанга' : 'без штанги'}</strong>
      </div>

      <div className="rp-ref-block rp-ref-block--polished">
        <h3>Готовые сценарии</h3>
        <p>Быстро заполните выбранную секцию</p>
        <div className="rp-ref-preset-grid rp-ref-preset-grid--polished">
          {fillingPresets.map(([id, title, text, description]) => (
            <button type="button" key={id} onClick={() => onPresetApply(id)}>
              <span>{title}</span>
              <small>{text}</small>
              <em>{description}</em>
            </button>
          ))}
        </div>
      </div>

      <div className="rp-ref-fields rp-ref-fields--compact rp-ref-fields--polished">
        <CounterField label="Полки" value={activeSection.shelves} hint="минимальный комфортный шаг — 200 мм" min={0} max={8} onMinus={() => onSectionPartChange('shelves', -1)} onPlus={() => onSectionPartChange('shelves', 1)} />
        <CounterField label="Ящики" value={activeSection.drawers} hint="ориентир фасада — от 200 мм" min={0} max={4} onMinus={() => onSectionPartChange('drawers', -1)} onPlus={() => onSectionPartChange('drawers', 1)} />
      </div>

      <div className="rp-ref-block rp-ref-block--polished">
        <h3>Штанга</h3>
        <p>{railDisabled ? 'Недоступна при глубине меньше 520 мм' : 'Подходит для одежды на плечиках'}</p>
        <button className={`rp-ref-toggle-option ${activeSection.rail ? 'is-active' : ''}`} type="button" disabled={railDisabled} onClick={onRailToggle}>
          <span>{activeSection.rail ? 'Штанга включена' : 'Добавить штангу'}</span>
          <b />
        </button>
      </div>

      <WarningList warnings={activeSectionWarnings?.length ? activeSectionWarnings : warnings} />
    </>
  )
}

function getPriceLabel(item) {
  if (item.priceFactor > 1) return `+${Math.round((item.priceFactor - 1) * 100)}%`
  if (item.priceFactor < 1) return `−${Math.round((1 - item.priceFactor) * 100)}%`
  return 'база'
}

function MaterialsStep({ project, materials, handleOptions, onMaterialChange }) {
  const selectedMaterial = materials.find(material => material.id === project.material.materialId) ?? materials[0]
  const selectedHandle = handleOptions.find(option => option.id === project.material.handleId) ?? handleOptions[0]

  return (
    <>
      <StepHint title="Выберите внешний вид" text="Материал влияет на визуал, комплект деталей и предварительную стоимость." />

      <div className="rp-ref-selected-material">
        <i className={`rp-ref-material-swatch rp-ref-material-swatch--${selectedMaterial.tone}`} />
        <div>
          <span>Выбрано сейчас</span>
          <b>{selectedMaterial.fullTitle ?? selectedMaterial.title}</b>
          <small>{selectedMaterial.edge} · {selectedHandle.title}</small>
        </div>
      </div>

      <div className="rp-ref-block rp-ref-block--topless rp-ref-block--polished">
        <h3>Материал корпуса</h3>
        <p>Базовый материал MVP — ЛДСП 16 мм. Кромка подбирается автоматически.</p>
        <div className="rp-ref-material-list rp-ref-material-list--product">
          {materials.map((material) => (
            <button className={project.material.materialId === material.id ? 'is-active' : ''} type="button" key={material.id} onClick={() => onMaterialChange('materialId', material.id)}>
              <i className={`rp-ref-material-swatch rp-ref-material-swatch--${material.tone}`} />
              <span>
                <strong>{material.title}</strong>
                <small>{material.text}</small>
                <em>{material.collection} · {material.thickness}</em>
              </span>
              <b>{material.badge}</b>
              <u>{getPriceLabel(material)}</u>
            </button>
          ))}
        </div>
      </div>

      <div className="rp-ref-block rp-ref-block--polished">
        <h3>Открывание</h3>
        <p>Для MVP безопаснее вариант с ручками, без ручек потребует более точной регулировки.</p>
        <div className="rp-ref-handle-list rp-ref-handle-list--product">
          {handleOptions.map((option) => (
            <button className={project.material.handleId === option.id ? 'is-active' : ''} type="button" key={option.id} onClick={() => onMaterialChange('handleId', option.id)}>
              <span>
                <strong>{option.title}</strong>
                <small>{option.text}</small>
                <em>{option.helper}</em>
              </span>
              <b>{option.priceAdd ? `+${option.priceAdd.toLocaleString('ru-RU')} ₽` : 'включено'}</b>
            </button>
          ))}
        </div>
      </div>

      <div className="rp-ref-block rp-ref-info rp-ref-info--materials">
        <Icon name="check-circle" size={16} />
        <span>{project.material.edge} подобрана автоматически. Фурнитура будет проверена технологом перед оплатой.</span>
      </div>
    </>
  )
}

export default function ConstructorConfig({
  activeStep,
  project,
  warnings,
  activeSectionWarnings,
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
  onPresetApply,
}) {
  const stepContent = {
    dimensions: {
      number: 1,
      eyebrow: 'Шаг 1 из 3',
      title: 'Размеры шкафа',
      text: 'Сначала задаём габариты. Это основа для деталировки, стоимости и ограничений по наполнению.',
      body: <DimensionsStep project={project} warnings={warnings} onDimensionChange={onDimensionChange} onSectionsChange={onSectionsChange} />,
      next: 'Далее: наполнение',
    },
    filling: {
      number: 2,
      eyebrow: 'Шаг 2 из 3',
      title: 'Наполнение секций',
      text: 'Соберите внутреннюю логику шкафа: полки, ящики и штанги в каждой секции.',
      body: <FillingStep project={project} warnings={warnings} activeSectionWarnings={activeSectionWarnings} onSectionSelect={onSectionSelect} onSectionPartChange={onSectionPartChange} onRailToggle={onRailToggle} onPresetApply={onPresetApply} />,
      next: 'Далее: материалы',
    },
    materials: {
      number: 3,
      eyebrow: 'Шаг 3 из 3',
      title: 'Материалы и фурнитура',
      text: 'Выберите декор корпуса и способ открывания. Кромка и базовая фурнитура учтены автоматически.',
      body: <MaterialsStep project={project} materials={materials} handleOptions={handleOptions} onMaterialChange={onMaterialChange} />,
      next: 'В корзину',
    },
  }

  const current = stepContent[activeStep] ?? stepContent.dimensions

  return (
    <aside className="rp-ctor-card rp-ctor-config rp-ref-config rp-ref-config--polished">
      <div className="rp-ref-panel-head rp-ref-panel-head--polished">
        <span>{current.number}</span>
        <div>
          <em>{current.eyebrow}</em>
          <h2>{current.title}</h2>
          <p>{current.text}</p>
        </div>
      </div>

      <div className="rp-ref-step-body">
        {current.body}
      </div>

      <div className="rp-ref-config-nav rp-ref-config-nav--polished">
        <button type="button" disabled={!canGoBack} onClick={onBack}>Назад</button>
        <button className="is-primary" type="button" onClick={onNext}>{canGoNext ? current.next : 'В корзину'}<Icon name="arrow-right" size={15} /></button>
      </div>
    </aside>
  )
}
