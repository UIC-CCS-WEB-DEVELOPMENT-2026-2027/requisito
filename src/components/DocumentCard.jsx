import './SprintCards.css'
import { formatDate } from '../utils/formatDate.js'

function DocumentCard({ type, issueDate, status }) {
  const normalizedStatus = status.toLowerCase()
  const statusLabels = {
    valid: 'Valid',
    expiring: 'Expiring soon',
    'expiring soon': 'Expiring soon',
    expired: 'Expired',
  }
  const statusLabel = statusLabels[normalizedStatus] ?? status
  const statusClass = normalizedStatus.replace(/\s+/g, '-')

  return (
    <article className="sprint-card document-card">
      <h2>{type}</h2>
      <p>
        Issued:{' '}
        <time dateTime={issueDate}>{formatDate(issueDate)}</time>
      </p>
      <span className={`status-badge status-${statusClass}`}>
        {statusLabel}
      </span>
    </article>
  )
}

export default DocumentCard
