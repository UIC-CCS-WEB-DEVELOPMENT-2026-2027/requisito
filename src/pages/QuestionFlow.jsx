import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGoal } from '../data/goalFlow.js'

function QuestionFlow({ goalId, answers, onAnswersChange, onComplete }) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [showAnswerError, setShowAnswerError] = useState(false)
  const navigate = useNavigate()
  const goal = getGoal(goalId)

  if (!goal) {
    return null
  }

  const question = goal.questions[questionIndex]
  const progress = ((questionIndex + 1) / goal.questions.length) * 100
  const isLastQuestion = questionIndex === goal.questions.length - 1

  function goForward() {
    if (!answers[questionIndex]) {
      setShowAnswerError(true)
      return
    }

    setShowAnswerError(false)
    if (isLastQuestion) {
      onComplete()
      navigate('/checklist')
      return
    }

    setQuestionIndex((currentIndex) => currentIndex + 1)
  }

  function goBack() {
    setShowAnswerError(false)
    if (questionIndex === 0) {
      navigate('/goals')
      return
    }

    setQuestionIndex((currentIndex) => currentIndex - 1)
  }

  return (
    <section
      className="page-content flow-content question-content"
      aria-labelledby="question-title"
    >
      <p className="eyebrow">Step 2 · A little more about your goal</p>
      <h1 id="question-title">{goal.title}</h1>
      <div
        aria-label={`Question ${questionIndex + 1} of ${goal.questions.length}`}
        className="question-progress"
      >
        <div className="question-progress-label">
          <span>Question {questionIndex + 1} of {goal.questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <progress
          aria-label="Questionnaire progress"
          max="100"
          value={progress}
        />
      </div>

      <fieldset className="question-fieldset">
        <legend>{question.text}</legend>
        <div className="answer-list">
          {question.options.map((option) => (
            <label
              className={`answer-option${answers[questionIndex] === option ? ' is-selected' : ''}`}
              key={option}
            >
              <input
                checked={answers[questionIndex] === option}
                name={`question-${questionIndex}`}
                onChange={() => {
                  onAnswersChange((currentAnswers) => ({
                    ...currentAnswers,
                    [questionIndex]: option,
                  }))
                  setShowAnswerError(false)
                }}
                type="radio"
                value={option}
              />
              <span className="radio-mark" aria-hidden="true" />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flow-actions question-actions">
        <p
          aria-live="polite"
          className="form-message"
          role={showAnswerError ? 'alert' : undefined}
        >
          {showAnswerError
            ? 'Select an answer before continuing.'
            : 'Your answers help shape a manageable action plan.'}
        </p>
        <div className="button-group">
          <button className="secondary-button" onClick={goBack} type="button">
            ← Back
          </button>
          <button className="primary-button" onClick={goForward} type="button">
            {isLastQuestion ? 'Generate checklist' : 'Next'}
            {!isLastQuestion && <span aria-hidden="true"> →</span>}
          </button>
        </div>
      </div>
    </section>
  )
}

export default QuestionFlow
