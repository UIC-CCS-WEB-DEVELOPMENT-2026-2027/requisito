import StatusBadge from './StatusBadge.jsx'
import './SprintCards.css'

function RequirementCard({ label, notes, copies, sourceUrl, lastVerified }) {
  return (
    <article className="sprint-card requirement-card">
      <h2>{label}</h2>
      <p>{notes}</p>
      <p className="card-detail">
        {copies === 1 ? 'Copy' : 'Copies'} needed: {copies}
      </p>
      <StatusBadge lastVerified={lastVerified} />
      {sourceUrl && (
        <a
          className="source-link"
          href={sourceUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Where to get it
        </a>
      )}
    </article>
  )
}

export default RequirementCard
