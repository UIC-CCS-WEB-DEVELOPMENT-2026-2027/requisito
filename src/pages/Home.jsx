import { Link } from 'react-router-dom'
import SummaryCard from '../components/SummaryCard.jsx'
import { getSummaryCounts } from '../data/helpers.js'

// Props: none. Dashboard records come only from helpers.js.
function Home() {
  const counts = getSummaryCounts()
  const overviewCards = [
    { title: 'Goals', value: counts.goals, description: 'Available goals, including placeholder goals.' },
    { title: 'Requirements done', value: counts.requirementsDone, description: 'Completed requirements in the sample data.' },
    { title: 'Documents expiring', value: counts.documentsExpiring, description: 'Fictional documents marked as expiring.' },
  ]
  return (
    <section className="page-content" aria-labelledby="home-title">
      <p className="eyebrow">Welcome to Requisito</p>
      <h1 id="home-title">Make room for what matters.</h1>
      <p className="page-description">
        Find out which documents you need for a goal and the order to get them
        in.
      </p>
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
