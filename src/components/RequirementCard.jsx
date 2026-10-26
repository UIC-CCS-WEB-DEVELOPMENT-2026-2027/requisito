import { useId } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'
import RequirementSourceCard from './RequirementSourceCard.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './SprintCards.css'

// Props: label, notes, requirementType, sourceUrl, lastVerified, status, onStatusChange, guidePath.
function RequirementCard({
  label,
  description,
  notes,
  copies,
  validityMonths,
  requirementType,
  applicability,
  conditionKey,
  sourceUrl,
  applicationUrl,
  applicationLabelKey,
  supportingDocumentsUrl,
  sources = [],
  demoOnly,
  lastVerified,
  status,
  onStatusChange,
  guidePath,
}) {
  const statusId = useId()
  const { t } = useLanguage()

  return (
    <article
      className={`sprint-card requirement-card${status === 'ready' ? ' is-done' : ''}`}
    >
      <h2 className="requirement-card-title">{label}</h2>
      {requirementType && <p className="requirement-kind">{t(`requirement.kind.${requirementType}`)}</p>}
      {description && <p>{description}</p>}
      {applicability === 'reported-general' && (
        <p className="card-detail">{t('requirement.reportedGeneral')}</p>
      )}
      {applicability === 'reported-conditional' && (
        <p className="card-detail">
          {t('requirement.reportedConditional').replace(
            '{condition}',
            conditionKey ? t(conditionKey) : t('requirement.conditionUnknown'),
          )}
        </p>
      )}
      {!applicability && !demoOnly && (
        <p className="card-detail">{t('requirement.applicabilityUnknown')}</p>
      )}
      <p>{notes}</p>
      {validityMonths != null && <p className="card-detail">{t('requirement.validity')}: {validityMonths} {t('requirement.months')}</p>}
      {typeof copies === 'number' && (
        <p className="card-detail">
          {copies === 1 ? t('requirement.copy') : t('requirement.copies')} {t('requirement.needed')}: {copies}
        </p>
      )}
      {onStatusChange && (
        <div className="requirement-toggle">
          <label htmlFor={statusId}>{t('checklist.itemStatus')}</label>
          <select id={statusId} value={status} onChange={(event) => onStatusChange(event.target.value)}>
            {['not-started', 'in-progress', 'ready', 'not-applicable'].map((itemStatus) => (
              <option key={itemStatus} value={itemStatus}>{t(`checklist.status.${itemStatus}`)}</option>
            ))}
          </select>
          <span className="requirement-status">
            {t(`checklist.status.${status}`)}
          </span>
        </div>
      )}
      {lastVerified && <StatusBadge lastVerified={lastVerified} />}
      {sourceUrl && (
        <a
          className="source-link"
          href={sourceUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t('record.officialSource')}
        </a>
      )}
      {applicationUrl && (
        <p>
          <a className="source-link" href={applicationUrl} rel="noopener noreferrer" target="_blank">
            {t(applicationLabelKey ?? 'requirement.officialApplication')}
          </a>
        </p>
      )}
      {supportingDocumentsUrl && (
        <p>
          <a className="source-link" href={supportingDocumentsUrl} rel="noopener noreferrer" target="_blank">
            {t('requirement.supportingDocuments')}
          </a>
        </p>
      )}
      {sources.length > 0 && (
        <details className="requirement-source-details">
          <summary>{t('requirement.sourcesAndEvidence')}</summary>
          <ul className="guidance-list">
            {sources.map((source) => (
              <RequirementSourceCard key={source.id} source={source} />
            ))}
          </ul>
        </details>
      )}
      {!sourceUrl && !demoOnly && <p className="card-detail">{t('record.sourceMissing')}</p>}
      {guidePath && <Link to={guidePath}>{t('goals.openDocumentGuide')}</Link>}
    </article>
  )
}

export default RequirementCard
