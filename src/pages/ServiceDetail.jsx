import { Link, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import ServiceMapActions from '../components/ServiceMapActions.jsx'
import { getServiceBySlug } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

function phoneHref(phone) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

function ServiceDetail() {
  const { t } = useLanguage()
  const { slug } = useParams()
  const service = getServiceBySlug(slug)

  if (!service) {
    return (
      <section className="page-content" aria-labelledby="service-missing-title">
        <h1 id="service-missing-title">{t('service.notFound')}</h1>
        <EmptyState message={t('service.noMatch')} />
        <Link className="return-link" to={href('services')}>{t('service.browse')}</Link>
      </section>
    )
  }

  return (
    <section className="page-content flow-content" aria-labelledby="service-title">
      <p className="eyebrow">{service.category}</p>
      <h1 id="service-title">{service.title}</h1>
      <p className="page-description">{service.description}</p>
      {service.timeSensitive && <p className="time-sensitive">{t('service.confirmDetails')}</p>}
      <dl className="portal-details">
        {service.contact.phone.length > 0 && (
          <div><dt>{t('service.phone')}</dt><dd>{service.contact.phone.map((phone) => <a key={phone} href={phoneHref(phone)}>{phone}</a>)}</dd></div>
        )}
        {service.contact.email && <div><dt>{t('service.email')}</dt><dd><a href={`mailto:${service.contact.email}`}>{service.contact.email}</a></dd></div>}
        {service.contact.address && <div><dt>{t('service.address')}</dt><dd>{service.contact.address}</dd></div>}
        {service.contact.hours && <div><dt>{t('service.hours')}</dt><dd>{service.contact.hours}</dd></div>}
      </dl>
      {service.steps?.length > 0 && (
        <section aria-labelledby="service-steps-title">
          <h2 id="service-steps-title">{t('service.steps')}</h2>
          <ol>{service.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>
      )}
      <ServiceMapActions service={service} />
      {service.notes && <p className="sample-notice">{service.notes}</p>}
      <RecordMeta record={service} />
      <Link className="return-link" to={href('contribute', {}, { record: service.slug })}>{t('common.reportCorrection')}</Link>
      {service.sourceUrl && <p><a href={service.sourceUrl} target="_blank" rel="noopener noreferrer">{t('service.openOfficial')}</a></p>}
    </section>
  )
}

export default ServiceDetail
