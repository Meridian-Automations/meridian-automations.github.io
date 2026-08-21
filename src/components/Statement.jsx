import Reveal from './Reveal.jsx'

export default function Statement() {
  return (
    <section className="section statement" id="company">
      <div className="section__inner">
        <Reveal>
          <p className="micro-label">Company</p>
        </Reveal>
        <Reveal delay={120}>
          <p className="statement__text">
            We combine <em>mathematical thinking</em>, disciplined engineering
            and considered product design — because the hardest problems yield
            to all three at once, and rarely to any one alone.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <p className="statement__footnote">
            A small team, deliberately. We take on a limited number of
            engagements each year and stay close to every line of work.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
