import Icon from '../../icons/Icon'

const dimensionFields = [
  ['height', 'Высота', 'от 200 до 2800 мм', 100, 'мм'],
  ['width', 'Ширина', 'от 400 до 3000 мм', 100, 'мм'],
  ['depth', 'Глубина', 'от 300 до 800 мм', 50, 'мм'],
]

const fillingPresets = [
  ['clothes', 'Гардероб', 'верхняя полка + штанга', 'Разделим секцию и соберём сценарий одежды'],
  ['shelves', 'Полки', '4–5 полок', 'Заполнить выбранную секцию полками'],
  ['drawers', 'Ящики снизу', 'блок из 3 ящиков', 'Снизу ящики, сверху разделительная полка'],
  ['combo', 'Комбо', 'ящики + полки', 'Снизу ящики, сверху полки'],
  ['empty', 'Пусто', 'очистить секцию', 'Очистить выбранную секцию'],
]

function getSectionWidth(project) {
  return Math.round(project.dimensions.width / project.sections)
}

function getDimensionAdvisories(project) {
  const sectionWidth = getSectionWidth(project)
  const hasRail = project.filling.some(section => section.rail)
  const hasDrawers = project.filling.some(section => section.drawers > 0)
  const advisories = []

  if (project.dimensions.depth < 550) {
    advisories.push({
      key: 'depth-rail',
      tone: hasRail ? 'warning' : 'info',
      title: 'Глубина для одежды',
      text: hasRail
        ? 'Для штанги нужна глубина от 550 мм. Сейчас одежда на плечиках может не помещаться.'
        : 'Если планируете штангу, лучше поставить глубину от 550 мм.',
    })
  }

  if (sectionWidth < 350) {
    advisories.push({
      key: 'section-too-narrow',
      tone: 'warning',
      title: 'Секции слишком узкие',
      text: `Сейчас секция примерно ${sectionWidth} мм. Лучше уменьшить количество секций или увеличить ширину шкафа.`,
    })
  } else if (sectionWidth < 420 && hasDrawers) {
    advisories.push({
      key: 'drawer-width',
      tone: 'recommendation',
      title: 'Ширина для ящиков',
      text: `Для ящиков комфортнее ширина секции от 420 мм. Сейчас примерно ${sectionWidth} мм.`,
    })
  }

  if (project.dimensions.height < 1200) {
    advisories.push({
      key: 'low-height',
      tone: 'info',
      title: 'Низкий шкаф',
      text: 'При небольшой высоте лучше не добавлять много полок и ящиков, чтобы оставить полезный объём.',
    })
  }

  return advisories
}

function getActiveSectionAdvisories(project, activeSection) {
  const sectionWidth = getSectionWidth(project)
  const usefulHeight = project.dimensions.height - activeSection.drawers * 170 - (activeSection.rail ? 950 : 0)
  const shelfGap = activeSection.shelves > 1 ? usefulHeight / (activeSection.shelves + 1) : usefulHeight
  const drawerFaceHeight = activeSection.drawers > 0 ? project.dimensions.height / activeSection.drawers : project.dimensions.height
  const advisories = []

  if (activeSection.rail && project.dimensions.depth < 550) {
    advisories.push({
      key: 'active-rail-depth',
      tone: 'warning',
      title: 'Штанга требует глубину',
      text: 'Для одежды на плечиках нужна глубина от 550 мм. Увеличьте глубину или уберите штангу.',
    })
  }

  if (activeSection.drawers > 0 && sectionWidth < 420) {
    advisories.push({
      key: 'active-drawer-width',
      tone: 'recommendation',
      title: 'Ящики могут быть узкими',
      text: `Секция примерно ${sectionWidth} мм. Для ящиков комфортнее от 420 мм.`,
    })
  }

  if (activeSection.shelves > 1 && shelfGap < 200) {
    advisories.push({
      key: 'active-shelf-gap',
      tone: 'warning',
      title: 'Мало места между полками',
      text: 'Комфортный шаг между полками — от 200 мм. Уберите часть полок или увеличьте высоту.',
    })
  }

  if (activeSection.drawers > 0 && drawerFaceHeight < 150) {
    advisories.push({
      key: 'active-drawer-height',
      tone: 'warning',
      title: 'Низкие фасады ящиков',
      text: 'Минимальная высота фасада ящика — около 150 мм. Лучше уменьшить количество ящиков.',
    })
  }

  if (!advisories.length) {
    advisories.push({
      key: 'active-ok',
      tone: 'success',
      title: 'Секция выглядит безопасно',
      text: 'Критичных ограничений по выбранной секции сейчас нет.',
    })
  }

  return advisories
}

