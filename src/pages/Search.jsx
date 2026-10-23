import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import HighlightedText from '../components/HighlightedText.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { searchAll } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const groupKeys = {
  services: 'group.services',
  barangays: 'group.barangays',
  requirements: 'group.requirements',
  updates: 'group.updates',
  history: 'nav.history',
  briefs: 'nav.briefs',
  budget: 'nav.budget',
  procurement: 'nav.procurement',
  elections: 'nav.elections',
  accountability: 'nav.accountability',
  districts: 'nav.districts',
}

function recordLink(type, record) {
  if (type === 'services') return `/services/${record.slug}`
  if (type === 'barangays') return `/barangays/${record.slug}`
  if (type === 'districts') return `/districts/${encodeURIComponent(record.slug)}`
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
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [draft, setDraft] = useState(null)
  const input = draft?.query === query ? draft.value : query
  const selectedType = searchParams.get('type') ?? ''
  const groups = searchAll(query)
  const resultCount = Object.values(groups).reduce((total, items) => total + items.length, 0)
  const typeNames = Object.keys(groups)
  const visibleGroups = Object.entries(groups).filter(([type, records]) =>
    records.length && (!selectedType || selectedType === type),
  )
  const visibleCount = visibleGroups.reduce((total, [, records]) => total + records.length, 0)

  useEffect(() => {
    document.title = `${t('page.search')} | Requisito`
  }, [t])

  function submit(event) {
    event.preventDefault()
    const next = new URLSearchParams(searchParams)
    const normalized = input.trim().slice(0, 100)
    if (normalized) next.set('q', normalized)
    else next.delete('q')
    next.delete('type')
    setDraft(null)
    setSearchParams(next)
  }

  function updateType(type) {
    const next = new URLSearchParams(searchParams)
    if (type) next.set('type', type)
    else next.delete('type')
    setSearchParams(next, { replace: true })
  }

  return (
    <section className="page-content flow-content" aria-labelledby="search-title">
      <p className="eyebrow">{t('search.eyebrow')}</p>
      <h1 id="search-title">{t('page.search')}</h1>
      <p className="page-description">{t('search.description')}</p>
      <form className="portal-search-form" onSubmit={submit}>
        <label htmlFor="portal-search">{t('label.globalSearch')}</label>
        <input id="portal-search" name="q" type="search" maxLength={100} value={input} onChange={(event) => setDraft({ query, value: event.target.value })} />
        <button type="submit">{t('button.search')}</button>
      </form>
      {query && (
        <div className="search-filters">
          <label htmlFor="search-type">{t('search.filterType')}</label>
          <select id="search-type" value={selectedType} onChange={(event) => updateType(event.target.value)}>
            <option value="">{t('search.allTypes').replace('{count}', resultCount)}</option>
            {typeNames.filter((type) => groups[type].length > 0).map((type) => (
              <option key={type} value={type}>{t(groupKeys[type])} ({groups[type].length})</option>
            ))}
          </select>
          <p aria-live="polite">{t('search.resultsFound').replace('{count}', visibleCount)}</p>
        </div>
      )}
      {!query && <p>{t('search.enterQuery')}</p>}
      {query && visibleCount === 0 && (
        <>
          <EmptyState message={t('search.noResults').replace('{query}', query)} />
          <p>{t('search.suggestions')}</p>
          <ul>
            <li><Link to="/services">{t('nav.services')}</Link></li>
            <li><Link to="/barangays">{t('nav.barangays')}</Link></li>
            {selectedType && <li><button type="button" onClick={() => updateType('')}>{t('search.clearType')}</button></li>}
          </ul>
        </>
      )}
      {visibleGroups.map(([type, records]) => (
        <section className="search-group" key={type} aria-labelledby={`search-${type}`}>
          <h2 id={`search-${type}`}>{t(groupKeys[type])} <span>({records.length})</span></h2>
          <ul className="portal-grid">
            {records.map((record) => (
              <li className="portal-card" key={`${type}-${record.id}`}>
                <h3><Link to={recordLink(type, record)}><HighlightedText text={record.title ?? record.label} query={query} /></Link></h3>
                <p><HighlightedText text={record.description ?? record.notes ?? ''} query={query} /></p>
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
