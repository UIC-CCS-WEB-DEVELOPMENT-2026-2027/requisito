import './SprintCards.css'

// Props: lastVerified (YYYY-MM-DD sample date).
function StatusBadge({ lastVerified }) {
  return <span className="status-badge">Last verified: {lastVerified}</span>
}

export default StatusBadge
