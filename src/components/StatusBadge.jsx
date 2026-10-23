import './SprintCards.css'
import { formatDate } from '../utils/formatDate.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Props: lastVerified.
function StatusBadge({ lastVerified }) {
  const { t } = useLanguage()

  return (
    <span className="status-badge">
      {lastVerified ? (
        <>
          {t('recordMeta.lastVerified')}{' '}
          <time dateTime={lastVerified}>{formatDate(lastVerified)}</time>
        </>
      ) : (
        t('recordMeta.neverVerified')
      )}
    </span>
  )
}

export default StatusBadge
