import { Link } from 'react-router-dom'
import RecordMeta from '../components/RecordMeta.jsx'
import { getStatusReport, STALE_DAYS } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

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
      <p className="eyebrow">Project transparency</p>
      <h1 id="integrity-title">{t('page.integrity')}</h1>
      <h2>{t('heading.siteMethods')}</h2>
      <p>Requisito is an independent student project, not an official Davao City website.</p>
      <p>Catalog records are marked verified, unverified, or conflicting. Verification requires an HTTPS official .gov.ph source or an explicitly configured allowlist domain, and a human-entered review date.</p>
      <p>Records older than {STALE_DAYS} days are treated as stale. Current catalog coverage: {verified} verified out of {total} records.</p>
      <p>The assistant uses only eligible verified catalog records in normal mode. Its answers may still be wrong and should be checked against the source.</p>
      <p>Corrections are prepared as public GitHub issues and are reviewed before data changes.</p>
      <p><Link to="/contribute">Suggest a correction</Link> · <Link to="/credits">Credits</Link></p>
      <h2>{t('heading.verificationExample')}</h2>
      <RecordMeta record={policyRecord} />
      <h2>{t('heading.aiDisclosure')}</h2>
      <p>The civic portal was built by Caleb with AI assistance. Automated tests and builds do not verify civic facts.</p>
    </section>
  )
}

export default Integrity
