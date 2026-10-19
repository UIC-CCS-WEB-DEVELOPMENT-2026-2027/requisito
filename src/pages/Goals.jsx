import { Link } from 'react-router-dom'
import GoalCard from '../components/GoalCard.jsx'
import { getGoals } from '../data/helpers.js'

// Props: none. Goal data comes from helpers.js.
function Goals() {
  const goals = getGoals()
  return (
    <section className="page-content" aria-labelledby="goals-title">
      <p className="eyebrow">Preparation goals</p>
      <h1 id="goals-title">Choose your next step.</h1>
      <p className="page-description">Start with First Job and explore its sample requirements.</p>
      <div className="sprint-grid">
        {goals.map((goal) => (
          <Link className="goal-card-link" to="/checklist" key={goal.id}>
            <GoalCard title={goal.title} description={goal.description} stepsCount={goal.stepsCount} />
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Goals
