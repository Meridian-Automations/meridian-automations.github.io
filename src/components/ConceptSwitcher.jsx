const CONCEPTS = [
  { id: 'atlas', number: '01', name: 'Atlas', note: 'Dark / computational field' },
  { id: 'precision', number: '02', name: 'Precision', note: 'Light / dimensional form' },
  { id: 'cortex', number: '03', name: 'Cortex', note: 'Neural / automated flow' },
]

export default function ConceptSwitcher({ variant = 'dark', onSelectConcept }) {
  return (
    <div className={`concept-switcher concept-switcher--${variant}`}>
      <button className="concept-switcher__trigger" type="button" aria-label="Choose a site concept">
        Meridian <span aria-hidden="true">+</span>
      </button>
      <div className="concept-switcher__menu">
        <p>Choose a concept</p>
        {CONCEPTS.map((concept) => (
          <a
            key={concept.id}
            href={`#${concept.id}`}
            onClick={(event) => {
              event.preventDefault()
              onSelectConcept?.(concept.id)
            }}
          >
            <span>{concept.number}</span>
            <strong>{concept.name}</strong>
            <small>{concept.note}</small>
          </a>
        ))}
      </div>
    </div>
  )
}
