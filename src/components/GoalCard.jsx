// Props: title, description, stepsCount.
function GoalCard({ title, description, stepsCount }) {
  return (
    <article className="goal-card">
      <h2 className="goal-card-title">{title}</h2>
      <p className="goal-card-description">{description}</p>
      <p className="goal-card-description">{stepsCount > 0 ? stepsCount + ' sample steps' : 'Checklist content coming soon'}</p>
    </article>
  )
}

export default GoalCard
