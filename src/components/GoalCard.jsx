// Props: title, description, stepsCount.
function GoalCard({ title, description, stepsCount }) {
  return (
    <article className="goal-card">
      <h2 className="goal-card-title">{title}</h2>
      <p className="goal-card-description">{description}</p>
      <p className="goal-card-steps-count">
        {stepsCount} {stepsCount === 1 ? 'step' : 'steps'}
      </p>
    </article>
  )
}

export default GoalCard
