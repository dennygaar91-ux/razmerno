import { useEffect, useMemo, useRef, useState } from 'react'
import ConstructorConfig from '../components/constructor/ConstructorConfig'
import ConstructorViewer from '../components/constructor/ConstructorViewer'
import ConstructorSummary from '../components/constructor/ConstructorSummary'
import CheckoutDrawer from '../components/constructor/CheckoutDrawer'
import StatusBadge from '../components/constructor/StatusBadge'
import Icon from '../icons/Icon'
import { DEFAULT_PROJECT, DIMENSION_LIMITS, MATERIALS, EDGE_OPTIONS, HANDLE_OPTIONS, HARDWARE_OPTIONS } from '../data/constructorCatalog'
import { calculatePrice, getActiveSectionWarnings, getPriceBreakdown, getProjectSummary, getWarnings } from '../utils/constructorPricing'
import { buildConstructorPayload } from '../utils/constructorPayload'
import { normalizeConstructorProject } from '../utils/constructorProjectNormalize'
import { clearConstructorProject, loadConstructorProject, loadConstructorProjectId, loadConstructorProjectMeta, saveConstructorProject, saveConstructorProjectId } from '../utils/constructorStorage'
import { calculateConstructorEstimate } from '../services/constructorEstimate'
import { loadConstructorProjectRemote, saveConstructorProjectRemote } from '../services/constructorProjects'
import './ConstructorPage.css'
import './ConstructorWizard.css'
import './ConstructorReference.css'
import './ConstructorInteractive.css'
import './ConstructorAdaptive.css'
import './ConstructorSummaryProduct.css'
import './ConstructorTargetAlignment.css'
import './ConstructorTargetCritical.css'

const FLOW_STEPS = [
  { id: 'dimensions', num: '1', title: 'Размеры', text: 'Укажите габариты и секции' },
  { id: 'filling', num: '2', title: 'Наполнение', text: 'Выберите полки, ящики и штанги' },
  { id: 'materials', num: '3', title: 'Материалы', text: 'Подберите декоры и фурнитуру' },
]

const FILLING_PRESETS = {
  clothes: { shelves: 1, drawers: 0, rail: true },
  shelves: { shelves: 5, drawers: 0, rail: false },
  drawers: { shelves: 1, drawers: 3, rail: false },
  empty: { shelves: 0, drawers: 0, rail: false },
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function formatProjectDate(value) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
  } catch {
    return ''
  }
}

function getInitialProject() {
  return normalizeConstructorProject(loadConstructorProject() ?? DEFAULT_PROJECT)
}

function getProjectStatus(syncState, meta) {
  if (syncState === 'saving') return { label: 'Сохраняем', tone: 'loading', text: 'Ручное сохранение проекта' }
  if (syncState === 'loading') return { label: 'Загружаем', tone: 'loading', text: 'Открываем последний проект' }
  if (syncState === 'autosaving') return { label: 'Автосохранение', tone: 'loading', text: 'Сохраняем изменения локально' }
  if (syncState === 'error') return { label: 'Ошибка сохранения', tone: 'error', text: 'Можно попробовать сохранить вручную' }
  if (syncState === 'saved') return { label: 'Сохранено', tone: 'success', text: 'Проект сохранён вручную' }
  if (syncState === 'autosaved') return { label: 'Автосохранено', tone: 'success', text: 'Последние изменения сохранены' }
  if (syncState === 'loaded') return { label: 'Загружено', tone: 'success', text: 'Проект восстановлен' }

  if (meta?.updatedAt) {
    return { label: `Сохранено ${formatProjectDate(meta.updatedAt)}`, tone: 'neutral', text: 'Есть локальная копия проекта' }
  }

  return { label: 'Новый проект', tone: 'neutral', text: 'Автосохранение включено' }
}

function getEstimateStatus(estimateState) {
  if (estimateState === 'loading') return { label: 'Пересчитываем', tone: 'loading' }
  if (estimateState === 'error') return { label: 'Предварительная цена', tone: 'error' }
  if (estimateState === 'success') return { label: 'Цена обновлена', tone: 'success' }
  return { label: 'Цена сразу', tone: 'neutral' }
}

