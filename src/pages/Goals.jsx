import GoalCard from '../components/GoalCard.jsx'
import { goals } from '../data/goals.js'

function Goals() {
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
            <GoalCard
              id={goal.id}
              title={goal.title}
              description={goal.description}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Goals
