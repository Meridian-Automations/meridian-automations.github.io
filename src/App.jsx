import { lazy, Suspense, useState } from 'react'
import DotField from './components/DotField.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Capabilities from './components/Capabilities.jsx'
import Work from './components/Work.jsx'
import Statement from './components/Statement.jsx'
import Contact from './components/Contact.jsx'

const PrecisionPage = lazy(() => import('./components/PrecisionPage.jsx'))
const CortexPage = lazy(() => import('./components/CortexPage.jsx'))

export default function App() {
  const [concept, setConcept] = useState('cortex')

  if (concept === 'precision') {
    return (
      <Suspense fallback={<div className="precision-loading">Loading concept…</div>}>
        <PrecisionPage onSelectConcept={setConcept} />
      </Suspense>
    )
  }

  if (concept === 'cortex') {
    return (
      <Suspense fallback={<div className="cortex-loading">Loading concept…</div>}>
        <CortexPage onSelectConcept={setConcept} />
      </Suspense>
    )
  }

  return (
    <>
      <DotField />
      <div className="site">
        <Nav onSelectConcept={setConcept} />
        <main>
          <Hero />
          <Capabilities />
          <Work />
          <Statement />
          <Contact />
        </main>
      </div>
    </>
  )
}
