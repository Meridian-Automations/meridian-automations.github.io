import CortexScene from './CortexScene.jsx'
import Reveal from './Reveal.jsx'
import ConceptSwitcher from './ConceptSwitcher.jsx'

const PIPELINE = [
  ['01', 'Observe the workflow', 'We sit inside the real process — every lookup, comparison and approval done by hand — and map the judgement behind each step.'],
  ['02', 'Encode the judgement', 'The decisions that matter are modelled explicitly, so the system can explain why it acted, not just that it did.'],
  ['03', 'Automate the routine', 'The repetitive path runs on its own. People keep the exceptions, with the full context already attached.'],
]

const PROJECTS = [
  ['01', 'Ledgerline', 'Procurement automation', 'Buyer workflows that took a morning of manual checks now clear in minutes, with every decision logged.'],
  ['02', 'Signal / One', 'Applied AI', 'A model evaluation system built to turn ambiguous output into accountable action.'],
  ['03', 'Relay', 'Operations copilots', 'An assistant that drafts the routine ninety percent, so specialists spend their attention on the ten that matters.'],
]

const CAPABILITIES = [
  [
    '01',
    'AI knowledge systems',
    'Grounded systems that make company knowledge useful, traceable and available at the moment a decision is made.',
    ['RAG', 'Enterprise search', 'Knowledge graphs', 'Document ingestion', 'Semantic search'],
  ],
  [
    '02',
    'AI agents & workflow automation',
    'Connected agents that act on information and automate multi-step operational work.',
    ['Agentic workflows', 'Multi-agent orchestration', 'LangGraph', 'MCP'],
  ],
  [
    '03',
    'Conversational AI & customer operations',
    'Assistants that resolve customer and employee requests, with thoughtful escalation when a person needs to take over.',
    ['Customer-service chatbots', 'Employee assistants', 'Voice assistants', 'Contact-centre automation'],
  ],
  [
    '04',
    'Document & language intelligence',
    'Systems that turn documents and spoken language into accurate, usable information and finished work.',
    ['Document generation', 'Document extraction', 'Classification', 'Translation', 'Transcription', 'Summarisation', 'Compliance checks'],
  ],
  [
    '05',
    'Model engineering & AI platforms',
    'Production-ready model stacks, selected and adapted for the work they need to do, then measured continuously.',
    ['Open-source deployment', 'Kimi', 'Qwen', 'DeepSeek', 'Fine-tuning', 'Model evaluation', 'AI observability'],
  ],
  [
    '06',
    'Cloud, data & machine learning',
    'Reliable data and cloud foundations that turn operational information into machine-learning products people can trust.',
    ['AWS', 'GCP', 'Azure', 'Data platforms', 'Data engineering', 'Data science', 'Machine learning', 'MLOps'],
  ],
]

export default function CortexPage({ onSelectConcept }) {
  return (
    <div className="cortex-page">
      <header className="cortex-nav">
        <ConceptSwitcher variant="cortex" onSelectConcept={onSelectConcept} />
        <p className="cortex-nav__note">Concept 03 / Cortex</p>
        <a className="cortex-nav__contact" href="mailto:hello@example.com">
          Start a conversation <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main>
        <section className="cortex-hero">
          <CortexScene />
          <div className="cortex-hero__copy">
            <Reveal>
              <p className="cortex-eyebrow">Independent technology studio</p>
            </Reveal>
            <Reveal delay={100}>
              <h1>
                Manual work,
                <br />
                learned — <em>then automated.</em>
              </h1>
            </Reveal>
            <Reveal delay={220}>
              <p className="cortex-hero__lede">
                We build AI systems that watch how the work is really done,
                encode the judgement behind it, and hand the routine to
                machines.
              </p>
            </Reveal>
            <Reveal delay={340}>
              <a href="#capabilities" className="cortex-button">
                Explore capabilities <span aria-hidden="true">↓</span>
              </a>
            </Reveal>
          </div>
          <p className="cortex-hero__legend">
            <span>Manual intake</span>
            <span>Learned judgement</span>
            <span>Automated output</span>
          </p>
        </section>

        <section className="cortex-pipeline" id="pipeline">
          <div className="cortex-pipeline__intro">
            <Reveal>
              <p className="cortex-eyebrow">The pipeline</p>
            </Reveal>
            <Reveal delay={120}>
              <h2>
                From repetition
                <br />
                to quiet automation.
              </h2>
            </Reveal>
          </div>
          <ol className="cortex-steps">
            {PIPELINE.map(([number, title, body], index) => (
              <Reveal as="li" key={number} delay={index * 100} className="cortex-step">
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="cortex-capabilities" id="capabilities">
          <div className="cortex-capabilities__intro">
            <Reveal>
              <p className="cortex-eyebrow">Capabilities</p>
            </Reveal>
            <Reveal delay={120}>
              <h2>
                Intelligence for the work
                <br />
                that cannot wait.
              </h2>
            </Reveal>
          </div>
          <div className="cortex-capability-grid">
            {CAPABILITIES.map(([number, title, body, services], index) => (
              <Reveal as="article" key={number} delay={index * 90} className="cortex-capability">
                <p className="cortex-capability__number">{number}</p>
                <h3>{title}</h3>
                <p className="cortex-capability__body">{body}</p>
                <ul className="cortex-capability__services">
                  {services.map((service) => <li key={service}>{service}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="cortex-work">
          <Reveal>
            <p className="cortex-eyebrow">Selected systems</p>
          </Reveal>
          <Reveal delay={100}>
            <h2>Work that used to be<br />someone&rsquo;s whole morning.</h2>
          </Reveal>
          <div className="cortex-projects">
            {PROJECTS.map(([number, name, discipline, outcome], index) => (
              <Reveal as="article" key={number} delay={index * 90} className="cortex-project">
                <p className="cortex-project__number">{number}</p>
                <h3>{name}</h3>
                <p className="cortex-project__discipline">{discipline}</p>
                <p className="cortex-project__outcome">{outcome}</p>
                <span className="cortex-project__arrow" aria-hidden="true">↗</span>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="cortex-statement">
          <Reveal>
            <p className="cortex-eyebrow">Company</p>
          </Reveal>
          <Reveal delay={120}>
            <p>
              The best automation is invisible: the work simply arrives done,
              <em> with the reasoning attached.</em>
            </p>
          </Reveal>
        </section>

        <section className="cortex-contact">
          <Reveal>
            <p className="cortex-eyebrow">Contact</p>
          </Reveal>
          <Reveal delay={100}>
            <h2>Show us the work<br />your team repeats.</h2>
          </Reveal>
          <Reveal delay={200}>
            <a className="cortex-contact__link" href="mailto:hello@example.com">
              hello@example.com <span aria-hidden="true">↗</span>
            </a>
          </Reveal>
          <footer className="cortex-footer">
            <span>Meridian / Concept 03</span>
            <span>London · Remote</span>
            <nav className="cortex-footer__concepts" aria-label="Other concepts">
              <button type="button" onClick={() => onSelectConcept('atlas')}>View Atlas</button>
              <button type="button" onClick={() => onSelectConcept('precision')}>View Precision</button>
            </nav>
          </footer>
        </section>
      </main>
    </div>
  )
}
