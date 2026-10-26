import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RequirementCard from '../components/RequirementCard.jsx'
import ChatAssistant from '../components/ChatAssistant.jsx'
import { getChecklistPlan, getGoals, getPlanningQuestions, getRequirementsByGoal } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'
import { getGoalProgressSummary, readChecklistProgress, reconcileChecklistProgress, writeChecklistProgress } from '../utils/checklistProgress.js'
import { assessChecklistReadiness } from '../utils/readinessAssessment.js'

const EMPTY_ANSWERS = Object.freeze({})

function ChecklistOverview() {
  const { t } = useLanguage()
  const goals = getGoals().filter((goal) => !goal.isSample)

  return (
    <section className="page-content" aria-labelledby="checklist-overview-title">
      <p className="eyebrow">{t('page.checklist')}</p>
      <h1 id="checklist-overview-title">{t('page.checklist')}</h1>
      <p className="page-description">{t('checklist.dashboardDescription')}</p>
      <ul className="goal-grid" aria-label={t('checklist.goalOverview')}>
        {goals.map((goal) => {
          const summary = getGoalProgressSummary(goal.id)
          const goalTitle = goal.titleKey ? t(goal.titleKey) : goal.title
          const statusKey = !summary.available
            ? 'unavailable'
            : summary.status === 'completed'
              ? 'completed'
              : summary.status === 'in-progress'
                ? 'in-progress'
                : 'not-started'
          const statusText = t(`checklist.status.${statusKey}`)
          const actionText = !summary.available
            ? t('goals.viewChecklistStatus')
            : summary.status === 'completed'
              ? t('goals.continueChecklist')
              : t('goals.viewChecklist')
          const goalHref = href('checklist', {}, { goal: goal.id })
          const goalDetailHref = href('goalDetail', { slug: goal.slug })

          return (
            <li key={goal.id}>
              <article className="goal-card">
                <h2 className="goal-card-title">{goalTitle}</h2>
                <p className="goal-card-category">{goal.categoryKey ? t(goal.categoryKey) : goal.category}</p>
                <p className="goal-card-description">{goal.descriptionKey ? t(goal.descriptionKey) : goal.description}</p>
                <p className="goal-card-steps-count">
                  {summary.available
                    ? `${summary.completed} / ${summary.total} ${t('goals.requirementCount')}`
                    : t('goals.checklistNotAvailable')}
                </p>
                {summary.available && (
                  <>
                    <div className="goal-progress-wrap" aria-label={`${goalTitle} ${t('checklist.progressLabel')}`}>
                      <div className="goal-progress-bar" aria-hidden="true">
                        <span style={{ width: `${summary.percent}%` }} />
                      </div>
                      <span className="goal-progress-value">{statusText}</span>
                    </div>
                  </>
                )}
                <div className="goal-card-actions">
                  <Link className="goal-card-action" to={goalHref}>{actionText} <span aria-hidden="true">→</span></Link>
                </div>
                {!summary.available && (
                  <div className="goal-card-actions">
                    <Link className="goal-card-action" to={goalDetailHref}>{t('goals.viewRequirements')} <span aria-hidden="true">→</span></Link>
                  </div>
                )}
              </article>
            </li>
          )
        })}
      </ul>
      <ChatAssistant />
    </section>
  )
}

function Checklist() {
  const [searchParams] = useSearchParams()
  const goalId = searchParams.get('goal')
  if (goalId === null || goalId === '') return <ChecklistOverview />
  return <ChecklistForGoal key={goalId} goalId={goalId} />
}

