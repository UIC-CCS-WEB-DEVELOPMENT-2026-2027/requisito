import { Link } from 'react-router-dom'

// Props: title, description, stepsCount, checklistAvailable, category, verification, countLabel, verificationLabel, unavailableLabel, actionLabel.
function GoalCard({
  title,
  description,
  stepsCount,
  checklistAvailable,
  category,
  countLabel,
  verificationLabel,
  unavailableLabel,
  actionLabel,
  detailActionLabel,
  completedCount,
  totalCount,
  progressPercent,
  statusText,
  navigateTo,
  detailHref,
}) {
  const shownCount = Number(stepsCount ?? totalCount ?? completedCount ?? 0)
  const summaryText = `${shownCount} ${countLabel}`

  return (
    <article className="goal-card">
      <h2 className="goal-card-title">{title}</h2>
      {category && <p className="goal-card-category">{category}</p>}
      <p className="goal-card-description">{description}</p>
      {checklistAvailable ? (
        <>
          <p className="goal-card-steps-count">{summaryText}</p>
          <div className="goal-progress-wrap" aria-label={`${title} progress`}>
            <div className="goal-progress-bar" aria-hidden="true">
              <span style={{ width: `${Math.max(0, Math.min(100, Number(progressPercent) || 0))}%` }} />
            </div>
            <span className="goal-progress-value">{statusText ?? 'Not started'}</span>
          </div>
        </>
      ) : (
        <>
          <p className="goal-card-steps-count">{summaryText}</p>
          <p className="goal-card-steps-count">{unavailableLabel} · {verificationLabel}</p>
        </>
      )}
      <div className="goal-card-actions">
        {checklistAvailable ? (
          <Link className="goal-card-action" to={navigateTo ?? detailHref ?? '#'}>{actionLabel} <span aria-hidden="true">→</span></Link>
        ) : (
          <Link className="goal-card-action" to={detailHref ?? '#'}>{actionLabel} <span aria-hidden="true">→</span></Link>
        )}
        {detailHref && (
          <Link className="goal-card-action" to={detailHref}>{detailActionLabel ?? 'View details'} <span aria-hidden="true">→</span></Link>
        )}
      </div>
    </article>
  )
}

export default GoalCard
