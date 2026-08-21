import CortexScene from './CortexScene.jsx'
import Reveal from './Reveal.jsx'
import ConceptSwitcher from './ConceptSwitcher.jsx'
import { FaAws } from 'react-icons/fa6'
import {
  SiAnthropic,
  SiDatabricks,
  SiDeepseek,
  SiGoogle,
  SiGooglecloud,
  SiHuggingface,
  SiLanggraph,
  SiMeta,
  SiMistralai,
  SiMoonshotai,
  SiPytorch,
  SiQwen,
  SiSnowflake,
} from 'react-icons/si'
import { VscAzure } from 'react-icons/vsc'

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

const SOLUTIONS = [
  ['01', 'chat', 'Conversational AI', 'Customer-service chatbots and voice assistants that answer, resolve and escalate requests around the clock.'],
  ['02', 'search', 'Knowledge systems', 'Enterprise search and RAG that surface trusted answers from documents, systems and organisational knowledge.'],
  ['03', 'document', 'Document intelligence', 'Document extraction, generation, translation and transcription that turn unstructured inputs into finished work.'],
  ['04', 'workflow', 'Agent workflows', 'Connected AI agents that coordinate complex, multi-step operational work across teams and tools.'],
]

const TECHNOLOGIES = [
  {
    label: 'Cloud',
    items: [
      ['AWS', FaAws],
      ['Google Cloud', SiGooglecloud],
      ['Azure', VscAzure],
    ],
  },
  {
    label: 'AI providers',
    items: [
      ['OpenAI', null, 'OA'],
      ['Anthropic', SiAnthropic],
      ['Google', SiGoogle],
      ['Mistral AI', SiMistralai],
    ],
  },
  {
    label: 'Open models',
    items: [
      ['Kimi', SiMoonshotai],
      ['Qwen', SiQwen],
      ['DeepSeek', SiDeepseek],
      ['Llama', SiMeta],
    ],
  },
  {
    label: 'AI & data platforms',
    items: [
      ['LangGraph', SiLanggraph],
      ['Hugging Face', SiHuggingface],
      ['Databricks', SiDatabricks],
      ['Snowflake', SiSnowflake],
      ['PyTorch', SiPytorch],
      ['MCP', null, 'MCP'],
    ],
  },
]

function SolutionVisual({ type }) {
  if (type === 'chat') {
    return (
      <div className="cortex-demo cortex-demo--chat" aria-hidden="true">
        <div className="cortex-demo__topline"><span /> Support assistant <i /></div>
        <div className="cortex-chat__message cortex-chat__message--user">Can I change my delivery address?</div>
        <div className="cortex-chat__message cortex-chat__message--assistant">Yes — I found your open order. Where should we send it?</div>
        <div className="cortex-chat__typing"><span /><span /><span /></div>
      </div>
    )
  }

  if (type === 'search') {
    return (
      <div className="cortex-demo cortex-demo--search" aria-hidden="true">
        <div className="cortex-search__bar"><span>⌕</span> What changed in the supplier policy?</div>
        <div className="cortex-search__result cortex-search__result--one"><i>01</i><span /><span /></div>
        <div className="cortex-search__result cortex-search__result--two"><i>02</i><span /><span /></div>
        <div className="cortex-search__source">3 trusted sources connected</div>
      </div>
    )
  }

  if (type === 'document') {
    return (
      <div className="cortex-demo cortex-demo--document" aria-hidden="true">
        <div className="cortex-document__sheet">
          <b>INVOICE</b><span /><span /><span className="is-read" /><span /><span className="is-read" />
        </div>
        <div className="cortex-document__data">
          <p>Supplier <strong>Northstar Ltd</strong></p>
          <p>Total <strong>£8,420.00</strong></p>
          <p>Status <strong>Ready to approve</strong></p>
        </div>
        <i className="cortex-document__scan" />
      </div>
    )
  }

  return (
    <div className="cortex-demo cortex-demo--workflow" aria-hidden="true">
      <div className="cortex-workflow__node cortex-workflow__node--input">Intake</div>
      <div className="cortex-workflow__node cortex-workflow__node--analyse">Analyse</div>
      <div className="cortex-workflow__node cortex-workflow__node--act">Act</div>
      <div className="cortex-workflow__node cortex-workflow__node--review">Review</div>
      <span className="cortex-workflow__line cortex-workflow__line--one" />
      <span className="cortex-workflow__line cortex-workflow__line--two" />
      <span className="cortex-workflow__line cortex-workflow__line--three" />
      <i className="cortex-workflow__pulse cortex-workflow__pulse--one" />
      <i className="cortex-workflow__pulse cortex-workflow__pulse--two" />
    </div>
  )
}

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
              <p className="cortex-eyebrow">Solutions</p>
            </Reveal>
            <Reveal delay={120}>
              <h2>
                See the work
                <br />
                moving itself forward.
              </h2>
            </Reveal>
          </div>
          <div className="cortex-solution-grid">
            {SOLUTIONS.map(([number, type, title, body], index) => (
              <Reveal as="article" key={number} delay={index * 90} className="cortex-solution">
                <SolutionVisual type={type} />
                <div className="cortex-solution__copy">
                  <p className="cortex-solution__number">{number}</p>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="cortex-ecosystem">
          <div className="cortex-ecosystem__intro">
            <Reveal>
              <p className="cortex-eyebrow">Technology ecosystem</p>
            </Reveal>
            <Reveal delay={120}>
              <h2>Built on the right<br />technology for the work.</h2>
            </Reveal>
            <Reveal delay={220}>
              <p>Cloud, model and data platforms selected for performance, security and fit — never because one stack is fashionable.</p>
            </Reveal>
          </div>
          <div className="cortex-orbits">
            {TECHNOLOGIES.map(({ label, items }, groupIndex) => (
              <Reveal as="article" key={label} delay={groupIndex * 90} className="cortex-orbit">
                <div className="cortex-orbit__stage">
                  <div
                    className="cortex-orbit__track"
                    style={{ '--orbit-duration': `${20 + groupIndex * 4}s` }}
                  >
                    {items.map(([name, Icon, fallback], index) => (
                      <div
                        className="cortex-orbit__technology"
                        key={name}
                        style={{ '--orbit-index': index, '--orbit-total': items.length }}
                        aria-label={name}
                        title={name}
                      >
                        {Icon ? <Icon aria-hidden="true" /> : <span aria-hidden="true">{fallback}</span>}
                      </div>
                    ))}
                  </div>
                  <p>{label}</p>
                </div>
                <ul>
                  {items.map(([name]) => <li key={name}>{name}</li>)}
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
