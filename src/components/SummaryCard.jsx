import './SprintCards.css'

// Props: title, value, description.
function SummaryCard({ title, value, description }) {
  return (
    <article className="sprint-card summary-card">
      <h2>{title}</h2>
      <p className="summary-value">{value}</p>
      <p>{description}</p>
    </article>
  )
}

export default SummaryCard
