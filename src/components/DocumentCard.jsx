import './SprintCards.css'

// Props: type, issueDate (YYYY-MM-DD), status (valid or expiring).
function DocumentCard({ type, issueDate, status }) {
  return (
    <article className="sprint-card">
      <h2>{type}</h2>
      <p>Issue date: <time dateTime={issueDate}>{issueDate}</time></p>
      <span className={status === 'expiring' ? 'status-badge status-expiring' : 'status-badge'}>
        {status === 'expiring' ? 'Expiring' : 'Valid'}
      </span>
    </article>
  )
}

export default DocumentCard