export default function ConstructorPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [activeStep, setActiveStep] = useState('dimensions')
  const [project, setProject] = useState(getInitialProject)
  const [notice, setNotice] = useState('')
  const [syncState, setSyncState] = useState('idle')
  const [projectMeta, setProjectMeta] = useState(() => loadConstructorProjectMeta())
  const [projectId, setProjectId] = useState(() => loadConstructorProjectId())
  const [estimateState, setEstimateState] = useState('idle')
  const [remoteEstimate, setRemoteEstimate] = useState(null)
  const saveTimerRef = useRef(null)
  const estimateTimerRef = useRef(null)

  const summary = getProjectSummary(project)
  const warnings = getWarnings(project, summary)
  const activeWarnings = getActiveSectionWarnings(project)
  const localBreakdown = useMemo(() => getPriceBreakdown(project, summary), [project, summary])
  const localPrice = useMemo(() => calculatePrice(project, summary), [project, summary])
  const projectWithPrice = useMemo(() => {
    const remoteTotal = remoteEstimate?.totalPrice ?? remoteEstimate?.total
    const price = isFiniteNumber(remoteTotal) ? remoteTotal : localPrice
    const priceBreakdown = remoteEstimate?.breakdown ?? localBreakdown
    return { ...project, price, priceBreakdown }
  }, [project, localBreakdown, localPrice, remoteEstimate])
  const status = getProjectStatus(syncState, projectMeta)
  const estimateStatus = getEstimateStatus(estimateState)
  const orderPayload = useMemo(() => buildConstructorPayload(projectWithPrice, { summary, warnings }), [projectWithPrice, summary, warnings])

  useEffect(() => () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    if (estimateTimerRef.current) window.clearTimeout(estimateTimerRef.current)
  }, [])

  useEffect(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    setSyncState('autosaving')
    saveTimerRef.current = window.setTimeout(() => {
      const result = saveConstructorProject(project)
      if (result.ok) {
        setProjectMeta(result.meta)
        setSyncState('autosaved')
      } else {
        setSyncState('error')
        setNotice('Не удалось сохранить проект локально. Можно продолжить и попробовать позже.')
      }
    }, 300)
  }, [project])

  useEffect(() => {
    if (estimateTimerRef.current) window.clearTimeout(estimateTimerRef.current)
    setEstimateState('loading')
    estimateTimerRef.current = window.setTimeout(async () => {
      const response = await calculateConstructorEstimate(project)

      if (response.ok) {
        setRemoteEstimate(response.estimate)
        setEstimateState('success')
      } else {
        setRemoteEstimate(null)
        setEstimateState('error')
      }
    }, 250)
  }, [project])

  function updateProject(updater) {
    setProject(current => normalizeConstructorProject(typeof updater === 'function' ? updater(current) : updater))
    setNotice('')
  }

  function updateDimensions(key, delta) {
    updateProject(current => ({
      ...current,
      dimensions: {
        ...current.dimensions,
        [key]: clamp(current.dimensions[key] + delta, DIMENSION_LIMITS[key].min, DIMENSION_LIMITS[key].max),
      },
    }))
  }

  function updateSections(delta) {
    updateProject(current => ({ ...current, sections: clamp(current.sections + delta, 1, 6) }))
  }

  function setActiveSection(sectionNumber) {
    updateProject(current => ({ ...current, activeSection: clamp(sectionNumber, 1, current.sections) }))
  }

  function updateSectionPart(type, delta) {
    updateProject(current => {
      const index = current.activeSection - 1
      const filling = current.filling.map((section, sectionIndex) => {
        if (sectionIndex !== index) return section
        return { ...section, [type]: Math.max(0, section[type] + delta) }
      })
      return { ...current, filling }
    })
  }

  function toggleRail() {
    updateProject(current => {
      const index = current.activeSection - 1
      const filling = current.filling.map((section, sectionIndex) => (
        sectionIndex === index ? { ...section, rail: !section.rail } : section
      ))
      return { ...current, filling }
    })
  }

  function clearActiveSection() {
    updateProject(current => {
      const index = current.activeSection - 1
      const filling = current.filling.map((section, sectionIndex) => (
        sectionIndex === index ? { shelves: 0, drawers: 0, rail: false } : section
      ))
      return { ...current, filling }
    })
  }

  function applyPreset(presetName) {
    const preset = FILLING_PRESETS[presetName]
    if (!preset) return
    updateProject(current => {
      const index = current.activeSection - 1
      const filling = current.filling.map((section, sectionIndex) => (
        sectionIndex === index ? { ...preset } : section
      ))
      return { ...current, filling }
    })
  }

  function copyToNextSection() {
    updateProject(current => {
      const index = current.activeSection - 1
      if (index >= current.filling.length - 1) return current
      const filling = current.filling.map((section, sectionIndex) => (
        sectionIndex === index + 1 ? { ...current.filling[index] } : section
      ))
      return { ...current, activeSection: index + 2, filling }
    })
  }

  function applyToAllSections() {
    updateProject(current => {
      const source = current.filling[current.activeSection - 1]
      return { ...current, filling: current.filling.map(() => ({ ...source })) }
    })
  }

  function setMaterial(key, value) {
    updateProject(current => ({ ...current, material: { ...current.material, [key]: value } }))
  }

  async function handleSave() {
    setSyncState('saving')
    const result = saveConstructorProject(project)
    if (!result.ok) {
      setSyncState('error')
      setNotice('Не удалось сохранить проект локально. Проверьте доступность браузерного хранилища.')
      return
    }

    setProjectMeta(result.meta)

    const remoteResult = await saveConstructorProjectRemote(project)
    if (remoteResult.ok) {
      setProjectId(remoteResult.projectId)
      saveConstructorProjectId(remoteResult.projectId)
      setNotice(`Проект сохранён. ID: ${remoteResult.projectId}`)
      setSyncState('saved')
      return
    }

    setNotice('Проект сохранён локально. Онлайн-сохранение подключим позже.')
    setSyncState('saved')
  }

  async function handleLoad() {
    setSyncState('loading')
    const savedId = loadConstructorProjectId()
    if (savedId) {
      const remoteResult = await loadConstructorProjectRemote(savedId)
      if (remoteResult.ok) {
        setProject(remoteResult.project)
        setProjectId(remoteResult.projectId)
        setNotice(`Загружен проект ${remoteResult.projectId}`)
        setSyncState('loaded')
        return
      }
    }

    const saved = loadConstructorProject()
    if (saved) {
      setProject(normalizeConstructorProject(saved))
      setProjectMeta(loadConstructorProjectMeta())
      setNotice('Загружена локальная версия проекта.')
      setSyncState('loaded')
    } else {
      setNotice('Пока нет сохранённого проекта.')
      setSyncState('idle')
    }
  }

  function handleClearConfirmed() {
    clearConstructorProject()
    setProjectId('')
    setProject(DEFAULT_PROJECT)
    setProjectMeta(null)
    setNotice('Проект очищен. Можно начать заново.')
    setClearConfirmOpen(false)
    setSyncState('idle')
  }

  return (
    <div className="rp-ctor-page rp-ctor-page--reference">
      <section className="rp-ctor-hero">
        <div>
          <p className="rp-ctor-kicker"><span /> Онлайн-конструктор</p>
          <h1>Соберите шкаф под свой размер</h1>
          <p className="rp-ctor-lead">Задайте габариты, выберите наполнение и материалы. Цена рассчитывается сразу, а мы подготовим комплект для сборки и доставим к вам.</p>
          <div className="rp-ctor-badges">
            <span>3 шага</span>
            <span>{estimateStatus.label}</span>
            <span>{status.label}</span>
          </div>
        </div>
        <div className="rp-ctor-actions">
          <button type="button" onClick={handleLoad}><Icon name="upload" size={16} />Загрузить</button>
          <button type="button" onClick={() => setClearConfirmOpen(true)}><Icon name="x" size={16} />Очистить</button>
          <button type="button" onClick={handleSave}><Icon name="bookmark" size={16} />Сохранить</button>
          <button className="is-primary" type="button" onClick={() => setCheckoutOpen(true)}><Icon name="cart" size={17} />В корзину</button>
        </div>
      </section>

      <section className="rp-ctor-flow" aria-label="Шаги настройки шкафа">
        {FLOW_STEPS.map(step => (
          <button type="button" className={activeStep === step.id ? 'is-active' : ''} key={step.id} onClick={() => setActiveStep(step.id)}>
            <span>{step.num}</span>
            <div>
              <p>{step.title}</p>
              <small>{step.text}</small>
            </div>
          </button>
        ))}
      </section>

      {notice && <p className="rp-ctor-notice" role="status">{notice}</p>}

      <main className="rp-ctor-shell" aria-label="Конструктор шкафа">
        <ConstructorConfig
          activeStep={activeStep}
          activeWarnings={activeWarnings}
          onActiveStepChange={setActiveStep}
          project={project}
          onDimensionChange={updateDimensions}
          onSectionChange={updateSections}
          onSectionSelect={setActiveSection}
          onSectionPartChange={updateSectionPart}
          onRailToggle={toggleRail}
          onClearSection={clearActiveSection}
          onPresetApply={applyPreset}
          onCopyToNext={copyToNextSection}
          onApplyToAll={applyToAllSections}
          onMaterialChange={setMaterial}
          materials={MATERIALS}
          edgeOptions={EDGE_OPTIONS}
          handleOptions={HANDLE_OPTIONS}
          hardwareOptions={HARDWARE_OPTIONS}
        />

        <ConstructorViewer
          project={projectWithPrice}
          onSectionSelect={setActiveSection}
          onSectionPartChange={updateSectionPart}
          onRailToggle={toggleRail}
          onClearSection={clearActiveSection}
          onPresetApply={applyPreset}
        />

        <ConstructorSummary
          project={projectWithPrice}
          summary={summary}
          warnings={warnings}
          estimateState={estimateState}
          onCheckout={() => setCheckoutOpen(true)}
        />
      </main>

      <CheckoutDrawer
        open={checkoutOpen}
        project={projectWithPrice}
        summary={summary}
        orderPayload={orderPayload}
        onClose={() => setCheckoutOpen(false)}
      />

      {clearConfirmOpen && (
        <div className="rp-confirm" role="dialog" aria-modal="true" aria-label="Очистить проект">
          <button className="rp-confirm__overlay" type="button" onClick={() => setClearConfirmOpen(false)} aria-label="Закрыть подтверждение" />
          <section className="rp-confirm__panel">
            <p>Очистка проекта</p>
            <h2>Сбросить текущий шкаф?</h2>
            <span>Все размеры, секции, материалы и наполнение вернутся к значениям по умолчанию. Локальное сохранение тоже будет удалено.</span>
            <div>
              <button type="button" onClick={() => setClearConfirmOpen(false)}>Отмена</button>
              <button type="button" className="is-danger" onClick={handleClearConfirmed}>Очистить проект</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
