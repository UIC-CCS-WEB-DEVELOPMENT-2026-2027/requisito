import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import CatalogEmptyState from '../components/CatalogEmptyState.jsx'
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
      <p className="eyebrow">{t('participate.eyebrow')}</p>
      <h1 id="participate-title">{t('page.participate')}</h1>
      <p className="page-description">{t('participate.description')}</p>
      <div className="portal-grid">
        <article className="portal-card">
          <h2>{t('heading.cityContact')}</h2>
          {contact ? <><p>{contact.description}</p><p>{contact.contact.phone.map((phone) => <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>)}</p><RecordMeta record={contact} /></> : <EmptyState message={t('participate.noContact')} />}
        </article>
        <article className="portal-card">
          <h2>{t('heading.councilSession')}</h2><p>{t('participate.confirmCouncil')}</p>
          <p>{t('participate.sourcePending')}</p><RecordMeta record={pendingSource} />
        </article>
        <article className="portal-card">
          <h2>{t('heading.foi')}</h2><p>{t('participate.checkFoi')}</p>
          <p>{t('participate.sourcePending')}</p><RecordMeta record={pendingSource} />
        </article>
        <article className="portal-card">
          <h2>{t('heading.corrections')}</h2><p>{t('participate.shareCorrection')}</p><Link to="/contribute">{t('participate.openForm')}</Link>
        </article>
      </div>
      <CatalogEmptyState
        what={t('emptyState.participateWhat')}
        how={t('emptyState.dataHow')}
        action={t('emptyState.participateAction')}
      />
    </section>
  )
}

export default Participate
