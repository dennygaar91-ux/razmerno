import Header from '../components/Header/Header'
import ConstructorConfig from '../components/constructor/ConstructorConfig'
import ConstructorViewer from '../components/constructor/ConstructorViewer'
import ConstructorSummary from '../components/constructor/ConstructorSummary'
import ConstructorBenefits from '../components/constructor/ConstructorBenefits'
import './ConstructorPage.css'
import './ConstructorPageHeader.css'
import './ConstructorPageNoRail.css'

export default function ConstructorPage() {
  return (
    <>
      <Header />
      <main className="rp-ctor-page">
        <section className="rp-ctor-shell rp-ctor-shell--no-rail" aria-label="Конструктор шкафа">
          <ConstructorConfig />
          <ConstructorViewer />
          <ConstructorSummary />
        </section>
        <ConstructorBenefits />
      </main>
    </>
  )
}
