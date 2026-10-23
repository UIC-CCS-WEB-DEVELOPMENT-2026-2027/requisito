import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getServices } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Participate() {
  const { t } = useLanguage()
  const contact = getServices().find((record) => record.slug === 'davao-city-contact-center')
  const pendingSource = {
    id: 'participation-source-pending',
    type: 'participation',
    verification: 'unverified',
    lastVerified: null,
    sourceUrl: '',
  }
  return (
    <section className="page-content flow-content" aria-labelledby="participate-title">
      <p className="eyebrow">Civic participation</p>
      <h1 id="participate-title">{t('page.participate')}</h1>
      <p className="page-description">Source-based ways to contact the city and take part in civic processes.</p>
      <div className="portal-grid">
        <article className="portal-card">
          <h2>{t('heading.cityContact')}</h2>
          {contact ? <><p>{contact.description}</p><p>{contact.contact.phone.map((phone) => <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>)}</p><RecordMeta record={contact} /></> : <EmptyState message="No city contact record is available." />}
        </article>
        <article className="portal-card">
          <h2>{t('heading.councilSession')}</h2><p>Confirm the current public schedule and access arrangements with the city council.</p>
          <p>Source to be added. This guidance is unverified.</p><RecordMeta record={pendingSource} />
        </article>
        <article className="portal-card">
          <h2>{t('heading.foi')}</h2><p>Check the responsible office's current procedure and requirements before submitting a request.</p>
          <p>Source to be added. This guidance is unverified.</p><RecordMeta record={pendingSource} />
        </article>
        <article className="portal-card">
          <h2>{t('heading.corrections')}</h2><p>Share a sourced correction using the project's public contribution form.</p><Link to="/contribute">Open correction form</Link>
        </article>
      </div>
    </section>
  )
}

export default Participate
