import StatusBadge from './StatusBadge.jsx'
import './SprintCards.css'

// Props: label, notes, copies, sourceUrl, lastVerified.
function RequirementCard({ label, notes, copies, sourceUrl, lastVerified }) {
  return (
    <article className="sprint-card">
      <h2>{label}</h2>
      <p>{notes}</p>
      <p className="card-detail">Copies: {copies}</p>
      <StatusBadge lastVerified={lastVerified} />
      {sourceUrl !== '' && <a className="source-link" href={sourceUrl}>Official source</a>}
    </article>
  )
}

export default RequirementCard
