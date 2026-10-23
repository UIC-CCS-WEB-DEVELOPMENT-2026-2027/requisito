import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getCityFacts } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function AboutDavao() {
  const { t } = useLanguage()
  const facts = getCityFacts()
  return (
    <section className="page-content flow-content" aria-labelledby="about-davao-title">
      <p className="eyebrow">City profile</p>
      <h1 id="about-davao-title">{t('page.about')}</h1>
      <p className="page-description">A short collection of city facts. Each item is unverified and should be checked at its source.</p>
      {facts.length ? (
        <ul className="portal-grid">
          {facts.map((fact) => (
            <li className="portal-card" key={fact.id}>
              <p className="eyebrow">{fact.category}</p>
              <h2>{fact.title}</h2>
              <p>{fact.description}</p>
              {fact.notes && <p className="sample-notice">{fact.notes}</p>}
              <RecordMeta record={fact} />
            </li>
          ))}
        </ul>
      ) : <EmptyState message="No city facts are available." />}
    </section>
  )
}

export default AboutDavao
