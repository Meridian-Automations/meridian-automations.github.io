import Reveal from './Reveal.jsx'

const CAPABILITIES = [
  {
    index: '01',
    title: 'Intelligent software',
    description:
      'Systems that reason about their domain — software designed around the structure of the problem, not the shape of a framework. Built to remain legible and dependable as they grow.',
  },
  {
    index: '02',
    title: 'Applied AI',
    description:
      'Machine learning where it earns its place. We take models from research into production with the evaluation, guardrails and observability that real decisions demand.',
  },
  {
    index: '03',
    title: 'Data & optimisation',
    description:
      'Forecasting, scheduling, routing and allocation. We translate operational constraints into mathematics, and mathematics into measurable outcomes.',
  },
  {
    index: '04',
    title: 'Digital product engineering',
    description:
      'Interfaces and infrastructure built with equal care. Fast, precise products whose craft is felt in the details rather than announced by them.',
  },
]

export default function Capabilities() {
  return (
    <section className="section capabilities" id="capabilities">
      <div className="section__inner">
        <Reveal>
          <p className="micro-label">Capabilities</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="section__heading">
            Four disciplines,
            <br />
            one standard of rigour.
          </h2>
        </Reveal>

        <div className="capabilities__list">
          {CAPABILITIES.map((capability, i) => (
            <Reveal
              as="article"
              key={capability.index}
              delay={i * 80}
              className="capability"
            >
              <span className="capability__index">{capability.index}</span>
              <h3 className="capability__title">{capability.title}</h3>
              <p className="capability__description">{capability.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
