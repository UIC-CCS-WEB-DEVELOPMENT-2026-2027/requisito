import { Link, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import { getBarangaysByDistrict, getDistricts } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

function DistrictProfile() {
  const { t } = useLanguage()
  const { name } = useParams()
  const district = getDistricts().find((item) => item.toLowerCase() === decodeURIComponent(name ?? '').toLowerCase())

  if (!district) {
    return (
      <section className="page-content" aria-labelledby="district-not-found">
        <h1 id="district-not-found">{t('districts.notFound')}</h1>
        <EmptyState message={t('districts.noMatch')} />
        <Link className="return-link" to={href('districts')}>{t('districts.browse')}</Link>
      </section>
    )
  }

  const records = getBarangaysByDistrict(district)
  return (
    <section className="page-content flow-content" aria-labelledby="district-title">
      <nav aria-label={t('a11y.breadcrumb')}>
        <ol className="breadcrumbs">
          <li><Link to={href('districts')}>{t('nav.districts')}</Link></li>
          <li aria-current="page">{district}</li>
        </ol>
      </nav>
      <p className="eyebrow">{t('districts.eyebrow')}</p>
      <h1 id="district-title">{district}</h1>
      <p>{t('districts.barangayCount').replace('{count}', records.length)}</p>
      {records.length ? (
        <ul className="portal-grid">
          {records.map((record) => (
            <li className="portal-card" key={record.id}>
              <h2><Link to={href('barangayProfile', { slug: record.slug })}>{record.title}</Link></h2>
              <p>{record.legislativeDistrict} {t('barangays.legislativeDistrict')}</p>
              <p>{t('barangays.population')}: {record.population2020 == null ? t('barangays.populationNotImported') : record.population2020.toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : <EmptyState message={t('districts.noBarangays')} />}
    </section>
  )
}

export default DistrictProfile
