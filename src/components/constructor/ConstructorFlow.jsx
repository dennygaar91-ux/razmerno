function getStepComplete(stepId, project, summary) {
  if (stepId === 'dimensions') {
    return Boolean(
      project?.dimensions?.height > 0 &&
      project?.dimensions?.width > 0 &&
      project?.dimensions?.depth > 0 &&
      project?.sections > 0,
    )
  }

  if (stepId === 'filling') {
    return (summary?.elements ?? 0) > 0
  }

  if (stepId === 'materials') {
    return Boolean(
      project?.material?.materialId &&
      project?.material?.edgeId &&
      project?.material?.handleId &&
      project?.material?.hardwareId,
    )
  }

  return false
}

export default function ConstructorFlow({ steps, activeStep, project, summary, onStepChange }) {
  return (
    <section className="rp-ctor-flow" aria-label="Шаги настройки шкафа">
      {steps.map((step) => {
        const isActive = activeStep === step.id
        const isComplete = getStepComplete(step.id, project, summary)
        const className = [
          isActive ? 'is-active' : '',
          isComplete ? 'is-complete' : '',
        ].filter(Boolean).join(' ')

        return (
          <button
            type="button"
            className={className}
            key={step.id}
            onClick={() => onStepChange(step.id)}
            aria-current={isActive ? 'step' : undefined}
          >
            <span>{step.num}</span>
            <div>
              <p>{step.title}</p>
              <small>{isComplete ? 'Готово' : step.text}</small>
            </div>
          </button>
        )
      })}
    </section>
  )
}
