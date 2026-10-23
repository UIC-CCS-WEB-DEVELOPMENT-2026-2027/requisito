import { useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { searchAll } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const groupTitles = {
  services: 'Services and hotlines',
  barangays: 'Barangays',
  requirements: 'Requirements',
  updates: 'Updates',
  history: 'History',
  briefs: 'Civic briefs',
  budget: 'Budget',
  procurement: 'Procurement',
  elections: 'Elections',
  accountability: 'Accountability records',
}

function recordLink(type, record) {
  if (type === 'services') return `/services/${record.slug}`
  if (type === 'barangays') return `/barangays/${record.slug}`
  if (type === 'requirements') return `/checklist?goal=${record.goalId}`
  if (type === 'history') return '/history'
  if (type === 'briefs') return '/briefs'
  if (type === 'budget') return '/budget'
  if (type === 'procurement') return '/procurement'
  if (type === 'elections') return '/elections'
  if (type === 'accountability') return '/accountability'
  return '/updates'
}

function Search() {
  const { t } = useLanguage()
  const [input, setInput] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [didSubmit, setDidSubmit] = useState(false)
  const groups = searchAll(submittedQuery)
  const resultCount = Object.values(groups).reduce((total, items) => total + items.length, 0)

  function handleSubmit(event) {
    event.preventDefault()
    const query = input.trim().slice(0, 100)
    setInput(query)
    setSubmittedQuery(query)
    setDidSubmit(Boolean(query))
  }

  return (
    <section className="page-content flow-content" aria-labelledby="search-title">
      <p className="eyebrow">Find information</p>
      <h1 id="search-title">{t('page.search')}</h1>
      <p className="page-description">Search services, barangays, requirements, city updates, history, civic briefs, budget and procurement records.</p>
      <form className="portal-search-form" onSubmit={handleSubmit}>
        <label htmlFor="portal-search">{t('label.globalSearch')}</label>
        <input id="portal-search" type="search" maxLength={100} value={input} onChange={(event) => setInput(event.target.value)} />
        <button type="submit">{t('button.search')}</button>
      </form>
      <p aria-live="polite" className="search-announcement">
        {didSubmit ? `${resultCount} records found.` : 'Enter a search term to see results.'}
      </p>
      {didSubmit && resultCount === 0 && <EmptyState message={t('form.noRecords')} />}
      {didSubmit && resultCount > 0 && Object.entries(groups).map(([type, records]) => records.length > 0 && (
        <section className="search-group" key={type} aria-labelledby={`search-${type}`}>
          <h2 id={`search-${type}`}>{groupTitles[type]} <span>({records.length})</span></h2>
          <ul className="portal-grid">
            {records.map((record) => (
              <li className="portal-card" key={`${type}-${record.id}`}>
                <h3><Link to={recordLink(type, record)}>{record.title ?? record.label}</Link></h3>
                <p>{record.description ?? record.notes}</p>
                <RecordMeta record={record} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  )
}

export default Search
