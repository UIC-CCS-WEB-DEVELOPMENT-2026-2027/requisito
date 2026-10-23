import { useLanguage } from '../i18n/LanguageContext.jsx'

function EmptyState({ message }) {
  const { t } = useLanguage()

  return (
    <div className="empty-state" role="status">
      <p>{message ?? t('emptyState.noRecords')}</p>
    </div>
  )
}

export default EmptyState
