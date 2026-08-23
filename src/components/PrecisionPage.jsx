import { useState } from 'react'
import PrecisionScene from './PrecisionScene.jsx'
import Reveal from './Reveal.jsx'
import ConceptSwitcher from './ConceptSwitcher.jsx'

const SPECIFICATIONS = [
  ['01', 'Model the system'],
  ['02', 'Find the signal'],
  ['03', 'Build the answer'],
]

const PROJECTS = [
  ['01', 'Northline', 'Intelligent operations', 'A decision surface for teams managing thousands of interdependent daily choices.'],
  ['02', 'Signal / One', 'Applied AI', 'A model evaluation system built to turn ambiguous output into accountable action.'],
  ['03', 'Lattice', 'Optimisation', 'A planning engine that makes complex resource allocation calm, visible and adjustable.'],
]

export default function PrecisionPage({ onSelectConcept }) {
  const [appearance, setAppearance] = useState('light')
  const isDark = appearance === 'dark'

  return (
    <div className={`precision-page precision-page--${appearance}`}>
      <header className="precision-nav">
        <ConceptSwitcher variant="light" onSelectConcept={onSelectConcept} />
        <p className="precision-nav__note">Concept 02 / Precision field</p>
        <div className="precision-nav__actions">
          <div className="precision-theme-toggle" role="group" aria-label="Precision appearance">
            <button
              type="button"
              className={!isDark ? 'is-active' : undefined}
              aria-pressed={!isDark}
              onClick={() => setAppearance('light')}
            >
              Light
            </button>
            <button
              type="button"
              className={isDark ? 'is-active' : undefined}
              aria-pressed={isDark}
              onClick={() => setAppearance('dark')}
            >
              Dark
            </button>
          </div>
          <a className="precision-nav__contact" href="mailto:hello@example.com">
            Start a conversation <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <main>
        <section className="precision-hero">
          <div className="precision-hero__copy">
            <Reveal>
              <p className="precision-eyebrow">Independent technology studio</p>
            </Reveal>
            <Reveal delay={100}>
              <h1>
                Complexity,
                <br />
                made <em>legible.</em>
              </h1>
            </Reveal>
            <Reveal delay={220}>
              <p className="precision-hero__lede">
                We design intelligent software and AI systems with a bias toward
                clarity, restraint and measurable precision.
              </p>
            </Reveal>
            <Reveal delay={340}>
              <a href="#approach" className="precision-button">
                Our approach <span aria-hidden="true">↓</span>
              </a>
            </Reveal>
          </div>
          <Reveal delay={160} className="precision-hero__visual">
            <PrecisionScene appearance={appearance} />
          </Reveal>
          <p className="precision-hero__index">01 — 03</p>
        </section>

        <section className="precision-approach" id="approach">
          <div className="precision-approach__intro">
            <Reveal>
              <p className="precision-eyebrow">The practice</p>
            </Reveal>
            <Reveal delay={120}>
              <h2>
                Exacting thought,
                <br />
                applied to real work.
              </h2>
            </Reveal>
          </div>
          <ol className="precision-steps">
            {SPECIFICATIONS.map(([number, title], index) => (
              <Reveal as="li" key={number} delay={index * 100} className="precision-step">
                <span>{number}</span>
                <h3>{title}</h3>
                <p>
                  We reduce ambiguity with rigorous analysis, then make the
                  work useful through engineering and considered product
                  decisions.
                </p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="precision-work">
          <Reveal>
            <p className="precision-eyebrow">Selected signals</p>
          </Reveal>
          <Reveal delay={100}>
            <h2>Systems with an edge<br />in the real world.</h2>
          </Reveal>
          <div className="precision-projects">
            {PROJECTS.map(([number, name, discipline, outcome], index) => (
              <Reveal as="article" key={number} delay={index * 90} className="precision-project">
                <p className="precision-project__number">{number}</p>
                <h3>{name}</h3>
                <p className="precision-project__discipline">{discipline}</p>
                <p className="precision-project__outcome">{outcome}</p>
                <span className="precision-project__arrow" aria-hidden="true">↗</span>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="precision-statement">
          <Reveal>
            <p className="precision-eyebrow">Company</p>
          </Reveal>
          <Reveal delay={120}>
            <p>
              We use mathematical thought, engineering discipline and product
              judgement to make difficult systems <em>work clearly.</em>
            </p>
          </Reveal>
        </section>

        <section className="precision-contact">
          <Reveal>
            <p className="precision-eyebrow">Contact</p>
          </Reveal>
          <Reveal delay={100}>
            <h2>Bring us the part<br />that will not yield.</h2>
          </Reveal>
          <Reveal delay={200}>
            <a className="precision-contact__link" href="mailto:hello@example.com">
              hello@example.com <span aria-hidden="true">↗</span>
            </a>
          </Reveal>
          <footer className="precision-footer">
            <span>Reimagine Labs / Concept 02</span>
            <span>London · Remote</span>
            <button type="button" onClick={() => onSelectConcept('atlas')}>View Atlas concept</button>
          </footer>
        </section>
      </main>
    </div>
  )
}
