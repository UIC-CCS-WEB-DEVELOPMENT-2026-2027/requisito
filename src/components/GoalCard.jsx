import { Link } from 'react-router-dom'

function GoalCard({ id, title, description }) {
  return (
    <Link className="goal-card" to={`/checklist?goal=${id}`}>
      <h2 className="goal-card-title">{title}</h2>
      <p className="goal-card-description">{description}</p>
    </Link>
  )
}

export default GoalCard
