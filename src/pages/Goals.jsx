import { useMemo, useState } from 'react'
import EmptyState from '../components/EmptyState.jsx'
import GoalCard from '../components/GoalCard.jsx'
import { getGoals } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'
import { getGoalProgressSummary } from '../utils/checklistProgress.js'

function getGoalProgress(goalId, t) {
  const summary = getGoalProgressSummary(goalId)
  const status = t(`checklist.status.${summary.available ? summary.status : 'unavailable'}`)

  return {
    total: summary.total,
    completed: summary.completed,
    percent: summary.percent,
    available: summary.available,
    status,
    actionLabel: !summary.available
      ? t('goals.viewChecklistStatus')
      : summary.status === 'completed'
        ? t('goals.continueChecklist')
        : t('goals.viewChecklist'),
  }
}

// Props: none. Goal data comes from helpers.js.
function Goals() {
  const { t } = useLanguage()
  const goals = getGoals().filter((goal) => !goal.isSample)
  const [searchText, setSearchText] = useState('')
  const [category, setCategory] = useState('')
  const query = searchText.trim().toLowerCase()
  const filteredGoals = useMemo(() => goals.filter((goal) =>
    (!category || goal.category === category) &&
    `${goal.title} ${goal.description} ${goal.category} ${goal.audience} ${goal.agency} ${goal.titleKey ? t(goal.titleKey) : ''} ${goal.descriptionKey ? t(goal.descriptionKey) : ''}`
      .toLowerCase()
      .includes(query),
  ), [category, goals, query, t])
  const categories = [...new Map(goals.map((goal) => [goal.category,
    goal.categoryKey ? t(goal.categoryKey) : goal.category,
  ])).entries()]

  return (
    <section className="page-content directory-page" aria-labelledby="goals-title">
      <header className="page-heading">
        <p className="eyebrow">{t('goals.eyebrow')}</p>
        <h1 id="goals-title">{t('page.goals')}</h1>
        <p className="page-description">
          {t('goals.description')}
        </p>
      </header>
      <div className="goal-search" role="search">
        <label htmlFor="goal-search">{t('label.searchGoals')}</label>
        <input
          id="goal-search"
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder={t('goals.search')}
          autoComplete="off"
        />
      </div>
      <div className="goal-category-filter">
        <label htmlFor="goal-category">{t('label.category')}</label>
        <select id="goal-category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">{t('goals.allCategories')}</option>
          {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {filteredGoals.length > 0 ? (
        <ul className="goal-grid" aria-label={t('a11y.availableGoals')}>
          {filteredGoals.map((goal) => {
            const progress = getGoalProgress(goal.id, t)
            const checklistHref = href('checklist', {}, { goal: goal.id })
            const detailHref = href('goalDetail', { slug: goal.slug })
            return (
              <li key={goal.id}>
                <GoalCard
                  title={goal.titleKey ? t(goal.titleKey) : goal.title}
                  description={goal.descriptionKey ? t(goal.descriptionKey) : goal.description}
                  stepsCount={progress.total}
                  checklistAvailable={progress.available}
                  category={goal.categoryKey ? t(goal.categoryKey) : goal.category}
                  countLabel={t('goals.requirementCount')}
                  verificationLabel={t(`record.${goal.verification}`)}
                  unavailableLabel={t('goals.checklistNotAvailable')}
                  actionLabel={progress.actionLabel}
                  detailActionLabel={t('goals.viewRequirements')}
                  completedCount={progress.completed}
                  totalCount={progress.total}
                  progressPercent={progress.percent}
                  statusText={progress.status}
                  navigateTo={checklistHref}
                  detailHref={detailHref}
                />
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState message={t('form.noRecords')} />
      )}
    </section>
  )
}

export default Goals
