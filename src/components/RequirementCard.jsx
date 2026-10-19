import { useId } from 'react'
import StatusBadge from './StatusBadge.jsx'
import './SprintCards.css'

// Props: label, notes, copies, sourceUrl, lastVerified, isDone, onToggle.
function RequirementCard({
  label,
  notes,
  copies,
  sourceUrl,
  lastVerified,
  isDone = false,
  onToggle,
}) {
  const checkboxId = useId()

  return (
    <article
      className={`sprint-card requirement-card${isDone ? ' is-done' : ''}`}
    >
      <h2 className="requirement-card-title">{label}</h2>
      <p>{notes}</p>
      <p className="card-detail">
        {copies === 1 ? 'Copy' : 'Copies'} needed: {copies}
      </p>
      {onToggle && (
        <div className="requirement-toggle">
          <input
            id={checkboxId}
            type="checkbox"
            checked={isDone}
            onChange={onToggle}
          />
          <label htmlFor={checkboxId}>Mark “{label}” as done</label>
          <span className="requirement-status">
            {isDone ? 'Done' : 'Not done'}
          </span>
        </div>
      )}
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
