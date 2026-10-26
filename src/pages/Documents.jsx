import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getDocuments } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

// Guide entries are derived from the canonical requirement definitions.
function Documents() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const documents = getDocuments().filter((guide) =>
    `${guide.label} ${guide.description} ${guide.category} ${guide.notes}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  )
  return (
    <section className="page-content" aria-labelledby="documents-title">
      <p className="eyebrow">{t('documents.eyebrow')}</p>
      <h1 id="documents-title">{t('page.documents')}</h1>
      <p className="page-description">
        {t('documents.description')}
      </p>
      <div className="goal-search" role="search">
        <label htmlFor="document-search">{t('documents.searchGuides')}</label>
        <input id="document-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      {documents.length ? <ul className="guidance-list" aria-label={t('a11y.documents')}>
        {documents.map((document) => (
          <li className="guidance-card" key={document.id}>
            <h2><Link to={href('documentGuide', { slug: document.slug })}>{document.label}</Link></h2>
            <p>{document.description}</p>
            <p className="requirement-kind">{t(`requirement.kind.${document.requirementType}`)}</p>
            {!document.demoOnly && <p>{t(`record.${document.verification}`)}</p>}
          </li>
        ))}
      </ul> : <p className="empty-state">{t('documents.noGuidesFound')}</p>}
    </section>
  )
}

export default Documents
