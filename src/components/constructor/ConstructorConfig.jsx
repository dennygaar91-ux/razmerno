import Icon from '../../icons/Icon'

const dimensionFields = [
  ['height', 'Высота', 'от 200 до 2800 мм', 100, 'мм'],
  ['width', 'Ширина', 'от 400 до 3000 мм', 100, 'мм'],
  ['depth', 'Глубина', 'от 300 до 800 мм', 50, 'мм'],
]

const fillingPresets = [
  ['clothes', 'Гардероб', 'штанга + полка', 'Для одежды на плечиках'],
  ['shelves', 'Полки', '5 полок', 'Для белья, коробок и хранения'],
  ['drawers', 'Ящики снизу', '3 ящика', 'Система сама добавит верхнюю полку'],
  ['empty', 'Пусто', 'очистить зону', 'Начать выбранную зону заново'],
]

const additionalReliabilityRows = [
  ['Задняя стенка', 'Рекомендуем'],
  ['ПВХ 2 мм на видимых торцах', 'Включена'],
  ['Крепление к стене', 'Рекомендуем'],
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

function OptionList({ items = [], activeId, field, onChange, compact = false }) {
  if (!items.length) {
    return <div className="rp-ref-empty-option">Варианты пока не добавлены</div>
  }

  return (
    <div className={`rp-ref-option-list ${compact ? 'rp-ref-option-list--compact' : ''}`}>
      {items.map((item) => (
        <button className={activeId === item.id ? 'is-active' : ''} type="button" key={item.id} onClick={() => onChange(field, item.id)}>
          <span>
            <strong>{item.title}</strong>
            <small>{item.text}</small>
            <em>{item.helper}</em>
          </span>
          <b>{item.priceAdd ? `+${item.priceAdd.toLocaleString('ru-RU')} ₽` : item.badge}</b>
        </button>
      ))}
    </div>
  )
}

function getZoneContentLabel(zone) {
  const content = zone?.content ?? {}

  if (content.type === 'drawers' || content.drawers > 0) return `${content.drawers || 0} ящ.`
  if (content.type === 'rail' || content.rail) return 'штанга'
  if (content.type === 'shelves' || content.shelves > 0) return `${content.shelves || 0} пол.`
  return 'пусто'
}

function ZonePicker({ project, activeZone, onZoneSelect, onZoneSplit }) {
  const activeSection = project.zoneLayout?.sections?.[project.activeSection - 1]
  const zones = activeSection?.zones ?? []
  const selectedZoneId = activeZone?.zone?.id ?? activeSection?.activeZoneId
  const selectedZone = zones.find(zone => zone.id === selectedZoneId) ?? zones[0]
  const canSplit = Boolean(selectedZone && selectedZone.height >= 420)

  if (!activeSection || !zones.length) return null

  return (
    <div className="rp-ref-zone-card rp-ref-zone-card--polished">
      <div className="rp-ref-zone-card__head">
        <div>
          <h3>Зоны секции</h3>
          <p>Полка делит секцию на отдельные области. Выберите область и настройте её наполнение.</p>
        </div>
        <span>{zones.length}</span>
      </div>

      <div className="rp-ref-zone-list" role="list">
        {zones.slice().reverse().map((zone) => (
          <button
            type="button"
            role="listitem"
            className={zone.id === selectedZoneId ? 'is-active' : ''}
            key={zone.id}
            onClick={() => onZoneSelect(activeSection.id, zone.id)}
          >
            <span>{zone.label}</span>
            <small>{zone.height} мм · {getZoneContentLabel(zone)}</small>
          </button>
        ))}
      </div>

      <div className="rp-ref-zone-selected">
        <span>Выбрана зона</span>
        <b>{selectedZone?.label ?? 'Зона'}</b>
        <small>{selectedZone?.height ?? 0} мм по высоте</small>
      </div>

      <div className="rp-ref-zone-actions">
        <button type="button" disabled={!canSplit} onClick={() => onZoneSplit('middle')}>Разделить полкой</button>
        <button type="button" disabled={!canSplit} onClick={() => onZoneSplit('lower-third')}>Полка ниже</button>
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

function FillingStep({ project, warnings, activeSectionWarnings, activeZone, onSectionSelect, onZoneSelect, onZoneSplit, onSectionPartChange, onRailToggle, onPresetApply, onCopySection, onApplySectionToAll }) {
  const activeSection = project.filling[project.activeSection - 1] ?? { shelves: 0, drawers: 0, rail: false }
  const selectedZone = activeZone?.zone
  const selectedContent = selectedZone?.content ?? activeSection
  const railDisabled = project.dimensions.depth < 520
  const activePreset = selectedContent.rail && selectedContent.shelves <= 2 && selectedContent.drawers === 0
    ? 'Гардероб'
    : selectedContent.shelves >= 4 && !selectedContent.drawers && !selectedContent.rail
      ? 'Полки'
      : selectedContent.drawers >= 2
        ? 'Ящики'
        : !selectedContent.shelves && !selectedContent.drawers && !selectedContent.rail
          ? 'Пусто'
          : 'Смешанная'

  return (
    <>
      <StepHint title="Настройте секцию или зону" text="Сначала выберите секцию, затем область внутри неё. Полка делит секцию на верхнюю и нижнюю зоны." />

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

      <ZonePicker project={project} activeZone={activeZone} onZoneSelect={onZoneSelect} onZoneSplit={onZoneSplit} />

      <div className="rp-ref-active-section rp-ref-active-section--polished">
        <div>
          <span>Секция {project.activeSection}</span>
          <b>{activePreset}</b>
        </div>
        <strong>{selectedContent.shelves || 0} полок · {selectedContent.drawers || 0} ящиков · {selectedContent.rail ? 'штанга' : 'без штанги'}</strong>
      </div>

      <div className="rp-ref-section-tools">
        <button type="button" disabled={project.sections < 2} onClick={onCopySection}>Копировать в соседнюю</button>
        <button type="button" disabled={project.sections < 2} onClick={onApplySectionToAll}>Применить ко всем</button>
      </div>

      <div className="rp-ref-block rp-ref-block--polished">
        <h3>Готовые сценарии</h3>
        <p>Быстро заполните выбранную зону. Ящики снизу автоматически создают верхнюю полку.</p>
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
        <CounterField label="Полки" value={selectedContent.shelves || 0} hint="новая полка делит выбранную зону" min={0} max={8} onMinus={() => onSectionPartChange('shelves', -1)} onPlus={() => onSectionPartChange('shelves', 1)} />
        <CounterField label="Ящики" value={selectedContent.drawers || 0} hint="для ящиков нужна зона с верхней и нижней границей" min={0} max={4} onMinus={() => onSectionPartChange('drawers', -1)} onPlus={() => onSectionPartChange('drawers', 1)} />
      </div>

      <div className="rp-ref-block rp-ref-block--polished">
        <h3>Штанга</h3>
        <p>{railDisabled ? 'Недоступна при глубине меньше 520 мм' : 'Подходит для одежды на плечиках в выбранной зоне'}</p>
        <button className={`rp-ref-toggle-option ${selectedContent.rail ? 'is-active' : ''}`} type="button" disabled={railDisabled} onClick={onRailToggle}>
          <span>{selectedContent.rail ? 'Штанга включена' : 'Добавить штангу'}</span>
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

function MaterialsStep({ project, materials = [], edgeOptions = [], handleOptions = [], hardwareOptions = [], onMaterialChange }) {
  const selectedMaterial = materials.find(material => material.id === project.material.materialId) ?? materials[0]
  const selectedEdge = edgeOptions.find(option => option.id === project.material.edgeId) ?? edgeOptions[0]
  const selectedHandle = handleOptions.find(option => option.id === project.material.handleId) ?? handleOptions[0]
  const selectedHardware = hardwareOptions.find(option => option.id === project.material.hardwareId) ?? hardwareOptions[0]

  if (!selectedMaterial || !selectedEdge || !selectedHandle || !selectedHardware) {
    return (
      <>
        <StepHint title="Материалы пока недоступны" text="Каталог материалов не загрузился. Проверьте constructorCatalog.js." />
        <div className="rp-ref-block rp-ref-info rp-ref-info--materials">
          <Icon name="clock" size={16} />
          <span>Конструктор продолжит работать с текущими размерами и наполнением, но выбор спецификации временно недоступен.</span>
        </div>
      </>
    )
  }

  return (
    <>
      <StepHint title="Соберите спецификацию" text="Корпус, кромка, открывание и фурнитура уже разнесены так, чтобы позже подключить каталог и админку." />

      <div className="rp-ref-selected-material rp-ref-selected-material--spec">
        <i className={`rp-ref-material-swatch rp-ref-material-swatch--${selectedMaterial.tone}`} />
        <div>
          <span>Текущая спецификация</span>
          <b>{selectedMaterial.fullTitle ?? selectedMaterial.title}</b>
          <small>{selectedEdge.title} · {selectedHandle.title} · {selectedHardware.title}</small>
        </div>
      </div>

      <div className="rp-ref-material-spec-grid">
        <div><span>Производитель</span><b>{selectedMaterial.manufacturer}</b></div>
        <div><span>Артикул MVP</span><b>{selectedMaterial.article}</b></div>
        <div><span>Толщина</span><b>{selectedMaterial.thickness}</b></div>
      </div>

      <div className="rp-ref-block rp-ref-block--topless rp-ref-block--polished">
        <h3>1. Корпус</h3>
        <p>Базовый материал MVP — ЛДСП 16 мм. Позже эти карточки будут приходить из админки материалов.</p>
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
        <h3>2. Кромка</h3>
        <p>В MVP кромка подобрана автоматически, но её можно переопределить для теста спецификации.</p>
        <OptionList items={edgeOptions} activeId={project.material.edgeId} field="edgeId" onChange={onMaterialChange} compact />
      </div>

      <div className="rp-ref-block rp-ref-block--polished">
        <h3>3. Открывание</h3>
        <p>Для MVP безопаснее вариант с ручками, без ручек потребует более точной регулировки.</p>
        <OptionList items={handleOptions} activeId={project.material.handleId} field="handleId" onChange={onMaterialChange} compact />
      </div>

      <div className="rp-ref-block rp-ref-block--polished">
        <h3>4. Фурнитура</h3>
        <p>Сейчас это UX-заготовка. Реальные бренды и правила подбора подключим через backend.</p>
        <OptionList items={hardwareOptions} activeId={project.material.hardwareId} field="hardwareId" onChange={onMaterialChange} compact />
      </div>

      <div className="rp-ref-block rp-ref-block--polished rp-ref-additional-materials">
        <h3>5. Дополнительно <span>/ Надёжность и сборка</span></h3>
        <div className="rp-ref-additional-materials__rows">
          {additionalReliabilityRows.map(([title, badge]) => (
            <div key={title}>
              <span>{title}</span>
              <em>{badge}</em>
              <b aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

      <div className="rp-ref-block rp-ref-info rp-ref-info--materials">
        <Icon name="check-circle" size={16} />
        <span>Спецификация готовится как структура для будущей базы: материал → кромка → фурнитура → правила расчёта.</span>
      </div>
    </>
  )
}

export default function ConstructorConfig({
  activeStep,
  project,
  warnings,
  activeWarnings,
  activeSectionWarnings,
  activeZone,
  materials = [],
  edgeOptions = [],
  handleOptions = [],
  hardwareOptions = [],
  onDimensionChange,
  onSectionsChange,
  onSectionChange,
  onSectionSelect,
  onZoneSelect,
  onZoneSplit,
  onSectionPartChange,
  onRailToggle,
  onMaterialChange,
  onPresetApply,
  onCopySection,
  onCopyToNext,
  onApplySectionToAll,
  onApplyToAll,
}) {
  const handleSectionsChange = onSectionsChange ?? onSectionChange
  const handleCopySection = onCopySection ?? onCopyToNext
  const handleApplySectionToAll = onApplySectionToAll ?? onApplyToAll
  const currentWarnings = activeSectionWarnings ?? activeWarnings

  const stepContent = {
    dimensions: {
      number: 1,
      eyebrow: 'Шаг 1 из 3',
      title: 'Размеры шкафа',
      text: 'Сначала задаём габариты. Это основа для деталировки, стоимости и ограничений по наполнению.',
      body: <DimensionsStep project={project} warnings={warnings} onDimensionChange={onDimensionChange} onSectionsChange={handleSectionsChange} />,
    },
    filling: {
      number: 2,
      eyebrow: 'Шаг 2 из 3',
      title: 'Наполнение секций',
      text: 'Соберите внутреннюю логику шкафа: полки, ящики и штанги в каждой секции.',
      body: <FillingStep project={project} warnings={warnings} activeSectionWarnings={currentWarnings} activeZone={activeZone} onSectionSelect={onSectionSelect} onZoneSelect={onZoneSelect} onZoneSplit={onZoneSplit} onSectionPartChange={onSectionPartChange} onRailToggle={onRailToggle} onPresetApply={onPresetApply} onCopySection={handleCopySection} onApplySectionToAll={handleApplySectionToAll} />,
    },
    materials: {
      number: 3,
      eyebrow: 'Шаг 3 из 3',
      title: 'Материалы и фурнитура',
      text: 'Выберите декор корпуса, кромку, открывание и фурнитуру. Это будущая структура спецификации.',
      body: <MaterialsStep project={project} materials={materials} edgeOptions={edgeOptions} handleOptions={handleOptions} hardwareOptions={hardwareOptions} onMaterialChange={onMaterialChange} />,
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
    </aside>
  )
}