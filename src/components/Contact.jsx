import Reveal from './Reveal.jsx'

export default function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="section__inner">
        <Reveal>
          <p className="micro-label">Contact</p>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="contact__heading">
            Have a difficult problem
            <br />
            worth solving?
          </h2>
        </Reveal>
        <Reveal delay={240}>
          <div className="contact__actions">
            <a className="button button--primary" href="mailto:hello@example.com">
              hello@example.com
            </a>
            <span className="contact__hint">We reply within two working days.</span>
          </div>
        </Reveal>
      </div>

      <footer className="footer">
        <div className="footer__inner">
          <p className="footer__item footer__wordmark">Meridian</p>
          <p className="footer__item">London · Remote</p>
          <a className="footer__item footer__link" href="mailto:hello@example.com">
            hello@example.com
          </a>
          <nav className="footer__social" aria-label="Social links">
            <a className="footer__link" href="https://github.com" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="footer__link" href="https://linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="footer__link" href="https://x.com" target="_blank" rel="noreferrer">
              X
            </a>
          </nav>
          <p className="footer__item footer__copyright">© 2026 Meridian. Placeholder identity.</p>
        </div>
      </footer>
    </section>
  )
}
