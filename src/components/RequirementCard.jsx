import { useId } from 'react'
import StatusBadge from './StatusBadge.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './SprintCards.css'

// Props: label, notes, copies, sourceUrl, lastVerified, isDone, onToggle.
function RequirementCard({
  label,
  notes,
  copies,
  validityMonths,
  sourceUrl,
  lastVerified,
  isDone = false,
  onToggle,
}) {
  const checkboxId = useId()
  const { t } = useLanguage()

  return (
    <article
      className={`sprint-card requirement-card${isDone ? ' is-done' : ''}`}
    >
      <h2 className="requirement-card-title">{label}</h2>
      <p>{notes}</p>
      <p className="card-detail">
        {copies === 1 ? t('requirement.copy') : t('requirement.copies')} {t('requirement.needed')}: {copies}
      </p>
      {validityMonths != null && <p className="card-detail">{t('requirement.validity')}: {validityMonths} {t('requirement.months')}</p>}
      {onToggle && (
        <div className="requirement-toggle">
          <input
            id={checkboxId}
            type="checkbox"
            checked={isDone}
            onChange={onToggle}
          />
          <label htmlFor={checkboxId}>{t('requirement.markDone').replace('{label}', label)}</label>
          <span className="requirement-status">
            {isDone ? t('requirement.done') : t('requirement.notDone')}
          </span>
        </div>
      )}
      <StatusBadge lastVerified={lastVerified} />
      {sourceUrl && (
        <a
          className="source-link"
          href={sourceUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t('requirement.whereToGet')}
        </a>
      )}
    </article>
  )
}

export default RequirementCard
