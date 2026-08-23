import Reveal from './Reveal.jsx'

/* Placeholder projects — replace each entry with a real case study. */
const PROJECTS = [
  {
    index: '01',
    name: 'Tidemark',
    discipline: 'Applied AI',
    year: '2025',
    outcome:
      'Demand forecasting platform that reduced planning cycles from weeks to hours for a national logistics operator.',
  },
  {
    index: '02',
    name: 'Atlas Routing Engine',
    discipline: 'Data & optimisation',
    year: '2024',
    outcome:
      'Constraint-based routing core cutting fleet distance by double digits while honouring every service-level guarantee.',
  },
  {
    index: '03',
    name: 'Corvus',
    discipline: 'Intelligent software',
    year: '2024',
    outcome:
      'Decision-support system for underwriting teams, pairing statistical models with an interface built for judgement.',
  },
  {
    index: '04',
    name: 'Reimagine Bench',
    discipline: 'Digital product engineering',
    year: '2023',
    outcome:
      'Internal experiment: an evaluation workbench for language-model pipelines, open-sourced after twelve months of daily use.',
  },
]

export default function Work() {
  return (
    <section className="section work" id="work">
      <div className="section__inner">
        <Reveal>
          <p className="micro-label">
            Selected work <span className="micro-label__note">— placeholder studies, to be replaced</span>
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="section__heading">
            Quiet systems doing
            <br />
            consequential work.
          </h2>
        </Reveal>

        <ul className="work__list">
          {PROJECTS.map((project, i) => (
            <Reveal as="li" key={project.index} delay={i * 60} className="project">
              <a className="project__row" href="#contact" aria-label={`${project.name} — placeholder case study`}>
                <span className="project__index">{project.index}</span>
                <span className="project__name">{project.name}</span>
                <span className="project__outcome">{project.outcome}</span>
                <span className="project__meta">
                  <span className="project__discipline">{project.discipline}</span>
                  <span className="project__year">{project.year}</span>
                </span>
                <span className="project__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
