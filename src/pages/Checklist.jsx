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
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const total = items.length
  const completed = items.filter((item) => item.status === 'done').length
  const query = searchText.trim().toLowerCase()
  const visibleItems = items.filter((item) => {
    const matchesSearch = item.label.toLowerCase().includes(query)
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'done' && item.status === 'done') ||
      (statusFilter === 'unverified' && item.status === 'pending')

    return matchesSearch && matchesStatus
  })

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
      <div className="goal-search checklist-search" role="search">
        <label htmlFor="checklist-search">{t('label.searchChecklist')}</label>
        <input
          id="checklist-search"
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder={t('label.searchChecklist')}
          autoComplete="off"
        />
        <label htmlFor="checklist-status">{t('label.checklistStatus')}</label>
        <select
          id="checklist-status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">{t('checklist.filterAll')}</option>
          <option value="unverified">{t('checklist.filterUnverified')}</option>
          <option value="done">{t('checklist.filterDone')}</option>
        </select>
      </div>
      {visibleItems.length > 0 ? (
        <ol className="sprint-grid generated-plan" aria-label={t('a11y.requirements')}>
          {visibleItems.map((item) => (
            <li key={item.id}>
              <p className="plan-step-number">Step {items.indexOf(item) + 1}</p>
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
      ) : (
        <EmptyState message={t('checklist.noMatches')} />
      )}
    </>
  )
}

export default Checklist
