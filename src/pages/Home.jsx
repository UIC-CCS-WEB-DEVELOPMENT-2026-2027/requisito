import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SummaryCard from '../components/SummaryCard.jsx'
import { getGoalBySlug, getSummaryCounts } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

// Props: none. Dashboard records come only from helpers.js.
function Home() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const counts = getSummaryCounts()
  const firstJobGoal = getGoalBySlug('first-job')
  const overviewCards = [
    { title: t('home.totalRecords'), value: counts.total, description: t('home.totalRecordsDescription') },
    { title: t('home.barangayRecords'), value: counts.collections.barangays, description: t('home.barangayRecordsDescription') },
    { title: t('home.unverifiedRecords'), value: counts.unverified, description: t('home.unverifiedRecordsDescription') },
  ]
  const resourceCards = [
    { id: 'services', to: href('services'), label: 'nav.services' },
    { id: 'barangays', to: href('barangays'), label: 'nav.barangays' },
    { id: 'districts', to: href('districts'), label: 'nav.districts' },
    { id: 'officials', to: href('officials'), label: 'nav.officials' },
    { id: 'budget', to: href('budget'), label: 'nav.budget' },
    { id: 'updates', to: href('updates'), label: 'nav.updates' },
    { id: 'live', to: href('live'), label: 'feature.live.title' },
  ]

  function submitSearch(event) {
    event.preventDefault()
    const normalized = query.trim().slice(0, 100)
    if (!normalized) return
    navigate(href('search', {}, { q: normalized }))
  }

  return (
    <section className="page-content" aria-labelledby="home-title">
      <section className="home-hero" aria-labelledby="home-title">
        <p className="eyebrow">{t('home.welcome')}</p>
        <h1 id="home-title">{t('page.home')}</h1>
        <p className="page-description">{t('home.description')}</p>
        <form className="home-search-form" role="search" onSubmit={submitSearch}>
          <label className="visually-hidden" htmlFor="home-search">{t('label.globalSearch')}</label>
          <input
            id="home-search"
            type="search"
            maxLength={100}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('home.searchPlaceholder')}
          />
          <button type="submit">{t('button.search')}</button>
        </form>
        <div className="home-hero-actions">
          <Link className="return-link" to={href('goals')}>
            {t('home.chooseGoal')} <span aria-hidden="true">→</span>
          </Link>
          <Link className="return-link" to={href('services')}>{t('nav.services')}</Link>
        </div>
      </section>

      {firstJobGoal && (
        <section className="featured-goal guidance-card" aria-labelledby="featured-first-job">
          <h2 id="featured-first-job">{t('home.firstJobTitle')}</h2>
          <p>{t('home.firstJobDescription')}</p>
          <Link to={href('goalDetail', { slug: firstJobGoal.slug })}>{t('goals.viewRequirements')}</Link>
        </section>
      )}

      <section className="home-resource-section" aria-labelledby="home-resources-title">
        <h2 id="home-resources-title">{t('home.resourcesTitle')}</h2>
        <p>{t('home.resourcesDescription')}</p>
        <ul className="home-resource-grid">
          {resourceCards.map(({ id, to, label }) => (
            <li key={id}>
              <Link className="portal-card home-resource-card" to={to}>
                <h3>{t(label)}</h3>
                <span>{t('home.openResource')} <span aria-hidden="true">→</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="overview-section" aria-labelledby="overview-title">
        <h2 id="overview-title">{t('home.overview')}</h2>
        <div className="summary-card-grid">
          {overviewCards.map((card) => (
            <SummaryCard
              key={card.title}
              title={card.title}
              value={card.value}
              description={card.description}
            />
          ))}
        </div>
      </section>
    </section>
  )
}

export default Home
