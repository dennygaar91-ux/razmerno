import Header from '../components/Header/Header'
import ConstructorRail from '../components/constructor/ConstructorRail'
import ConstructorConfig from '../components/constructor/ConstructorConfig'
import ConstructorViewer from '../components/constructor/ConstructorViewer'
import ConstructorSummary from '../components/constructor/ConstructorSummary'
import ConstructorBenefits from '../components/constructor/ConstructorBenefits'
import './ConstructorPage.css'
import './ConstructorPageHeader.css'

export default function ConstructorPage() {
  return (
    <>
      <Header />
      <main className="rp-ctor-page">
        <section className="rp-ctor-shell" aria-label="Конструктор шкафа">
          <ConstructorRail />
          <ConstructorConfig />
          <ConstructorViewer />
          <ConstructorSummary />
        </section>
        <ConstructorBenefits />
      </main>
    </>
  )
}
