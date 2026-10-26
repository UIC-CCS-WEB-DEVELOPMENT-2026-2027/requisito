import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import HighlightedText from '../components/HighlightedText.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { searchAll } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

const groupKeys = {
  goals: 'group.goals',
  services: 'group.services',
  barangays: 'group.barangays',
  requirements: 'group.requirements',
  sources: 'group.sources',
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
  if (type === 'goals') return href('goalDetail', { slug: record.slug })
  if (type === 'services') return href('serviceDetail', { slug: record.slug })
  if (type === 'barangays') return href('barangayProfile', { slug: record.slug })
  if (type === 'districts') return href('districtProfile', { name: record.slug })
  if (type === 'requirements') return href('documentGuide', { slug: record.slug })
  if (type === 'history') return href('history')
  if (type === 'briefs') return href('briefs')
  if (type === 'budget') return href('budget')
  if (type === 'procurement') return href('procurement')
  if (type === 'elections') return href('elections')
  if (type === 'accountability') return href('accountability')
  return href('updates')
}

function safeSourceUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}

function safeMetadataRecord(record) {
  return {
    ...record,
    sourceUrl: safeSourceUrl(record.sourceUrl) ?? '',
    relatedSources: Array.isArray(record.relatedSources)
      ? record.relatedSources.map(safeSourceUrl).filter(Boolean)
      : [],
  }
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
            <li><Link to={href('services')}>{t('nav.services')}</Link></li>
            <li><Link to={href('barangays')}>{t('nav.barangays')}</Link></li>
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
                <h3>
                  {type === 'sources' ? (
                    safeSourceUrl(record.sourceUrl) ? (
                      <a href={safeSourceUrl(record.sourceUrl)} target="_blank" rel="noopener noreferrer">
                        <HighlightedText text={record.title ?? record.label} query={query} />
                      </a>
                    ) : <HighlightedText text={record.title ?? record.label} query={query} />
                  ) : (
                    <Link to={recordLink(type, record)}><HighlightedText text={record.title ?? record.label} query={query} /></Link>
                  )}
                </h3>
                <p><HighlightedText text={record.description ?? record.notes ?? ''} query={query} /></p>
                {type === 'sources' && record.linkedRequirementSlugs.length > 0 && (
                  <p>
                    {record.linkedRequirementSlugs.map((slug, index) => (
                      <span key={slug}>
                        {index > 0 ? ', ' : ''}
                        <Link to={href('documentGuide', { slug })}>{t('search.relatedGuidance')}</Link>
                      </span>
                    ))}
                  </p>
                )}
                {type === 'requirements' && record.linkedSources?.length > 0 && (
                  <div>
                    <p>{t('search.relatedSources')}</p>
                    <ul>
                      {record.linkedSources.map((source) => {
                        const sourceUrl = safeSourceUrl(source.url)
                        const statusKey = {
                          verified: 'record.verified',
                          unverified: 'record.unverified',
                          conflicting: 'record.conflicting',
                        }[source.verification] ?? 'record.unverified'
                        return (
                          <li key={source.id}>
                            {sourceUrl ? (
                              <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                                {source.title}
                              </a>
                            ) : source.title}
                            {' — '}{t(statusKey)}; {t('goals.lastChecked')}:{' '}
                            {source.lastChecked
                              ? <time dateTime={source.lastChecked}>{source.lastChecked}</time>
                              : t('goals.lastCheckedUnavailable')}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
                {!record.demoOnly && !record.demoContent && (
                  <RecordMeta record={safeMetadataRecord(record)} />
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  )
}

export default Search
