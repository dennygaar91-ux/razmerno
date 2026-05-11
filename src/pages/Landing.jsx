import { useEffect } from 'react'
import Header            from '../components/Header/Header'
import Footer            from '../components/Footer/Footer'
import Hero              from '../components/sections/Hero/Hero'
import TrustBar          from '../components/sections/TrustBar/TrustBar'
import Value             from '../components/sections/Value/Value'
import UseCases          from '../components/sections/UseCases/UseCases'
import HowItWorks        from '../components/sections/HowItWorks/HowItWorks'
import Measure           from '../components/sections/Measure/Measure'
import Cases             from '../components/sections/Cases/Cases'
import Materials         from '../components/sections/Materials/Materials'
import ConstructorTeaser from '../components/sections/ConstructorTeaser/ConstructorTeaser'
import Box               from '../components/sections/Box/Box'
import Assembly          from '../components/sections/Assembly/Assembly'
import FearFaq           from '../components/sections/FearFaq/FearFaq'
import FinalCta          from '../components/sections/FinalCta/FinalCta'
import useScrollReveal   from '../hooks/useScrollReveal'
import { Link }          from 'react-router-dom'
import Icon              from '../icons/Icon'

export default function Landing() {
  useScrollReveal()

  // Сброс скролла при навигации
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Value />
        <UseCases />
        <HowItWorks />
        <Measure />
        <Cases />
        <Materials />
        <ConstructorTeaser />
        <Box />
        <Assembly />
        <FearFaq />
        <FinalCta />
      </main>
      <Footer />

      {/* Sticky mobile CTA */}
      <div className="stick">
        <Link to="/constructor" className="btn btn-cta">
          Открыть конструктор
          <Icon name="arrow-right" className="arr" size={14} />
        </Link>
      </div>
    </>
  )
}
