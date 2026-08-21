import Reveal from './Reveal.jsx'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <Reveal>
          <p className="micro-label">Independent technology studio</p>
        </Reveal>
        <Reveal delay={120}>
          <h1 className="hero__headline">
            We build intelligent systems
            <br />
            for complex problems.
          </h1>
        </Reveal>
        <Reveal delay={240}>
          <p className="hero__supporting">
            We design and engineer modern software, applied AI systems and
            digital products — from first principles to production.
          </p>
        </Reveal>
        <Reveal delay={360}>
          <div className="hero__actions">
            <a className="button button--primary" href="#capabilities">
              Explore our capabilities
            </a>
            <a className="text-link" href="#contact">
              Start a project
            </a>
          </div>
        </Reveal>
      </div>

      <div className="hero__scroll-hint" aria-hidden="true">
        <span className="hero__scroll-label">Scroll</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  )
}
