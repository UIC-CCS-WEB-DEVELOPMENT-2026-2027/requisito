import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getOfficials } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

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
              <p>{office.holderName ?? 'Office holder not listed.'}</p>
              {office.verification !== 'verified'
                ? <p>Not verified yet. Check the official city website.</p>
                : <p>As of <time dateTime={office.lastVerified}>{office.lastVerified}</time>.</p>}
              <p className="sample-notice">{office.notes}</p>
              <RecordMeta record={office} />
            </li>
          ))}
        </ul>
      ) : <EmptyState message="No official offices are listed." />}
    </section>
  )
}

export default Officials
