import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getOfficials } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'
import { Link } from 'react-router-dom'

function Officials() {
  const { t } = useLanguage()
  const officials = getOfficials()
  return (
    <section className="page-content flow-content" aria-labelledby="officials-title">
      <p className="eyebrow">{t('officials.eyebrow')}</p>
      <h1 id="officials-title">{t('page.officials')}</h1>
      <p className="page-description">{t('officials.description')}</p>
      {officials.length ? (
        <ul className="portal-grid">
          {officials.map((office) => (
            <li className="portal-card" key={office.id}>
              <h2>{office.title}</h2>
              {office.verification === 'verified' && office.holderName && <p>{office.holderName}</p>}
              {office.verification !== 'verified'
                ? <p>{t('officials.notVerified')}</p>
                : <p>{t('officials.asOf')} <time dateTime={office.lastVerified}>{office.lastVerified}</time>.</p>}
              {office.verification === 'verified' && office.notes && <p className="sample-notice">{office.notes}</p>}
              <RecordMeta record={office} />
              <Link to={href('officialProfile', { slug: office.slug })}>{t('officials.viewProfile')}</Link>
            </li>
          ))}
        </ul>
      ) : <EmptyState message={t('officials.empty')} />}
    </section>
  )
}

export default Officials
