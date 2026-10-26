import { Link } from 'react-router-dom'
import CatalogEmptyState from '../components/CatalogEmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getStatusReport, STALE_DAYS } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

function Integrity() {
  const { t } = useLanguage()
  const report = getStatusReport()
  const counts = Object.entries(report.verificationCounts)
  const total = counts.reduce((sum, [, row]) => sum + row.verified + row.unverified + row.conflicting, 0)
  const verified = counts.reduce((sum, [, row]) => sum + row.verified, 0)
  const policyRecord = {
    id: 'integrity-project-policy',
    type: 'integrity',
    verification: 'unverified',
    lastVerified: null,
    sourceUrl: '',
  }
  return (
    <section className="page-content flow-content" aria-labelledby="integrity-title">
      <p className="eyebrow">{t('integrity.eyebrow')}</p>
      <h1 id="integrity-title">{t('page.integrity')}</h1>
      <h2>{t('heading.siteMethods')}</h2>
      <p>{t('integrity.independent')}</p>
      <p>{t('integrity.verificationPolicy')}</p>
      <p>{t('heading.staleRecords')} {STALE_DAYS} {t('integrity.days')}. {t('integrity.coverage').replace('{verified}', verified).replace('{total}', total)}</p>
      <p>{t('integrity.assistant')}</p>
      <p>{t('integrity.corrections')}</p>
      <p><Link to={href('contribute')}>{t('integrity.suggestCorrection')}</Link> · <Link to={href('credits')}>{t('integrity.credits')}</Link></p>
      <h2>{t('heading.verificationExample')}</h2>
      <RecordMeta record={policyRecord} />
      <h2>{t('heading.aiDisclosure')}</h2>
      <p>{t('integrity.aiDisclosure')}</p>
      <CatalogEmptyState
        what={t('emptyState.integrityWhat')}
        how={t('emptyState.dataHow')}
        action={t('emptyState.integrityAction')}
      />
    </section>
  )
}

export default Integrity
