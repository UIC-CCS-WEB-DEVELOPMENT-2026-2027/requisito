import { Link } from 'react-router-dom'
import SummaryCard from '../components/SummaryCard.jsx'

// Static placeholders until real user data exists.
const overviewCards = [
  {
    title: 'Goals',
    value: 0,
    description: 'Active goals being tracked.',
  },
  {
    title: 'Requirements done',
    value: '0 of 0',
    description: 'Documents obtained so far.',
  },
  {
    title: 'Documents expiring',
    value: 0,
    description: 'Documents expiring soon.',
  },
]

function Home() {
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
