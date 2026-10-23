import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RequirementCard from '../components/RequirementCard.jsx'
import ChatAssistant from '../components/ChatAssistant.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getGoals, getRequirementsByGoal } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Props: none. Requirements come from helpers.js.
function Checklist() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const goalId = searchParams.get('goal')
  const numericGoalId = goalId === null ? null : Number(goalId)
  const requirements = Number.isInteger(numericGoalId)
    ? getRequirementsByGoal(numericGoalId)
    : []
  const goal = getGoals().find((item) => item.id === numericGoalId)

  return (
    <section className="page-content" aria-labelledby="checklist-title">
      <p className="eyebrow">{goal?.title ?? 'Checklist'}</p>
      <h1 id="checklist-title">{t('page.checklist')}</h1>
      <p className="page-description">
        These are the documents you need, in order.
      </p>
      {requirements.length > 0 ? (
        <>
          <p className="sample-notice">
            Sample content, to be verified against official sources.
            Requirements, order, and dates are illustrative.
          </p>
          <ChecklistView
            key={goalId}
            initialRequirements={requirements}
          />
        </>
      ) : (
        <EmptyState message={t('checklist.noRequirements')} />
      )}
      <ChatAssistant key={goalId} />
    </section>
  )
}

function ChecklistView({ initialRequirements }) {
  const { t } = useLanguage()
  const [items, setItems] = useState(() =>
    initialRequirements.map((req) => ({ ...req, status: 'pending' })),
  )
  const total = items.length
  const completed = items.filter((item) => item.status === 'done').length

  const handleToggle = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'done' ? 'pending' : 'done',
            }
          : item,
      ),
    )
  }

  return (
    <>
      <div className="checklist-progress">
        <p className="checklist-progress-label" aria-live="polite">
          {completed} of {total} completed
        </p>
        <progress
          aria-label={t('a11y.requirementsCompleted')}
          value={completed}
          max={total}
        />
      </div>
      <ol className="sprint-grid generated-plan" aria-label={t('a11y.requirements')}>
        {items.map((item, index) => (
          <li key={item.id}>
            <p className="plan-step-number">Step {index + 1}</p>
            <RequirementCard
              label={item.label}
              notes={item.notes}
              copies={item.copies}
              validityMonths={item.validityMonths}
              sourceUrl={item.sourceUrl}
              lastVerified={item.lastVerified}
              isDone={item.status === 'done'}
              onToggle={() => handleToggle(item.id)}
            />
            {item.requirement && <RecordMeta record={item.requirement} />}
          </li>
        ))}
      </ol>
    </>
  )
}

export default Checklist
