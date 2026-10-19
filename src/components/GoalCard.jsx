import './SprintCards.css'

// Props: title, description, stepsCount.
function GoalCard({ title, description, stepsCount }) {
  return (
    <article className="sprint-card">
      <h2>{title}</h2>
      <p>{description}</p>
      <p className="card-detail">{stepsCount} steps</p>
    </article>
  )
}

export default GoalCard
