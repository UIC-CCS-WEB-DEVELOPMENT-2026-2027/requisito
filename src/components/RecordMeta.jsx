import { useLanguage } from '../i18n/LanguageContext.jsx'

function RecordMeta({ record }) {
  const { t } = useLanguage()
  const stateKey = {
    verified: 'record.verified',
    unverified: 'record.unverified',
    conflicting: 'record.conflicting',
  }[record.verification] ?? 'record.unverified'

  return (
    <div className="record-meta">
      <span className={`status-badge verification-${record.verification ?? 'unverified'}`}>
        {t(stateKey)}
      </span>
      <p>
        {t('recordMeta.lastVerified')}{' '}
        {record.verification === 'verified' && record.lastVerified
          ? <time dateTime={record.lastVerified}>{record.lastVerified}</time>
          : t('record.neverVerified')}
      </p>
      {record.sourceUrl ? (
        <p><a href={record.sourceUrl} target="_blank" rel="noopener noreferrer">{t('record.officialSource')}</a></p>
      ) : (
        <p>{t('record.sourceMissing')}</p>
      )}
      {record.relatedSources?.map((source, index) => (
        <p key={source}><a href={source} target="_blank" rel="noopener noreferrer">{t('record.additionalSource').replace('{index}', index + 1)}</a></p>
      ))}
    </div>
  )
}

export default RecordMeta
