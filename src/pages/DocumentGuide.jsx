import { Link, useParams, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import RequirementSourceCard from '../components/RequirementSourceCard.jsx'
import { getDocumentGuideBySlug } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

function DocumentGuide() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const { t } = useLanguage()
  const guide = getDocumentGuideBySlug(slug)

  if (!guide) return <EmptyState message={t('documents.guideNotFound')} />

  const checklistGoalId = Number(searchParams.get('goal'))
  const cameFromChecklist = searchParams.get('from') === 'checklist' &&
    guide.goals.some((goal) => goal.id === checklistGoalId)
  const label = guide.labelKey ? t(guide.labelKey) : guide.label
  const description = guide.demoOnly && guide.goals[0]?.demoNoteKey
    ? t(guide.goals[0].demoNoteKey)
    : guide.descriptionKey ? t(guide.descriptionKey) : guide.description
  const instructions = guide.guideInstructionsKey
    ? t(guide.goals[0]?.demoGuideKey ?? guide.guideInstructionsKey)
    : guide.guideInstructions

  return (
    <section className="page-content document-guide" aria-labelledby="document-guide-title">
      <p className="eyebrow">{t('documents.eyebrow')}</p>
      <h1 id="document-guide-title">{label}</h1>
      <p className="page-description">{description}</p>
      {!guide.demoOnly && <p className="verification-notice">{t('documents.guideCaveat')}</p>}
      {cameFromChecklist && (
        <p>
          <Link to={href('checklist', {}, { goal: checklistGoalId })}>
            {t('documents.returnToChecklist')}
          </Link>
        </p>
      )}

      <section className="guidance-section" aria-labelledby="guide-purpose-title">
        <h2 id="guide-purpose-title">{t('documents.whatItIsFor')}</h2>
        <p>{description}</p>
        <p className="requirement-kind">{t(`requirement.kind.${guide.requirementType}`)}</p>
      </section>

      <section className="guidance-section" aria-labelledby="guide-obtain-title">
        <h2 id="guide-obtain-title">{t('documents.howToObtain')}</h2>
        <p>{instructions}</p>
        <p>{guide.notesKey ? t(guide.notesKey) : guide.notes}</p>
        {guide.applicationUrl && (
          <p>
            <a href={guide.applicationUrl} rel="noopener noreferrer" target="_blank">
              {t(guide.applicationLabelKey ?? 'requirement.officialApplication')}
            </a>
          </p>
        )}
        {guide.supportingDocumentsUrl && (
          <p>
            <a href={guide.supportingDocumentsUrl} rel="noopener noreferrer" target="_blank">
              {t('requirement.supportingDocuments')}
            </a>
          </p>
        )}
        {guide.validityMonths != null && (
          <p>{t('requirement.validity')}: {guide.validityMonths} {t('requirement.months')} · {t('documents.historicalValidityNotice')}</p>
        )}
        {guide.validityMonths == null && !guide.demoOnly && <p>{t('documents.validityNotConfirmed')}</p>}
      </section>

      {!guide.demoOnly && (
        <section className="guidance-section" aria-labelledby="guide-details-title">
          <h2 id="guide-details-title">{t('documents.issuerAndPrerequisites')}</h2>
          <p>{[...new Set(guide.sources.map((source) => source.agency))].join('; ') || t('documents.issuerNotConfirmed')}</p>
          <p>{t('documents.prerequisitesNotConfirmed')}</p>
          <p>{t('documents.channelNotConfirmed')}</p>
          <p>{t('documents.feesNotConfirmed')}</p>
          <p>{t('documents.renewalNotConfirmed')}</p>
        </section>
      )}

      <section className="guidance-section" aria-labelledby="guide-conditions-title">
        <h2 id="guide-conditions-title">{t('documents.conditionsAndReuse')}</h2>
        {guide.goals.length ? (
          <ul className="guidance-list">
            {guide.goals.map((goal) => (
              <li className="guidance-card" key={goal.id}>
                <h3><Link to={href('goalDetail', { slug: goal.slug })}>{goal.titleKey ? t(goal.titleKey) : goal.title}</Link></h3>
                <p>{goal.audienceKey ? t(goal.audienceKey) : goal.audience}</p>
                {(guide.conditionKey || !guide.demoOnly) && (
                  <p>{guide.conditionKey ? t(guide.conditionKey) : t('documents.noExtraConditionKnown')}</p>
                )}
                <Link to={{
                  pathname: href('goalDetail', { slug: goal.slug }),
                  hash: `#requirement-${guide.id}`,
                }}>
                  {t('documents.viewGoalRequirement')}
                </Link>
                <Link to={href('checklist', {}, { goal: goal.id })}>
                  {t('documents.openGoalChecklist')}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>{t('documents.noGoalLinks')}</p>
        )}
        {!guide.demoOnly && <p>{t('documents.reuseNotConfirmed')}</p>}
      </section>

      {!guide.demoOnly && (
        <section className="guidance-section" aria-labelledby="guide-source-title">
          <h2 id="guide-source-title">{t('goals.sourcesAndReview')}</h2>
          <RecordMeta record={guide} />
          {guide.sources.length > 0 && (
          <ul className="guidance-list">
            {guide.sources.map((source) => (
                <RequirementSourceCard key={source.id} source={source} />
              ))}
          </ul>
          )}
        </section>
      )}

      <Link className="return-link" to={href('documents')}>{t('documents.backToGuides')}</Link>
    </section>
  )
}

export default DocumentGuide
