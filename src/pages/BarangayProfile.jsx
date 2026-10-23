import { Link, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getBarangayBySlug, getBarangaysByDistrict } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function BarangayProfile() {
  const { t } = useLanguage()
  const { slug } = useParams()
  const barangay = getBarangayBySlug(slug)

  if (!barangay) {
    return (
      <section className="page-content" aria-labelledby="barangay-missing-title">
        <h1 id="barangay-missing-title">{t('barangays.notFound')}</h1>
        <EmptyState message={t('barangays.noMatch')} />
        <Link className="return-link" to="/barangays">{t('barangays.browse')}</Link>
      </section>
    )
  }

  const districtBarangays = getBarangaysByDistrict(barangay.adminDistrict)
  const currentIndex = districtBarangays.findIndex((item) => item.slug === barangay.slug)
  const previous = districtBarangays[currentIndex - 1]
  const next = districtBarangays[currentIndex + 1]

  return (
    <section className="page-content flow-content" aria-labelledby="barangay-title">
      <nav aria-label={t('a11y.breadcrumb')}>
        <ol className="breadcrumbs">
          <li><Link to="/barangays">{t('page.barangays')}</Link></li>
          <li><Link to={`/districts/${encodeURIComponent(barangay.adminDistrict)}`}>{barangay.adminDistrict}</Link></li>
          <li aria-current="page">{barangay.title}</li>
        </ol>
      </nav>
      <p className="eyebrow">{t('barangays.profile')}</p>
      <h1 id="barangay-title">{barangay.title}</h1>
      <p className="page-description">{barangay.description}</p>
      <p className="status-badge verification-unverified">{t('status.unverified')}</p>
      <p>{t('barangays.unverifiedNote')}</p>
      <dl className="portal-details">
        <div><dt>{t('barangays.adminDistrict')}</dt><dd>{barangay.adminDistrict}</dd></div>
        {barangay.legislativeDistrict != null && <div><dt>{t('barangays.legislativeDistrict')}</dt><dd>{barangay.legislativeDistrict}</dd></div>}
        <div>
          <dt>{t('barangays.population')}</dt>
          <dd>{barangay.population2020 == null ? t('barangays.populationNotImported') : barangay.population2020.toLocaleString()}</dd>
        </div>
      </dl>
      <RecordMeta record={barangay} />
      <div className="barangay-pagination">
        {previous ? <Link to={`/barangays/${previous.slug}`}>{t('barangays.previous')}: {previous.title}</Link> : <span />}
        {next ? <Link to={`/barangays/${next.slug}`}>{t('barangays.next')}: {next.title}</Link> : <span />}
      </div>
      <Link className="return-link" to={`/contribute?record=${encodeURIComponent(barangay.slug)}`}>{t('barangays.reportCorrection')}</Link>
    </section>
  )
}

export default BarangayProfile
