import { Link } from 'react-router-dom'
import SummaryCard from '../components/SummaryCard.jsx'
import { getSummaryCounts } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Props: none. Dashboard records come only from helpers.js.
function Home() {
  const { t } = useLanguage()
  const counts = getSummaryCounts()
  const overviewCards = [
    { title: 'Goals', value: counts.goals, description: 'Available goals, including placeholder goals.' },
    { title: 'Requirements done', value: counts.requirementsDone, description: 'Completed requirements in the sample data.' },
    { title: 'Documents expiring', value: counts.documentsExpiring, description: 'Fictional documents marked as expiring.' },
  ]
  return (
    <section className="page-content" aria-labelledby="home-title">
      <p className="eyebrow">Welcome to Requisito</p>
      <h1 id="home-title">{t('page.home')}</h1>
      <p className="page-description">
        Find Davao City services, contacts, barangay information, and source status.
      </p>
      <div className="home-portal-links">
        <Link className="return-link" to="/services">{t('nav.services')}</Link>
        <Link className="return-link" to="/barangays">{t('nav.barangays')}</Link>
        <Link className="return-link" to="/search">{t('nav.search')}</Link>
      </div>
      <Link className="return-link" to="/goals">
        Choose a goal <span aria-hidden="true">→</span>
      </Link>

      <section className="overview-section" aria-labelledby="overview-title">
        <h2 id="overview-title">Overview</h2>
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