function ChecklistForGoal({ goalId }) {
  const { t } = useLanguage()
  const numericGoalId = goalId === null ? null : Number(goalId)
  const [initialProgress] = useState(() => {
    if (typeof window === 'undefined' || !Number.isInteger(numericGoalId)) {
      return { saved: { items: {}, answers: {} }, failed: false }
    }
    try {
      return { saved: readChecklistProgress(window.localStorage, numericGoalId), failed: false }
    } catch {
      return { saved: { items: {}, answers: {} }, failed: true }
    }
  })
  const [saved, setSaved] = useState(initialProgress.saved)
  const [storageFailed, setStorageFailed] = useState(initialProgress.failed)
  const answers = saved.answers ?? EMPTY_ANSWERS
  const questions = Number.isInteger(numericGoalId) ? getPlanningQuestions(numericGoalId) : []
  const plan = useMemo(() => {
    if (!Number.isInteger(numericGoalId)) return null
    return getChecklistPlan(numericGoalId, answers)
  }, [numericGoalId, answers])
  const requirements = useMemo(() => {
    if (!plan) return []
    return plan.steps
      .filter((step) => step.kind === 'requirement')
      .map(({ requirement, ...step }) => ({ ...requirement, ...step }))
  }, [plan])
  const definitions = Number.isInteger(numericGoalId) ? getRequirementsByGoal(numericGoalId) : []
  const goal = getGoals().find((item) => item.id === numericGoalId && !item.isSample)

  const saveProgress = (nextSaved) => {
    setSaved(nextSaved)
    try {
      writeChecklistProgress(window.localStorage, numericGoalId, nextSaved)
      setStorageFailed(false)
    } catch {
      setStorageFailed(true)
    }
  }

  return (
    <section className="page-content" aria-labelledby="checklist-title">
      <p className="eyebrow">{goal?.titleKey ? t(goal.titleKey) : goal?.title ?? t('page.checklist')}</p>
      <h1 id="checklist-title">{t('page.checklist')}</h1>
      <p className="page-description">{t('checklist.description')}</p>
      {definitions.length > 0 && plan?.ok && plan.warnings.length === 0 ? (
        <>
          {requirements.some((requirement) => requirement.verification !== 'verified') && (
            !goal?.demoContent && <p className="verification-notice">{t('requirement.currentDetailsNotice')}</p>
          )}
          {numericGoalId === 7 && <p className="sample-notice">{t('checklist.healthCardNotice')}</p>}
          {numericGoalId === 7 && <p>{t('checklist.orderNotice')}</p>}
          {numericGoalId === 7 && (
            <p><Link to={href('serviceDetail', { slug: 'city-health-office' })}>{t('checklist.officeLink')}</Link></p>
          )}
          {questions.length > 0 && (
            <section className="checklist-questions" aria-labelledby="checklist-questions-title">
              <h2 id="checklist-questions-title">{t('checklist.questionsTitle')}</h2>
              <p>{t('checklist.questionsDescription')}</p>
              {questions.map((question) => (
                <div className="checklist-question" key={question.id}>
                  <label htmlFor={`checklist-${question.id}`}>{t(question.labelKey)}</label>
                  <select
                    id={`checklist-${question.id}`}
                    value={answers[question.id] ?? ''}
                    onChange={(event) => saveProgress({
                      ...saved,
                      answers: { ...answers, [question.id]: event.target.value },
                    })}
                  >
                    {question.options.map((option) => (
                      <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
                    ))}
                  </select>
                </div>
              ))}
            </section>
          )}
          <ChecklistView
            key={numericGoalId}
            goalId={numericGoalId}
            requirements={requirements}
            definitions={definitions}
            saved={saved}
            saveProgress={saveProgress}
            storageFailed={storageFailed}
            planValid={Boolean(plan?.ok && plan.warnings.length === 0)}
            demoOnly={Boolean(goal?.demoContent)}
            demoNoteKey={goal?.demoNoteKey}
          />
        </>
      ) : (
        <>
          <EmptyState message={goal
            ? t('checklist.unavailableForGoal').replace('{goal}', goal.title)
            : t('checklist.noRequirements')} />
          <p>{goal ? t('checklist.goalResearchPending') : t('checklist.noRequirementsHint')}</p>
          {goal && (
            <>
              <p>{t('checklist.relatedGuidesNotSubstitute').replace('{goal}', goal.title)}</p>
              <p><Link to={href('documents')}>{t('checklist.browseRelatedGuides')}</Link></p>
            </>
          )}
          <Link to={href('goals')}>{t('checklist.findGoals')}</Link>
        </>
      )}
      {goal && <p><Link to={href('goalDetail', { slug: goal.slug })}>{t('checklist.backToGoal')}</Link></p>}
      <ChatAssistant key={goalId} />
    </section>
  )
}

