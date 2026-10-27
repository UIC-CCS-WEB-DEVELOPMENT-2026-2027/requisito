import { useLanguage } from '../i18n/LanguageContext.jsx'

function EmptyState({ message, description }) {
  const { t } = useLanguage()

  return (
    <div className="empty-state" role="status">
      <svg
        className="empty-state__icon"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M15 18.5h18M15 24h11M15 29.5h7" strokeWidth="2.5" />
        <path d="M12 7.5h19l5 5v28H12z" strokeWidth="2.5" />
        <path d="M31 7.5v6h5M29.5 28.5l7 7M36.5 28.5l-7 7" strokeWidth="2.5" />
      </svg>
      <p className="empty-state__message">{message ?? t('emptyState.noRecords')}</p>
      {description != null && <p className="empty-state__description">{description}</p>}
    </div>
  )
}

export default EmptyState
