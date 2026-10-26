import { Link } from 'react-router-dom'
import SummaryCard from '../components/SummaryCard.jsx'
import { getGoalBySlug, getSummaryCounts } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

// Props: none. Dashboard records come only from helpers.js.
function Home() {
  const { t } = useLanguage()
  const counts = getSummaryCounts()
  const firstJobGoal = getGoalBySlug('first-job')
  const overviewCards = [
    { title: t('home.totalRecords'), value: counts.total, description: t('home.totalRecordsDescription') },
    { title: t('home.barangayRecords'), value: counts.collections.barangays, description: t('home.barangayRecordsDescription') },
    { title: t('home.unverifiedRecords'), value: counts.unverified, description: t('home.unverifiedRecordsDescription') },
  ]
  return (
    <section className="page-content" aria-labelledby="home-title">
      <p className="eyebrow">{t('home.welcome')}</p>
      <h1 id="home-title">{t('page.home')}</h1>
      <p className="page-description">
        {t('home.description')}
      </p>
      <div className="home-portal-links">
        <Link className="return-link" to={href('services')}>{t('nav.services')}</Link>
        <Link className="return-link" to={href('barangays')}>{t('nav.barangays')}</Link>
        <Link className="return-link" to={href('search')}>{t('nav.search')}</Link>
      </div>
      <Link className="return-link" to={href('goals')}>
        {t('home.chooseGoal')} <span aria-hidden="true">→</span>
      </Link>
      {firstJobGoal && (
        <section className="featured-goal guidance-card" aria-labelledby="featured-first-job">
          <h2 id="featured-first-job">{t('home.firstJobTitle')}</h2>
          <p>{t('home.firstJobDescription')}</p>
          <Link to={href('goalDetail', { slug: firstJobGoal.slug })}>{t('goals.viewRequirements')}</Link>
        </section>
      )}

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
