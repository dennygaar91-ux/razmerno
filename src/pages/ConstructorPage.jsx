import { useMemo, useState } from 'react'
import ConstructorConfig from '../components/constructor/ConstructorConfig'
import ConstructorViewer from '../components/constructor/ConstructorViewer'
import ConstructorSummary from '../components/constructor/ConstructorSummary'
import CheckoutDrawer from '../components/constructor/CheckoutDrawer'
import Icon from '../icons/Icon'
import { DEFAULT_PROJECT, DIMENSION_LIMITS, MATERIALS, HANDLE_OPTIONS } from '../data/constructorCatalog'
import { calculatePrice, getPriceBreakdown, getProjectSummary, getWarnings } from '../utils/constructorPricing'
import './ConstructorPage.css'
import './ConstructorWizard.css'
import './ConstructorReference.css'
import './ConstructorInteractive.css'

const FLOW_STEPS = [
  { id: 'dimensions', num: '1', title: 'Размеры', text: 'Укажите габариты и секции' },
  { id: 'filling', num: '2', title: 'Наполнение', text: 'Выберите полки, ящики и штанги' },
  { id: 'materials', num: '3', title: 'Материалы', text: 'Подберите декоры и фурнитуру' },
]

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export default function ConstructorPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [activeStep, setActiveStep] = useState('dimensions')
  const [project, setProject] = useState(DEFAULT_PROJECT)

  const activeStepIndex = FLOW_STEPS.findIndex(step => step.id === activeStep)

  const canGoBack = activeStepIndex > 0
  const canGoNext = activeStepIndex < FLOW_STEPS.length - 1

  const summary = useMemo(() => getProjectSummary(project), [project])
  const priceBreakdown = useMemo(() => getPriceBreakdown(project, summary), [project, summary])
  const price = useMemo(() => calculatePrice(project, summary), [project, summary])
  const warnings = useMemo(() => getWarnings(project, summary), [project, summary])
  const projectWithPrice = useMemo(() => ({ ...project, price, priceBreakdown }), [project, price, priceBreakdown])

  function goNext() {
    if (!canGoNext) {
      setCheckoutOpen(true)
      return
    }

    setActiveStep(FLOW_STEPS[activeStepIndex + 1].id)
  }

  function goBack() {
    if (!canGoBack) return
    setActiveStep(FLOW_STEPS[activeStepIndex - 1].id)
  }

  function updateDimension(key, delta) {
    setProject(current => {
      const limits = DIMENSION_LIMITS[key]

      return {
        ...current,
        dimensions: {
          ...current.dimensions,
          [key]: clamp(current.dimensions[key] + delta, limits.min, limits.max),
        },
      }
    })
  }

  function updateSections(delta) {
    setProject(current => {
      const nextCount = clamp(current.sections + delta, 1, 6)
      const filling = Array.from({ length: nextCount }, (_, index) => current.filling[index] ?? { shelves: 1, drawers: 0, rail: false })

      return {
        ...current,
        sections: nextCount,
        activeSection: Math.min(current.activeSection, nextCount),
        filling,
      }
    })
  }

  function selectSection(sectionNumber) {
    setProject(current => ({ ...current, activeSection: sectionNumber }))
  }

  function updateActiveSection(part, delta) {
    setProject(current => {
      const index = current.activeSection - 1
      const filling = current.filling.map((section, sectionIndex) => {
        if (sectionIndex !== index) return section
        const limit = part === 'shelves' ? 8 : 4

        return {
          ...section,
          [part]: clamp(section[part] + delta, 0, limit),
        }
      })

      return { ...current, filling }
    })
  }

  function clearActiveSection() {
    setProject(current => {
      const index = current.activeSection - 1
      const filling = current.filling.map((section, sectionIndex) => (
        sectionIndex === index ? { shelves: 0, drawers: 0, rail: false } : section
      ))

      return { ...current, filling }
    })
  }

  function toggleRail() {
    setProject(current => {
      const index = current.activeSection - 1
      const filling = current.filling.map((section, sectionIndex) => (
        sectionIndex === index ? { ...section, rail: !section.rail } : section
      ))

      return { ...current, filling }
    })
  }

  function updateMaterial(field, value) {
    setProject(current => {
      if (field === 'materialId') {
        const material = MATERIALS.find(item => item.id === value)
        if (!material) return current

        return {
          ...current,
          material: {
            ...current.material,
            body: material.title,
            materialId: material.id,
            thickness: material.thickness,
            edge: material.edge,
            tone: material.tone,
            priceFactor: material.priceFactor,
          },
        }
      }

      if (field === 'handleId') {
        const handle = HANDLE_OPTIONS.find(item => item.id === value)
        if (!handle) return current

        return {
          ...current,
          material: {
            ...current.material,
            handles: handle.title,
            handleId: handle.id,
            handlePriceAdd: handle.priceAdd,
          },
        }
      }

      return {
        ...current,
        material: { ...current.material, [field]: value },
      }
    })
  }

  function resetProject() {
    setProject(DEFAULT_PROJECT)
    setActiveStep('dimensions')
  }

  return (
    <main className="rp-ctor-page rp-ctor-page--reference">
      <section className="rp-ctor-hero">
        <div>
          <p className="rp-ctor-kicker">онлайн-конструктор</p>
          <h1>Соберите шкаф под свой размер</h1>
          <p className="rp-ctor-lead">Задайте габариты, выберите наполнение и материалы. Цена рассчитывается сразу, а мы подготовим комплект для сборки и доставим к вам.</p>
          <div className="rp-ctor-badges">
            <span>3 шага</span>
            <span>цена сразу</span>
            <span>комплект для сборки</span>
          </div>
        </div>

        <div className="rp-ctor-actions">
          <button type="button"><Icon name="download" size={16} />Загрузить</button>
          <button type="button" onClick={resetProject}><Icon name="x" size={16} />Очистить</button>
          <button type="button"><Icon name="file-check" size={16} />Сохранить</button>
          <button className="is-primary" type="button" onClick={() => setCheckoutOpen(true)}><Icon name="orders" size={17} />В корзину</button>
        </div>
      </section>

      <section className="rp-ctor-flow" aria-label="Этапы конструктора">
        {FLOW_STEPS.map(step => (
          <button className={step.id === activeStep ? 'is-active' : ''} type="button" key={step.id} onClick={() => setActiveStep(step.id)}>
            <span>{step.num}</span>
            <p>{step.title}<small>{step.text}</small></p>
          </button>
        ))}
      </section>

      <section className="rp-ctor-shell rp-ctor-shell--no-rail" aria-label="Конструктор шкафа">
        <ConstructorConfig
          activeStep={activeStep}
          project={projectWithPrice}
          summary={summary}
          warnings={warnings}
          materials={MATERIALS}
          handleOptions={HANDLE_OPTIONS}
          canGoBack={canGoBack}
          canGoNext={canGoNext}
          onBack={goBack}
          onNext={goNext}
          onCheckout={() => setCheckoutOpen(true)}
          onDimensionChange={updateDimension}
          onSectionsChange={updateSections}
          onSectionSelect={selectSection}
          onSectionPartChange={updateActiveSection}
          onRailToggle={toggleRail}
          onMaterialChange={updateMaterial}
        />
        <ConstructorViewer
          activeStep={activeStep}
          project={projectWithPrice}
          onSectionSelect={selectSection}
          onSectionPartChange={updateActiveSection}
          onRailToggle={toggleRail}
          onClearSection={clearActiveSection}
        />
        <ConstructorSummary project={projectWithPrice} summary={summary} warnings={warnings} onCheckout={() => setCheckoutOpen(true)} />
      </section>

      <CheckoutDrawer open={checkoutOpen} project={projectWithPrice} summary={summary} onClose={() => setCheckoutOpen(false)} />
    </main>
  )
}