function ChecklistView({ goalId, requirements, definitions, saved, saveProgress, storageFailed, planValid, demoOnly, demoNoteKey }) {
  const { t } = useLanguage()
  const progress = reconcileChecklistProgress(saved, definitions)

  const handleStatusChange = (requirement, status) => {
    const current = reconcileChecklistProgress(saved, definitions)
    const nextSaved = {
      ...saved,
      items: {
        ...current.items,
        [String(requirement.id)]: {
          status,
          revision: requirement.revision,
          needsReview: false,
        },
      },
    }
    saveProgress(nextSaved)
  }

  const itemStatuses = requirements.map((requirement) =>
    progress.items[String(requirement.id)]?.status ?? 'not-started',
  )
  const readiness = assessChecklistReadiness(
    requirements,
    progress.items,
    planValid,
  )
  const applicableCount = itemStatuses.filter((status) => status !== 'not-applicable').length
  const readyCount = itemStatuses.filter((status) => status === 'ready').length
  const progressMax = Math.max(applicableCount, 1)

  return (
    <>
      <p className="browser-storage-note">{t('checklist.browserStorageNotice')}</p>
      {storageFailed && <p className="verification-notice" role="status">{t('checklist.storageError')}</p>}
      {requirements.length > 0 && !demoOnly ? (
        <section className="checklist-readiness verification-notice" aria-labelledby="checklist-readiness-title" role="status">
          <h2 id="checklist-readiness-title">{t('checklist.readiness.heading')}</h2>
          <p className="checklist-readiness-status">{t(`checklist.readiness.${readiness.status}`)}</p>
          {readiness.missingPrerequisites.length > 0 && (
            <p>{t('checklist.readiness.missingPrerequisiteCount').replace(
              '{count}',
              String(readiness.missingPrerequisites.length),
            )}</p>
          )}
        </section>
      ) : requirements.length === 0 ? (
        <p className="empty-state-message" role="status">{t('checklist.noApplicableItems')}</p>
      ) : null}
      {progress.needsReview && (
        <p className="verification-notice" role="status">
          {t('checklist.outdatedNotice').replace('{count}', String(progress.obsoleteIds.length))}
        </p>
      )}
      {requirements.length > 0 && <div className="checklist-progress">
        <p className="checklist-progress-label" aria-live="polite">
          {t('checklist.progressLabel').replace('{ready}', String(readyCount)).replace('{total}', String(applicableCount))}
        </p>
        <progress aria-label={t('a11y.requirementsCompleted')} value={readyCount} max={progressMax} />
        {itemStatuses.some((status) => status === 'not-applicable') && (
          <p>{t('checklist.notApplicableCount').replace(
            '{count}',
            String(itemStatuses.filter((status) => status === 'not-applicable').length),
          )}</p>
        )}
      </div>}
      {requirements.length > 0 && <ol className="sprint-grid generated-plan" aria-label={t('a11y.requirements')}>
        {requirements.map((item, index) => {
          const savedItem = progress.items[String(item.id)]
          const condition = [item.goalContextKey, item.conditionKey]
            .filter(Boolean)
            .map((key) => t(key))
            .join('; ')
          return (
            <li key={item.id} id={`checklist-item-${item.id}`}>
              <p className="plan-step-number">{t('checklist.itemLabel').replace('{number}', String(index + 1))}</p>
              {savedItem?.needsReview && <p className="verification-notice">{t('checklist.itemOutdated')}</p>}
              {condition && <p>{t('goals.appliesWhen').replace('{condition}', condition)}</p>}
              <RequirementCard
                label={item.labelKey ? t(item.labelKey) : item.label}
                description={demoOnly ? undefined : item.descriptionKey ? t(item.descriptionKey) : item.description}
                notes={demoOnly && demoNoteKey ? t(demoNoteKey) : item.notesKey ? t(item.notesKey) : item.notes}
                copies={item.copies}
                validityMonths={item.validityMonths}
                requirementType={item.requirementType}
                applicability={item.applicability}
                conditionKey={item.conditionKey}
                sourceUrl={item.sourceUrl}
                applicationUrl={item.applicationUrl}
                applicationLabelKey={item.applicationLabelKey}
                supportingDocumentsUrl={item.supportingDocumentsUrl}
                demoOnly={item.demoOnly}
                lastVerified={item.lastVerified}
                status={savedItem?.status ?? 'not-started'}
                onStatusChange={(status) => handleStatusChange(item, status)}
                guidePath={href('documentGuide', { slug: item.slug }, { goal: goalId, from: 'checklist' })}
              />
            </li>
          )
        })}
      </ol>}
    </>
  )
}

export default Checklist
