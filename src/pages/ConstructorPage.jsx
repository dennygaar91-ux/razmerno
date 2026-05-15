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
  price: 15447,
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
    setProject(current => ({
      ...current,
      dimensions: {
        ...current.dimensions,
        [key]: Math.max(0, current.dimensions[key] + delta),
      },
    }))
  }

  function updateSections(delta) {
    setProject(current => {
      const nextCount = Math.min(6, Math.max(1, current.sections + delta))
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
        return {
          ...section,
          [part]: Math.max(0, section[part] + delta),
        }
      })

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
          <button type="button"><Icon name="x" size={16} />Очистить</button>
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
          project={project}
          summary={summary}
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
          project={project}
          onSectionSelect={selectSection}
          onSectionPartChange={updateActiveSection}
          onRailToggle={toggleRail}
        />
        <ConstructorSummary project={project} summary={summary} onCheckout={() => setCheckoutOpen(true)} />
      </section>

      <CheckoutDrawer open={checkoutOpen} project={project} summary={summary} onClose={() => setCheckoutOpen(false)} />
    </main>
  )
}
