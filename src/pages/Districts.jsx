import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import { getDistrictSummary } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

function Districts() {
  const { t } = useLanguage()
  const districts = getDistrictSummary()
  return (
    <section className="page-content flow-content" aria-labelledby="districts-title">
      <p className="eyebrow">{t('districts.eyebrow')}</p>
      <h1 id="districts-title">{t('nav.districts')}</h1>
      <p className="page-description">{t('districts.description')}</p>
      {districts.length ? (
        <ul className="portal-grid">
          {districts.map(({ name, count }) => (
            <li className="portal-card" key={name}>
              <h2><Link to={href('districtProfile', { name })}>{name}</Link></h2>
              <p>{t('districts.barangayCount').replace('{count}', count)}</p>
            </li>
          ))}
        </ul>
      ) : <EmptyState message={t('districts.noDistricts')} />}
    </section>
  )
}

export default Districts
