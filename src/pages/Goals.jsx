import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { goals } from '../data/goalFlow.js'

function Goals({ selectedGoalId, onSelectGoal }) {
  const [showSelectionError, setShowSelectionError] = useState(false)
  const navigate = useNavigate()

  function continueToQuestions() {
    if (!selectedGoalId) {
      setShowSelectionError(true)
      return
    }

    setShowSelectionError(false)
    navigate('/questions')
  }

  return (
    <section className="page-content flow-content" aria-labelledby="goals-title">
      <p className="eyebrow">Step 1 · Choose a goal</p>
      <h1 id="goals-title">What would you like to achieve?</h1>
      <p className="page-description">
        Choose one goal to shape a short set of questions and a practical plan
        that fits what matters to you.
      </p>

      <div className="goal-grid" role="group" aria-label="Available goals">
        {goals.map((goal, index) => {
          const selected = selectedGoalId === goal.id
          return (
            <button
              key={goal.id}
              aria-pressed={selected}
              className={`goal-card${selected ? ' is-selected' : ''}`}
              onClick={() => {
                onSelectGoal(goal.id)
                setShowSelectionError(false)
              }}
              type="button"
            >
              <span className="goal-card-topline">
                <span className="goal-number">0{index + 1}</span>
                <span aria-hidden="true" className="selection-indicator">
                  {selected ? '✓' : ''}
                </span>
              </span>
              <span className="goal-card-title">{goal.title}</span>
              <span className="goal-card-description">{goal.description}</span>
            </button>
          )
        })}
      </div>

      <div className="flow-actions">
        <p
          aria-live="polite"
          className="form-message"
          role={showSelectionError ? 'alert' : undefined}
        >
          {showSelectionError
            ? 'Choose a goal before continuing.'
            : selectedGoalId
              ? 'You can change your choice at any time.'
              : 'Select one goal to get started.'}
        </p>
        <button
          className="primary-button"
          onClick={continueToQuestions}
          type="button"
        >
          Continue <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  )
}

export default Goals
