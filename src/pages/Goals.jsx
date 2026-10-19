import { Link } from 'react-router-dom'
import GoalCard from '../components/GoalCard.jsx'
import { getGoals } from '../data/helpers.js'

// Props: none. Goal data comes from helpers.js.
function Goals() {
  const goals = getGoals()
  return (
    <section className="page-content flow-content" aria-labelledby="goals-title">
      <p className="eyebrow">Choose a goal</p>
      <h1 id="goals-title">Goals</h1>
      <p className="page-description">
        Choose what you want to accomplish. We'll show the documents you need,
        in order.
      </p>
      <ul className="goal-grid" aria-label="Available goals">
        {goals.map((goal) => (
          <li key={goal.id}>
            <Link className="goal-card-link" to={'/checklist?goal=' + goal.id}>
              <GoalCard
                title={goal.title}
                description={goal.description}
                stepsCount={goal.stepsCount}
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Goals
