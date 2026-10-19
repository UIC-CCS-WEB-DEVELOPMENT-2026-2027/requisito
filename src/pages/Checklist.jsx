import { useNavigate } from 'react-router-dom'
import { getGoal } from '../data/goalFlow.js'

function Checklist({
  goalId,
  answers,
  completedTasks,
  onCompletedTasksChange,
  onStartOver,
}) {
  const navigate = useNavigate()
  const goal = getGoal(goalId)

  if (!goal) {
    return null
  }

  const completedCount = goal.checklist.filter(
    (_, index) => completedTasks[index],
  ).length
  const progress = (completedCount / goal.checklist.length) * 100

  return (
    <section className="page-content flow-content" aria-labelledby="checklist-title">
      <p className="eyebrow">Step 3 · Your action plan</p>
      <h1 id="checklist-title">Your Action Plan</h1>
      <p className="page-description">
        A few manageable next steps to help you work toward{' '}
        <strong>{goal.title.toLowerCase()}</strong>.
      </p>

      {answers[0] && (
        <p className="plan-focus">
          Your focus: <strong>{answers[0]}</strong>
        </p>
      )}

      <div className="checklist-progress">
        <div className="checklist-progress-label">
          <span>Plan progress</span>
          <span>
            {completedCount} of {goal.checklist.length} complete
          </span>
        </div>
        <progress
          aria-label="Checklist completion progress"
          max="100"
          value={progress}
        />
      </div>

      <ul className="checklist-items">
        {goal.checklist.map((task, index) => {
          const isComplete = Boolean(completedTasks[index])
          return (
            <li
              className={`checklist-item${isComplete ? ' is-complete' : ''}`}
              key={task}
            >
              <label>
                <input
                  checked={isComplete}
                  onChange={(event) =>
                    onCompletedTasksChange((currentTasks) => ({
                      ...currentTasks,
                      [index]: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                <span>{task}</span>
              </label>
            </li>
          )
        })}
      </ul>

      <div className="flow-actions checklist-actions">
        <p className="form-message">
          {completedCount === goal.checklist.length
            ? 'Everything is checked off. Nice work!'
            : 'Small steps count. You can update your progress anytime.'}
        </p>
        <div className="button-group">
          <button
            className="secondary-button"
            onClick={() => navigate('/questions')}
            type="button"
          >
            Review answers
          </button>
          <button
            className="primary-button"
            onClick={() => {
              onStartOver()
              navigate('/goals')
            }}
            type="button"
          >
            Start again
          </button>
        </div>
      </div>
    </section>
  )
}

export default Checklist
