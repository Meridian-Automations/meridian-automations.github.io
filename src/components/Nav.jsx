import { useEffect, useState } from 'react'
import ConceptSwitcher from './ConceptSwitcher.jsx'

const LINKS = [
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Work', href: '#work' },
  { label: 'Company', href: '#company' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav({ onSelectConcept }) {
  const [activeHref, setActiveHref] = useState(null)

  useEffect(() => {
    const sections = LINKS.map(({ href }) => document.querySelector(href)).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveHref(`#${visible[0].target.id}`)
      },
      // A narrow observation band aligns the active state with the part of
      // the page currently passing through the reader's attention.
      { rootMargin: '-38% 0px -52% 0px', threshold: [0, 0.1, 0.3] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <header className="nav">
      <div className="nav__inner">
        <ConceptSwitcher onSelectConcept={onSelectConcept} />
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.href}
              className={activeHref === link.href ? 'nav__link is-active' : 'nav__link'}
              href={link.href}
              aria-current={activeHref === link.href ? 'location' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a className="nav__cta" href="#contact">
          Start a conversation
        </a>
      </div>
    </header>
  )
}
