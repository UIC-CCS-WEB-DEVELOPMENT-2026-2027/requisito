import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'
import { requisitoQuizQuestions, scoreRequisitoQuiz } from '../utils/requisitoQuiz.js'

function Quiz() {
  const { t } = useLanguage()
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(null)
  const complete = requisitoQuizQuestions.every((question) => answers[question.id] !== undefined)

  function submitQuiz(event) {
    event.preventDefault()
    if (!complete) return
    setScore(scoreRequisitoQuiz(answers))
  }

  function restartQuiz() {
    setAnswers({})
    setScore(null)
  }

  return (
    <section className="page-content flow-content" aria-labelledby="quiz-title">
      <p className="eyebrow">{t('quiz.eyebrow')}</p>
      <h1 id="quiz-title">{t('quiz.title')}</h1>
      <p className="page-description">{t('quiz.description')}</p>
      {score === null ? (
        <form className="flow-content" onSubmit={submitQuiz}>
          {requisitoQuizQuestions.map((question, index) => (
            <fieldset className="portal-card" key={question.id}>
              <legend>{t('quiz.questionNumber').replace('{number}', String(index + 1))}: {t(question.prompt)}</legend>
              {question.options.map((optionKey, optionIndex) => (
                <label className="quiz-option" htmlFor={`quiz-${question.id}-${optionIndex}`} key={optionKey}>
                  <input
                    id={`quiz-${question.id}-${optionIndex}`}
                    type="radio"
                    name={question.id}
                    value={optionIndex}
                    required
                    checked={answers[question.id] === optionIndex}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                  />
                  {t(optionKey)}
                </label>
              ))}
            </fieldset>
          ))}
          <button className="primary-button" type="submit">{t('quiz.submit')}</button>
        </form>
      ) : (
        <section aria-labelledby="quiz-results-title">
          <div role="status">
            <h2 id="quiz-results-title">
              {t('quiz.score').replace('{score}', String(score)).replace('{total}', String(requisitoQuizQuestions.length))}
            </h2></div>
          </div>
          <ol className="flow-content">
            {requisitoQuizQuestions.map((question) => {
              const isCorrect = Number(answers[question.id]) === question.answer
              return (
                <li className="portal-card" key={question.id}>
                  <h3>{t(question.prompt)}</h3>
                  <p>{t(isCorrect ? 'quiz.correct' : 'quiz.review')}</p>
                  <p>{t(question.explanation)}</p>
                </li>
              )
            })}
          </ol>
          <button className="secondary-button" type="button" onClick={restartQuiz}>{t('quiz.retry')}</button>
          <p><Link to={href('goals')}>{t('home.chooseGoal')}</Link></p>
        </section>
      )}
    </section>
  )
}

export default Quiz
