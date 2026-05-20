import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../icons/Icon'
import { DEFAULT_PROJECT, DIMENSION_LIMITS, MATERIALS } from '../data/constructorCatalog'
import { calculatePrice, getPriceBreakdown, getProjectSummary } from '../utils/constructorPricing'
import { normalizeConstructorProject } from '../utils/constructorProjectNormalize'
import { UiButton, UiEmptyState, UiMaterialCard, UiPillTabs, UiPriceCard, UiSegmented, UiStatus } from '../components/uikit/RazmernoUIKit'
import CheckoutDrawer from '../components/constructor/CheckoutDrawer'
import './ConstructorUIKitShell.css'
import './ConstructorUIKitPanels.css'
import './ConstructorUIKitCanvas.css'

const tabs = [
  { id: 'dimensions', label: 'Размеры', icon: 'ruler' },
  { id: 'filling', label: 'Наполнение', icon: 'layers' },
  { id: 'design', label: 'Дизайн', icon: 'settings' },
]

const viewModes = [
  { id: 'front', label: 'Фронт', icon: 'surface' },
  { id: 'scheme', label: 'Схема', icon: 'cube' },
]

const baseModels = [
  ['wardrobe', 'Шкаф-купе', 'Для спальни и гардеробной'],
  ['hinged', 'Распашной', 'Классический корпус'],
  ['tv', 'Тумба ТВ', 'Низкая модульная база'],
]

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function getMaterialColor(material) {
  const tone = material?.tone || material?.title || ''
  if (/дуб|wood|oak/i.test(tone)) return '#c8aa7a'
  if (/графит|серый|gray|stone/i.test(tone)) return '#5f625f'
  if (/кашемир|beige/i.test(tone)) return '#d8cab8'
  return '#f3f2ef'
}

function toProjectMaterial(material, currentMaterial) {
  return {
    ...currentMaterial,
    body: material.fullTitle || material.title,
    materialId: material.id,
    thickness: material.thickness,
    edge: material.edge,
    edgeId: material.edgeId,
    manufacturer: material.manufacturer,
    article: material.article,
    priceFactor: material.priceFactor,
    tone: material.tone,
  }
}