function CounterField({ label, value, hint, unit = '', min, max, onMinus, onPlus, advisory }) {
  const minusDisabled = typeof min === 'number' && value <= min
  const plusDisabled = typeof max === 'number' && value >= max

  return (
    <div className={`rp-ref-field rp-ref-field--polished ${advisory ? `has-advisory is-${advisory.tone}` : ''}`}>
      <div>
        <strong>{label}</strong>
        <span>{hint}</span>
        {advisory && <small className="rp-ref-field-advisory">{advisory.text}</small>}
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

function AdvisoryCard({ advisory }) {
  return (
    <div className={`rp-ref-advisory-card is-${advisory.tone}`}>
      <Icon name={advisory.tone === 'success' ? 'check-circle' : 'clock'} size={14} />
      <div>
        <b>{advisory.title}</b>
        <span>{advisory.text}</span>
      </div>
    </div>
  )
}

function AdvisoryList({ title, items }) {
  if (!items?.length) return null

  return (
    <div className="rp-ref-advisory-list">
      {title && <h3>{title}</h3>}
      {items.map((item) => <AdvisoryCard advisory={item} key={item.key} />)}
    </div>
  )
}

function WarningList({ warnings }) {
  if (!warnings?.length) return null

  return (
    <details className="rp-ref-warnings rp-ref-warnings--details">
      <summary>Все рекомендации проекта <span>{warnings.length}</span></summary>
      {warnings.map((warning) => (
        <p key={warning}><Icon name="clock" size={14} />{warning}</p>
      ))}
    </details>
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

function DimensionsStep({ project, warnings, onDimensionChange, onSectionsChange }) {
  const sectionWidth = getSectionWidth(project)
  const advisories = getDimensionAdvisories(project)
  const advisoryByField = {
    depth: advisories.find(item => item.key === 'depth-rail'),
    width: advisories.find(item => item.key === 'section-too-narrow' || item.key === 'drawer-width'),
    height: advisories.find(item => item.key === 'low-height'),
  }

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
            advisory={advisoryByField[key]}
            min={key === 'height' ? 200 : key === 'width' ? 400 : 300}
            max={key === 'height' ? 2800 : key === 'width' ? 3000 : 800}
            onMinus={() => onDimensionChange(key, -step)}
            onPlus={() => onDimensionChange(key, step)}
          />
        ))}
        <CounterField
          label="Секции"
          value={project.sections}
          hint="от 1 до 6 вертикальных секций"
          min={1}
          max={6}
          advisory={sectionWidth < 350 ? { tone: 'warning', text: `Сейчас секция примерно ${sectionWidth} мм — это слишком узко.` } : undefined}
          onMinus={() => onSectionsChange(-1)}
          onPlus={() => onSectionsChange(1)}
        />
      </div>

      <div className="rp-ref-block rp-ref-block--polished">
        <h3>Ширина секции</h3>
        <p>Сейчас каждая секция примерно по {sectionWidth} мм</p>
        <div className="rp-ref-section-width-diagram" aria-label="Пропорции секций">
          {Array.from({ length: project.sections }, (_, index) => (
            <span key={index} style={{ flex: 1 }}>
              <b>{index + 1}</b>
              <em>{sectionWidth} мм</em>
            </span>
          ))}
        </div>
      </div>

      <AdvisoryList title="Подсказки по размерам" items={advisories} />
      <WarningList warnings={warnings} />
    </>
  )
}

