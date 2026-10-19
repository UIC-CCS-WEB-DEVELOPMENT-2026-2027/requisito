function SummaryCard({ title, value, description }) {
  return (
    <article className="summary-card">
      <h3>{title}</h3>
      <p className="summary-card-value">{value}</p>
      <p className="summary-card-description">{description}</p>
    </article>
  )
}

export default SummaryCard
