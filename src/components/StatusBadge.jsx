import './SprintCards.css'
import { formatDate } from '../utils/formatDate.js'

function StatusBadge({ lastVerified }) {
  return (
    <span className="status-badge">
      {lastVerified ? (
        <>
          Last verified:{' '}
          <time dateTime={lastVerified}>{formatDate(lastVerified)}</time>
        </>
      ) : (
        'Not yet verified'
      )}
    </span>
  )
}

export default StatusBadge
