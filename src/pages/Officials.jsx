import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getOfficials } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { Link } from 'react-router-dom'

function Officials() {
  const { t } = useLanguage()
  const officials = getOfficials()
  return (
    <section className="page-content flow-content" aria-labelledby="officials-title">
      <p className="eyebrow">City leadership</p>
      <h1 id="officials-title">{t('page.officials')}</h1>
      <p className="page-description">Office listings only. No office holder has been confirmed for this directory.</p>
      {officials.length ? (
        <ul className="portal-grid">
          {officials.map((office) => (
            <li className="portal-card" key={office.id}>
              <h2>{office.title}</h2>
              {office.verification === 'verified' && office.holderName && <p>{office.holderName}</p>}
              {office.verification !== 'verified'
                ? <p>Not verified yet. Check the official city website.</p>
                : <p>As of <time dateTime={office.lastVerified}>{office.lastVerified}</time>.</p>}
              {office.verification === 'verified' && office.notes && <p className="sample-notice">{office.notes}</p>}
              <RecordMeta record={office} />
              <Link to={`/officials/${office.slug}`}>View office profile</Link>
            </li>
          ))}
        </ul>
      ) : <EmptyState message="No official offices are listed." />}
    </section>
  )
}

export default Officials
