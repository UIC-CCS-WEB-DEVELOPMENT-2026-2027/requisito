import { useState } from 'react'
import RequirementCard from '../components/RequirementCard.jsx'
import { getChecklistPlan, getPlanningQuestions } from '../data/helpers.js'

// Props: none. Questions and generated plan data come only from helpers.js.
function Checklist() {
  const [answers, setAnswers] = useState({})
  const questions = getPlanningQuestions()
  const plan = getChecklistPlan(1, answers)
  const done = plan.steps.filter((step) => step.requirement?.status === 'done').length
  return (
    <section className="page-content" aria-labelledby="checklist-title">
      <p className="eyebrow">First Job</p>
      <h1 id="checklist-title">Your preparation checklist</h1>
      <p className="sample-notice">Sample content, to be verified against official sources. Requirements, dependency order, and dates are illustrative. All content remains unverified; a sample Last verified date is not proof of review.</p>
      <div className="planning-questions">
        {questions.map((question) => (
          <div className="planning-field" key={question.id}>
            <label htmlFor={question.id}>{question.label}</label>
            <select id={question.id} value={answers[question.id] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}>
              {question.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        ))}
        <p>Your sample plan updates when you change an answer. Confirm actual requirements with your employer and the relevant agency.</p>
      </div>
      <div className="checklist-progress" role="status">
        <p>{plan.steps.length} ordered steps; {done} done (sample data)</p>
        <progress aria-label="Sample requirements completion" value={done} max={plan.steps.length || 1} />
      </div>
      {plan.warnings.length > 0 && (
        <div className="sample-notice" role="alert">
          <h2>Plan needs attention</h2>
          <ul>{plan.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
          {plan.unresolved.length > 0 && <p>Not ordered: {plan.unresolved.map((item) => item.title).join(', ')}. Confirm the plan before following it.</p>}
        </div>
      )}
      <ol className="sprint-grid generated-plan" aria-label="Ordered preparation steps">
        {plan.steps.map((step) => (
          <li key={step.id}>
            <p className="plan-step-number">Step {step.order}</p>
            {step.requirement ? (
              <RequirementCard label={step.requirement.label} notes={step.requirement.notes} copies={step.requirement.copies} sourceUrl={step.requirement.sourceUrl} lastVerified={step.requirement.lastVerified} />
            ) : (
              <article className="sprint-card"><h2>{step.title}</h2><p>Complete any one: {step.options.map((option) => option.title).join(', ')}</p></article>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Checklist