function FillingStep({ project, warnings, activeSectionWarnings, onSectionSelect, onSectionPartChange, onPresetApply, onCopySection, onApplySectionToAll, onClearSection, onZoneRailToggle }) {
  const activeSection = project.filling[project.activeSection - 1] ?? { shelves: 0, drawers: 0, rail: false }
  const railDisabled = project.dimensions.depth < 550
  const activeAdvisories = getActiveSectionAdvisories(project, activeSection)

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
      <StepHint title="Настройте выбранную секцию" text="Выберите секцию и добавьте полки, ящики или штангу. Активная секция подсвечивается в центре и на карте." />

      <div className="rp-ref-block rp-ref-block--topless rp-ref-block--polished">
        <h3>Секция для редактирования</h3>
        <p>Клик по секции синхронно меняет левую панель, viewer и карту снизу.</p>
        <div className="rp-ref-section-tabs">
          {project.filling.map((section, index) => {
            const details = [
              section.shelves ? `${section.shelves} полок` : 'без полок',
              section.drawers ? `${section.drawers} ящиков` : 'без ящиков',
              section.rail ? 'штанга' : 'без штанги',
            ].join(', ')

            return (
              <button className={project.activeSection === index + 1 ? 'is-active' : ''} type="button" key={index} onClick={() => onSectionSelect(index + 1)} title={`Секция ${index + 1}: ${details}`}>
                <span>{index + 1}</span>
                <small>{details}</small>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rp-ref-active-section rp-ref-active-section--polished rp-ref-active-section--with-actions">
        <div>
          <span>Секция {project.activeSection}</span>
          <b>{activePreset}</b>
        </div>
        <strong>{activeSection.shelves} полок · {activeSection.drawers} ящиков · {activeSection.rail ? 'штанга' : 'без штанги'}</strong>
      </div>

      <AdvisoryList title="Проверка выбранной секции" items={activeAdvisories} />

      <div className="rp-ref-block rp-ref-block--polished rp-ref-section-direct-actions">
        <h3>Действия для секции {project.activeSection}</h3>
        <p>Эти кнопки применяются только к активной секции.</p>
        <div className="rp-ref-zone-actions rp-ref-zone-actions--section">
          <button type="button" onClick={() => onSectionPartChange('shelves', 1)}>+ Полка</button>
          <button type="button" onClick={() => onSectionPartChange('drawers', 1)}>+ Ящик</button>
          <button type="button" onClick={onZoneRailToggle} disabled={railDisabled}>{activeSection.rail ? 'Убрать штангу' : 'Штанга'}</button>
          <button type="button" onClick={onClearSection}>Очистить</button>
        </div>
        {railDisabled && <p className="rp-ref-zone-hint">Для штанги нужна глубина секции от 550 мм.</p>}
      </div>

      <div className="rp-ref-section-tools">
        <button type="button" disabled={project.sections < 2} onClick={onCopySection}>Копировать в соседнюю</button>
        <button type="button" disabled={project.sections < 2} onClick={onApplySectionToAll}>Применить ко всем</button>
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
        <CounterField label="Ящики" value={activeSection.drawers} hint="минимальная высота фасада — 150 мм" min={0} max={4} onMinus={() => onSectionPartChange('drawers', -1)} onPlus={() => onSectionPartChange('drawers', 1)} />
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
      <StepHint title="Соберите спецификацию" text="При выборе декора цвет шкафа меняется в предпросмотре. Это помогает проверить внешний вид до заявки." />

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
  activeSectionWarnings,
  materials = [],
  edgeOptions = [],
  handleOptions = [],
  hardwareOptions = [],
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
  onCopySection,
  onApplySectionToAll,
  onClearSection,
  onZoneRailToggle,
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
      body: <FillingStep project={project} warnings={warnings} activeSectionWarnings={activeSectionWarnings} onSectionSelect={onSectionSelect} onSectionPartChange={onSectionPartChange} onPresetApply={onPresetApply} onCopySection={onCopySection} onApplySectionToAll={onApplySectionToAll} onClearSection={onClearSection} onZoneRailToggle={onZoneRailToggle ?? onRailToggle} />,
      next: 'Далее: материалы',
    },
    materials: {
      number: 3,
      eyebrow: 'Шаг 3 из 3',
      title: 'Материалы и фурнитура',
      text: 'Выберите декор корпуса, кромку, открывание и фурнитуру. Это будущая структура спецификации.',
      body: <MaterialsStep project={project} materials={materials} edgeOptions={edgeOptions} handleOptions={handleOptions} hardwareOptions={hardwareOptions} onMaterialChange={onMaterialChange} />,
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
