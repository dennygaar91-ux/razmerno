import { useMemo, useState } from 'react'
import ConstructorConfig from '../components/constructor/ConstructorConfig'
import ConstructorViewer from '../components/constructor/ConstructorViewer'
import ConstructorSummary from '../components/constructor/ConstructorSummary'
import CheckoutDrawer from '../components/constructor/CheckoutDrawer'
import Icon from '../icons/Icon'
import './ConstructorPage.css'
import './ConstructorWizard.css'
import './ConstructorReference.css'
import './ConstructorInteractive.css'

const FLOW_STEPS = [
  { id: 'dimensions', num: '1', title: 'Размеры', text: 'Укажите габариты и секции' },
  { id: 'filling', num: '2', title: 'Наполнение', text: 'Выберите полки, ящики и штанги' },
  { id: 'materials', num: '3', title: 'Материалы', text: 'Подберите декоры и фурнитуру' },
]

const DIMENSION_LIMITS = {
  height: { min: 200, max: 2800, step: 100 },
  width: { min: 400, max: 3000, step: 100 },
  depth: { min: 300, max: 800, step: 50 },
}

const initialProject = {
  dimensions: { height: 2400, width: 1800, depth: 600 },
  sections: 3,
  activeSection: 1,
  filling: [
    { shelves: 4, drawers: 2, rail: false },
    { shelves: 1, drawers: 0, rail: true },
    { shelves: 3, drawers: 0, rail: false },
  ],
  material: {
    body: 'ЛДСП Дуб Сонома',
    thickness: '16 мм',
    edge: 'ПВХ 2 мм',
    handles: 'С ручками',
  },
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function calculatePrice(project, summary) {
  const { height, width, depth } = project.dimensions
  const volumeFactor = (height * width * depth) / (2400 * 1800 * 600)
  const base = 11200 * volumeFactor
  const sections = project.sections * 620
  const shelves = summary.shelves * 420
  const drawers = summary.drawers * 1550
  const rails = summary.rails * 690
  const handleFactor = project.material.handles === 'Без ручек' ? 1450 : 0

  return Math.round((base + sections + shelves + drawers + rails + handleFactor) / 10) * 10
}

function getWarnings(project, summary) {
  const warnings = []
  const { height, width, depth } = project.dimensions

  if (depth < 520 && summary.rails > 0) {
    warnings.push('Для штанги рекомендуем глубину от 520 мм. Сейчас одежда может не помещаться по плечикам.')
  }

  if (height < 1200 && summary.shelves > 4) {
    warnings.push('При такой высоте слишком много полок: минимальный комфортный шаг между полками — около 200 мм.')
  }

  if (width / project.sections < 350) {
    warnings.push('Ширина секции меньше 350 мм. Лучше уменьшить количество секций или увеличить ширину шкафа.')
  }

  return warnings
}

export default function ConstructorPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [activeStep, setActiveStep] = useState('dimensions')
  const [project, setProject] = useState(initialProject)

  const activeStepIndex = FLOW_STEPS.findIndex(step => step.id === activeStep)

  const canGoBack = activeStepIndex > 0
  const canGoNext = activeStepIndex < FLOW_STEPS.length - 1

  const summary = useMemo(() => {
    const shelves = project.filling.reduce((total, section) => total + section.shelves, 0)
    const drawers = project.filling.reduce((total, section) => total + section.drawers, 0)
    const rails = project.filling.reduce((total, section) => total + (section.rail ? 1 : 0), 0)

    return {
      shelves,
      drawers,
      rails,
      elements: shelves + drawers + rails,
    }
  }, [project])

  const price = useMemo(() => calculatePrice(project, summary), [project, summary])
  const warnings = useMemo(() => getWarnings(project, summary), [project, summary])
  const projectWithPrice = useMemo(() => ({ ...project, price }), [project, price])

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
    setProject(current => ({
      ...current,
      material: { ...current.material, [field]: value },
    }))
  }

  function resetProject() {
    setProject(initialProject)
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
