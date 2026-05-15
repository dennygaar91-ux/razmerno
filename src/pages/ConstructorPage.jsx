import { useState } from 'react'
import Header from '../components/Header/Header'
import ConstructorConfig from '../components/constructor/ConstructorConfig'
import ConstructorViewer from '../components/constructor/ConstructorViewer'
import ConstructorSummary from '../components/constructor/ConstructorSummary'
import ConstructorBenefits from '../components/constructor/ConstructorBenefits'
import CheckoutDrawer from '../components/constructor/CheckoutDrawer'
import './ConstructorPage.css'
import './ConstructorPageHeader.css'
import './ConstructorWizard.css'

export default function ConstructorPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  return (
    <>
      <Header />
      <main className="rp-ctor-page">
        <section className="rp-ctor-shell rp-ctor-shell--no-rail" aria-label="Конструктор шкафа">
          <ConstructorConfig onCheckout={() => setCheckoutOpen(true)} />
          <ConstructorViewer />
          <ConstructorSummary onCheckout={() => setCheckoutOpen(true)} />
        </section>
        <ConstructorBenefits />
      </main>
      <CheckoutDrawer open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  )
}
