import { Link, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getOfficials } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

function OfficialProfile() {
  const { t } = useLanguage()
  const { slug } = useParams()
  const office = getOfficials().find((item) => item.slug === slug)
  if (!office) return <section className="page-content"><h1>{t('officials.notFound')}</h1><EmptyState message={t('officials.noMatch')} /><Link to={href('officials')}>{t('officials.allOffices')}</Link></section>
  return (
    <section className="page-content flow-content" aria-labelledby="office-title">
      <p className="eyebrow">{t('officials.profile')}</p>
      <h1 id="office-title">{office.title}</h1>
      <p>{office.description}</p>
      {office.verification === 'verified' && office.holderName && <p>{t('officials.holder')} {office.holderName}</p>}
      {office.verification !== 'verified' && <p>{t('officials.notVerified')}</p>}
      {office.verification === 'verified' && office.term && <p>{t('officials.term')} {office.term}</p>}
      <RecordMeta record={office} />
      <Link to={href('officials')}>{t('officials.back')}</Link>
    </section>
  )
}

export default OfficialProfile