export default function ConstructorUIKitPage() {
  const [activeTab, setActiveTab] = useState('dimensions')
  const [viewMode, setViewMode] = useState('front')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [project, setProject] = useState(() => normalizeConstructorProject(DEFAULT_PROJECT))
  const summary = useMemo(() => getProjectSummary(project), [project])
  const price = useMemo(() => calculatePrice(project, summary), [project, summary])
  const breakdown = useMemo(() => getPriceBreakdown(project, summary), [project, summary])
  const sectionIndexes = Array.from({ length: project.sections }, (_, index) => index)
  const activeSectionIndex = Math.max(0, project.activeSection - 1)

  function updateProject(updater) {
    setProject((current) => normalizeConstructorProject(typeof updater === 'function' ? updater(current) : updater))
  }

  function updateDimension(key, value) {
    updateProject((current) => ({
      ...current,
      dimensions: {
        ...current.dimensions,
        [key]: clamp(Number(value) || DIMENSION_LIMITS[key].min, DIMENSION_LIMITS[key].min, DIMENSION_LIMITS[key].max),
      },
    }))
  }

  function updateSections(nextCount) {
    updateProject((current) => ({ ...current, sections: clamp(nextCount, 1, 6), activeSection: Math.min(current.activeSection, clamp(nextCount, 1, 6)) }))
  }

  function updateActiveSection(type, delta) {
    updateProject((current) => ({
      ...current,
      filling: current.filling.map((section, index) => index === activeSectionIndex ? { ...section, [type]: Math.max(0, section[type] + delta) } : section),
    }))
  }

  function toggleRail() {
    updateProject((current) => ({
      ...current,
      filling: current.filling.map((section, index) => index === activeSectionIndex ? { ...section, rail: !section.rail } : section),
    }))
  }

  function selectMaterial(material) {
    updateProject((current) => ({ ...current, material: toProjectMaterial(material, current.material) }))
  }

  const rows = [
    { label: 'Материалы', value: breakdown.material },
    { label: 'Распил', value: breakdown.cutting },
    { label: 'Кромление', value: breakdown.edging },
    { label: 'Фурнитура', value: breakdown.hardware },
    { label: 'Упаковка', value: breakdown.packaging },
  ]

  return (
    <main className="rzm-ctor-ref rzm-ui">
      <header className="rzm-ctor-topbar">
        <div className="rzm-ctor-brand"><Link to="/">Размерно.</Link><span>Проект шкафа</span></div>
        <div className="rzm-ctor-topbar__center"><UiStatus>Автосохранение</UiStatus><span>{project.dimensions.width} × {project.dimensions.height} × {project.dimensions.depth} мм</span></div>
        <div className="rzm-ctor-topbar__actions"><Link to="/account">Мои проекты</Link><UiButton variant="secondary" onClick={() => setCheckoutOpen(true)}>Заявка</UiButton></div>
      </header>

      <aside className="rzm-ctor-left">
        <div className="rzm-ctor-left__head"><h1>Конструктор</h1><p>Настройте базу, размеры, наполнение и материал.</p></div>
        <UiPillTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'dimensions' && (
          <section className="rzm-ctor-panel">
            <div className="rzm-ctor-block"><span>База</span><div className="rzm-ctor-base-grid">{baseModels.map(([id, title, text]) => <button key={id} type="button" className={id === 'wardrobe' ? 'is-active' : ''}><b>{title}</b><small>{text}</small></button>)}</div></div>
            <DimensionControl label="Ширина" value={project.dimensions.width} min={DIMENSION_LIMITS.width.min} max={DIMENSION_LIMITS.width.max} onChange={(value) => updateDimension('width', value)} />
            <DimensionControl label="Высота" value={project.dimensions.height} min={DIMENSION_LIMITS.height.min} max={DIMENSION_LIMITS.height.max} onChange={(value) => updateDimension('height', value)} />
            <DimensionControl label="Глубина" value={project.dimensions.depth} min={DIMENSION_LIMITS.depth.min} max={DIMENSION_LIMITS.depth.max} onChange={(value) => updateDimension('depth', value)} />
            <div className="rzm-ctor-counter"><span>Секции</span><div><button onClick={() => updateSections(project.sections - 1)}>-</button><b>{project.sections}</b><button onClick={() => updateSections(project.sections + 1)}>+</button></div></div>
          </section>
        )}

        {activeTab === 'filling' && (
          <section className="rzm-ctor-panel">
            <UiEmptyState icon="layers" title="Выберите секцию шкафа" text="Нажмите на секцию на холсте, чтобы добавить полки, ящики или штангу." />
            <div className="rzm-ctor-filling-mini">
              <span>Активная секция: {project.activeSection}</span>
              <div><button onClick={() => updateActiveSection('shelves', -1)}>-</button><b>Полки {project.filling[activeSectionIndex]?.shelves || 0}</b><button onClick={() => updateActiveSection('shelves', 1)}>+</button></div>
              <div><button onClick={() => updateActiveSection('drawers', -1)}>-</button><b>Ящики {project.filling[activeSectionIndex]?.drawers || 0}</b><button onClick={() => updateActiveSection('drawers', 1)}>+</button></div>
              <button type="button" onClick={toggleRail}>{project.filling[activeSectionIndex]?.rail ? 'Убрать штангу' : 'Добавить штангу'}</button>
            </div>
          </section>
        )}

        {activeTab === 'design' && (
          <section className="rzm-ctor-panel">
            <div className="rzm-ctor-materials">{MATERIALS.slice(0, 4).map((material) => <UiMaterialCard key={material.id} title={material.title} subtitle={material.manufacturer || 'ЛДСП'} color={getMaterialColor(material)} active={project.material.materialId === material.id} onClick={() => selectMaterial(material)} />)}</div>
          </section>
        )}
      </aside>

      <section className="rzm-ctor-stage">
        <div className="rzm-ctor-wardrobe" style={{ '--sections': project.sections }}>
          {sectionIndexes.map((index) => {
            const section = project.filling[index] || { shelves: 0, drawers: 0, rail: false }
            return <button key={index} type="button" className={`rzm-ctor-wardrobe__section ${project.activeSection === index + 1 ? 'is-active' : ''}`} onClick={() => updateProject((current) => ({ ...current, activeSection: index + 1 }))}>{section.rail && <i className="rail" />}{Array.from({ length: Math.min(section.shelves, 5) }, (_, shelf) => <i key={shelf} className="shelf" style={{ top: `${22 + shelf * 13}%` }} />)}{Array.from({ length: Math.min(section.drawers, 4) }, (_, drawer) => <i key={drawer} className="drawer" style={{ bottom: `${8 + drawer * 12}%` }} />)}</button>
          })}
        </div>
        <div className="rzm-ctor-dim is-width">{project.dimensions.width} мм</div>
        <div className="rzm-ctor-dim is-height">{project.dimensions.height} мм</div>
        <div className="rzm-ctor-dim is-depth">{project.dimensions.depth} мм</div>
        <div className="rzm-ctor-floating"><UiSegmented items={viewModes} active={viewMode} onChange={setViewMode} /></div>
        <button type="button" className="rzm-ctor-help"><Icon name="chat" size={20} /></button>
      </section>

      <section className="rzm-ctor-right"><UiPriceCard price={price} rows={rows} cta="Отправить заявку" onSubmit={() => setCheckoutOpen(true)} /></section>
      <CheckoutDrawer open={checkoutOpen} project={{ ...project, price, priceBreakdown: breakdown }} summary={summary} orderPayload={{ productType: 'cabinet_wardrobe', dimensions: project.dimensions, sections: project.sections, filling: project.filling, material: project.material, estimate: { total: price, breakdown } }} onClose={() => setCheckoutOpen(false)} />
    </main>
  )
}

function DimensionControl({ label, value, min, max, onChange }) {
  return (
    <label className="rzm-ctor-dim-control"><span>{label}</span><div><input type="number" value={value} onChange={(event) => onChange(event.target.value)} /><em>мм</em></div><input type="range" min={min} max={max} value={value} onChange={(event) => onChange(event.target.value)} /></label>
  )
}
