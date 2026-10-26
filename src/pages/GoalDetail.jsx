import { Link, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import RequirementSourceCard from '../components/RequirementSourceCard.jsx'
import { getChecklistPlan, getGoalBySlug, getRequirementsByGoal, getRequirementSources } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

function GoalDetail() {
  const { slug } = useParams()
  const { t } = useLanguage()
  const goal = getGoalBySlug(slug)

  if (!goal) return <EmptyState message={t('goals.notFound')} />

  const requirements = getRequirementsByGoal(goal.id)
  const plan = getChecklistPlan(goal.id)
  const sourcesById = new Map(getRequirementSources().map((source) => [source.id, source]))
  const linkedSourceIds = [...new Set(requirements.flatMap((requirement) => requirement.sourceIds ?? []))]
  const linkedSources = linkedSourceIds.map((id) => sourcesById.get(id)).filter(Boolean)
  const title = goal.titleKey ? t(goal.titleKey) : goal.title
  const description = goal.descriptionKey ? t(goal.descriptionKey) : goal.description

  return (
    <section className="page-content goal-detail" aria-labelledby="goal-title">
      <p className="eyebrow">{goal.categoryKey ? t(goal.categoryKey) : goal.category}</p>
      <h1 id="goal-title">{title}</h1>
      <p className="page-description">{description}</p>

      <section className="guidance-section" aria-labelledby="goal-overview-title">
        <h2 id="goal-overview-title">{t('goals.overview')}</h2>
        <dl className="goal-facts">
          <div><dt>{t('goals.audience')}</dt><dd>{goal.audienceKey ? t(goal.audienceKey) : goal.audience}</dd></div>
          <div><dt>{t('goals.responsibleAgency')}</dt><dd>{goal.agency || t('goals.agencyUnknown')}</dd></div>
          <div>
            <dt>{t('goals.requirementCount')}</dt>
            <dd>{requirements.length ? plan.steps.length : t('goals.checklistNotAvailable')}</dd>
          </div>
        </dl>
      </section>

      <section className="guidance-section" aria-labelledby="goal-requirements-title">
        <h2 id="goal-requirements-title">{t('goals.requirements')}</h2>
        <p>{t('goals.requirementsExplanation')}</p>
        {requirements.length ? (
          <ol className="guidance-list">
            {requirements.map((requirement) => {
              const condition = [
                requirement.goalContextKey,
                requirement.conditionKey,
              ].filter(Boolean).map((key) => t(key)).join('; ')
              return (
                <li className="guidance-card" id={`requirement-${requirement.id}`} key={requirement.id}>
                  <h3>{requirement.labelKey ? t(requirement.labelKey) : requirement.label}</h3>
                  <p className="requirement-kind">{t(`requirement.kind.${requirement.requirementType}`)}</p>
                  {condition && <p>{t('goals.appliesWhen').replace('{condition}', condition)}</p>}
                  {!goal.demoContent && requirement.descriptionKey && <p>{t(requirement.descriptionKey)}</p>}
                  <p>{goal.demoNoteKey
                    ? t(goal.demoNoteKey)
                    : requirement.notesKey ? t(requirement.notesKey) : requirement.notes}</p>
                  {!goal.demoContent && <RecordMeta record={requirement} />}
                  <Link to={href('documentGuide', { slug: requirement.slug })}>
                    {t('goals.openDocumentGuide')}
                  </Link>
                </li>
              )
            })}
          </ol>
        ) : (
          <p>{t('goals.researchIncomplete')}</p>
        )}
      </section>

      <section className="guidance-section" aria-labelledby="goal-tips-title">
        <h2 id="goal-tips-title">{t(goal.demoPreparationKey ? 'demo.preparationHeading' : 'goals.preparationTips')}</h2>
        <p>{t(goal.demoPreparationKey ?? 'goals.preparationTipText')}</p>
        {goal.demoMistakesKey && (
          <>
            <h3>{t('demo.commonMistakesHeading')}</h3>
            <p>{t(goal.demoMistakesKey)}</p>
          </>
        )}
      </section>

      {!goal.demoContent && (
        <section className="guidance-section" aria-labelledby="goal-sources-title">
          <h2 id="goal-sources-title">{t('goals.sourcesAndReview')}</h2>
          {linkedSources.length ? (
            <ul className="guidance-list">
              {linkedSources.map((source) => (
                <RequirementSourceCard key={source.id} source={source} />
              ))}
            </ul>
          ) : (
            <p>{t('goals.noSources')}</p>
          )}
        </section>
      )}

      <Link className="primary-button" to={href('checklist', {}, { goal: goal.id })}>
        {requirements.length ? t('goals.startChecklist') : t('goals.viewChecklistStatus')}
      </Link>
      <p><Link to={href('goals')}>{t('goals.backToGoals')}</Link></p>
    </section>
  )
}

export default GoalDetail
