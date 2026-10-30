import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SummaryCard from '../components/SummaryCard.jsx'
import Icon from '../components/Icon.jsx'
import { getGoalBySlug, getGoals, getServices, getSummaryCounts } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

// Props: none. Dashboard records come only from helpers.js.
function Home() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const counts = getSummaryCounts()
  const firstJobGoal = getGoalBySlug('first-job')
  const searchSuggestions = [...new Set([
    ...getServices().map((service) => service.title),
    ...getGoals().map((goal) => goal.title),
  ])].slice(0, 16)
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
    <section className="page-content home-page" aria-labelledby="home-title">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <p className="eyebrow">{t('home.welcome')}</p>
            <h1 id="home-title">{t('page.home')}</h1>
            <p className="page-description">{t('home.description')}</p>
            <div className="home-hero-actions">
              <Link className="return-link" to={href('goals')}>
                {t('home.chooseGoal')} <Icon name="arrow" />
              </Link>
              <Link className="return-link hero-secondary" to={href('services')}>{t('nav.services')}</Link>
            </div>
          </div>
          <div className="home-search-card">
            <h2><Icon name="search" />{t('home.findService')}</h2>
            <p>{t('home.searchHelp')}</p>
            <form className="home-search-form" role="search" onSubmit={submitSearch}>
              <label className="visually-hidden" htmlFor="home-search">{t('label.globalSearch')}</label>
              <input
                id="home-search"
                type="search"
                list="home-search-suggestions"
                maxLength={100}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('home.searchPlaceholder')}
              />
              <datalist id="home-search-suggestions">
                {searchSuggestions.map((suggestion) => <option key={suggestion} value={suggestion} />)}
              </datalist>
              <button type="submit" aria-label={t('button.search')}><Icon name="arrow" /></button>
            </form>
            <div className="home-search-shortcuts">
              <span>{t('home.startWith')}</span>
              {getGoals().slice(0, 3).map((goal) => <Link key={goal.id} to={href('goalDetail', { slug: goal.slug })}>{goal.title}</Link>)}
            </div>
          </div>
        </div>
      </section>

      <div className="home-body">
        {firstJobGoal && (
          <section className="featured-goal guidance-card" aria-labelledby="featured-first-job">
            <span className="resource-icon"><Icon name="checklist" /></span>
            <div>
              <h2 id="featured-first-job">{t('home.firstJobTitle')}</h2>
              <p>{t('home.firstJobDescription')}</p>
            </div>
            <Link to={href('goalDetail', { slug: firstJobGoal.slug })}>{t('goals.viewRequirements')} <Icon name="arrow" /></Link>
          </section>
        )}

        <section className="home-resource-section" aria-labelledby="home-resources-title">
          <div className="section-heading">
            <h2 id="home-resources-title">{t('home.resourcesTitle')}</h2>
            <Link to={href('sitemap')}>{t('home.viewAll')} <Icon name="arrow" /></Link>
          </div>
          <p>{t('home.resourcesDescription')}</p>
          <ul className="home-resource-grid">
            {resourceCards.map(({ id, to, label }) => (
              <li key={id}>
                <Link className="portal-card home-resource-card" to={to}>
                  <span className="resource-icon"><Icon name={id} /></span>
                  <div>
                    <h3>{t(label)}</h3>
                    <span>{t(`home.resource.${id}`)}</span>
                  </div>
                  <Icon name="arrow" className="resource-arrow" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="overview-section" aria-labelledby="overview-title">
          <div className="section-heading">
            <h2 id="overview-title">{t('home.overview')}</h2>
            <Link to={href('status')}>{t('nav.sources')} <Icon name="arrow" /></Link>
          </div>
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
      </div>
    </section>
  )
}

export default Home
