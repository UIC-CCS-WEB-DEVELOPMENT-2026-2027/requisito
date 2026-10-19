import { Link } from 'react-router-dom'
import SummaryCard from '../components/SummaryCard.jsx'
import { getSummaryCounts } from '../data/helpers.js'

// Props: none. Summary data comes from helpers.js.
function Home() {
  const counts = getSummaryCounts()
  return (
    <section className="page-content" aria-labelledby="home-title">
      <p className="eyebrow">Welcome to Requisito</p>
      <h1 id="home-title">Your first job, one step at a time.</h1>
      <p className="page-description">Explore a sample preparation checklist and document tracker.</p>
      <div className="summary-grid">
        <SummaryCard title="Goals" value={counts.goals} description="Available preparation goals" />
        <SummaryCard title="Requirements done" value={counts.requirementsDone} description="Completed requirements in the sample data" />
        <SummaryCard title="Documents expiring" value={counts.documentsExpiring} description="Sample documents marked as expiring" />
      </div>
      <Link className="return-link" to="/goals">Explore goals</Link>
    </section>
  )
}

export default Home
